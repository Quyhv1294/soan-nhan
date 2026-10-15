"use client";

import { SITE } from "@/lib/site";
import { demoAllowed } from "@/lib/supabase/configured";
import { useXacNhan } from "@/components/XacNhan";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { BookOpen, Blocks, Check, ChevronDown, Loader2, Sun, Sunset, Trees, WandSparkles, type LucideIcon } from "lucide-react";
import { NutTaiFile } from "@/components/NutTaiFile";
import { LINH_VUC_MAU } from "@/components/TinhNang";
import { Button, Field, Input, PageHeader, Select } from "@/components/ui";
import { goiSoan } from "@/lib/goi-api";
import { luuGiaoAn, luuTaiLieu } from "@/lib/kho-local";
import { giuIdTaiLieu } from "@/lib/ban-soan";
import { hrefSoanGiaoAn, hrefXemGiaoAn, khoangNgay } from "@/lib/lien-ket";
import { DO_TUOI_LABEL, type GiaoAnMamNon, type HoatDongTrongNgay, type KeHoachTuan } from "@/lib/types";
import { useTuan } from "@/lib/use-tuan";
import { useHoSo } from "@/lib/use-ho-so";

const BUOI: { ten: HoatDongTrongNgay["buoi"]; icon: LucideIcon }[] = [
  { ten: "Đón trẻ", icon: Sun },
  { ten: "Hoạt động học", icon: BookOpen },
  { ten: "Hoạt động ngoài trời", icon: Trees },
  { ten: "Hoạt động góc", icon: Blocks },
  { ten: "Hoạt động chiều", icon: Sunset },
];
const ICON_BUOI = Object.fromEntries(BUOI.map((b) => [b.ten, b.icon])) as Record<HoatDongTrongNgay["buoi"], LucideIcon>;

const hocCuaNgay = (t: KeHoachTuan) => t.ngay.map((n) => n.hoatDong.find((h) => h.buoi === "Hoạt động học")!);
type PendingSave = { loai: "ke-hoach-tuan"; data: KeHoachTuan } | { loai: "giao-an"; data: GiaoAnMamNon; hoatDongId: string };

