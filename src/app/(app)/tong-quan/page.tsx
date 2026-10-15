import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { LINH_VUC_MAU, LOAI_TINH_NANG, OBieuTuong, TINH_NANG } from "@/components/TinhNang";
import { LOAI_LABEL } from "@/components/LoaiTaiLieu";
import { ButtonLink } from "@/components/ui";
import { MOCK_THU_VIEN, MOCK_TUAN } from "@/lib/mock-data";
import { APP_NAV } from "@/lib/site";
import { hrefSoanGiaoAn, hrefXemGiaoAn } from "@/lib/lien-ket";
import { DO_TUOI_LABEL } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { demoAllowed } from "@/lib/supabase/configured";
import type { KeHoachTuan, TaiLieu } from "@/lib/types";

export const metadata: Metadata = { title: "Tổng quan" };

const CONG_CU = ["/phieu-hoc-tap", "/tro-choi", "/tin-nhan-phu-huynh", "/ke-hoach-bai-day"];

// Trang đầu tiên sau đăng nhập: trả lời "tuần này còn phải soạn gì?"
export default async function TongQuan() {
  let tuan: KeHoachTuan | null = demoAllowed() ? MOCK_TUAN : null;
  let taiLieu: TaiLieu[] = demoAllowed() ? MOCK_THU_VIEN : [];
  let tenNguoiDung = "cô";
  if (!demoAllowed()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    tenNguoiDung = user?.user_metadata?.full_name || "cô";
    if (user) {
      const { data: profile } = await supabase.from("users").select("ho_ten").eq("id", user.id).maybeSingle();
      tenNguoiDung = profile?.ho_ten || tenNguoiDung;
    }
    const { data } = await supabase.from("documents").select("id,loai,tieu_de,chu_de,noi_dung,cap_nhat").order("cap_nhat", { ascending: false }).limit(100);
    const docs = data ?? [];
    const plan = docs.find((d) => d.loai === "ke-hoach-tuan");
    if (plan?.noi_dung && typeof plan.noi_dung === "object") tuan = plan.noi_dung as KeHoachTuan;
    taiLieu = docs.filter((d) => d.loai !== "ke-hoach-tuan").map((d) => ({ id: d.id, loai: d.loai as TaiLieu["loai"], tieuDe: d.tieu_de, chuDe: d.chu_de ?? "", capNhat: d.cap_nhat }));
  }
  if (!tuan) return <section className="rounded-the border border-vien bg-trang p-8 text-center"><h1 className="text-2xl font-bold">Chào cô!</h1><p className="mt-2 text-muc-nhat">Tạo kế hoạch tuần đầu tiên để bắt đầu soạn bài.</p><ButtonLink href="/ke-hoach-tuan" className="mt-5">Tạo kế hoạch tuần</ButtonLink></section>;
  const hoatDongHoc = tuan.ngay.map((n) => ({ thu: n.thu, hd: n.hoatDong.find((h) => h.buoi === "Hoạt động học")! }));
  const daSoan = hoatDongHoc.filter((x) => x.hd.giaoAnId).length;
  const tiepTheo = hoatDongHoc.find((x) => !x.hd.giaoAnId);

  return (
    <>
      {/* Thẻ chào: tuần này, tiến độ, việc tiếp theo */}
      <section className="bang-phan relative overflow-hidden rounded-[20px] text-white p-6 sm:p-8 shadow-noi">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="font-tay text-xl text-phan">Chào {tenNguoiDung},</p>
            <h1 className="mt-1 text-[26px] sm:text-[32px] font-bold tracking-tight leading-tight">
              Tuần này: {tuan.chuDe}
            </h1>
            <p className="mt-2 text-white/70">
              {tuan.nhanh ? `Nhánh ${tuan.nhanh} · ` : ""}{DO_TUOI_LABEL[tuan.doTuoi]} · {new Date(tuan.tuNgay).toLocaleDateString("vi-VN", { timeZone: "UTC", day: "2-digit", month: "2-digit" })}
            </p>
            <div className="mt-6 max-w-sm">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-white/80">Giáo án hoạt động học</span>
                <span className="font-bold tabular-nums">{daSoan}/5 đã soạn</span>
              </div>
              <div className="mt-2 grid grid-cols-5 gap-1.5" aria-hidden="true">
                {hoatDongHoc.map(({ hd }) => (
                  <span key={hd.id} className={`h-2 rounded-full ${hd.giaoAnId ? "bg-phan" : "bg-white/20"}`} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {tiepTheo && (
              <Link
                href={hrefSoanGiaoAn(tuan, tiepTheo.hd)}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-o bg-phan text-muc font-semibold hover:brightness-110 transition-colors"
              >
                Soạn tiếp: {tiepTheo.thu}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            )}
            <Link href="/ke-hoach-tuan" className="inline-flex items-center h-11 px-5 rounded-o border border-white/30 font-semibold hover:brightness-110/10 transition-colors">
              Mở kế hoạch tuần
            </Link>
          </div>
        </div>
      </section>

      {/* Năm hoạt động học trong tuần */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-bold">Hoạt động học tuần này</h2>
          <Link href="/ke-hoach-tuan" className="inline-flex min-h-11 items-center px-1 text-sm font-semibold text-bang hover:underline">Xem cả tuần</Link>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {hoatDongHoc.map(({ thu, hd }) => {
            const lv = hd.linhVuc ? LINH_VUC_MAU[hd.linhVuc] : null;
            const href = hd.giaoAnId ? hrefXemGiaoAn(hd.giaoAnId) : hrefSoanGiaoAn(tuan, hd);
            return (
              <li key={hd.id}>
                <Link
                  href={href}
                  className={`group h-full flex flex-col rounded-the border bg-trang p-4 transition hover:shadow-noi hover:-translate-y-0.5 ${
                    hd.giaoAnId ? "border-phan" : "border-vien"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-muc-nhat">{thu}</span>
                    {hd.giaoAnId ? (
                      <span className="inline-flex items-center gap-1 text-[13px] font-semibold px-2 py-0.5 rounded-full bg-phan text-muc">
                        <Check size={12} strokeWidth={3} aria-hidden="true" />
                        Đã soạn
                      </span>
                    ) : (
                      <span className="text-[13px] font-semibold px-2 py-0.5 rounded-full bg-giay text-muc-nhat">Chưa soạn</span>
                    )}
                  </div>
                  <p className="mt-3 font-semibold leading-snug flex-1">{hd.ten}</p>
                  {lv && (
                    <span className={`mt-4 inline-flex items-center gap-1.5 self-start text-[13px] font-semibold px-2 py-1 rounded-md ${lv.mau.nen} ${lv.mau.chu}`}>
                      <lv.icon size={13} aria-hidden="true" />
                      {lv.ngan}
                    </span>
                  )}
                  <span className="mt-3 text-[13px] font-semibold text-bang group-hover:underline">
                    {hd.giaoAnId ? "Xem giáo án" : "Soạn giáo án"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Công cụ nhanh */}
        <div>
          <h2 className="text-lg font-bold">Soạn thêm cho tuần này</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {CONG_CU.map((href) => {
              const t = TINH_NANG[href];
              const nav = APP_NAV.find((n) => n.href === href)!;
              return (
                <li key={href}>
                  <Link href={href} className="group flex gap-4 rounded-the border border-vien bg-trang p-4 transition hover:shadow-noi hover:-translate-y-0.5">
                    <OBieuTuong icon={t.icon} mau={t.mau} />
                    <span className="min-w-0">
                      <span className="block font-semibold group-hover:text-bang">{nav.label}</span>
                      <span className="block mt-0.5 text-[13.5px] text-muc-nhat leading-snug">{t.moTa}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Mới soạn gần đây */}
        <aside>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-bold">Mới soạn gần đây</h2>
            <Link href="/thu-vien" className="inline-flex min-h-11 items-center px-1 text-sm font-semibold text-bang hover:underline">Thư viện</Link>
          </div>
          <ul className="mt-4 rounded-the border border-vien bg-trang divide-y divide-vien">
            {taiLieu.slice(0, 4).map((t) => {
              const tn = LOAI_TINH_NANG[t.loai];
              return (
                <li key={t.id}>
                  <Link href="/thu-vien" className="flex items-center gap-3 px-3 py-3 hover:bg-giay first:rounded-t-the last:rounded-b-the">
                    <OBieuTuong icon={tn.icon} mau={tn.mau} size="sm" />
                    <span className="min-w-0">
                      <span className="block text-[14.5px] font-medium truncate">{t.tieuDe}</span>
                      <span className="block text-[13px] text-muc-nhat">{LOAI_LABEL[t.loai]}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <ButtonLink href="/ke-hoach-tuan" variant="phu" className="mt-4 w-full">
            Tạo kế hoạch tuần mới
          </ButtonLink>
        </aside>
      </section>
    </>
  );
}
