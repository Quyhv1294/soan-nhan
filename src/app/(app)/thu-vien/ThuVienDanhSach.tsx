"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Copy, Pencil, Search, SearchX, Trash2 } from "lucide-react";
import { LOAI_LABEL } from "@/components/LoaiTaiLieu";
import { LOAI_TINH_NANG, OBieuTuong } from "@/components/TinhNang";
import { Button, ButtonLink, Field, Input } from "@/components/ui";
import { Modal } from "@/components/Modal";
import { docTaiLieu, thaoTacTaiLieuLocal } from "@/lib/kho-local";
import { hrefThuVien, sapXepTaiLieu, timTaiLieu, type SapXep } from "@/lib/thu-vien";
import type { LoaiTaiLieu, TaiLieu } from "@/lib/types";

const PATH: Record<LoaiTaiLieu, string> = { "giao-an": "/giao-an/moi?id=", khbd: "/ke-hoach-bai-day?id=", phieu: "/phieu-hoc-tap?id=", "tro-choi": "/tro-choi?id=", "tin-nhan": "/tin-nhan-phu-huynh?id=", "ke-hoach-tuan": "/ke-hoach-tuan?id=", "ke-hoach-thang": "/ke-hoach-thang?id=" };
type DocumentRow = { id: string; loai: LoaiTaiLieu; tieu_de: string; chu_de?: string; cap_nhat: string; noi_dung?: Record<string, unknown> };
const fromRow = (d: DocumentRow): TaiLieu => ({ id: d.id, loai: d.loai, tieuDe: d.tieu_de, chuDe: d.chu_de ?? "", capNhat: d.cap_nhat, noiDung: d.noi_dung });
type Action = { item: TaiLieu; action: "rename" | "delete" | "duplicate" };

