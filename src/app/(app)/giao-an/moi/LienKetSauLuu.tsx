"use client";

import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui";
import { hrefOThang, lienKetGiaoAnThang } from "@/lib/lien-ket-thang";
import type { GiaoAnMamNon, NguCanhGiaoAnThang } from "@/lib/types";

export function GanLaiVaoKeHoach({ ga, context, expectedId }: { ga: GiaoAnMamNon; context: NguCanhGiaoAnThang; expectedId: string | null }) {
  const [state, setState] = useState<"linking" | "done" | "error">("linking");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setState("linking");
    lienKetGiaoAnThang(context.keHoachId, context.nhomId, ga.id, expectedId, true).then(() => { if (active) setState("done"); }).catch((e) => { if (active) { setError(e instanceof Error ? e.message : "Chưa gắn được giáo án."); setState("error"); } });
    return () => { active = false; };
  }, [ga.id, context.keHoachId, context.nhomId, expectedId, retry]);
  return <div className="khong-in mb-4 space-y-2 rounded-o border border-vien bg-trang p-3">
    <p role={state === "error" ? "alert" : "status"} className="text-sm">{state === "linking" ? "Giáo án đã lưu · Đang gắn vào ô kế hoạch…" : state === "done" ? "Đã gắn giáo án vào đúng ô kế hoạch tháng." : `Giáo án đã lưu trong thư viện nhưng chưa gắn được vào kế hoạch. ${error}`}</p>
    {state === "error" && <><Button type="button" variant="phu" onClick={() => setRetry((n) => n + 1)}>Thử gắn lại</Button><p className="text-sm text-muc-nhat">Thử gắn lại không gọi AI, không dùng thêm lượt soạn.</p></>}
    <ButtonLink href={hrefOThang(context.keHoachId, context.nhomId)} variant="nhe" aria-disabled={state === "linking"} className={state === "linking" ? "pointer-events-none opacity-50" : ""} onClick={(e) => { if (state === "linking") e.preventDefault(); }}>Về ô kế hoạch tháng</ButtonLink>
  </div>;
}
