"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { docTuan, docTaiLieu, luuTuan, luuTaiLieu } from "./kho-local";
import { MOCK_TUAN } from "./mock-data";
import type { KeHoachTuan } from "./types";

// Kế hoạch tuần hiện tại, dùng chung cho trang Kế hoạch tuần và Tổng quan.
// Lần vẽ đầu (cả trên máy chủ) luôn là bản mẫu để khớp nhau; sang trình duyệt mới nạp bản đã lưu.
export function useTuan() {
  const [tuan, datTuan] = useState<KeHoachTuan>(MOCK_TUAN);
  const [daNap, datDaNap] = useState(false);
  const [error, setError] = useState("");
  const moiNhat = useRef(tuan); // tránh đọc nhầm bản cũ khi cập nhật liên tiếp trong vòng lặp bất đồng bộ

  useEffect(() => {
    const requestedId = window.location.pathname === "/ke-hoach-tuan" ? new URLSearchParams(window.location.search).get("id") : null;
    let active = true;
    fetch("/api/documents?loai=ke-hoach-tuan").then(async (r) => {
      if (!r.ok) throw new Error("Chưa tải được kế hoạch tuần.");
      const result = await r.json();
      const currentId = requestedId ?? docTuan()?.id;
      const plans: KeHoachTuan[] = result.demo
        ? docTaiLieu().filter((x) => x.loai === "ke-hoach-tuan").map((x) => x.noiDung as KeHoachTuan)
        : (result.documents ?? []).map((x: { noi_dung: KeHoachTuan }) => x.noi_dung);
      const selected = plans.find((x) => x?.id === currentId) ?? (requestedId ? null : plans[0] ?? (result.demo ? docTuan() : null));
      if (requestedId && !selected) throw new Error("Kế hoạch này không còn trong thư viện. Cô quay lại thư viện để chọn kế hoạch khác.");
      if (active && selected?.ngay?.length === 5) { moiNhat.current = selected; datTuan(selected); luuTuan(selected); }
    }).catch((e) => { if (active) setError(e instanceof Error ? e.message : "Chưa tải được kế hoạch tuần."); }).finally(() => { if (active) datDaNap(true); });
    return () => { active = false; };
  }, []);

  const capNhat = useCallback(async (doi: (t: KeHoachTuan) => KeHoachTuan) => {
    if (error) throw new Error(error);
    const moi = doi(moiNhat.current);
    moiNhat.current = moi;
    datTuan(moi);
    luuTuan(moi);
    const id = await luuTaiLieu("ke-hoach-tuan", moi as unknown as Record<string, unknown>);
    const saved = { ...moi, id };
    moiNhat.current = saved;
    datTuan(saved);
    luuTuan(saved);
    if (window.location.pathname === "/ke-hoach-tuan") {
      const url = new URL(window.location.href); url.searchParams.set("id", id);
      window.history.replaceState(null, "", url.pathname + url.search);
    }
    return saved;
  }, [error]);

  return { tuan, capNhat, daNap, error };
}
