"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "./ui";
import { docKeHoachThang } from "@/lib/ke-hoach-thang";

// Gọi /api/export/{docx|pdf} rồi cho trình duyệt tải file về. Dùng chung cho mọi loại tài liệu.
export function NutTaiFile({
  loai,
  dinhDang = "docx",
  data,
  tenFile,
  variant = "chinh",
  nhan = dinhDang === "pdf" ? "Tải PDF" : "Tải file Word",
}: {
  loai: "giao-an" | "khbd" | "ke-hoach-tuan" | "ke-hoach-thang" | "phieu";
  dinhDang?: "docx" | "pdf";
  data: unknown;
  tenFile: string;
  variant?: "chinh" | "phu" | "nhe";
  nhan?: string;
}) {
  const [dang, setDang] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  async function tai() {
    setDang(true);
    setLoi(null);
    try {
      if (loai === "ke-hoach-thang") docKeHoachThang(data);
      const res = await fetch(`/api/export/${dinhDang}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loai, data }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error ?? `Không xuất được file ${dinhDang === "pdf" ? "PDF" : "Word"}. Thử lại sau ít phút.`);
      }
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      // Bỏ ký tự không hợp lệ trong tên file trên Windows.
      a.download = `${tenFile.replace(/[\\/:*?"<>|]+/g, " ").trim().slice(0, 80) || "soan-nhan"}.${dinhDang}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setLoi(e instanceof TypeError ? "Mất kết nối mạng. Cô kiểm tra mạng rồi thử lại." : e instanceof Error ? e.message : `Không xuất được file ${dinhDang === "pdf" ? "PDF" : "Word"}.`);
    } finally {
      setDang(false);
    }
  }

  return (
    <>
      <Button type="button" variant={variant} onClick={tai} disabled={dang}>
        {dang ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <FileDown size={17} aria-hidden="true" />}
        {dang ? "Đang tạo file…" : nhan}
      </Button>
      {loi && (
        <span className="basis-full text-sm text-butdo" role="alert">
          {loi}
        </span>
      )}
    </>
  );
}
