import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { HoSoLopForm } from "@/components/HoSoLopForm";
import { DangXuatButton } from "@/components/DangXuatButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = { title: "Tài khoản" };

export default function TaiKhoan() {
  return <>
    <PageHeader tinhNang="/tai-khoan" title="Tài khoản" lead="Cập nhật thông tin lớp để nội dung soạn ra phù hợp với lớp của cô." />
    <section className="mb-6 max-w-xl rounded-the border border-vien bg-trang p-5 shadow-the sm:p-6"><h2 className="font-bold">Giao diện</h2><p className="mb-4 mt-1 text-sm text-muc-nhat">Chọn chế độ sáng hoặc tối. Lựa chọn được ghi nhớ trên trình duyệt này.</p><ThemeToggle /></section>
    <div className="max-w-xl rounded-the border border-vien bg-trang p-5 sm:p-6 shadow-the">
      <h2 className="font-bold">Hồ sơ lớp</h2>
      <HoSoLopForm goDashboard={false} />
      <div className="mt-8 border-t border-vien pt-5"><DangXuatButton /></div>
    </div>
  </>;
}