export function ThuVienDanhSach({ initial, demo, initialError }: { initial: TaiLieu[]; demo: boolean; initialError: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const rawType = params.get("loai") ?? "";
  const loai = rawType in LOAI_LABEL ? rawType : "";
  const sort: SapXep = ["cu-nhat", "ten"].includes(params.get("sort") ?? "") ? params.get("sort") as SapXep : "moi-nhat";
  const [query, setQuery] = useState(q);
  const [items, setItems] = useState(initial);
  const [loading, setLoading] = useState(demo);
  const [error, setError] = useState(initialError);
  const [message, setMessage] = useState("");
  const [selection, setSelection] = useState<Action | null>(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  useEffect(() => { setQuery(q); }, [q]);
  useEffect(() => {
    if (demo) { setItems(docTaiLieu()); setLoading(false); }
  }, [demo]);
  async function reload() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/documents");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Chưa tải được thư viện.");
      setItems(result.demo ? docTaiLieu() : (result.documents ?? []).map(fromRow));
    } catch (e) { setError(e instanceof Error ? e.message : "Mất kết nối mạng."); }
    finally { setLoading(false); }
  }
  // Bộ lọc và số đếm luôn dùng cùng một tập tài liệu, bao gồm từ khóa hiện tại.
  const matched = useMemo(() => timTaiLieu(items, q), [items, q]);
  const filtered = useMemo(() => sapXepTaiLieu(matched.filter((x) => !loai || x.loai === loai), sort), [matched, loai, sort]);
  const href = (type: string) => hrefThuVien({ q: query, loai: type, sort });
  function open(item: TaiLieu, action: Action["action"]) { setSelection({ item, action }); setTitle(item.tieuDe); setActionError(""); }
  async function apply(event?: FormEvent) {
    event?.preventDefault();
    if (!selection || busy) return;
    const { item, action } = selection;
    const trimmed = title.trim();
    if (action === "rename" && (!trimmed || trimmed.length > 200)) { setActionError("Cô nhập tên tài liệu từ 1 đến 200 ký tự nhé."); return; }
    setBusy(true); setActionError(""); setMessage("");
    try {
      const response = await fetch("/api/documents", { method: action === "delete" ? "DELETE" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, action, title: trimmed }) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error ?? "Chưa thực hiện được thao tác.");
      const next: TaiLieu | null = result.demo ? thaoTacTaiLieuLocal(item.id, action, trimmed) : result.document ? fromRow(result.document) : null;
      if (action !== "delete" && !next) throw new Error("Chưa nhận được tài liệu đã lưu. Cô tải lại danh sách nhé.");
      setItems((all) => action === "delete" ? all.filter((x) => x.id !== item.id) : action === "duplicate" ? [next!, ...all] : all.map((x) => x.id === item.id ? next! : x));
      setMessage(action === "delete" ? `Đã xóa “${item.tieuDe}”.` : action === "duplicate" ? "Đã tạo bản sao riêng trong thư viện, không dùng lượt AI." : "Đã đổi tên tài liệu trong thư viện.");
      setSelection(null);
    } catch (e) { setActionError(e instanceof Error ? e.message : "Mất kết nối mạng. Cô thử lại nhé."); }
    finally { setBusy(false); }
  }

  return <div aria-busy={loading}>
    <form className="flex max-w-2xl gap-2" onSubmit={(e) => { e.preventDefault(); router.push(hrefThuVien({ q: query, loai, sort }), { scroll: false }); }}>
      <div className="relative min-w-0 flex-1"><Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muc-nhat" aria-hidden="true" /><input type="search" name="q" value={query} onChange={(e) => setQuery(e.target.value)} maxLength={100} placeholder="Tìm theo tên hoặc chủ đề" aria-label="Tìm tài liệu" className="h-12 w-full rounded-full border border-vien-nhap bg-trang pl-11 pr-4 text-base placeholder:text-muc-nhat focus:outline-bang" /></div><Button type="submit" className="h-12">Tìm</Button>
    </form>
    <nav className="mt-5 flex flex-wrap gap-2" aria-label="Lọc theo loại">{["", ...Object.keys(LOAI_LABEL)].map((type) => <Link key={type} href={href(type)} scroll={false} aria-current={loai === type ? "page" : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm font-medium ${loai === type ? "border-bang bg-bang text-tren-bang" : "border-vien bg-trang text-muc"}`}>{type ? LOAI_LABEL[type as LoaiTaiLieu] : "Tất cả"}<span className="tabular-nums opacity-80">{loading ? "…" : type ? matched.filter((x) => x.loai === type).length : matched.length}</span></Link>)}</nav>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p role="status" className="text-sm text-muc-nhat">{loading ? "Đang tải thư viện…" : `${filtered.length} tài liệu${q ? ` phù hợp với “${q}”` : ""}${demo ? " · Lưu trên trình duyệt này" : ""}`}</p><label className="flex items-center gap-2 text-sm">Sắp xếp<select aria-label="Sắp xếp tài liệu" value={sort} onChange={(e) => router.push(hrefThuVien({ q: query, loai, sort: e.target.value }), { scroll: false })} className="min-h-11 rounded-o border border-vien-nhap bg-trang px-3 text-base"><option value="moi-nhat">Mới cập nhật</option><option value="cu-nhat">Cũ nhất</option><option value="ten">Tên A–Z</option></select></label><Button type="button" variant="nhe" disabled={loading || busy} onClick={reload}>Tải lại danh sách</Button></div>
    {error && <p role="alert" className="mt-4 rounded-o bg-phan-nhat p-3 text-sm">{error}</p>}
    {message && <p role="status" className="mt-4 rounded-o bg-la-nhat p-3 text-sm">{message}</p>}
    {!loading && !error && !filtered.length && <div className="mt-6 rounded-the border border-vien bg-trang p-8 text-center"><SearchX size={28} className="mx-auto text-muc-nhat" aria-hidden="true" /><h2 className="mt-3 font-semibold">{items.length ? "Chưa có tài liệu khớp bộ lọc" : "Thư viện đang trống"}</h2><p className="mt-2 text-sm text-muc-nhat">{items.length ? "Cô thử từ khóa khác hoặc bỏ bộ lọc." : "Tài liệu cô soạn và lưu sẽ xuất hiện ở đây."}</p>{items.length ? <ButtonLink href="/thu-vien" variant="phu" className="mt-4">Bỏ bộ lọc</ButtonLink> : <ButtonLink href="/tong-quan" className="mt-4">Bắt đầu soạn</ButtonLink>}</div>}
    {filtered.length > 0 && <ul className="mt-6 divide-y divide-vien rounded-the border border-vien bg-trang shadow-the">{filtered.map((item) => {
      const feature = LOAI_TINH_NANG[item.loai];
      return <li key={item.id} className="p-4 sm:flex sm:items-center sm:gap-4"><Link href={PATH[item.loai] + item.id} className="group flex min-w-0 flex-1 items-center gap-3"><OBieuTuong icon={feature.icon} mau={feature.mau} /><span className="min-w-0 flex-1"><span className="block break-words font-semibold group-hover:text-bang">{item.tieuDe}</span><span className="mt-1 block text-[13px] text-muc-nhat">{LOAI_LABEL[item.loai]}{item.chuDe ? ` · ${item.chuDe}` : ""}</span><time dateTime={item.capNhat} className="mt-1 block text-xs text-muc-nhat">Cập nhật {new Date(item.capNhat).toLocaleString("vi-VN")}</time></span></Link><div className="mt-3 flex flex-wrap gap-1 sm:mt-0" aria-label={`Thao tác với ${item.tieuDe}`}><Button type="button" variant="nhe" aria-label={`Đổi tên ${item.tieuDe}`} onClick={() => open(item, "rename")}><Pencil size={16} aria-hidden="true" /><span className="sm:sr-only">Đổi tên</span></Button><Button type="button" variant="nhe" aria-label={`Nhân bản ${item.tieuDe}`} onClick={() => open(item, "duplicate")}><Copy size={16} aria-hidden="true" /><span className="sm:sr-only">Nhân bản</span></Button><Button type="button" variant="nhe" aria-label={`Xóa ${item.tieuDe}`} onClick={() => open(item, "delete")}><Trash2 size={16} aria-hidden="true" /><span className="sm:sr-only">Xóa</span></Button></div></li>;
    })}</ul>}
    {selection && <Modal title={selection.action === "rename" ? "Đổi tên tài liệu" : selection.action === "delete" ? "Xóa tài liệu" : "Nhân bản tài liệu"} onClose={() => { if (!busy) setSelection(null); }}><form onSubmit={apply} className="space-y-4 p-5">{selection.action === "rename" ? <><Field label="Tên hiển thị trong thư viện"><Input name="title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} disabled={busy} /></Field><p className="text-sm text-muc-nhat">Tên này dùng để tìm tài liệu. Nội dung bài dạy được giữ nguyên.</p></> : <p className="break-words text-sm">{selection.action === "delete" ? `Xóa “${selection.item.tieuDe}” khỏi thư viện? Thao tác này không thể hoàn tác.${selection.item.loai === "giao-an" ? " Hoạt động trong kế hoạch tuần sẽ trở về trạng thái chưa soạn." : ""}` : `Tạo bản sao riêng của “${selection.item.tieuDe}”? Không dùng lượt AI.${selection.item.loai === "ke-hoach-tuan" ? " Bản sao cần soạn giáo án riêng cho từng hoạt động." : ""}`}</p>}{actionError && <p role="alert" className="text-sm text-butdo">{actionError}</p>}<div className="flex flex-wrap gap-2"><Button type="submit" disabled={busy} className={selection.action === "delete" ? "bg-nguy-hiem text-white hover:bg-nguy-hiem/90" : ""}>{busy ? "Đang xử lý…" : selection.action === "rename" ? "Lưu tên" : selection.action === "delete" ? "Xóa tài liệu" : "Tạo bản sao"}</Button><Button type="button" variant="phu" disabled={busy} onClick={() => setSelection(null)}>Hủy</Button></div></form></Modal>}
  </div>;
}
