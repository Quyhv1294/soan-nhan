// Gọi mô hình AI (hiện hỗ trợ Google Gemini qua REST, không cần thư viện).
// Chỉ chạy phía máy chủ: khóa API không bao giờ được gửi xuống trình duyệt.

export type AiLoiKieu =
  | "chua-cau-hinh" // thiếu khóa hoặc nhà cung cấp chưa được hỗ trợ
  | "khoa-sai" // khóa bị từ chối
  | "het-han-muc" // 429
  | "qua-tai" // 5xx, mô hình đang quá tải
  | "het-gio" // chờ quá lâu
  | "bi-chan" // bộ lọc an toàn từ chối
  | "sai-khuon" // trả về nội dung không đúng khuôn
  | "khac";

export class AiError extends Error {
  constructor(
    public kind: AiLoiKieu,
    message: string,
  ) {
    super(message);
  }
}

// Lỗi riêng cho "AI trả về sai khuôn" để hàm kiểm tra khuôn ném ra.
export class SaiKhuon extends AiError {
  constructor(message: string) {
    super("sai-khuon", message);
  }
}

export type AiCauHinh = { khoa: string; nhanh: string; manh: string };

// Trả null nếu chưa cấu hình — khi đó route dùng dữ liệu mẫu để chạy thử giao diện.
export function docCauHinh(): AiCauHinh | null {
  const khoa = process.env.AI_API_KEY?.trim().replace(/^["']|["']$/g, "").trim();
  if (!khoa) return null;
  const nhaCungCap = (process.env.AI_PROVIDER ?? "google").trim().toLowerCase();
  if (nhaCungCap !== "google") {
    throw new AiError("chua-cau-hinh", `Nhà cung cấp AI "${nhaCungCap}" chưa được hỗ trợ. Hiện chỉ có google.`);
  }
  const nhanh = process.env.AI_MODEL_FAST?.trim() || "gemini-3.5-flash-lite";
  const manh = process.env.AI_MODEL_STRONG?.trim() || nhanh;
  return { khoa, nhanh, manh };
}

type YeuCau = {
  system: string;
  user: string;
  schema?: object; // có schema thì ép trả JSON đúng khuôn, không có thì trả chữ thường
};

export type KetQuaAi = { text: string; mohinh: string; tokenVao?: number; tokenRa?: number; ms: number };

const GIOI_HAN_MOI_LAN_MS = 50_000;

async function goiGemini(cfg: AiCauHinh, model: string, yc: YeuCau): Promise<KetQuaAi> {
  const t0 = Date.now();
  let res: Response;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": cfg.khoa, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(GIOI_HAN_MOI_LAN_MS),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: yc.system }] },
        contents: [{ role: "user", parts: [{ text: yc.user }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 16384,
          ...(yc.schema ? { responseMimeType: "application/json", responseSchema: yc.schema } : {}),
          ...THINKING,
        },
      }),
    });
  } catch (e) {
    if (e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError")) {
      throw new AiError("het-gio", "AI trả lời quá lâu.");
    }
    throw new AiError("khac", "Không kết nối được tới AI.");
  }

  const j = (await res.json().catch(() => null)) as {
    candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
    promptFeedback?: { blockReason?: string };
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
    error?: { message?: string };
  } | null;

  if (!res.ok) {
    // Không đưa nguyên văn lỗi của nhà cung cấp ra ngoài: có thể chứa chi tiết nội bộ.
    if (res.status === 429) throw new AiError("het-han-muc", "Hết hạn mức của AI.");
    if (res.status === 400 && /api key/i.test(j?.error?.message ?? "")) throw new AiError("khoa-sai", "Khóa AI không hợp lệ.");
    if (res.status === 401 || res.status === 403) throw new AiError("khoa-sai", "Khóa AI bị từ chối.");
    if (res.status === 404) throw new AiError("khac", `Mô hình ${model} không còn dùng được.`);
    if (res.status >= 500) throw new AiError("qua-tai", "AI đang quá tải.");
    throw new AiError("khac", `AI từ chối yêu cầu (${res.status}).`);
  }

  if (j?.promptFeedback?.blockReason) throw new AiError("bi-chan", "Yêu cầu bị bộ lọc an toàn của AI chặn.");
  const cand = j?.candidates?.[0];
  if (cand?.finishReason === "SAFETY") throw new AiError("bi-chan", "Nội dung bị bộ lọc an toàn của AI chặn.");
  if (cand?.finishReason === "MAX_TOKENS") throw new SaiKhuon("AI viết quá dài nên bị cắt giữa chừng.");
  const text = (cand?.content?.parts ?? [])
    .filter((p) => !p.thought)
    .map((p) => p.text ?? "")
    .join("")
    .trim();
  if (!text) throw new SaiKhuon("AI trả về nội dung rỗng.");

  return { text, mohinh: model, tokenVao: j?.usageMetadata?.promptTokenCount, tokenRa: j?.usageMetadata?.candidatesTokenCount, ms: Date.now() - t0 };
}

// Gọi lần lượt các mô hình (mạnh trước, nhanh sau). Mỗi mô hình được thử lại 1 lần nếu trả sai khuôn;
// quá tải hoặc hết hạn mức thì chuyển ngay sang mô hình kế tiếp.
export async function sinhNoiDung<T>(
  cfg: AiCauHinh,
  yc: YeuCau & { mohinh: string[]; kiemTra: (raw: unknown) => T },
): Promise<{ data: T; ket: KetQuaAi }> {
  let cuoi: AiError | undefined;
  for (const model of [...new Set(yc.mohinh)]) {
    for (let lan = 0; lan < 2; lan++) {
      try {
        const ket = await goiGemini(cfg, model, yc);
        let raw: unknown = ket.text;
        if (yc.schema) {
          try {
            raw = JSON.parse(ket.text);
          } catch {
            throw new SaiKhuon("AI trả về JSON hỏng.");
          }
        }
        return { data: yc.kiemTra(raw), ket };
      } catch (e) {
        cuoi = e instanceof AiError ? e : new AiError("khac", "Lỗi không xác định khi gọi AI.");
        if (cuoi.kind === "khoa-sai" || cuoi.kind === "bi-chan" || cuoi.kind === "chua-cau-hinh") throw cuoi;
        if (cuoi.kind === "sai-khuon" && lan === 0) continue; // thử lại 1 lần cùng mô hình
        break; // sang mô hình kế tiếp
      }
    }
  }
  throw cuoi ?? new AiError("khac", "Không gọi được AI.");
}

// Cấu hình "suy nghĩ" của mô hình — xem ghi chú ở dưới sau khi thử trên khóa thật.
const THINKING: Record<string, unknown> = {};
