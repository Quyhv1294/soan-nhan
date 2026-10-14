"use client";

import { useEffect, useState } from "react";
import { docHoSo } from "./kho-local";
import { DO_TUOI_LABEL, type CapHoc, type DoTuoi } from "./types";
import { demoAllowed } from "./supabase/configured";

export type HoSoHienTai = { capHoc: CapHoc; doTuoi: string; boSach: string; tenLop: string; hoTen: string; luotDaDung: number };
export const HO_SO_MAC_DINH: HoSoHienTai = { capHoc: "mam-non", doTuoi: DO_TUOI_LABEL["4-5"], boSach: "Không áp dụng", tenLop: "", hoTen: "", luotDaDung: 0 };
let cached: HoSoHienTai | null = null;
let loading: Promise<HoSoHienTai> | null = null;
let revision = 0;

export function xoaBoNhoHoSo() {
  revision += 1; cached = null; loading = null;
  window.dispatchEvent(new Event("soan-nhan:ho-so-thay-doi"));
}

export function thongBaoHoSo(profile: Partial<HoSoHienTai>) {
  cached = { ...(cached ?? HO_SO_MAC_DINH), ...profile };
  window.dispatchEvent(new Event("soan-nhan:ho-so-thay-doi"));
}

async function load() {
  const currentRevision = revision;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let response: Response;
  let result;
  try {
    response = await fetch("/api/profile", { signal: controller.signal });
    result = await response.json();
  } finally { clearTimeout(timeout); }
  if (!response.ok) throw new Error("Chưa tải được hồ sơ lớp.");
  if (currentRevision !== revision) throw new Error("Phiên đăng nhập đã thay đổi.");
  const p = result.profile;
  cached = result.demo ? { ...HO_SO_MAC_DINH, ...docHoSo<Partial<HoSoHienTai>>() } : p ? {
    capHoc: p.cap_hoc ?? "mam-non", doTuoi: DO_TUOI_LABEL[p.do_tuoi as DoTuoi] ?? p.do_tuoi ?? (p.lop ? `Lớp ${p.lop}` : HO_SO_MAC_DINH.doTuoi),
    boSach: p.bo_sach ?? "Không áp dụng", tenLop: p.ten_lop ?? "", hoTen: p.ho_ten ?? "", luotDaDung: p.luot_da_dung ?? 0,
  } : HO_SO_MAC_DINH;
  cached.doTuoi = DO_TUOI_LABEL[cached.doTuoi as DoTuoi] ?? cached.doTuoi;
  return cached;
}

export function useHoSo() {
  const [profile, setProfile] = useState(HO_SO_MAC_DINH);
  const [daNap, setDaNap] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const refresh = () => { if (active) { setProfile(cached ?? HO_SO_MAC_DINH); setDaNap(Boolean(cached)); } };
    window.addEventListener("soan-nhan:ho-so-thay-doi", refresh);
    // Demo chỉ dùng hồ sơ trên trình duyệt, không cần đợi API hay phiên đăng nhập.
    if (demoAllowed() && !cached) {
      cached = { ...HO_SO_MAC_DINH, ...docHoSo<Partial<HoSoHienTai>>() };
      cached.doTuoi = DO_TUOI_LABEL[cached.doTuoi as DoTuoi] ?? cached.doTuoi;
    }
    if (cached) refresh();
    else {
      loading ??= load().finally(() => { loading = null; });
      loading.then((p) => { if (active) setProfile(p); }).catch(() => { if (active) setError("Chưa tải được hồ sơ lớp. Cô tải lại trang để thử lại hoặc kiểm tra thông tin trước khi lưu."); }).finally(() => { if (active) setDaNap(true); });
    }
    return () => { active = false; window.removeEventListener("soan-nhan:ho-so-thay-doi", refresh); };
  }, []);
  return { profile, daNap, error };
}
