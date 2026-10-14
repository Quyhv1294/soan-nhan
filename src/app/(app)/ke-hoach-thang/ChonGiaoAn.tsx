"use client";

import { useEffect, useState } from "react";
import { Button, Input } from "@/components/ui";
import { docTaiLieu } from "@/lib/kho-local";
import { demoAllowed } from "@/lib/supabase/configured";
import { chuanHoaTimKiem } from "@/lib/thu-vien";
import type { DoTuoi } from "@/lib/types";

export function ChonGiaoAn({ doTuoi, onChoose }: { doTuoi: DoTuoi; onChoose: (id: string) => Promise<void> }) {
  const [items, setItems] = useState<{ id: string; ten: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    let active = true;
    setLoading(true); setError("");
    async function load() {
      let docs;
      if (demoAllowed()) docs = docTaiLieu().filter((d) => d.loai === "giao-an").map((d) => ({ id: d.id, ten: d.tieuDe, doTuoi: d.noiDung?.doTuoi }));
      else {
        const response = await fetch("/api/documents?loai=giao-an", { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Chưa tải được giáo án.");
        docs = (result.documents ?? []).filter((d: { loai: string }) => d.loai === "giao-an").map((d: { id: string; tieu_de: string; noi_dung?: { doTuoi?: string } }) => ({ id: d.id, ten: d.tieu_de, doTuoi: d.noi_dung?.doTuoi }));
      }
      if (active) setItems(docs.filter((d: { doTuoi?: string }) => d.doTuoi === doTuoi));
    }
    load().catch((e) => { if (active) setError(e instanceof Error && e.name !== "AbortError" ? e.message : "Tải danh sách quá lâu. Cô thử lại nhé."); }).finally(() => { clearTimeout(timer); if (active) setLoading(false); });
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [doTuoi, retry]);
  async function choose(id: string) {
    if (busy) return;
    setBusy(true); setError("");
    try { await onChoose(id); } catch (e) { setError(e instanceof Error ? e.message : "Chưa gắn được giáo án."); } finally { setBusy(false); }
  }
  const shown = items.filter((d) => chuanHoaTimKiem(d.ten).includes(chuanHoaTimKiem(query)));
  return <div className="space-y-4 p-4" aria-busy={loading || busy}>
    <p className="text-sm text-muc-nhat">Chọn giáo án cùng độ tuổi trong thư viện của cô. Kế hoạch đang sửa được lưu trước khi gắn; thao tác này không gọi AI.</p>
    <Input type="search" aria-label="Tìm giáo án đã lưu" placeholder="Tìm theo tên giáo án" value={query} onChange={(e) => setQuery(e.target.value)} disabled={busy} />
    {loading ? <p role="status">Đang tải giáo án…</p> : <ul className="max-h-96 divide-y divide-vien overflow-y-auto">{shown.map((d) => <li key={d.id} className="flex items-center justify-between gap-3 py-3"><p className="min-w-0 break-words">{d.ten}</p><Button type="button" variant="phu" disabled={busy} onClick={() => choose(d.id)}>Gắn</Button></li>)}</ul>}
    {!loading && !shown.length && <p className="text-sm text-muc-nhat">Chưa có giáo án cùng độ tuổi khớp từ khóa trong danh sách tải về.</p>}
    {error && <div role="alert"><p className="text-sm text-butdo">{error}</p><Button type="button" variant="nhe" disabled={busy} onClick={() => setRetry((n) => n + 1)}>Tải lại danh sách</Button></div>}
  </div>;
}
