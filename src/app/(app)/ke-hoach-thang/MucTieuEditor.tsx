"use client";

import { useEffect, useState } from "react";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { cacONoiDung, docKeHoachThang } from "@/lib/ke-hoach-thang";
import { nhanMucTieu, taoBoMucTieuThang10 } from "@/lib/muc-tieu";
import { DO_TUOI_LABEL, LINH_VUC, type BoMucTieu, type KeHoachThang, type NoiDungNhom } from "@/lib/types";
import { chuanHoaTimKiem } from "@/lib/thu-vien";
import { Modal } from "@/components/Modal";
import { docTaiLieu } from "@/lib/kho-local";
import { demoAllowed } from "@/lib/supabase/configured";

const SELECT = "min-h-11 w-full rounded-o border border-vien-nhap bg-trang px-3 text-base focus:outline-bang";
export function BoMucTieuEditor({ plan, onChange }: { plan: KeHoachThang; onChange: (p: KeHoachThang) => void }) {
  const [query, setQuery] = useState("");
  const [reuse, setReuse] = useState(false);
  const b = plan.boMucTieu;
  function update(next: BoMucTieu) { onChange({ ...plan, boMucTieu: next }); }
  const cells = cacONoiDung(plan);
  const used = (id: string) => cells.filter((o) => o.nhom.mucTieuIds?.includes(id)).length;
  function remove() {
    if (!window.confirm("Gỡ bộ mục tiêu và toàn bộ lựa chọn MT trong kế hoạch này? Nội dung hoạt động và giáo án đã lưu được giữ nguyên.")) return;
    const groups = (items: NoiDungNhom[]) => items.map(({ mucTieuIds: _old, ...g }) => g);
    const { boMucTieu: _old, ...rest } = plan;
    onChange({ ...rest, nhom: groups(plan.nhom), tuan: plan.tuan.map((w) => ({ ...w, nhom: groups(w.nhom), ngay: w.ngay.map((d) => ({ ...d, nhom: groups(d.nhom) })) })) });
  }
  return <details className="rounded-the border border-vien bg-trang">
    <summary className="cursor-pointer p-4 font-bold">Bộ mục tiêu MT <span className="font-normal text-muc-nhat">· {b ? `${b.mucTieu.length} mục tiêu · ${b.phienBan}` : "Chưa chọn"}</span></summary>
    <div className="space-y-4 border-t border-vien p-4">
      <p className="text-sm leading-relaxed text-muc-nhat">Mã MT thuộc bộ của trường/lớp. Nguồn, phiên bản và độ tuổi được lưu cùng kế hoạch; chọn mã ở từng ô sau khi có bộ mục tiêu.</p>
      {!b ? <div className="flex flex-wrap gap-2">
        <Button type="button" variant="phu" onClick={() => update({ id: crypto.randomUUID(), ten: "Bộ mục tiêu của lớp", nguon: "Giáo viên nhập", phienBan: "1", doTuoi: plan.doTuoi, mucTieu: [] })}>Tạo bộ riêng</Button>
        <Button type="button" variant="phu" disabled={plan.doTuoi !== "5-6"} onClick={() => update(taoBoMucTieuThang10())}>Dùng 11 MT từ mẫu tháng 10 (5–6 tuổi)</Button>
        <Button type="button" variant="phu" onClick={() => setReuse(true)}>Dùng bộ MT từ kế hoạch đã lưu</Button>
        {plan.doTuoi !== "5-6" && <p className="w-full text-sm text-muc-nhat">Mẫu tháng 10 dành cho lớp 5–6 tuổi. Cô tạo bộ riêng cho độ tuổi đang chọn nhé.</p>}
      </div> : <>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên bộ mục tiêu"><Input value={b.ten} maxLength={200} onChange={(e) => update({ ...b, ten: e.target.value })} /></Field>
          <Field label="Phiên bản"><Input value={b.phienBan} maxLength={100} onChange={(e) => update({ ...b, phienBan: e.target.value })} /></Field>
          <div className="sm:col-span-2"><Field label="Nguồn bộ mục tiêu"><Textarea rows={2} value={b.nguon} maxLength={1000} onChange={(e) => update({ ...b, nguon: e.target.value })} /></Field></div>
        </div>
        <p className="text-sm text-muc-nhat">Độ tuổi: {DO_TUOI_LABEL[b.doTuoi]}. Mẫu được chép từ cột MT trong tài liệu cô gửi; cô rà lại và sửa theo bộ đang dùng tại trường.</p>
        <Field label="Tìm mục tiêu"><Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Mã MT hoặc nội dung" /></Field>
        <div className="space-y-3">{b.mucTieu.filter((mt) => chuanHoaTimKiem(`${mt.ma} ${mt.chiTieu} ${mt.moTa}`).includes(chuanHoaTimKiem(query))).map((mt) => <details key={mt.id} className="rounded-o border border-vien p-3" open={!mt.ma}>
          <summary className="cursor-pointer break-words font-semibold">{mt.ma ? nhanMucTieu(mt) : "Mục tiêu mới"}<span className="ml-2 text-sm font-normal text-muc-nhat">{used(mt.id)} ô đang dùng</span></summary>
          <div className="mt-3 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Mã mục tiêu"><Input value={mt.ma} maxLength={40} placeholder="MT40" onChange={(e) => update({ ...b, mucTieu: b.mucTieu.map((m) => m.id === mt.id ? { ...m, ma: e.target.value } : m) })} /></Field><Field label="Chỉ tiêu (không bắt buộc)"><Input value={mt.chiTieu} maxLength={100} placeholder="1.1" onChange={(e) => update({ ...b, mucTieu: b.mucTieu.map((m) => m.id === mt.id ? { ...m, chiTieu: e.target.value } : m) })} /></Field></div>
            <Field label="Mô tả"><Textarea rows={4} value={mt.moTa} maxLength={6000} onChange={(e) => update({ ...b, mucTieu: b.mucTieu.map((m) => m.id === mt.id ? { ...m, moTa: e.target.value } : m) })} /></Field>
            <Field label="Lĩnh vực (không bắt buộc)"><select className={SELECT} value={mt.linhVuc ?? ""} onChange={(e) => update({ ...b, mucTieu: b.mucTieu.map((m) => m.id === mt.id ? { ...m, linhVuc: e.target.value ? e.target.value as typeof mt.linhVuc : undefined } : m) })}><option value="">Chưa phân loại</option>{LINH_VUC.map((l) => <option key={l}>{l}</option>)}</select></Field>
            <Button type="button" variant="nhe" disabled={used(mt.id) > 0} onClick={() => { if (mt.moTa.trim() && !window.confirm(`Xóa mục tiêu ${mt.ma || "mới"} khỏi bộ?`)) return; update({ ...b, mucTieu: b.mucTieu.filter((m) => m.id !== mt.id) }); }}>Xóa mục tiêu</Button>
            {used(mt.id) > 0 && <p className="text-sm text-muc-nhat">Bỏ chọn mục tiêu ở các ô đang dùng trước khi xóa.</p>}
          </div>
        </details>)}</div>
        <div className="flex flex-wrap gap-2"><Button type="button" variant="phu" disabled={b.mucTieu.length >= 200} onClick={() => { setQuery(""); update({ ...b, mucTieu: [...b.mucTieu, { id: crypto.randomUUID(), ma: "", chiTieu: "", moTa: "" }] }); }}>Thêm mục tiêu</Button><Button type="button" variant="nhe" onClick={remove}>Gỡ bộ mục tiêu</Button></div>
      </>}
    </div>
    {reuse && <Modal title="Dùng lại bộ mục tiêu" onClose={() => setReuse(false)}><DungLaiBoMT doTuoi={plan.doTuoi} onChoose={(bo) => { update({ ...structuredClone(bo), id: crypto.randomUUID(), mucTieu: bo.mucTieu.map((mt) => ({ ...mt, id: crypto.randomUUID() })) }); setReuse(false); }} /></Modal>}
  </details>;
}

