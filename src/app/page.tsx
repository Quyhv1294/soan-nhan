import Link from "next/link";
import { ArrowRight, Check, FileDown, ShieldCheck, Sparkles } from "lucide-react";
import { LINH_VUC_MAU, OBieuTuong, TINH_NANG } from "@/components/TinhNang";
import { ButtonLink, Logo } from "@/components/ui";
import { APP_NAV, SITE } from "@/lib/site";
import type { LinhVuc } from "@/lib/types";
import { ThemeToggle } from "@/components/ThemeToggle";

// F0 — Trang giới thiệu. Một lời hứa, một nút, một ví dụ thật.
export default function TrangChu() {
  return (
    <div className="min-h-dvh overflow-x-clip">
      <header className="sticky top-0 z-20 bg-giay/85 backdrop-blur border-b border-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle compact />
            <a href="#tinh-nang" className="hidden md:inline-flex px-3 h-10 items-center text-[15px] font-medium text-muc-nhat hover:text-muc">
              Tính năng
            </a>
            <a href="#vi-du" className="hidden md:inline-flex px-3 h-10 items-center text-[15px] font-medium text-muc-nhat hover:text-muc">
              Giáo án mẫu
            </a>
            <Link href="/dang-nhap" className="px-3 h-10 inline-flex items-center text-[15px] font-semibold text-muc hover:text-bang">
              Đăng nhập
            </Link>
            <span className="hidden sm:inline-flex">
              <ButtonLink href="/dang-nhap?moi=1" className="h-10">
                Dùng thử miễn phí
              </ButtonLink>
            </span>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 sm:pt-14 pb-20 grid lg:grid-cols-[1fr_1.05fr] gap-14 items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-trang border border-vien pl-2 pr-3.5 py-1 text-[13px] font-medium text-muc-nhat shadow-the">
            <span className="h-5 w-5 rounded-full bg-phan grid place-items-center text-muc">
              <Sparkles size={12} strokeWidth={2.5} aria-hidden="true" />
            </span>
            Trợ lý soạn bài cho giáo viên mầm non và tiểu học
          </p>
          <h1 className="mt-6 text-[36px] sm:text-[52px] leading-[1.1] font-bold tracking-tight text-muc text-balance">
            Chọn chủ đề tuần, <span className="gach-phan">có ngay giáo án</span> để dạy.
          </h1>
          <p className="mt-6 text-lg text-muc-nhat leading-relaxed max-w-xl">
            {SITE.name} soạn kế hoạch tuần, giáo án đúng mẫu, phiếu học tập và trò chơi cho lớp của cô. Cô chỉ cần đọc lại, sửa vài chỗ và tải về.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/dang-nhap?moi=1" className="h-12 px-6 text-base shadow-the">
              Dùng thử miễn phí
              <ArrowRight size={18} aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="#vi-du" variant="phu" className="h-12 px-6 text-base">
              Xem một giáo án mẫu
            </ButtonLink>
          </div>
          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-muc-nhat">
            {[`${SITE.freeQuota} lượt miễn phí mỗi tháng`, "Không cần thẻ thanh toán", "Tải về file Word"].map((x) => (
              <li key={x} className="inline-flex items-center gap-1.5">
                <Check size={16} className="text-la" strokeWidth={2.5} aria-hidden="true" />
                {x}
              </li>
            ))}
          </ul>
        </div>

        <TrangVoMau />
      </section>

      {/* Tính năng */}
      <section id="tinh-nang" className="bg-trang border-y border-vien scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-20">
          <p className="font-tay text-xl text-butdo">Mọi thứ cho một tuần dạy</p>
          <h2 className="mt-1 text-3xl sm:text-[38px] font-bold tracking-tight max-w-2xl leading-tight">Từ kế hoạch tuần đến tin nhắn phụ huynh, ở cùng một chỗ</h2>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {APP_NAV.filter((n) => n.feature && n.href !== "/thu-vien").map((n) => {
              const t = TINH_NANG[n.href];
              return (
                <li key={n.href} className="group rounded-the border border-vien bg-giay/60 p-6 transition hover:bg-trang hover:shadow-noi hover:-translate-y-0.5">
                  <OBieuTuong icon={t.icon} mau={t.mau} size="lg" />
                  <h3 className="mt-5 text-lg font-bold">{n.label}</h3>
                  <p className="mt-1.5 text-[15px] text-muc-nhat leading-relaxed">{t.moTa}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Ba bước, viết trên bảng phấn */}
      <section className="bang-phan text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-20">
          <h2 className="text-3xl sm:text-[38px] font-bold tracking-tight">Một chủ đề, đủ cho cả tuần</h2>
          <p className="mt-3 text-white/70 text-lg">Ba bước, tối Chủ nhật là xong việc của cả tuần.</p>
          <ol className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              ["Chọn chủ đề và độ tuổi", "Gia đình, Nghề nghiệp, Thế giới động vật… hoặc tự gõ chủ đề của trường."],
              ["Xem kế hoạch 5 ngày", "Đón trẻ, hoạt động học, ngoài trời, góc và chiều, chia đủ 5 lĩnh vực."],
              ["Bấm vào từng hoạt động", "Nhận giáo án 3 cột, phiếu học tập in A4, trò chơi trình chiếu và tin nhắn phụ huynh."],
            ].map(([t, d], i) => (
              <li key={t} className="relative pt-2">
                <span className="font-tay text-[64px] leading-none text-phan" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="block mt-3 border-t border-dashed border-white/25 pt-4 font-semibold text-xl">{t}</span>
                <span className="block mt-2 text-white/70 leading-relaxed">{d}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Ví dụ giáo án */}
      <section id="vi-du" className="max-w-6xl mx-auto px-4 sm:px-8 py-20 grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-center scroll-mt-16">
        <div>
          <p className="font-tay text-xl text-butdo">Không phải chép lại</p>
          <h2 className="mt-1 text-3xl sm:text-[38px] font-bold tracking-tight leading-tight">Đúng mẫu cô vẫn nộp</h2>
          <p className="mt-4 text-lg text-muc-nhat leading-relaxed">
            Giáo án mầm non theo bảng 3 cột. Kế hoạch bài dạy tiểu học theo mẫu Công văn 2345. Mở bằng Word hay Google Docs đều sửa được ngay.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              { icon: FileDown, t: "Tải Word, PDF A4, trình chiếu", d: "Định dạng sẵn font Times, bảng kẻ đủ viền." },
              { icon: ShieldCheck, t: "Không lưu tên của trẻ", d: "Chỉ lưu thông tin lớp cần để soạn đúng độ tuổi." },
              { icon: Check, t: "Mầm non và tiểu học", d: "Nhà trẻ đến mẫu giáo lớn; Toán, Tiếng Việt lớp 1–5, ba bộ sách." },
            ].map(({ icon: Icon, t, d }) => (
              <li key={t} className="flex gap-4">
                <span className="h-10 w-10 rounded-xl bg-bang-nhat text-bang grid place-items-center shrink-0" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <span>
                  <span className="block font-semibold">{t}</span>
                  <span className="block text-[15px] text-muc-nhat">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative px-2 sm:px-6 pt-4">
          <span className="bang-dinh top-0 left-1/2 -translate-x-1/2 -rotate-3 z-10" aria-hidden="true" />
          <div className="trang-van-ban relative rounded-o border border-vien shadow-noi p-6 sm:p-8 text-[14px] rotate-[0.6deg]">
            <p className="text-center font-bold text-[16px]">GIÁO ÁN</p>
            <p className="text-center italic">Lĩnh vực: Phát triển nhận thức</p>
            <p className="mt-3"><b>Đề tài:</b> Nhận biết hình tròn, hình vuông</p>
            <p><b>Độ tuổi:</b> 4–5 tuổi. <b>Thời gian:</b> 25–30 phút</p>
            <table className="mt-3 text-[13.5px]">
              <thead>
                <tr>
                  <th className="w-[18%]">Thời gian</th>
                  <th>Hoạt động của cô</th>
                  <th>Hoạt động của trẻ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2–3 phút</td>
                  <td>Cô cùng trẻ hát bài về gia đình, mời trẻ đến thăm nhà bạn Thỏ.</td>
                  <td>Trẻ hát cùng cô, đi theo cô.</td>
                </tr>
                <tr>
                  <td>12–15 phút</td>
                  <td>Cô đưa chiếc đĩa: chiếc đĩa có dạng hình gì? Cho trẻ lăn thử hình tròn.</td>
                  <td>Trẻ trả lời, lăn hình và nhận xét.</td>
                </tr>
              </tbody>
            </table>
            {/* Lời phê của cô bằng bút đỏ */}
            <p className="font-tay text-butdo text-xl absolute -bottom-4 right-4 sm:right-8 -rotate-6 bg-trang/90 px-2 rounded">Đúng mẫu, sửa được ngay ✓</p>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-8 pb-20">
        <div className="bang-phan max-w-6xl mx-auto rounded-[24px] text-white px-6 sm:px-12 py-12 flex flex-wrap items-center justify-between gap-8 shadow-noi">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Tối nay soạn thử một chủ đề nhé cô.</h2>
            <p className="mt-2 text-white/70">Nhập email, nhận mã OTP và đăng nhập ngay trên website.</p>
          </div>
          <Link
            href="/dang-nhap?moi=1"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-o bg-phan text-muc font-semibold hover:brightness-110 transition-colors"
          >
            Dùng thử miễn phí
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-vien">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muc-nhat">
          <Logo className="mr-auto" />
          <Link href="/dieu-khoan" className="inline-flex min-h-11 items-center hover:text-muc">Điều khoản sử dụng</Link>
          <Link href="/quyen-rieng-tu" className="inline-flex min-h-11 items-center hover:text-muc">Chính sách quyền riêng tư</Link>
          <a href="mailto:hotro@soannhan.vn" className="inline-flex min-h-11 items-center hover:text-muc">hotro@soannhan.vn</a>
          <span>© 2026 {SITE.name}</span>
        </div>
      </footer>
    </div>
  );
}

// Trang vở ô ly minh họa kế hoạch tuần, kẹp thêm mẩu giấy ghi chú của cô.
function TrangVoMau() {
  const ngay: [string, string, LinhVuc][] = [
    ["Thứ 2", "Nhận biết hình tròn, hình vuông", "Phát triển nhận thức"],
    ["Thứ 3", "Bật xa 50 cm", "Phát triển thể chất"],
    ["Thứ 4", "Kể chuyện về gia đình", "Phát triển ngôn ngữ"],
    ["Thứ 5", "Vẽ chân dung người thân", "Phát triển thẩm mỹ"],
    ["Thứ 6", "Bé yêu thương người thân", "Phát triển tình cảm, kỹ năng xã hội"],
  ];
  return (
    <div className="relative pt-4 pb-8 sm:pr-6">
      {/* Tờ giấy lót phía sau cho cảm giác xấp vở */}
      <div className="absolute inset-x-6 top-8 bottom-4 rounded-the bg-trang border border-oly-dam rotate-[2.5deg]" aria-hidden="true" />
      <figure className="o-ly le-do relative rounded-the border border-oly-dam shadow-noi pl-[72px] pr-5 sm:pr-6 py-7 -rotate-1">
        <span className="bang-dinh -top-3 left-1/2 -translate-x-1/2 rotate-2" aria-hidden="true" />
        <p className="text-[13px] font-medium text-muc-nhat">Mẫu giáo nhỡ · tuần 19/10</p>
        <p className="mt-1 text-[22px] font-bold text-bang">Chủ đề: Gia đình bé</p>
        <ul className="mt-5 space-y-2">
          {ngay.map(([thu, hd, lv], i) => {
            const { icon, mau } = LINH_VUC_MAU[lv];
            return (
              <li key={thu} className="flex items-center gap-3 bg-trang border border-vien rounded-o pl-2 pr-2.5 py-2 shadow-[0_1px_0_rgba(29,36,51,0.04)]">
                <OBieuTuong icon={icon} mau={mau} size="sm" />
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-semibold text-muc-nhat">{thu}</span>
                  <span className="block text-[14.5px] font-medium leading-snug">{hd}</span>
                </span>
                {i === 0 ? (
                  <span className="inline-flex items-center gap-1 text-[13px] font-semibold px-2 py-1 rounded-md bg-phan text-muc">
                    <Check size={13} strokeWidth={3} aria-hidden="true" />
                    Đã soạn
                  </span>
                ) : (
                  <span className="text-[13px] font-semibold px-2 py-1 rounded-md border border-bang/40 text-bang">Soạn</span>
                )}
              </li>
            );
          })}
        </ul>
      </figure>
      {/* Mẩu giấy ghi chú màu phấn vàng */}
      <div className="absolute -bottom-2 -left-2 sm:-left-8 rotate-[-4deg] bg-phan-nhat border border-phan rounded-md px-4 py-3 shadow-noi max-w-[210px]">
        <p className="font-tay text-[19px] leading-tight text-muc">Mỗi hoạt động bấm một lần là có giáo án!</p>
      </div>
    </div>
  );
}
