"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./ui";

export function XemLon({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);
  return <Modal title="Xem bản soạn" wide onClose={onClose}><div className="flex items-center gap-2 border-b border-vien bg-trang p-3"><Button type="button" variant="phu" aria-label="Thu nhỏ" disabled={zoom <= 0.5} onClick={() => setZoom((n) => Math.max(0.5, n - 0.25))}>−</Button><span className="w-14 text-center text-sm tabular-nums">{Math.round(zoom * 100)}%</span><Button type="button" variant="phu" aria-label="Phóng to" disabled={zoom >= 2} onClick={() => setZoom((n) => Math.min(2, n + 0.25))}>+</Button><Button type="button" variant="nhe" onClick={() => setZoom(1)}>100%</Button></div><div className="overflow-auto p-3"><div style={{ width: 744, zoom }}>{children}</div></div></Modal>;
}
