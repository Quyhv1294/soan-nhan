"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui";
import { NutTaiFile } from "@/components/NutTaiFile";
import { cauHinhTrangThang } from "@/lib/bang-ke-hoach-thang";
import { cssKeHoachThang, keHoachThangHtml, noiDungHtmlThang } from "@/lib/ke-hoach-thang-html";
import type { KeHoachThang } from "@/lib/types";

export function BanInThang({ plan, onClose }: { plan: KeHoachThang; onClose: () => void }) {
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(0.75);
  const viewport = useRef<HTMLDivElement>(null);
  const f = cauHinhTrangThang(plan);
  function fit() { if (viewport.current) setZoom(Math.max(0.25, Math.min(1.5, (viewport.current.clientWidth - 24) / (f.rongMm * 96 / 25.4)))); }
  useEffect(() => { const frame = requestAnimationFrame(fit); return () => cancelAnimationFrame(frame); }, [f.rongMm]);
  function print() {
    setError("");
    const popup = window.open("", "_blank", "popup,width=1200,height=850");
    if (!popup) { setError("Trình duyệt đang chặn cửa sổ in. Cô cho phép cửa sổ bật lên hoặc tải PDF để in nhé."); return; }
    popup.document.open(); popup.document.write(keHoachThangHtml(plan)); popup.document.close();
    popup.focus(); popup.setTimeout(() => popup.print(), 250);
  }
  const name = `Ke hoach giao duc thang ${plan.thang}`;
  return <Modal wide title={`Bản in tháng · ${f.khoGiay} ngang · ${f.coChu}pt`} onClose={onClose}>
    <div className="space-y-3 border-b border-vien p-4">
      <div className="flex flex-wrap gap-2"><NutTaiFile loai="ke-hoach-thang" data={plan} tenFile={name} nhan="Tải Word" /><NutTaiFile loai="ke-hoach-thang" dinhDang="pdf" data={plan} tenFile={name} variant="phu" /><Button type="button" variant="phu" onClick={print}>In</Button></div>
      <div className="flex flex-wrap items-center gap-2"><Button type="button" variant="phu" aria-label="Thu nhỏ bản in" disabled={zoom <= 0.25} onClick={() => setZoom((n) => Math.max(0.25, n - 0.1))}>−</Button><span className="w-14 text-center text-sm tabular-nums">{Math.round(zoom * 100)}%</span><Button type="button" variant="phu" aria-label="Phóng to bản in" disabled={zoom >= 1.5} onClick={() => setZoom((n) => Math.min(1.5, n + 0.1))}>+</Button><Button type="button" variant="nhe" onClick={fit}>Vừa chiều rộng</Button><Button type="button" variant="nhe" onClick={() => setZoom(1)}>100%</Button></div>
      <p className="text-sm text-muc-nhat">Bản xem giữ đầy đủ nội dung trên giấy; Word/PDF tự chia trang và lặp hàng tiêu đề. Khi in, dùng đúng khổ giấy và hướng ngang đã chọn.</p>
      {error && <p role="alert" className="text-sm text-butdo">{error}</p>}
    </div>
    <div ref={viewport} className="overflow-auto bg-vien p-3" tabIndex={0} role="region" aria-label="Bản in kế hoạch tháng có thể cuộn ngang">
      <style>{cssKeHoachThang(plan)}</style>
      <div style={{ width: f.rongMm * 96 / 25.4, zoom }} dangerouslySetInnerHTML={{ __html: noiDungHtmlThang(plan) }} />
    </div>
  </Modal>;
}