function DungLaiBoMT({ doTuoi, onChoose }: { doTuoi: KeHoachThang["doTuoi"]; onChoose: (bo: BoMucTieu) => void }) {
  const [items, setItems] = useState<{ id: string; ten: string; bo: BoMucTieu }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    setLoading(true); setError("");
    async function load() {
      let docs: { id: string; ten: string; noiDung: unknown }[];
      if (demoAllowed()) docs = docTaiLieu().filter((d) => d.loai === "ke-hoach-thang").map((d) => ({ id: d.id, ten: d.tieuDe, noiDung: d.noiDung }));
      else {
        const response = await fetch("/api/documents?loai=ke-hoach-thang", { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Chưa tải được bộ MT đã lưu.");
        docs = (result.documents ?? []).filter((d: { loai: string }) => d.loai === "ke-hoach-thang").map((d: { id: string; tieu_de: string; noi_dung: unknown }) => ({ id: d.id, ten: d.tieu_de, noiDung: d.noi_dung }));
      }
      const result = docs.flatMap((d) => { try { const p = docKeHoachThang(d.noiDung); return p.doTuoi === doTuoi && p.boMucTieu?.mucTieu.length ? [{ id: d.id, ten: d.ten, bo: p.boMucTieu }] : []; } catch { return []; } });
      if (active) setItems(result);
    }
    load().catch((e) => { if (active) setError(e instanceof Error && e.name !== "AbortError" ? e.message : "Tải danh sách quá lâu. Cô thử lại nhé."); }).finally(() => { clearTimeout(timer); if (active) setLoading(false); });
    return () => { active = false; controller.abort(); clearTimeout(timer); };
  }, [doTuoi, retry]);
  return <div className="space-y-3 p-4"><p className="text-sm text-muc-nhat">Chọn bộ cùng độ tuổi từ các kế hoạch tải về trong thư viện. Bản sao giữ nguồn/phiên bản và được chỉnh riêng trong tháng này.</p>{loading ? <p role="status">Đang tải…</p> : items.length ? <ul className="max-h-96 divide-y divide-vien overflow-y-auto">{items.map((item) => <li key={item.id} className="space-y-2 py-3"><p className="font-semibold">{item.bo.ten} · {item.bo.phienBan}</p><p className="text-sm text-muc-nhat">{item.ten} · {item.bo.mucTieu.length} MT</p><Button type="button" variant="phu" onClick={() => onChoose(item.bo)}>Dùng bộ này</Button></li>)}</ul> : <p>Chưa có bộ MT cùng độ tuổi trong các kế hoạch đã tải về.</p>}{error && <p role="alert" className="text-sm text-butdo">{error}</p>}<Button type="button" variant="nhe" disabled={loading} onClick={() => setRetry((n) => n + 1)}>Tải lại danh sách</Button></div>;
}

