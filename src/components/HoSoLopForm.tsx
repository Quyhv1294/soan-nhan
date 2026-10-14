"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Baby, Save, School } from "lucide-react";
import { Button, ChoiceGroup, Field, Input, Select } from "@/components/ui";
import { DO_TUOI_LABEL, type CapHoc } from "@/lib/types";
import { luuHoSo } from "@/lib/kho-local";
import { thongBaoHoSo, useHoSo } from "@/lib/use-ho-so";
import { demoAllowed } from "@/lib/supabase/configured";

type Profile = { capHoc: CapHoc; doTuoi: string; boSach: string; tenLop: string };
const initial: Profile = { capHoc: "mam-non", doTuoi: DO_TUOI_LABEL["4-5"], boSach: "Không áp dụng", tenLop: "" };
const BO_SACH = ["Kết nối tri thức", "Chân trời sáng tạo", "Cánh Diều"];

export function HoSoLopForm({ goDashboard = true }: { goDashboard?: boolean }) {
  const router = useRouter();
  const { profile: savedProfile, daNap, error: loadError } = useHoSo();
  const [profile, setProfile] = useState<Profile>(initial);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (daNap) setProfile(savedProfile);
  }, [savedProfile, daNap]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!daNap || saving) return;
    setSaving(true); setError(""); setSaved(false);
    const form = new FormData(event.currentTarget);
    const capHoc = String(form.get("capHoc")) as CapHoc;
    const next = { capHoc, doTuoi: String(form.get("doTuoi")), boSach: capHoc === "tieu-hoc" ? String(form.get("boSach")) : "Không áp dụng", tenLop: String(form.get("tenLop") ?? "").trim() };
    try {
      if (demoAllowed()) {
        if (!luuHoSo(next)) throw new Error("Trình duyệt không lưu được hồ sơ lớp. Cô cho phép lưu dữ liệu trang web rồi thử lại nhé.");
      } else {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        try {
          const response = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next), signal: controller.signal });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error ?? "Chưa lưu được hồ sơ.");
          if (result.demo && !luuHoSo(next)) throw new Error("Trình duyệt không lưu được hồ sơ lớp.");
        } finally { clearTimeout(timeout); }
      }
      thongBaoHoSo(next);
      if (goDashboard) router.push("/tong-quan");
      else setSaved(true);
    } catch (e) { setError(e instanceof Error && e.name === "AbortError" ? "Lưu hồ sơ đang mất quá nhiều thời gian. Cô kiểm tra kết nối rồi thử lại nhé." : e instanceof Error ? e.message : "Chưa lưu được hồ sơ."); }
    finally { setSaving(false); }
  }

  const tuổi = profile.capHoc === "mam-non" ? Object.values(DO_TUOI_LABEL) : ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"];
  const tieuHoc = profile.capHoc === "tieu-hoc";
  return <form onSubmit={save} onChange={() => { setSaved(false); setError(""); }} className="mt-8" aria-busy={!daNap || saving}>
    {!daNap && <p role="status" className="mb-4 text-sm text-muc-nhat">Đang tải hồ sơ lớp…</p>}
    {loadError && <p role="alert" className="mb-4 text-sm text-butdo">{loadError}</p>}
    <fieldset disabled={!daNap || saving} className="space-y-6">
    <fieldset><legend className="text-base font-semibold mb-2.5">Cấp học</legend><ChoiceGroup key={profile.capHoc} name="capHoc" defaultValue={profile.capHoc} onValueChange={(capHoc) => setProfile((old) => ({ ...old, capHoc: capHoc as CapHoc, doTuoi: capHoc === "mam-non" ? initial.doTuoi : "Lớp 1" }))} options={[{ value: "mam-non", label: "Mầm non", note: "Kế hoạch tuần, giáo án 3 cột", icon: Baby }, { value: "tieu-hoc", label: "Tiểu học", note: "Kế hoạch bài dạy theo CV 2345", icon: School }]} /></fieldset>
    <Field label={tieuHoc ? "Lớp đang dạy" : "Độ tuổi của trẻ"}><Select name="doTuoi" options={tuổi} value={profile.doTuoi} onChange={(e) => setProfile((old) => ({ ...old, doTuoi: e.target.value }))} /></Field>
    {tieuHoc && <Field label="Bộ sách" hint="Chọn bộ sách lớp đang sử dụng."><Select name="boSach" options={BO_SACH} value={BO_SACH.includes(profile.boSach) ? profile.boSach : BO_SACH[0]} onChange={(e) => setProfile((old) => ({ ...old, boSach: e.target.value }))} /></Field>}
    <Field label="Tên lớp (không bắt buộc)" hint="Dùng trong tin nhắn gửi phụ huynh."><Input name="tenLop" value={profile.tenLop} onChange={(e) => setProfile((old) => ({ ...old, tenLop: e.target.value }))} maxLength={100} placeholder={tieuHoc ? "Lớp 2A" : "Mẫu giáo nhỡ A2"} /></Field>
    {error && <p role="alert" className="text-sm text-butdo">{error}</p>}
    {saved && <p role="status" className="text-sm text-la">Đã lưu hồ sơ lớp.</p>}
    <Button type="submit" className="w-full h-12" disabled={saving || !daNap}>{!daNap ? "Đang tải hồ sơ…" : saving ? "Đang lưu…" : goDashboard ? "Bắt đầu soạn bài" : "Lưu thay đổi"}{goDashboard ? <ArrowRight size={18} aria-hidden="true" /> : <Save size={18} aria-hidden="true" />}</Button>
  </fieldset></form>;
}
