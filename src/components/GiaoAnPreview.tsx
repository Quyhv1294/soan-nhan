import type { GiaoAnMamNon, KeHoachBaiDay } from "@/lib/types";
import { DO_TUOI_LABEL } from "@/lib/types";
import { dongNguCanhGiaoAn } from "@/lib/ngu-canh-giao-an";

// Xem trước giáo án mầm non như trang Word sẽ xuất ra (font có chân, bảng 3 cột).
export function GiaoAnPreview({ ga }: { ga: GiaoAnMamNon }) {
  return (
    <article className="trang-van-ban border border-vien rounded-o p-6 sm:p-10">
      <p className="text-center font-bold text-[17px]">GIÁO ÁN</p>
      <p className="text-center italic">Lĩnh vực: {ga.linhVuc}</p>
      <div className="mt-4">
        <p><b>Chủ đề:</b> {ga.chuDe}</p>
        <p><b>Đề tài:</b> {ga.tenHoatDong}</p>
        <p><b>Độ tuổi:</b> {DO_TUOI_LABEL[ga.doTuoi]}. <b>Thời gian:</b> {ga.thoiLuong}</p>
        {dongNguCanhGiaoAn(ga.nguCanhKeHoach).map((row, index) => <p key={index} className="mt-1 whitespace-pre-wrap break-words"><b>{row.nhan}:</b> {row.noiDung}</p>)}
      </div>

      <h3 className="mt-5 font-bold">I. MỤC ĐÍCH, YÊU CẦU</h3>
      <p className="font-bold italic">1. Kiến thức</p>
      <List items={ga.mucDich.kienThuc} />
      <p className="font-bold italic">2. Kỹ năng</p>
      <List items={ga.mucDich.kyNang} />
      <p className="font-bold italic">3. Thái độ</p>
      <List items={ga.mucDich.thaiDo} />

      <h3 className="mt-4 font-bold">II. CHUẨN BỊ</h3>
      <p className="font-bold italic">1. Đồ dùng của cô</p>
      <List items={ga.chuanBi.cuaCo} />
      <p className="font-bold italic">2. Đồ dùng của trẻ</p>
      <List items={ga.chuanBi.cuaTre} />
      {ga.chuanBi.diaDiem && <p><b><i>3. Địa điểm:</i></b> {ga.chuanBi.diaDiem}</p>}

      <h3 className="mt-4 mb-2 font-bold">III. TIẾN HÀNH</h3>
      <table>
        <thead>
          <tr>
            <th className="w-[16%]">Thời gian</th>
            <th>Hoạt động của cô</th>
            <th className="w-[32%]">Hoạt động của trẻ</th>
          </tr>
        </thead>
        <tbody>
          {ga.tienHanh.flatMap((hd) => [
            <tr key={hd.ten}>
              <td colSpan={3} className="font-bold">{hd.ten}</td>
            </tr>,
            ...hd.buoc.map((b, i) => (
              <tr key={`${hd.ten}-${i}`}>
                <td>{b.thoiGian}</td>
                <td><List items={b.hoatDongCo} /></td>
                <td><List items={b.hoatDongTre} /></td>
              </tr>
            )),
          ])}
        </tbody>
      </table>
    </article>
  );
}

// Xem trước kế hoạch bài dạy tiểu học theo khung Công văn 2345.
export function KhbdPreview({ k }: { k: KeHoachBaiDay }) {
  return (
    <article className="trang-van-ban border border-vien rounded-o p-6 sm:p-10">
      <p className="text-center font-bold text-[17px]">KẾ HOẠCH BÀI DẠY</p>
      <p className="text-center">Môn: {k.mon}, lớp {k.lop}. Bộ sách: {k.boSach}</p>
      <p className="text-center font-bold mt-1">{k.tenBai}{k.tiet ? ` (${k.tiet})` : ""}</p>

      <h3 className="mt-5 font-bold">I. YÊU CẦU CẦN ĐẠT</h3>
      <p className="font-bold italic">1. Năng lực đặc thù</p>
      <List items={k.yeuCauCanDat.nangLucDacThu} />
      <p className="font-bold italic">2. Năng lực chung</p>
      <List items={k.yeuCauCanDat.nangLucChung} />
      <p className="font-bold italic">3. Phẩm chất</p>
      <List items={k.yeuCauCanDat.phamChat} />

      <h3 className="mt-4 font-bold">II. ĐỒ DÙNG DẠY HỌC</h3>
      <p><b>Giáo viên:</b> {k.doDung.giaoVien.join("; ")}</p>
      <p><b>Học sinh:</b> {k.doDung.hocSinh.join("; ")}</p>

      <h3 className="mt-4 mb-2 font-bold">III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU</h3>
      <table>
        <thead>
          <tr>
            <th>Hoạt động của giáo viên</th>
            <th className="w-[40%]">Hoạt động của học sinh</th>
          </tr>
        </thead>
        <tbody>
          {k.hoatDong.flatMap((hd) => [
            <tr key={hd.ten}>
              <td colSpan={2}><b>{hd.ten}</b> <i>Mục tiêu: {hd.mucTieu}</i></td>
            </tr>,
            <tr key={`${hd.ten}-nd`}>
              <td><List items={hd.giaoVien} /></td>
              <td><List items={hd.hocSinh} /></td>
            </tr>,
          ])}
        </tbody>
      </table>

      <h3 className="mt-4 font-bold">IV. ĐIỀU CHỈNH SAU BÀI DẠY</h3>
      <p className="text-muc-nhat">{k.dieuChinh ?? "................................................................................"}</p>
    </article>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((x, i) => (
        <li key={i}>- {x}</li>
      ))}
    </ul>
  );
}
