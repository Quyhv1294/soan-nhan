"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./ui";

type YeuCau = { noiDung: string; nutDongY: string; nutHuy: string };

// Thay cho window.confirm(): hộp thoại của trình duyệt có thể bị chặn trong trình duyệt của Zalo/Facebook
// và chữ không đồng bộ với giao diện. Dùng: const { xacNhan, hopThoai } = useXacNhan();
// rồi `if (!(await xacNhan("…"))) return;` và đặt {hopThoai} ở cuối JSX.
export function useXacNhan() {
  const [yeuCau, setYeuCau] = useState<YeuCau | null>(null);
  const giai = useRef<((dongY: boolean) => void) | null>(null);

  const xacNhan = useCallback((noiDung: string, tuyChon: Partial<Omit<YeuCau, "noiDung">> = {}) => new Promise<boolean>((xong) => {
    giai.current?.(false);
    giai.current = xong;
    setYeuCau({ noiDung, nutDongY: tuyChon.nutDongY ?? "Tiếp tục", nutHuy: tuyChon.nutHuy ?? "Quay lại" });
  }), []);

  const dong = (dongY: boolean) => {
    giai.current?.(dongY);
    giai.current = null;
    setYeuCau(null);
  };

  const hopThoai: ReactNode = yeuCau && (
    <Modal title="Cô xác nhận nhé" onClose={() => dong(false)}>
      <div className="space-y-4 p-4">
        <p className="whitespace-pre-line leading-relaxed">{yeuCau.noiDung}</p>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="phu" onClick={() => dong(false)}>{yeuCau.nutHuy}</Button>
          <Button type="button" onClick={() => dong(true)}>{yeuCau.nutDongY}</Button>
        </div>
      </div>
    </Modal>
  );

  return { xacNhan, hopThoai };
}
