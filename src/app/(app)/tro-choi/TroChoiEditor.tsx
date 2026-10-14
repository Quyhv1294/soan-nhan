"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, Presentation, Save } from "lucide-react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { MauPicker } from "@/components/MauPicker";
import { luuTaiLieu, docNoiDung } from "@/lib/kho-local";
import type { MauTroChoi } from "@/lib/types";
import { BO_MAU_TRO_CHOI, CHU_DE_CHOI, NOI_DUNG_MAU, docNoiDungChoi, docTroChoi, tenTroChoi, type BoChoi, type ChuDeChoi } from "@/lib/tro-choi";
import { TrinhChieuTroChoi } from "./TrinhChieuTroChoi";
import { TaoHocLieuAi } from "@/components/TaoHocLieuAi";

export function TroChoiEditor({ initial }: { initial: { id?: string; mau?: MauTroChoi; noiDung?: string } | null }) {
  const [mode, setMode] = useState<MauTroChoi>(initial?.mau ?? "lat-the");
  const [topic, setTopic] = useState<ChuDeChoi>("Bản thân & thói quen");
  const [drafts, setDrafts] = useState<Partial<Record<MauTroChoi, string>>>(initial?.noiDung ? { [initial.mau ?? "lat-the"]: initial.noiDung } : {});
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [autoAi, setAutoAi] = useState(true);
  const [aiMeta, setAiMeta] = useState<{ doTuoi?: string; chuDeAi?: string }>({});
  const [backup, setBackup] = useState<{ mode: MauTroChoi; content: string; title: string; meta: typeof aiMeta } | null>(null);
  const idRef = useRef(initial?.id ?? crypto.randomUUID());
  const savingRef = useRef(false);
  const [loading, setLoading] = useState(!initial), [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(""), [error, setError] = useState("");
  const [session, setSession] = useState<{ bo: BoChoi; title: string; key: number } | null>(null);
  const content = drafts[mode] ?? "";
  const blocked = loading || saving || creating;
  const meta = BO_MAU_TRO_CHOI.find((m) => m.value === mode)!;
  let built: BoChoi | null = null, validation = "";
  try { built = docNoiDungChoi(mode, content); } catch (e) { validation = e instanceof Error ? e.message : "Nội dung chưa hợp lệ."; }

  useEffect(() => {
    if (initial) return;
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) { setLoading(false); return; }
    let active = true;
    function load(value: unknown) {
      if (!active) return;
      try {
        const data = docTroChoi(value);
        idRef.current = id!; setMode(data.mau); setDrafts({ [data.mau]: data.noiDung }); setTitle(data.chuDe);
        const raw = value as Record<string, unknown>;
        setAiMeta({ doTuoi: typeof raw.doTuoi === "string" ? raw.doTuoi : undefined, chuDeAi: typeof raw.chuDeAi === "string" ? raw.chuDeAi : undefined });
      } catch (e) { setError(e instanceof Error ? e.message : "Chưa mở được trò chơi đã lưu."); }
      setLoading(false);
    }
    const local = docNoiDung(id);
    if (local) load(local);
    else fetch(`/api/documents?id=${encodeURIComponent(id)}`).then((r) => r.json()).then((r) => load(r.documents?.find((d: { id: string; loai: string }) => d.id === id && d.loai === "tro-choi")?.noi_dung)).catch(() => { if (active) { setError("Chưa tải được trò chơi. Cô tải lại trang để thử lại nhé."); setLoading(false); } });
    return () => { active = false; };
  }, [initial]);

  function changeMode(value: string) {
    setAutoAi(false);
    // Keep each mode's edited draft when switching to another template and back.
    setDrafts((old) => ({ ...old, [mode]: content })); setMode(value as MauTroChoi); setSaved(""); setError("");
  }
  function applyAi(value: unknown) {
    const data = docTroChoi(value), raw = value as Record<string, unknown>;
    setBackup({ mode, content, title, meta: aiMeta });
    setDrafts((old) => ({ ...old, [mode]: content, [data.mau]: data.noiDung }));
    setMode(data.mau); setTitle(data.chuDe);
    setAiMeta({ doTuoi: typeof raw.doTuoi === "string" ? raw.doTuoi : undefined, chuDeAi: typeof raw.chuDeAi === "string" ? raw.chuDeAi : undefined });
    setSaved(""); setError("");
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (loading || creating || savingRef.current) return;
    setSaved(""); setError("");
    try {
      docNoiDungChoi(mode, content); savingRef.current = true; setSaving(true);
      const id = await luuTaiLieu("tro-choi", { id: idRef.current, mau: mode, noiDung: content, chuDe: title.trim() || `${tenTroChoi(mode)} · ${topic}`, ...aiMeta });
      idRef.current = id;
      const url = new URL(window.location.href); url.searchParams.set("id", id); window.history.replaceState(null, "", url.pathname + url.search);
      setSaved("Đã lưu trò chơi vào thư viện. Lần lưu tiếp theo sẽ cập nhật bản này.");
    } catch (e) { setError(e instanceof Error ? e.message : "Chưa lưu được trò chơi."); }
    finally { savingRef.current = false; setSaving(false); }
  }
  function start() {
    if (blocked) return;
    try { setSession({ bo: docNoiDungChoi(mode, content), title: title.trim() || topic, key: Date.now() }); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Cô kiểm tra lại nội dung nhé."); }
  }
  const count = built?.muc.length ?? 0;
  const unit = mode === "lat-the" ? "cặp thẻ" : mode === "sap-xep" ? "bước" : mode === "vong-quay" ? "mục" : mode === "o-cua-bi-mat" ? "ô cửa" : "câu hỏi";

  return <>
    <div className="grid items-start gap-8 xl:grid-cols-[1fr_440px]">
      <form onSubmit={save} aria-busy={blocked} className="space-y-6 rounded-the border border-vien bg-trang p-5 shadow-the sm:p-6">
        <TaoHocLieuAi loai="tro-choi" mau={mode} auto={autoAi} onAutoChange={setAutoAi} input={{ chuDe: aiMeta.chuDeAi ?? topic, doTuoi: aiMeta.doTuoi, banTruoc: content ? content.slice(0, 1500) : undefined }} disabled={loading || saving} onBusy={setCreating} onResult={applyAi} />
        {backup && <Button type="button" variant="nhe" disabled={blocked} onClick={() => { setMode(backup.mode); setDrafts((old) => ({ ...old, [backup.mode]: backup.content })); setTitle(backup.title); setAiMeta(backup.meta); setBackup(null); setSaved(""); }}>Khôi phục nội dung trước</Button>}
        <fieldset disabled={blocked}><legend className="mb-3 text-base font-semibold">Mẫu trò chơi</legend><MauPicker name="mau" value={mode} options={BO_MAU_TRO_CHOI} onChange={changeMode} /></fieldset>
        {loading && <p role="status" className="text-sm text-muc-nhat">Đang mở trò chơi…</p>}
        <Field label="Tên trò chơi (không bắt buộc)" hint="Dùng tên riêng để dễ tìm lại trong thư viện."><Input value={title} maxLength={100} disabled={blocked} onChange={(e) => { setTitle(e.target.value); setSaved(""); }} placeholder={`${tenTroChoi(mode)} · ${topic}`} /></Field>
        <details className="rounded-o border border-vien bg-giay p-4"><summary className="cursor-pointer font-semibold">Dùng bộ nội dung có sẵn</summary><fieldset disabled={blocked} className="mt-4 space-y-3">
          <Field label="Chủ đề mẫu"><Select options={[...CHU_DE_CHOI]} value={topic} onChange={(e) => {
            // Freeze the current draft before changing the sample topic.
            setDrafts((old) => ({ ...old, [mode]: content })); setTopic(e.target.value as ChuDeChoi);
          }} /></Field>
          <Button type="button" variant="phu" onClick={() => { setDrafts((old) => ({ ...old, [mode]: NOI_DUNG_MAU[topic][mode] })); setSaved(""); setError(""); }}>Dùng nội dung mẫu</Button>
          <p className="text-sm text-muc-nhat">Nút này thay nội dung đang nhập bằng bộ mẫu đã chọn. Cô sửa từng dòng bên dưới để phù hợp với lớp.</p>
        </fieldset></details>
        <Field label="Nội dung trò chơi" hint={meta.hint}><Textarea name="noiDung" rows={8} maxLength={12000} disabled={blocked} value={content} placeholder="Tạo nội dung bằng AI ở trên, dùng bộ có sẵn hoặc tự nhập tại đây." onChange={(e) => { setDrafts((old) => ({ ...old, [mode]: e.target.value })); setSaved(""); setError(""); }} /></Field>
        {validation && !loading && !!content.trim() && <p className="text-sm text-butdo" role="status">{validation}</p>}
        <div className="flex flex-wrap gap-3"><Button type="submit" disabled={blocked || !built}>{saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}{saving ? "Đang lưu…" : "Lưu trò chơi"}</Button><Button type="button" variant="phu" disabled={blocked || !built} onClick={start}><Presentation size={18} />Trình chiếu</Button></div>
        {saved && <p className="text-sm text-la" role="status">{saved}</p>}{error && <p className="text-sm text-butdo" role="alert">{error}</p>}
        <p className="text-sm text-muc-nhat">Có thể trình chiếu ngay trước khi lưu. Cô đọc câu hỏi và hướng dẫn thao tác cho trẻ chưa đọc được chữ.</p>
      </form>
      <aside className="space-y-4 xl:sticky xl:top-6"><div className="rounded-[18px] bg-muc p-2.5 shadow-noi"><div className="bang-phan flex aspect-video flex-col items-center justify-center rounded-[12px] p-5 text-center text-white"><h2 className="font-tay text-2xl text-phan">{meta.label}</h2><p className="mt-3 text-white/85">{count ? `${count} ${unit}` : "Tạo nội dung để bắt đầu"}</p><Button type="button" variant="phu" disabled={blocked || !built} className="mt-5" onClick={start}>Mở trình chiếu</Button></div></div><p className="text-sm leading-relaxed text-muc-nhat">{meta.note}. Màn hình chơi có nút Chơi lại; bấm Esc để thoát. Có thể dùng F11 của trình duyệt để ẩn thanh công cụ.</p><div className="rounded-o border border-vien bg-trang p-4"><h3 className="font-semibold">Cách nhập mẫu này</h3><p className="mt-2 text-sm leading-relaxed text-muc-nhat">{meta.hint}</p><p className="mt-3 text-sm text-muc-nhat">AI tạo nội dung theo yêu cầu của cô. Nếu cần bắt đầu nhanh, vẫn có 21 bộ mẫu trong mục Dùng bộ nội dung có sẵn.</p></div></aside>
    </div>
    {session && <TrinhChieuTroChoi key={session.key} bo={session.bo} title={session.title} onClose={() => setSession(null)} onReplay={() => setSession((old) => old ? { ...old, key: old.key + 1 } : null)} />}
  </>;
}
