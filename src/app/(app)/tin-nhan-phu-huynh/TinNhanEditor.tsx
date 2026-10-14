"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Loader2, RefreshCw, Users } from "lucide-react";
import { Button, Field, Select, Textarea } from "@/components/ui";
import { MOCK_TIN_NHAN } from "@/lib/mock-data";
import { docNoiDung, luuTaiLieu } from "@/lib/kho-local";
import { useHoSo } from "@/lib/use-ho-so";
import { useTuan } from "@/lib/use-tuan";
import { ActionMenu } from "@/components/ActionMenu";

const GIOI_HAN = 1000;

// Sao chép văn bản; trang mở qua http (không phải https/localhost) không có navigator.clipboard.
async function saoChep(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const el = document.createElement("textarea");
  el.value = text;
  el.setAttribute("readonly", "");
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(el);
  if (!ok) throw new Error("copy");
}

export function TinNhanEditor() {
  const { profile, daNap: profileReady } = useHoSo();
  const { tuan: plan, daNap: planReady, error: planError } = useTuan();
  const className = profile.tenLop || "lớp mình";
  const [text, setText] = useState(MOCK_TIN_NHAN);
  const [trangThai, setTrangThai] = useState<"" | "da-chep" | "loi">("");
  const [giong, setGiong] = useState("Lịch sự, ngắn gọn");
  const [phase, setPhase] = useState<"idle" | "generating" | "saving" | "saved" | "save-error">("idle");
  const dangSoan = phase === "generating";
  const busy = dangSoan || phase === "saving";
  const [loiSoan, setLoiSoan] = useState<string | null>(null);
  const [banSoan, setBanSoan] = useState(MOCK_TIN_NHAN); // bản AI soạn gần nhất, để biết cô đã sửa chưa
  const [saveMessage, setSaveMessage] = useState("");
  const [documentId, setDocumentId] = useState(() => crypto.randomUUID());
  const pendingSave = useRef<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!busy && phase !== "save-error") return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy, phase]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) {
      const local = docNoiDung(id);
      if (typeof local?.noiDung === "string") { setText(local.noiDung); setBanSoan(local.noiDung); setDocumentId(id); }
      else fetch(`/api/documents?id=${encodeURIComponent(id)}`).then((r) => r.json()).then((x) => {
        const data = x.documents?.[0]?.noi_dung;
        if (typeof data?.noiDung === "string") { setText(data.noiDung); setBanSoan(data.noiDung); setDocumentId(id); }
      }).catch(() => {});
    }
  }, []);

  async function savePayload(payload: Record<string, unknown>) {
    pendingSave.current = payload;
    setPhase("saving"); setSaveMessage("");
    try {
      const id = await luuTaiLieu("tin-nhan", payload);
      setDocumentId(id); pendingSave.current = null; setPhase("saved");
      setSaveMessage("Đã lưu tin nhắn vào thư viện.");
    } catch (error) { setPhase("save-error"); setSaveMessage(error instanceof Error ? error.message : "Chưa lưu được tin nhắn."); }
  }
  async function luuTinNhan() {
    if (busy) return;
    await savePayload(pendingSave.current ?? { id: documentId, tenHoatDong: "Tin nhắn phụ huynh", chuDe: plan.chuDe, noiDung: text });
  }

  async function chep() {
    try {
      await saoChep(text);
      setTrangThai("da-chep");
    } catch {
      setTrangThai("loi");
    }
    setTimeout(() => setTrangThai(""), 2000);
  }

  async function soanLai() {
    if (busy || phase === "save-error" || !planReady || !profileReady || planError) return;
    // Cô đã sửa tay thì hỏi trước khi ghi đè.
    if (text !== banSoan && !window.confirm("Cô đã chỉnh nội dung. Soạn lại sẽ thay bằng bản mới, cô muốn tiếp tục?")) return;
    setPhase("generating"); setSaveMessage("");
    setLoiSoan(null);
    try {
      const days = plan.ngay.map((n) => `${n.thu}: ${n.hoatDong.find((h) => h.buoi === "Hoạt động học")?.ten ?? ""}`).join("; ");
      const start = new Date(plan.tuNgay);
      const end = new Date(start); end.setUTCDate(end.getUTCDate() + 4);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loai: "tin-nhan", input: { giongVan: giong, tenLop: className, chuDe: plan.chuDe, nhanh: plan.nhanh ?? "", tuNgay: start.toLocaleDateString("vi-VN", { timeZone: "UTC" }), denNgay: end.toLocaleDateString("vi-VN", { timeZone: "UTC" }), hoatDongHoc: days } }),
      });
      const json = (await res.json().catch(() => null)) as { data?: string; error?: string } | null;
      if (!res.ok || typeof json?.data !== "string") throw new Error(json?.error ?? "Không soạn lại được. Thử lại sau ít phút.");
      setText(json.data);
      setBanSoan(json.data);
      await savePayload({ id: documentId, tenHoatDong: "Tin nhắn phụ huynh", chuDe: plan.chuDe, noiDung: json.data });
    } catch (e) {
      setPhase("idle");
      setLoiSoan(e instanceof TypeError ? "Mất kết nối mạng. Cô kiểm tra mạng rồi thử lại." : e instanceof Error ? e.message : "Không soạn lại được.");
    }
  }

  const dai = text.length > GIOI_HAN;

  return (
    <div className="grid gap-10 xl:grid-cols-[1fr_360px] items-start">
      <div className="space-y-5 rounded-the border border-vien bg-trang p-5 sm:p-6 shadow-the">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Dựa trên">
            <Select options={[`Kế hoạch tuần: ${plan.chuDe} (${new Date(plan.tuNgay).toLocaleDateString("vi-VN", { timeZone: "UTC" })})`]} />
          </Field>
          <Field label="Giọng văn">
            <Select options={["Lịch sự, ngắn gọn", "Thân mật", "Trang trọng"]} value={giong} disabled={busy} onChange={(e) => setGiong(e.target.value)} />
          </Field>
        </div>
        <Field label="Nội dung">
          <Textarea rows={15} value={text} disabled={busy} onChange={(e) => { setText(e.target.value); setPhase("idle"); setSaveMessage(""); pendingSave.current = null; }} />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant={phase === "save-error" ? "phu" : "chinh"} onClick={chep} className="h-12 px-5" disabled={busy}>
            {trangThai === "da-chep" ? <Check size={18} strokeWidth={2.5} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
            {trangThai === "da-chep" ? "Đã sao chép" : "Sao chép tin nhắn"}
          </Button>
          {phase === "save-error" && <Button type="button" onClick={luuTinNhan} disabled={busy}>Thử lưu lại</Button>}
          <ActionMenu label="Tùy chọn tin nhắn"><Button type="button" variant="nhe" onClick={soanLai} disabled={busy || phase === "save-error" || !planReady || !profileReady || Boolean(planError)}>
            {dangSoan ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <RefreshCw size={17} aria-hidden="true" />}
            {dangSoan ? "Đang soạn…" : "Soạn lại"}
          </Button>
          {phase !== "save-error" && <Button type="button" variant="nhe" onClick={luuTinNhan} disabled={busy}>{phase === "saving" ? "Đang lưu…" : "Lưu vào thư viện"}</Button>}</ActionMenu>
          <span className={`ml-auto text-sm tabular-nums ${dai ? "text-butdo font-semibold" : "text-muc-nhat"}`}>
            {text.length}/{GIOI_HAN} ký tự
          </span>
        </div>
        {busy && <p className="text-sm text-muc-nhat" role="status">{dangSoan ? "Đang soạn tin nhắn… Thời gian tùy nội dung và dịch vụ AI." : "Đã có nội dung · Đang lưu vào thư viện…"}</p>}
        {saveMessage && <p className={`text-sm ${phase === "save-error" ? "text-butdo" : "text-la"}`} role={phase === "save-error" ? "alert" : "status"}>{phase === "save-error" ? `Nội dung vẫn được giữ lại. ${saveMessage} Cô giữ trang mở và thử lưu lại, không dùng thêm lượt AI.` : saveMessage}</p>}
        {planError && <p role="alert" className="text-sm text-butdo">{planError}</p>}
        {loiSoan && (
          <p className="text-[13px] text-butdo" role="alert">
            {loiSoan}
          </p>
        )}
        {trangThai === "loi" && (
          <p className="text-[13px] text-butdo" role="alert">
            Không sao chép được, cô bôi đen nội dung rồi sao chép thủ công.
          </p>
        )}
      </div>

      {/* Xem trước như trong nhóm Zalo của lớp */}
      <figure className="mx-auto w-full max-w-[340px]">
        <div className="giay-co-dinh rounded-[36px] bg-muc p-2.5 shadow-noi">
          <div className="rounded-[28px] overflow-hidden bg-[#e2e9f1]">
            <div className="flex items-center gap-3 bg-xanh px-4 pt-5 pb-3 text-white">
              <span className="h-9 w-9 rounded-full bg-white/20 grid place-items-center" aria-hidden="true">
                <Users size={18} />
              </span>
              <span>
                <span className="block text-[14px] font-semibold leading-tight">Phụ huynh · {className}</span>
                <span className="block text-[11.5px] text-white">Bản xem trước tin nhắn</span>
              </span>
            </div>
            <div className="h-[460px] overflow-y-auto p-3">
              <div className="flex gap-2 items-end">
                <span className="h-7 w-7 rounded-full bg-phan text-muc text-[12px] font-bold grid place-items-center shrink-0" aria-hidden="true">
                  {profile.hoTen.slice(0, 1) || "C"}
                </span>
                <div className="rounded-2xl rounded-bl-md bg-trang px-3 py-2.5 shadow-sm max-w-[85%]">
                  <p className="text-[11.5px] font-semibold text-xanh">{profile.hoTen || "Giáo viên"}</p>
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-muc">{text || "…"}</p>
                  <p className="mt-1 text-right text-[10.5px] text-muc-nhat">20:15</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <figcaption className="mt-3 text-center text-[13px] text-muc-nhat">Xem trước khi dán vào nhóm Zalo</figcaption>
      </figure>
    </div>
  );
}