export function ChonMucTieu({ bo, value, onChange }: { bo?: BoMucTieu; value: string[]; onChange: (ids: string[]) => void }) {
  const [query, setQuery] = useState("");
  return <details className="rounded-o border border-vien p-3">
    <summary className="cursor-pointer font-semibold">Mục tiêu của ô <span className="font-normal text-muc-nhat">· {value.length ? `${value.length} MT riêng` : "Chưa gắn MT riêng"}</span></summary>
    {!bo?.mucTieu.length ? <p className="mt-3 text-sm text-muc-nhat">Cô thêm bộ mục tiêu ở mục “Bộ mục tiêu MT” phía trên để chọn mã.</p> : <div className="mt-3 space-y-3">
      <p className="text-sm text-muc-nhat">{bo.ten} · {bo.phienBan}. MT chung được bổ sung hoặc thay thế cùng nội dung của ô.</p>
      <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm mã hoặc mô tả MT" aria-label="Tìm mục tiêu để gắn vào ô" />
      <div className="max-h-72 space-y-2 overflow-y-auto">{bo.mucTieu.filter((mt) => !query || value.includes(mt.id) || chuanHoaTimKiem(`${mt.ma} ${mt.moTa}`).includes(chuanHoaTimKiem(query))).map((mt) => <label key={mt.id} className="flex cursor-pointer items-start gap-3 rounded-o border border-vien p-3 has-[:checked]:border-bang has-[:checked]:bg-bang-nhat"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-bang" checked={value.includes(mt.id)} onChange={(e) => onChange(e.target.checked ? [...value, mt.id] : value.filter((id) => id !== mt.id))} /><span className="min-w-0"><span className="block font-semibold">{nhanMucTieu(mt)}</span><span className="mt-1 block whitespace-pre-wrap break-words text-sm text-muc-nhat">{mt.moTa}</span></span></label>)}</div>
    </div>}
  </details>;
}
