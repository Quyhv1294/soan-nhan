"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button, Field, Input, Select, Textarea } from "./ui";
import { goiSoan } from "@/lib/goi-api";
import { LUA_TUOI_HOC_LIEU } from "@/lib/yeu-cau-hoc-lieu";
import { useHoSo } from "@/lib/use-ho-so";

export function TaoHocLieuAi({ loai, mau, input, disabled, auto, onAutoChange, onBusy, onResult, onChuDeChange, tieuDe }: {
  loai: "phieu" | "tro-choi"; mau: string; input: Record<string, string | undefined>; disabled: boolean;
  auto: boolean; onAutoChange: (auto: boolean) => void;
  onBusy: (busy: boolean) => void; onResult: (result: unknown) => void;
  // Để trang cha dùng chung MỘT ô chủ đề này, không phải nhập lại ở chỗ khác.
  onChuDeChange?: (chuDe: string) => void;
  tieuDe?: string;
}) {
  const { profile, daNap } = useHoSo();
  const [age, setAge] = useState(LUA_TUOI_HOC_LIEU[2]);
  const ageChanged = useRef(false), busyRef = useRef(false), alive = useRef(true);
  const [topic, setTopic] = useState(input.chuDe ?? "");
  const [request, setRequest] = useState("");
  const [range, setRange] = useState(input.phamVi ?? "7"), [letters, setLetters] = useState(input.chuCai ?? "a,ă,â,e,ê"), [pattern, setPattern] = useState(input.quyLuat ?? "ABB");
  const [count, setCount] = useState("6"), [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => { if (daNap && !ageChanged.current && LUA_TUOI_HOC_LIEU.includes(profile.doTuoi)) setAge(profile.doTuoi); }, [daNap, profile.doTuoi]);
  useEffect(() => { if (input.doTuoi && LUA_TUOI_HOC_LIEU.includes(input.doTuoi)) { setAge(input.doTuoi); ageChanged.current = true; } }, [input.doTuoi]);
  useEffect(() => { if (input.chuDe) setTopic(input.chuDe); }, [input.chuDe]);
  useEffect(() => { if (input.phamVi) setRange(input.phamVi); }, [input.phamVi]);
  useEffect(() => { if (input.chuCai) setLetters(input.chuCai); }, [input.chuCai]);
  useEffect(() => { if (input.quyLuat) setPattern(input.quyLuat); }, [input.quyLuat]);
  async function generate() {
    if (busyRef.current || disabled) return;
    if (!topic.trim()) { setError("Cô nhập chủ đề trước khi tạo bằng AI nhé."); return; }
    busyRef.current = true; setBusy(true); onBusy(true); setError("");
    try {
      const result = await goiSoan<unknown>(loai, { ...input, mau: auto ? "tu-dong" : mau, chuDe: topic.trim(), doTuoi: age, yeuCau: request, soLuong: count, ...(loai === "phieu" ? { phamVi: range, chuCai: letters, quyLuat: pattern } : {}) });
      if (alive.current) onResult(result);
    } catch (e) { if (alive.current) setError(e instanceof Error ? e.message : "Chưa tạo được nội dung bằng AI."); }
    finally { busyRef.current = false; if (alive.current) { setBusy(false); onBusy(false); } }
  }
  return <section className="space-y-4 rounded-the border border-bang/30 bg-bang-nhat p-4 sm:p-5" aria-label="Tạo nội dung bằng AI" aria-busy={busy} onKeyDown={(event) => {
    if (event.key === "Enter" && !event.nativeEvent.isComposing && event.target instanceof HTMLInputElement && event.target.type !== "checkbox") { event.preventDefault(); void generate(); }
  }}>
    <h2 className="flex items-center gap-2 font-bold"><Sparkles size={19} aria-hidden="true" />{tieuDe ?? "Tạo nội dung mới bằng AI"}</h2>
    <fieldset disabled={disabled || busy} className="space-y-4">
      <Field label="Chủ đề"><Input value={topic} maxLength={100} onChange={(e) => { setTopic(e.target.value); onChuDeChange?.(e.target.value); }} placeholder="Ví dụ: Cơ thể của bé, động vật dưới nước…" /></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Độ tuổi / lớp"><Select options={LUA_TUOI_HOC_LIEU} value={age} onChange={(e) => { ageChanged.current = true; setAge(e.target.value); }} /></Field>{loai === "tro-choi" && <Field label="Số lượng (câu hỏi, cặp thẻ hoặc bước)"><Select options={Array.from({ length: 8 }, (_, i) => String(i + 3))} value={count} onChange={(e) => setCount(e.target.value)} /></Field>}</div>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base"><input type="checkbox" checked={auto} onChange={(e) => onAutoChange(e.target.checked)} className="h-5 w-5 accent-bang" /><span>Để AI chọn {loai === "phieu" ? "dạng bài" : "kiểu trò chơi"} hợp với chủ đề</span></label>
      {!auto && <p className="text-sm text-muc-nhat">AI sẽ tạo theo {loai === "phieu" ? "mẫu phiếu" : "kiểu trò chơi"} cô đã chọn ở phần "Tự chọn" bên dưới.</p>}
      {loai === "phieu" && <details className="rounded-o border border-vien bg-trang p-3"><summary className="cursor-pointer text-sm font-semibold">Chữ cái, con số, quy luật (tùy chọn)</summary><div className="mt-3 space-y-3"><Field label="Dùng các số đến"><Select options={Array.from({ length: 8 }, (_, i) => String(i + 3))} value={range} onChange={(e) => setRange(e.target.value)} /></Field><Field label="Chữ cái muốn luyện" hint="Từ 1 đến 6 chữ viết thường, ngăn bằng dấu phẩy."><Input maxLength={30} value={letters} onChange={(e) => setLetters(e.target.value)} /></Field><Field label="Quy luật lặp hình"><Select options={["AB", "AAB", "ABB"]} value={pattern} onChange={(e) => setPattern(e.target.value)} /></Field><p className="text-sm text-muc-nhat">Chỉ áp dụng thông số tương ứng khi AI chọn bài toán, chữ cái hoặc quy luật.</p></div></details>}
      <Field label="Yêu cầu thêm (không bắt buộc)" hint="Nêu kỹ năng muốn luyện, mức độ hoặc nội dung cần tập trung."><Textarea rows={2} maxLength={300} value={request} onChange={(e) => setRequest(e.target.value)} placeholder={loai === "phieu" ? "Ví dụ: Luyện tách gộp 7, dùng hình các đồ vật gần gũi." : "Ví dụ: Ôn a, ă, â; câu hỏi ngắn, đọc to được."} /></Field>
    </fieldset>
    <Button type="button" variant={input.banTruoc ? "phu" : "chinh"} disabled={disabled || busy} onClick={generate}>{busy ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}{busy ? "AI đang tạo nội dung…" : input.banTruoc ? "Tạo bộ khác bằng AI" : "Tạo bằng AI"}</Button>
    {error && <p role="alert" className="text-sm text-butdo">{error}</p>}
    <p className="text-sm text-muc-nhat">Tạo xong, bản soạn được lưu vào thư viện. Cô xem lại và chỉnh trước khi in hoặc cho trẻ chơi.</p>
  </section>;
}