// F2 — Kế hoạch tuần theo chủ đề.
// Trên máy tính: lưới 5 ngày × 5 buổi giống bảng kế hoạch giáo viên vẫn kẻ tay.
// Trên điện thoại: từng ngày xếp dọc.
export function KeHoachTuanView() {
  const { tuan: t, capNhat, daNap, error: planError, coKeHoach } = useTuan();
  const { profile, daNap: profileReady } = useHoSo();
  const { xacNhan, hopThoai } = useXacNhan();
  const [dangTaoTuan, setDangTaoTuan] = useState(false);
  const [tienDo, setTienDo] = useState<{ xong: number; tong: number; ten: string } | null>(null);
  const [loi, setLoi] = useState<string | null>(null);
  const [thongBao, setThongBao] = useState<string | null>(null);
  const [buoc, setBuoc] = useState<"soan" | "luu" | null>(null);
  const [pendingSave, setPendingSave] = useState<PendingSave | null>(null);
  const [dangLuuLai, setDangLuuLai] = useState(false);
  const [chuDeNhap, setChuDeNhap] = useState("");

  const hoc = hocCuaNgay(t);
  const daSoan = hoc.filter((h) => h.giaoAnId).length;
  const con = 5 - daSoan;
  const ban = dangTaoTuan || tienDo !== null || dangLuuLai || pendingSave !== null;
  useEffect(() => {
    if (!ban) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [ban]);

  async function luuGiaoAnChoNgay(ga: GiaoAnMamNon, hoatDongId: string) {
    const id = await luuTaiLieu("giao-an", ga as unknown as Record<string, unknown>);
    luuGiaoAn({ ...ga, id });
    await capNhat((cu) => ({ ...cu, ngay: cu.ngay.map((n) => ({ ...n, hoatDong: n.hoatDong.map((h) => h.id === hoatDongId ? { ...h, giaoAnId: id } : h) })) }));
  }
  async function thuLuuLai() {
    if (!pendingSave || dangLuuLai) return;
    setDangLuuLai(true); setBuoc("luu"); setLoi(null);
    try {
      if (pendingSave.loai === "ke-hoach-tuan") await capNhat(() => pendingSave.data);
      else await luuGiaoAnChoNgay(pendingSave.data, pendingSave.hoatDongId);
      setPendingSave(null); setThongBao("Đã lưu lại nội dung và kế hoạch tuần. Cô có thể tiếp tục soạn các giáo án còn thiếu.");
    } catch (e) { setLoi(e instanceof Error ? e.message : "Chưa lưu được nội dung."); }
    finally { setDangLuuLai(false); setBuoc(null); }
  }

  async function taoTuan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const chuDe = String(f.get("chuDe") ?? "").trim();
    if (!chuDe) {
      setLoi("Cô chưa nhập chủ đề.");
      return;
    }
    if (coKeHoach && daSoan > 0 && !(await xacNhan(`Kế hoạch hiện tại đã có ${daSoan} giáo án. Tạo kế hoạch mới sẽ thay thế kế hoạch này. Cô muốn tiếp tục?`, { nutDongY: "Thay bằng kế hoạch mới" }))) return;
    setLoi(null);
    setThongBao(null);
    setDangTaoTuan(true);
    setBuoc("soan");
    let moi: KeHoachTuan | null = null;
    try {
      moi = await goiSoan<KeHoachTuan>("ke-hoach-tuan", {
        chuDe,
        nhanh: String(f.get("nhanh") ?? ""),
        doTuoi: String(f.get("doTuoi") ?? ""),
      });
      setBuoc("luu");
      const created = moi;
      await capNhat(() => created);
      setThongBao(`Đã tạo kế hoạch tuần cho chủ đề "${moi.chuDe}". Cô xem lại và chỉnh nếu cần.`);
    } catch (err) {
      if (moi) setPendingSave({ loai: "ke-hoach-tuan", data: moi });
      setLoi(err instanceof Error ? err.message : "Không tạo được kế hoạch tuần.");
    } finally {
      setDangTaoTuan(false);
      setBuoc(null);
    }
  }

  // Soạn lần lượt các giáo án còn thiếu: tuần tự để thấy tiến độ và không vượt giới hạn gọi AI mỗi phút.
  // Dừng ở lỗi đầu tiên, phần đã soạn được giữ lại; bấm lại sẽ soạn tiếp phần còn thiếu.
  async function soanCaTuan() {
    const canSoan = hoc.filter((h) => !h.giaoAnId);
    if (!canSoan.length) return;
    // Nói trước chi phí: mỗi giáo án là 1 lượt AI và mất 10–25 giây, để cô không bấm rồi ngạc nhiên.
    const n = canSoan.length;
    const conLai = Math.max(0, SITE.freeQuota - profile.luotDaDung);
    const phut = (giay: number) => Math.max(1, Math.round(giay / 60));
    const loiHoi = `Soạn ${n} giáo án sẽ dùng ${n} lượt trong tháng${demoAllowed() ? "" : ` (cô còn ${conLai} lượt)`} và mất khoảng ${phut(n * 10)}–${phut(n * 25)} phút. Cô giữ trang này mở đến khi xong nhé.${!demoAllowed() && conLai < n ? `

Lượt còn lại không đủ cho cả ${n} giáo án, việc soạn sẽ dừng khi hết lượt, các giáo án đã soạn vẫn được giữ.` : ""}`;
    if (!(await xacNhan(loiHoi, { nutDongY: `Soạn ${n} giáo án`, nutHuy: "Để sau" }))) return;
    setLoi(null);
    setThongBao(null);
    let xong = 0;
    for (const hd of canSoan) {
      setTienDo({ xong, tong: canSoan.length, ten: hd.ten });
      setBuoc("soan");
      let ga: GiaoAnMamNon | null = null;
      try {
        ga = giuIdTaiLieu(await goiSoan<GiaoAnMamNon>("giao-an", {
          tenHoatDong: hd.ten,
          linhVuc: hd.linhVuc,
          chuDe: t.chuDe,
          doTuoi: DO_TUOI_LABEL[t.doTuoi],
        }));
        setBuoc("luu");
        await luuGiaoAnChoNgay(ga, hd.id);
        xong++;
      } catch (err) {
        if (ga) setPendingSave({ loai: "giao-an", data: ga, hoatDongId: hd.id });
        setLoi(`Đã soạn ${xong}/${canSoan.length}, dừng ở "${hd.ten}". ${err instanceof Error ? err.message : ""}`);
        setTienDo(null);
        setBuoc(null);
        return;
      }
    }
    setTienDo(null);
    setBuoc(null);
    setThongBao(`Đã soạn xong ${xong} giáo án. Cô bấm vào từng ô để đọc lại và chỉnh.`);
  }

  const formTao = (cls: string) => (
    <form key={profileReady ? "ready" : "loading"} onSubmit={taoTuan} className={cls}>
          <Field label="Chủ đề">
            <Input name="chuDe" value={chuDeNhap} onChange={(e) => setChuDeNhap(e.target.value)} placeholder="Ví dụ: Gia đình bé" required maxLength={100} disabled={!profileReady} />
          </Field>
          <Field label="Nhánh (không bắt buộc)">
            <Input name="nhanh" placeholder="Ngôi nhà của bé" maxLength={100} disabled={!profileReady} />
          </Field>
          <Field label="Độ tuổi">
            <Select name="doTuoi" options={Object.values(DO_TUOI_LABEL)} disabled={!profileReady} defaultValue={profile.capHoc === "mam-non" ? profile.doTuoi : DO_TUOI_LABEL[t.doTuoi]} />
          </Field>
          <Button type="submit" disabled={ban || !daNap || !profileReady || Boolean(planError)}>
            {dangTaoTuan ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <WandSparkles size={17} aria-hidden="true" />}
            {dangTaoTuan ? buoc === "luu" ? "Đang lưu…" : "Đang soạn…" : "Gợi ý kế hoạch 5 ngày"}
          </Button>
        </form>
  );

  const khoiThongBao = (
      <div aria-live="polite">
        {(dangTaoTuan || dangLuuLai) && !tienDo && <p className="mb-4 flex items-center gap-2 rounded-o bg-bang-nhat p-3 text-sm" role="status"><Loader2 size={17} className="animate-spin" />{buoc === "luu" ? "Đã có nội dung · Đang lưu kế hoạch…" : "Đang gợi ý kế hoạch tuần…"}</p>}
        {pendingSave && !dangLuuLai && <div className="mb-4 rounded-o border border-phan bg-phan-nhat p-4"><p className="text-sm font-semibold">Đã có nội dung nhưng chưa lưu đầy đủ vào thư viện.</p><p className="mt-1 text-sm text-muc-nhat">Cô giữ trang mở và thử lưu lại. Nội dung đã tạo sẽ được dùng lại, không gọi AI thêm lần nữa.</p><Button type="button" variant="phu" className="mt-3" onClick={thuLuuLai}>Thử lưu lại</Button></div>}
        {tienDo && (
          <div className="mb-6 rounded-the border border-phan bg-phan-nhat px-5 py-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <span className="font-semibold">
                {buoc === "luu" ? "Đang lưu giáo án và kế hoạch" : "Đang soạn giáo án"} {tienDo.xong + 1}/{tienDo.tong}
              </span>
              <span className="text-muc-nhat">Thời gian tùy nội dung và dịch vụ AI. Phần đã lưu được giữ lại.</span>
            </div>
            <p className="mt-1 truncate text-[14px]">{tienDo.ten}</p>
            <div className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${tienDo.tong}, minmax(0, 1fr))` }} aria-hidden="true">
              {Array.from({ length: tienDo.tong }).map((_, i) => (
                <span key={i} className={`h-2 rounded-full ${i < tienDo.xong ? "bg-bang" : i === tienDo.xong ? "bg-bang/40 animate-pulse" : "bg-white"}`} />
              ))}
            </div>
          </div>
        )}
        {thongBao && (
          <p className="mb-6 flex items-center gap-2 rounded-the bg-la-nhat px-4 py-3 text-[14px] text-la">
            <Check size={16} strokeWidth={3} aria-hidden="true" />
            {thongBao}
          </p>
        )}
        {loi && (
          <p className="mb-6 rounded-the border border-butdo/30 bg-hong-nhat px-4 py-3 text-[14px] text-butdo" role="alert">
            {loi}
          </p>
        )}
      </div>
  );

  const GOI_Y_CHU_DE = ["Bản thân", "Gia đình", "Trường mầm non", "Nghề nghiệp", "Thế giới động vật", "Phương tiện giao thông"];

  if (planError) return <div role="alert" className="rounded-the border border-vien bg-trang p-6"><h1 className="text-xl font-bold">Chưa mở được kế hoạch tuần</h1><p className="mt-3">{planError}</p><Link href="/thu-vien" className="mt-4 inline-flex min-h-11 items-center font-semibold text-bang">Quay lại thư viện</Link></div>;

  // Chưa tải xong: không vẽ kế hoạch mẫu rồi mới đổi sang kế hoạch thật.
  if (!daNap) return <p role="status" className="py-10 text-center text-muc-nhat">Đang mở kế hoạch tuần…</p>;

  // Cô chưa có kế hoạch tuần nào: mời tạo bản đầu tiên, không hiện kế hoạch mẫu như thể là của cô.
  if (!coKeHoach) {
    return (
      <>
        <PageHeader
          tinhNang="/ke-hoach-tuan"
          title="Kế hoạch tuần"
          lead="Nhập chủ đề đang dạy, AI gợi ý khung 5 ngày × 5 buổi cho lớp của cô. Cô xem lại và chỉnh trước khi soạn giáo án."
        />
        {khoiThongBao}{hopThoai}
        <section className="rounded-the border border-vien bg-trang p-5 shadow-the sm:p-6" aria-label="Tạo kế hoạch tuần đầu tiên">
          <h2 className="text-lg font-bold">Tạo kế hoạch tuần đầu tiên</h2>
          <p className="mt-1 text-muc-nhat">Chưa biết chọn chủ đề nào? Bấm một gợi ý bên dưới, cô có thể sửa lại.</p>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Gợi ý chủ đề">
            {GOI_Y_CHU_DE.map((g) => (
              <button key={g} type="button" onClick={() => setChuDeNhap(g)} disabled={ban} className={`min-h-11 rounded-full border px-4 text-sm font-medium transition-colors ${chuDeNhap === g ? "border-bang bg-bang-nhat text-bang" : "border-vien bg-trang hover:border-muc-nhat"}`}>
                {g}
              </button>
            ))}
          </div>
          {formTao("mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end")}
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        tinhNang="/ke-hoach-tuan"
        title={`Chủ đề: ${t.chuDe}`}
        lead={`${t.nhanh ? `Nhánh ${t.nhanh} · ` : ""}${DO_TUOI_LABEL[t.doTuoi]} · Tuần ${khoangNgay(t.tuNgay)}`}
        actions={
          <>
            <Button onClick={soanCaTuan} disabled={ban || con === 0 || !daNap}>
              {tienDo ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <WandSparkles size={17} aria-hidden="true" />}
              {con === 0 ? "Đã soạn đủ 5 giáo án" : con === 5 ? "Soạn cả 5 giáo án" : `Soạn ${con} giáo án còn lại`}
            </Button>
            <NutTaiFile loai="ke-hoach-tuan" data={t} tenFile={`Ke hoach tuan - ${t.chuDe}`} variant="phu" nhan="Tải Word" />
            <NutTaiFile loai="ke-hoach-tuan" dinhDang="pdf" data={t} tenFile={`Ke hoach tuan - ${t.chuDe}`} variant="phu" nhan="Tải PDF" />
          </>
        }
      />

      {/* Tiến độ và thông báo */}
      {khoiThongBao}{hopThoai}

      <details className="group mb-8 rounded-the border border-vien bg-trang shadow-the">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-5 py-4 font-semibold [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg bg-phan-nhat text-muc grid place-items-center" aria-hidden="true">
              <WandSparkles size={16} />
            </span>
            Tạo kế hoạch tuần mới
          </span>
          <ChevronDown size={18} className="text-muc-nhat transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        {planError && <p role="alert" className="px-5 pb-3 text-butdo">{planError}</p>}
        {formTao("grid gap-4 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-4 items-end")}
      </details>

      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muc-nhat">
        <span className="font-semibold text-muc">Lĩnh vực trong tuần:</span>
        {Object.values(LINH_VUC_MAU).map((lv) => (
          <span key={lv.ngan} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${lv.mau.nen} border ${lv.mau.vien}`} aria-hidden="true" />
            {lv.ngan}
          </span>
        ))}
        <span className="ml-auto font-medium">Đã soạn {daSoan}/5 giáo án</span>
      </div>

      <div className={`transition-opacity ${dangTaoTuan ? "opacity-40 pointer-events-none" : ""}`}>
        {/* Lưới tuần trên màn hình rộng */}
        <div className="hidden xl:block rounded-the border border-vien bg-trang shadow-the overflow-hidden">
          <table className="w-full table-fixed border-collapse text-[14px]">
            <thead>
              <tr className="bg-giay">
                <th className="w-[150px] p-3 text-left text-[13px] font-semibold uppercase tracking-wider text-muc-nhat">Buổi</th>
                {t.ngay.map((n) => (
                  <th key={n.thu} className="p-3 text-left font-bold border-l border-vien">{n.thu}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BUOI.map(({ ten: buoi, icon: Icon }) => {
                const laHoc = buoi === "Hoạt động học";
                return (
                  <tr key={buoi} className={`border-t border-vien ${laHoc ? "bg-bang-nhat/40" : ""}`}>
                    <th scope="row" className={`p-3 text-left align-top font-semibold ${laHoc ? "text-bang" : "text-muc-nhat"}`}>
                      <span className="flex items-center gap-2">
                        <Icon size={16} aria-hidden="true" />
                        {buoi}
                      </span>
                    </th>
                    {t.ngay.map((n) => {
                      const hd = n.hoatDong.find((h) => h.buoi === buoi)!;
                      return (
                        <td key={hd.id} className="p-2.5 align-top border-l border-vien">
                          {laHoc ? <OHoc t={t} hd={hd} dangSoan={tienDo?.ten === hd.ten} /> : <p className="px-1 py-0.5 leading-snug text-muc">{hd.ten}</p>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Danh sách theo ngày trên màn hình hẹp */}
        <div className="xl:hidden grid gap-5 md:grid-cols-2">
          {t.ngay.map((n) => (
            <section key={n.thu} className="rounded-the border border-vien bg-trang shadow-the overflow-hidden">
              <h2 className="px-4 py-3 bg-giay border-b border-vien font-bold">{n.thu}</h2>
              <ul className="p-3 space-y-2">
                {n.hoatDong.map((hd) => {
                  const Icon = ICON_BUOI[hd.buoi];
                  return (
                    <li key={hd.id}>
                      {hd.buoi === "Hoạt động học" ? (
                        <OHoc t={t} hd={hd} dangSoan={tienDo?.ten === hd.ten} />
                      ) : (
                        <div className="flex gap-3 px-1 py-1.5">
                          <Icon size={16} className="mt-0.5 shrink-0 text-muc-nhat" aria-hidden="true" />
                          <div>
                            <p className="text-[13px] font-semibold text-muc-nhat">{hd.buoi}</p>
                            <p className="leading-snug">{hd.ten}</p>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

// Ô hoạt động học: thẻ màu theo lĩnh vực, có nút soạn / xem giáo án.
function OHoc({ t, hd, dangSoan }: { t: KeHoachTuan; hd: HoatDongTrongNgay; dangSoan: boolean }) {
  const lv = hd.linhVuc ? LINH_VUC_MAU[hd.linhVuc] : null;
  return (
    <div className={`rounded-o border bg-trang p-3 ${hd.giaoAnId ? "border-phan" : lv ? lv.mau.vien : "border-vien"}`}>
      {lv && (
        <span className={`inline-flex items-center gap-1 text-[13px] font-semibold px-2 py-0.5 rounded ${lv.mau.nen} ${lv.mau.chu}`}>
          <lv.icon size={12} aria-hidden="true" />
          {lv.ngan}
        </span>
      )}
      <p className="mt-1.5 font-semibold leading-snug">{hd.ten}</p>
      {dangSoan ? (
        <span className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muc-nhat">
          <Loader2 size={13} className="animate-spin" aria-hidden="true" />
          Đang soạn…
        </span>
      ) : hd.giaoAnId ? (
        <Link
          href={hrefXemGiaoAn(hd.giaoAnId)}
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-md bg-phan px-3 text-sm font-semibold text-muc hover:brightness-95"
        >
          <Check size={13} strokeWidth={3} aria-hidden="true" />
          Đã soạn, xem
        </Link>
      ) : (
        <Link
          href={hrefSoanGiaoAn(t, hd)}
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-md border border-bang/40 px-3 text-sm font-semibold text-bang hover:bg-bang-nhat"
        >
          <WandSparkles size={13} aria-hidden="true" />
          Soạn giáo án
        </Link>
      )}
    </div>
  );
}
