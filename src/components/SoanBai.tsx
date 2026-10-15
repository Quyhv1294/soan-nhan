"use client";

import { Fragment, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Check, History, Loader2, Pencil, Redo2, Save, Undo2, WandSparkles } from "lucide-react";
import { Button } from "./ui";
import { ActionMenu } from "./ActionMenu";
import { EditorTabs } from "./EditorTabs";
import { XemLon } from "./XemLon";
import { docGiaoAn, docNoiDung, luuTaiLieu } from "@/lib/kho-local";
import { chuanHoaNoiDung, docBanSoan, dongGoiBanSoan, giuIdTaiLieu, themPhienBan, type NguonBanSoan, type PhienBan, type TaiLieuCoId } from "@/lib/ban-soan";
import type { LoaiTaiLieu } from "@/lib/types";

type Stage = "idle" | "generating" | "saving" | "saved" | "save-error";
type SaveJob<T> = { data: T; versions: PhienBan<T>[]; source: NguonBanSoan };

export function SoanBai<T extends TaiLieuCoId>({ loai, form, initial, render, renderEditor, actions, primaryActions, tiepTheo, afterSave }: {
  loai: LoaiTaiLieu;
  form: ReactNode | ((data: T | null) => ReactNode);
  initial: T | null;
  render: (data: T) => ReactNode;
  renderEditor: (data: T, onChange: (data: T) => void) => ReactNode;
  actions?: (data: T) => ReactNode;
  // Các nút cô cần nhất sau khi soạn xong (tải Word, tải PDF, in). Luôn hiện sẵn, không giấu trong menu.
  // Mỗi phần tử là một nút; phần tử đầu là nút chính.
  primaryActions?: (data: T) => ReactNode[];
  // Khối "Làm tiếp" dưới bản soạn: gợi ý việc cô thường làm kế tiếp, mang theo chủ đề đã có.
  tiepTheo?: (data: T) => ReactNode;
  afterSave?: (data: T) => ReactNode;
}) {
  const initialVersion = initial ? docBanSoan(initial) : null;
  const uid = useId();
  const [tab, setTab] = useState<"info" | "output">(initial ? "output" : "info");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [data, setData] = useState<T | null>(initialVersion?.data ?? null);
  const [versions, setVersions] = useState<PhienBan<T>[]>(initialVersion?.phienBan ?? []);
  const [source, setSource] = useState<NguonBanSoan>(initialVersion?.nguon ?? "khong-ro");
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [draft, setDraft] = useState<T | null>(null);
  const [undo, setUndo] = useState<T[]>([]);
  const [redo, setRedo] = useState<T[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const pending = useRef<SaveJob<T> | null>(null);
  const busyRef = useRef(false);
  const outputRef = useRef<HTMLElement>(null);
  const busy = stage === "generating" || stage === "saving";
  const draftChanged = draft !== null && JSON.stringify(draft) !== JSON.stringify(data);

  useEffect(() => {
    if (initial) return;
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return;
    const local = docNoiDung(id) ?? (loai === "giao-an" ? docGiaoAn(id) : null);
    if (!local) return;
    const loaded = docBanSoan(local as T);
    setData(loaded.data); setVersions(loaded.phienBan); setSource(loaded.nguon);
    setTab("output");
  }, [initial, loai]);

  useEffect(() => {
    if (stage !== "generating") return;
    setElapsed(0);
    const timer = setInterval(() => setElapsed((seconds) => seconds + 1), 1000);
    return () => clearInterval(timer);
  }, [stage]);

  useEffect(() => {
    if (!draftChanged && stage !== "save-error" && !busy) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [draftChanged, stage, busy]);

  async function saveSnapshot(job: SaveJob<T>) {
    pending.current = job;
    setStage("saving"); setSaveError("");
    try {
      const packed = dongGoiBanSoan(job.data, job.versions, job.source);
      const id = await luuTaiLieu(loai, packed as unknown as Record<string, unknown>);
      setData({ ...job.data, id });
      const url = new URL(window.location.href);
      url.searchParams.set("id", id);
      window.history.replaceState(null, "", url.pathname + url.search);
      pending.current = null;
      setStage("saved");
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Chưa lưu được tài liệu.");
      setStage("save-error");
    }
  }

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current || draft || stage === "save-error") return;
    busyRef.current = true; setStage("generating"); setError("");
    try {
      const input = Object.fromEntries(new FormData(event.currentTarget));
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ loai, input }) });
      const json = await response.json().catch(() => null) as { data?: T; error?: string; nguon?: "ai" | "mau" } | null;
      if (!response.ok || !json?.data) throw new Error(json?.error ?? "Không soạn được nội dung. Cô thử lại sau nhé.");
      const next = giuIdTaiLieu(json.data, data);
      const nextVersions = data ? themPhienBan(versions, data, source, "Trước khi soạn lại") : versions;
      const nextSource = json.nguon ?? "ai";
      setData(next); setVersions(nextVersions); setSource(nextSource);
      setTab("output");
      requestAnimationFrame(() => { if (window.matchMedia("(max-width: 1279px)").matches) outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); });
      await saveSnapshot({ data: next, versions: nextVersions, source: nextSource });
    } catch (e) {
      setError(e instanceof TypeError ? "Mất kết nối mạng. Cô kiểm tra mạng rồi thử lại." : e instanceof Error ? e.message : "Chưa soạn được nội dung.");
      setStage("idle");
    } finally { busyRef.current = false; }
  }

  function updateDraft(next: T) {
    if (!draft) return;
    setUndo((history) => [...history.slice(-29), draft]); setRedo([]); setDraft(next);
  }
  function undoDraft() {
    const previous = undo.at(-1);
    if (!previous || !draft) return;
    setRedo((history) => [...history, draft]); setDraft(previous); setUndo(undo.slice(0, -1));
  }
  function redoDraft() {
    const next = redo.at(-1);
    if (!next || !draft) return;
    setUndo((history) => [...history, draft]); setDraft(next); setRedo(redo.slice(0, -1));
  }
  async function saveEdits(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data || !draft || busyRef.current) return;
    const fields = event.currentTarget.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input[required],textarea[required]");
    for (const field of fields) { field.setCustomValidity(field.value.trim() ? "" : "Cô điền nội dung cho mục này nhé."); }
    if (!event.currentTarget.reportValidity()) return;
    busyRef.current = true;
    const next = giuIdTaiLieu(chuanHoaNoiDung(draft), data);
    const nextVersions = themPhienBan(versions, data, source, "Trước khi chỉnh sửa");
    setData(next); setVersions(nextVersions); setSource("chinh-sua"); setDraft(null); setError("");
    await saveSnapshot({ data: next, versions: nextVersions, source: "chinh-sua" });
    busyRef.current = false;
  }
  async function restore(index: number) {
    if (!data || busyRef.current) return;
    const selected = versions[index];
    if (!selected) return;
    busyRef.current = true; setError("");
    const next = giuIdTaiLieu(selected.data, data);
    const nextVersions = themPhienBan(versions.filter((_, i) => i !== index), data, source, "Trước khi khôi phục");
    setData(next); setVersions(nextVersions); setSource(selected.nguon);
    await saveSnapshot({ data: next, versions: nextVersions, source: selected.nguon });
    busyRef.current = false;
  }
  async function retrySave() {
    if (!pending.current || busyRef.current) return;
    busyRef.current = true;
    await saveSnapshot(pending.current);
    busyRef.current = false;
  }

  const startEditing = () => { if (data) { setTab("output"); setDraft(structuredClone(data)); setUndo([]); setRedo([]); } };
  return <div className="soan-layout grid items-start gap-5 pb-20 xl:grid-cols-[340px_1fr] xl:gap-8 xl:pb-0">
    <EditorTabs id={uid} value={tab} onChange={setTab} hasOutput={Boolean(data)} />
    <form id={`${uid}-info`} role="tabpanel" aria-labelledby={`${uid}-info-tab`} onSubmit={generate} className={`khong-in space-y-5 rounded-the border border-vien bg-trang p-5 shadow-the xl:sticky xl:top-6 ${tab === "info" ? "" : "hidden xl:block"}`} aria-busy={stage === "generating"}>
      <fieldset key={JSON.stringify(data)} disabled={busy || Boolean(draft)} className="space-y-5">{typeof form === "function" ? form(data) : form}</fieldset>
      <div className="hidden xl:block"><Button type="submit" variant={data ? "phu" : "chinh"} className="h-12 w-full" disabled={busy || Boolean(draft) || stage === "save-error"}>
        {busy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <WandSparkles size={18} aria-hidden="true" />}
        {stage === "generating" ? "Đang soạn…" : stage === "saving" ? "Đang lưu…" : data ? "Soạn lại" : "Soạn"}
      </Button></div>
      <p className="text-sm text-muc-nhat">{data ? "Soạn lại sẽ tạo bản mới và dùng thêm 1 lượt. Cô có thể khôi phục bản trước trong Các bản đã lưu." : "Mỗi lần bấm Soạn dùng 1 lượt trong tháng."}</p>
      {draft && <p className="text-sm text-muc-nhat">Cô lưu hoặc hủy chỉnh sửa trước khi soạn lại nhé.</p>}
      {error && <p role="alert" className="text-sm text-butdo">{error}{data ? " Bản đang có vẫn được giữ lại." : ""}</p>}
    </form>

    <section id={`${uid}-output`} ref={outputRef} role="tabpanel" aria-labelledby={`${uid}-output-tab`} className={`soan-output min-w-0 scroll-mt-20 ${tab === "output" ? "" : "hidden xl:block"}`} aria-label="Bản soạn" aria-busy={busy}>
      <div className="khong-in mb-4" role="status" aria-live="polite" aria-atomic="true">
        {stage === "generating" && <div className="rounded-o bg-phan-nhat p-4 text-sm"><p className="flex items-center gap-2 font-semibold"><Loader2 size={17} className="animate-spin" aria-hidden="true" />Đang soạn nội dung…</p><p className="mt-1 text-muc-nhat">{elapsed < 30 ? "Thường mất 10–30 giây. Cô giữ trang này mở nhé." : elapsed < 60 ? "Hôm nay AI hơi chậm. Cô chờ thêm chút, bản soạn sẽ tự hiện ra." : "AI đang rất chậm. Cô chờ thêm, hoặc thử lại sau ít phút nếu vẫn chưa có kết quả."} Đã chờ {elapsed} giây.</p></div>}
        {stage === "saving" && <p className="flex items-center gap-2 rounded-o bg-bang-nhat p-3 text-sm"><Loader2 size={17} className="animate-spin" aria-hidden="true" />Đã có nội dung · Đang lưu vào thư viện…</p>}
        {stage === "saved" && <p className="flex items-center gap-2 rounded-o bg-la-nhat p-3 text-sm text-bang"><Check size={17} aria-hidden="true" />Đã lưu vào thư viện (có giữ các bản cũ).</p>}
      </div>
      {stage === "save-error" && <div className="khong-in mb-4 rounded-o border border-butdo/30 bg-phan-nhat p-4"><p role="alert" className="text-sm"><b>Nội dung đã sẵn sàng nhưng chưa lưu được.</b> {saveError}</p><p className="mt-1 text-sm text-muc-nhat">Cô có thể thử lưu lại hoặc tải file. Giữ trang mở để không mất bản đang có.</p><Button type="button" className="mt-3 hidden xl:inline-flex" onClick={retrySave}><Save size={17} aria-hidden="true" />Thử lưu lại</Button><p className="mt-2 text-sm text-muc-nhat">Thử lưu lại không gọi AI và không dùng thêm lượt soạn.</p></div>}

      {data ? <>
        {stage === "saved" && afterSave?.(data)}
        {draft ? <form id={`${uid}-edit`} onSubmit={saveEdits} onInput={(event) => { const target = event.target; if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) target.setCustomValidity(""); }} className="khong-in space-y-5 rounded-the border border-vien bg-trang p-4 shadow-the sm:p-6" aria-label="Chỉnh sửa nội dung">
          <div><h2 className="text-lg font-bold">Chỉnh sửa nội dung</h2><p className="mt-1 text-sm text-muc-nhat">Sửa từng mục bên dưới. Bản trước được giữ lại khi cô lưu thay đổi.</p></div>
          <div className="flex flex-wrap gap-2"><Button type="button" variant="nhe" disabled={!undo.length} onClick={undoDraft}><Undo2 size={17} aria-hidden="true" />Hoàn tác</Button><Button type="button" variant="nhe" disabled={!redo.length} onClick={redoDraft}><Redo2 size={17} aria-hidden="true" />Làm lại</Button><Button type="button" variant="phu" onClick={() => setDraft(null)}>Hủy chỉnh sửa</Button></div>
          {renderEditor(draft, updateDraft)}
          <div className="hidden flex-wrap gap-2 border-t border-vien pt-4 xl:flex"><Button type="submit" disabled={!draftChanged}>Lưu thay đổi</Button><Button type="button" variant="phu" onClick={() => setDraft(null)}>Hủy chỉnh sửa</Button></div>
        </form> : <>
          <div className="khong-in mb-4 hidden flex-wrap items-center gap-2 xl:flex">{primaryActions?.(data).map((node, i) => <Fragment key={i}>{node}</Fragment>)}<Button type="button" variant="phu" disabled={busy} onClick={startEditing}><Pencil size={17} aria-hidden="true" />Chỉnh sửa</Button><ActionMenu label="Tùy chọn khác"><Button type="button" variant="nhe" data-close-menu onClick={() => setPreviewOpen(true)}>Xem lớn</Button>{actions?.(data)}</ActionMenu></div>
          {versions.length > 0 && <details className="khong-in mb-4 rounded-o border border-vien bg-trang p-3"><summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold"><History size={17} aria-hidden="true" />Các bản đã lưu ({versions.length})</summary><p className="mt-2 text-xs text-muc-nhat">Giữ tối đa 5 bản trước đó. Quay lại bản cũ không mất lượt AI.</p><ul className="mt-3 divide-y divide-vien">{versions.map((version, i) => <li key={`${version.luc}-${i}`} className="flex flex-wrap items-center justify-between gap-2 py-2"><span className="text-sm">{version.nhan}<span className="block text-xs text-muc-nhat">{new Date(version.luc).toLocaleString("vi-VN")}</span></span><Button type="button" variant="nhe" disabled={busy} onClick={() => restore(i)} aria-label={`Khôi phục phiên bản ${i + 1}`}>Khôi phục</Button></li>)}</ul></details>}
          <div className={`overflow-x-auto ${stage === "generating" ? "opacity-60" : ""}`}>{render(data)}</div>
          <p className="khong-in mt-4 border-l-2 border-vien pl-3 text-sm leading-relaxed text-muc-nhat">{source === "mau" ? "Đây là nội dung mẫu để dùng thử." : source === "chinh-sua" ? "Bản đã được cô chỉnh sửa. File tải về dùng đúng nội dung đang xem." : source === "ai" ? "Nội dung do AI soạn. Cô đọc lại và chỉnh cho phù hợp với lớp trước khi dùng." : "Cô có thể chỉnh sửa nội dung trước khi tải file và sử dụng."}</p>
          {tiepTheo && <section className="khong-in mt-6 rounded-the border border-vien bg-trang p-4 shadow-the" aria-label="Làm tiếp"><h2 className="font-bold">Làm tiếp từ bài này</h2><p className="mt-1 text-sm text-muc-nhat">Chủ đề được giữ nguyên, cô không cần nhập lại.</p><div className="mt-3 grid gap-2 sm:grid-cols-3">{tiepTheo(data)}</div></section>}
        </>}
      </> : <div className="o-ly rounded-the border border-oly-dam p-8 text-center"><div className="mx-auto max-w-lg rounded-o bg-trang/95 p-6"><h2 className="text-lg font-semibold">Bản soạn của cô</h2><p className="mt-2 text-base leading-relaxed text-muc-nhat">{stage === "generating" ? "Bản soạn sẽ xuất hiện ở đây khi hoàn tất." : "Điền thông tin rồi bấm Soạn để nhận bản nháp."}</p></div></div>}
    </section>
    <div className="khong-in fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 flex items-center justify-center gap-2 border-t border-vien bg-trang/95 px-3 py-2 backdrop-blur lg:bottom-0 lg:left-[264px] xl:hidden [&_button]:whitespace-nowrap [&_button]:px-3" aria-label="Thao tác soạn bài">
      {draft ? <><Button type="submit" form={`${uid}-edit`} disabled={busy || !draftChanged}>Lưu thay đổi</Button><Button type="button" variant="phu" onClick={() => setDraft(null)}>Hủy</Button></> : stage === "save-error" ? <Button type="button" disabled={busy} onClick={retrySave}>Thử lưu lại</Button> : tab === "info" ? <Button type="submit" form={`${uid}-info`} disabled={busy}>{busy ? "Đang xử lý…" : data ? "Soạn lại" : "Soạn"}</Button> : data ? <>{primaryActions?.(data)[0]}<Button type="button" variant={primaryActions ? "phu" : "chinh"} disabled={busy} onClick={startEditing}>Chỉnh sửa</Button></> : <Button type="button" onClick={() => setTab("info")}>Điền thông tin</Button>}
      {data && !draft && <ActionMenu label="Thêm"><Button type="button" variant="nhe" data-close-menu onClick={() => setPreviewOpen(true)}>Xem lớn</Button>{(tab === "info" ? primaryActions?.(data) : primaryActions?.(data).slice(1))?.map((node, i) => <Fragment key={i}>{node}</Fragment>)}{actions?.(data)}</ActionMenu>}
    </div>
    {previewOpen && data && <XemLon onClose={() => setPreviewOpen(false)}>{render(data)}</XemLon>}
  </div>;
}
