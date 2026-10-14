"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Loader2, Printer, Save } from "lucide-react";
import { NutTaiFile } from "@/components/NutTaiFile";
import { PhieuPreview } from "@/components/PhieuPreview";
import { Button, ChoiceGroup, Field, Input, Select } from "@/components/ui";
import { PHIEU_TIEU_DE, type MauPhieu, type PhieuHocTap } from "@/lib/types";
import { BO_MAU_PHIEU, CHU_CAI_VIET, DUNG_CHU_CAI, DUNG_PHAM_VI, docPhieu } from "@/lib/mau-phieu";
import { MauPicker } from "@/components/MauPicker";
import { docNoiDung, luuTaiLieu } from "@/lib/kho-local";
import { useTuan } from "@/lib/use-tuan";
import { EditorTabs, type EditorTab } from "@/components/EditorTabs";
import { XemLon } from "@/components/XemLon";
import { ActionMenu } from "@/components/ActionMenu";
import { TaoHocLieuAi } from "@/components/TaoHocLieuAi";
import { SuaBaiTapPhieu } from "@/components/SuaBaiTapPhieu";

type Worksheet = PhieuHocTap & { id: string };

export function PhieuEditor() {
  const uid = useId();
  const [tab, setTab] = useState<EditorTab>("info");
  const [previewOpen, setPreviewOpen] = useState(false);
  const { tuan, daNap } = useTuan();
  const changed = useRef(false);
  useEffect(() => { if (daNap && !changed.current && !new URLSearchParams(window.location.search).has("id")) setPhieu((old) => ({ ...old, chuDe: tuan.chuDe })); }, [daNap, tuan.chuDe]);
  const [phieu, setPhieu] = useState<Worksheet>(() => ({ id: crypto.randomUUID(), mau: "dem-khoanh", chuDe: "Gia đình bé", noiDung: "" }));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [autoAi, setAutoAi] = useState(true);
  const [backup, setBackup] = useState<Worksheet | null>(null);
  const blocked = loading || status === "saving" || creating;
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) { setLoading(false); return; }
    let active = true;
    const load = (data: Record<string, unknown> | null | undefined) => {
      if (!active) return;
      try { const p = docPhieu(data); setPhieu({ ...p, id }); setTab("output"); }
      catch (e) { setError(e instanceof Error ? e.message : "Chưa đọc được phiếu đã lưu."); }
      setLoading(false);
    };
    const local = docNoiDung(id);
    if (local) load(local);
    else fetch(`/api/documents?id=${encodeURIComponent(id)}`).then((r) => r.json()).then((x) => load(x.documents?.find((d: { id: string; loai: string }) => d.id === id && d.loai === "phieu")?.noi_dung)).catch(() => { if (active) { setError("Chưa tải được phiếu đã lưu. Cô tải lại trang để thử lại nhé."); setLoading(false); } });
    return () => { active = false; };
  }, []);

  function change(patch: Partial<Worksheet>) {
    changed.current = true;
    if (patch.mau) setAutoAi(false);
    if (phieu.baiTapAi && (patch.mau || patch.tuyChinh)) setBackup(phieu);
    setPhieu((old) => ({ ...old, ...patch, ...(patch.mau || patch.tuyChinh ? { baiTapAi: undefined } : {}) }));
    setStatus("idle"); setError("");
  }
  function applyAi(value: unknown) {
    const data = docPhieu(value);
    if (!data.baiTapAi) throw new Error("AI chưa trả về bài tập cho phiếu.");
    setBackup(phieu); changed.current = true;
    setPhieu({ ...data, id: phieu.id, noiDung: phieu.noiDung });
    setStatus("idle"); setError(""); setTab("output");
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (blocked) return; setStatus("saving"); setError("");
    try {
      docPhieu(phieu);
      const id = await luuTaiLieu("phieu", phieu);
      setPhieu((old) => ({ ...old, id })); setStatus("saved");
      setTab("output");
      const url = new URL(window.location.href); url.searchParams.set("id", id);
      window.history.replaceState(null, "", url.pathname + url.search);
    }
    catch (e) { setStatus("error"); setError(e instanceof Error ? e.message : "Chưa lưu được phiếu."); }
  }

  const options = <><Button type="button" variant="nhe" data-close-menu onClick={() => setPreviewOpen(true)}>Xem lớn</Button><NutTaiFile loai="phieu" dinhDang="pdf" data={phieu} tenFile={`Phieu hoc tap - ${PHIEU_TIEU_DE[phieu.mau]}`} variant="nhe" /><Button type="button" variant="nhe" onClick={() => window.print()}><Printer size={17} aria-hidden="true" />In phiếu</Button></>;

  return <div className="phieu-editor grid items-start gap-5 pb-20 xl:grid-cols-[1fr_440px] xl:gap-8 xl:pb-0">
    <EditorTabs id={uid} value={tab} onChange={setTab} hasOutput={!loading} />
    <form id={`${uid}-info`} role="tabpanel" aria-labelledby={`${uid}-info-tab`} onSubmit={save} className={`khong-in space-y-6 rounded-the border border-vien bg-trang p-5 shadow-the sm:p-6 ${tab === "info" ? "" : "hidden xl:block"}`} aria-busy={blocked}>
      <TaoHocLieuAi loai="phieu" mau={phieu.mau} auto={autoAi} onAutoChange={setAutoAi} disabled={loading || status === "saving"} onBusy={setCreating} onResult={applyAi} input={{ chuDe: phieu.chuDe, doTuoi: phieu.doTuoi, phamVi: String(phieu.tuyChinh?.phamVi ?? (phieu.mau === "dem-khoanh" ? 5 : 7)), chuCai: (phieu.tuyChinh?.chuCai ?? ["a", "ă", "â", "e", "ê"]).join(","), quyLuat: phieu.tuyChinh?.quyLuat ?? "ABB", banTruoc: phieu.baiTapAi ? JSON.stringify(phieu.baiTapAi).slice(0, 1500) : undefined }} />
      {backup && <Button type="button" variant="nhe" disabled={blocked} onClick={() => { setPhieu(backup); setBackup(null); setStatus("idle"); }}>Khôi phục nội dung trước</Button>}
      {phieu.baiTapAi && <SuaBaiTapPhieu key={JSON.stringify(phieu.baiTapAi)} phieu={{ ...phieu, baiTapAi: phieu.baiTapAi }} disabled={blocked} onApply={(baiTapAi) => { setBackup(phieu); change({ baiTapAi }); }} />}
      <fieldset disabled={blocked}>
        <legend className="mb-2.5 text-base font-semibold">Mẫu phiếu</legend>
        <MauPicker name="mau" value={phieu.mau} options={BO_MAU_PHIEU} onChange={(mau) => change({ mau: mau as MauPhieu })} />
      </fieldset>
      {loading && <p role="status" className="text-sm text-muc-nhat">Đang mở phiếu…</p>}
      {DUNG_PHAM_VI.includes(phieu.mau) && <Field label={phieu.mau === "tach-gop" ? "Tổng số cần tách, gộp" : "Phạm vi số"} hint="Điều chỉnh số lượng hình và bài tập trên phiếu."><Select options={Array.from({ length: 8 }, (_, i) => String(i + 3))} value={String(phieu.tuyChinh?.phamVi ?? (phieu.mau === "dem-khoanh" ? 5 : 7))} disabled={blocked} onChange={(e) => change({ tuyChinh: { ...phieu.tuyChinh, phamVi: Number(e.target.value) } })} /></Field>}
      {DUNG_CHU_CAI.includes(phieu.mau) && <fieldset disabled={blocked}><legend className="text-base font-semibold">Chữ cái trên phiếu</legend><p className="mt-1 text-sm text-muc-nhat">Chọn từ 1 đến 6 chữ. Tô chữ là bài làm quen nét viền, cô hướng dẫn thêm cách đưa bút.</p><div className="mt-3 flex flex-wrap gap-2">{CHU_CAI_VIET.map((c) => {
        const letters = phieu.tuyChinh?.chuCai ?? ["a", "ă", "â", "e", "ê"], selected = letters.includes(c);
        return <button key={c} type="button" aria-pressed={selected} disabled={selected ? letters.length === 1 : letters.length >= 6} onClick={() => change({ tuyChinh: { ...phieu.tuyChinh, chuCai: selected ? letters.filter((x) => x !== c) : [...letters, c] } })} className={`h-11 w-11 rounded-o border text-xl disabled:opacity-40 ${selected ? "border-bang bg-bang-nhat font-bold text-bang" : "border-vien"}`}>{c}</button>;
      })}</div></fieldset>}
      {phieu.mau === "quy-luat" && <fieldset disabled={blocked}><legend className="mb-2 text-base font-semibold">Kiểu lặp hình</legend><ChoiceGroup name="quyLuat" value={phieu.tuyChinh?.quyLuat ?? "ABB"} options={[{ value: "AB", label: "AB", note: "Một hình A, một hình B" }, { value: "AAB", label: "AAB", note: "Hai hình A, một hình B" }, { value: "ABB", label: "ABB", note: "Một hình A, hai hình B" }]} onValueChange={(value) => change({ tuyChinh: { ...phieu.tuyChinh, quyLuat: value as "AB" | "AAB" | "ABB" } })} /></fieldset>}
      <Field label="Chủ đề" hint="Ví dụ: Gia đình bé, hình học, thiên nhiên, động vật hoặc giao thông.">
        <Input name="chuDe" value={phieu.chuDe} maxLength={100} disabled={blocked} onChange={(e) => change({ chuDe: e.target.value })} />
      </Field>
      <Field label="Ghi chú trên phiếu (không bắt buộc)" hint="Ghi chú xuất hiện ở cuối phiếu. Các bài tập thay đổi theo mẫu được chọn.">
        <Input name="noiDung" value={phieu.noiDung ?? ""} maxLength={140} disabled={blocked} onChange={(e) => change({ noiDung: e.target.value })} placeholder="Cô có thể hướng dẫn bé làm cùng bố mẹ." />
      </Field>
      <div className="hidden flex-wrap gap-2 xl:flex">
        <Button type="submit" disabled={blocked}>{status === "saving" ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}{status === "saving" ? "Đang lưu…" : status === "error" ? "Thử lưu lại" : "Lưu phiếu"}</Button>
        <ActionMenu label="Tùy chọn phiếu">{options}</ActionMenu>
      </div>
      {status === "saved" && <p className="text-sm text-la" role="status">Đã lưu phiếu vào thư viện.</p>}
      {error && <p className="text-sm text-butdo" role="alert">{error}</p>}
      <p className="text-sm text-muc-nhat">{phieu.baiTapAi ? "Phiếu đang dùng bài tập do AI tạo." : "Phiếu đang dùng dữ kiện mẫu để xem bố cục. Bấm Tạo bằng AI để có bộ bài tập mới."} Bản xem trước và PDF dùng chung một nội dung, để trống phần trả lời.</p>
    </form>
    <section id={`${uid}-output`} role="tabpanel" aria-labelledby={`${uid}-output-tab`} className={`phieu-output min-w-0 ${tab === "output" ? "" : "hidden xl:block"}`}><p className="khong-in mb-3 text-sm font-semibold text-muc-nhat">Xem trước · A4 · {phieu.baiTapAi ? "Bài tập AI" : "Dữ kiện mẫu"}</p><PhieuPreview phieu={phieu} />{status === "saved" && <p className="khong-in mt-3 text-sm text-la" role="status">Đã lưu phiếu vào thư viện.</p>}{error && <p className="khong-in mt-3 text-sm text-butdo" role="alert">{error}</p>}</section>
    <div className="khong-in fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 flex items-center justify-center gap-2 border-t border-vien bg-trang/95 px-3 py-2 backdrop-blur lg:bottom-0 lg:left-[264px] xl:hidden" aria-label="Thao tác phiếu học tập"><Button type="submit" form={`${uid}-info`} disabled={blocked}>{status === "saving" ? "Đang lưu…" : status === "error" ? "Thử lưu lại" : "Lưu phiếu"}</Button><ActionMenu label="Tùy chọn">{options}</ActionMenu></div>
    {previewOpen && <XemLon onClose={() => setPreviewOpen(false)}><PhieuPreview phieu={phieu} /></XemLon>}
  </div>;
}
