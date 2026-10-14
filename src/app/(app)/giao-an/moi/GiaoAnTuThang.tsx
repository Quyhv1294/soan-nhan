"use client";

import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui";
import { cacONoiDung, layNguCanhGiaoAn } from "@/lib/ke-hoach-thang";
import { hrefOThang, taiKeHoachThang } from "@/lib/lien-ket-thang";
import type { GiaoAnMamNon, NguCanhGiaoAnThang } from "@/lib/types";
import { GiaoAnEditor } from "./GiaoAnEditor";

export function GiaoAnTuThang({ initial, planId, nhomId }: { initial: GiaoAnMamNon | null; planId: string; nhomId: string }) {
  const [context, setContext] = useState<NguCanhGiaoAnThang | null>(null);
  const [expected, setExpected] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    setError(""); setContext(null);
    taiKeHoachThang(planId, controller.signal).then((plan) => {
      const snapshot = layNguCanhGiaoAn(plan, nhomId);
      if (active) { setContext(snapshot); setExpected(cacONoiDung(plan).find((o) => o.nhom.id === nhomId)?.nhom.giaoAnId ?? null); }
    }).catch((e) => { if (active) setError(e instanceof Error && e.name !== "AbortError" ? e.message : "Tải kế hoạch quá lâu. Cô thử lại nhé."); }).finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [planId, nhomId, retry]);
  if (error) return <div role="alert" className="space-y-3 rounded-the border border-vien bg-trang p-5"><p>{error}</p><Button type="button" onClick={() => setRetry((n) => n + 1)}>Thử lại</Button><ButtonLink href={hrefOThang(planId, nhomId)} variant="phu">Về kế hoạch tháng</ButtonLink></div>;
  if (!context) return <p role="status">Đang lấy loại tiết, nội dung và mục tiêu từ ô kế hoạch…</p>;
  return <>
    <div className="khong-in mb-5 space-y-2 rounded-o bg-bang-nhat p-4">
      <p className="font-semibold">Soạn từ kế hoạch tháng {context.thang.slice(5, 7)}/{context.thang.slice(0, 4)}{context.ngay ? ` · ${context.ngay}` : " · Nội dung dùng chung"}</p>
      <p className="text-sm">{context.mucTieu.length ? `${context.mucTieu.length} mục tiêu từ ${context.boMucTieu?.ten}, phiên bản ${context.boMucTieu?.phienBan}.` : "Ô chưa gắn MT; giáo án không tự thêm mã mục tiêu."}</p>
      <ButtonLink href={hrefOThang(planId, nhomId)} variant="nhe">Về chỉnh ô kế hoạch</ButtonLink>
    </div>
    <GiaoAnEditor initial={initial} tenHoatDong={context.tietHoc.deTai} nguCanhThang={context} expectedGiaoAnId={expected} />
  </>;
}
