"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { tenTroChoi, xaoTron, type BoChoi } from "@/lib/tro-choi";

const button = "min-h-12 rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-lg font-semibold text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-200 disabled:opacity-50";
const tile = "min-h-24 break-words rounded-xl border-2 p-5 text-left text-xl font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-200";

export function TrinhChieuTroChoi({ bo, title, onClose, onReplay }: { bo: BoChoi; title: string; onClose: () => void; onReplay: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null, overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; ref.current?.showModal();
    return () => { ref.current?.close(); document.body.style.overflow = overflow; before?.focus(); };
  }, []);
  const [cards, setCards] = useState(() => bo.loai === "lat-the" ? xaoTron(bo.muc.flatMap((p, i) => [{ id: i * 2, pair: i, text: p.cau }, { id: i * 2 + 1, pair: i, text: p.dapAn }])) : []);
  const [open, setOpen] = useState<number[]>([]), [matched, setMatched] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [pick, setPick] = useState(() => bo.loai === "vong-quay" ? bo.muc[Math.floor(Math.random() * bo.muc.length)] : "");
  const [question, setQuestion] = useState(0), [answer, setAnswer] = useState<number | null>(null), [score, setScore] = useState(0);
  const [door, setDoor] = useState<number | null>(null), [showAnswer, setShowAnswer] = useState(false);
  const [order, setOrder] = useState<number[]>([]), [checked, setChecked] = useState(false);
  const [shuffled] = useState(() => {
    const values = xaoTron(bo.muc.map((_, i) => i));
    return values.every((v, i) => v === i) ? [...values.slice(1), values[0]] : values;
  });
  useEffect(() => {
    if (open.length !== 2) return;
    const timer = window.setTimeout(() => setOpen([]), 850);
    return () => window.clearTimeout(timer);
  }, [open]);
  function flip(id: number) {
    if (open.includes(id) || matched.includes(id) || open.length === 2) return;
    const next = [...open, id]; setOpen(next);
    if (next.length === 2) {
      const [a, b] = next.map((v) => cards.find((c) => c.id === v)!);
      // Older documents may repeat an answer (e.g. two objects both match "hình tròn").
      // Exchange identical copies' pair assignments so either visible copy is accepted.
      const twin = cards.find((c) => c.pair === a.pair && c.id !== a.id);
      if (a.pair === b.pair || twin?.text === b.text) {
        if (a.pair !== b.pair && twin) setCards((old) => old.map((c) => c.id === b.id ? { ...c, pair: a.pair } : c.id === twin.id ? { ...c, pair: b.pair } : c));
        setMatched((old) => [...old, ...next]);
      }
    }
  }
  const replay = <button type="button" className={button} onClick={onReplay}><RotateCcw size={18} className="mr-2 inline" aria-hidden="true" />Chơi lại</button>;
  let stage;
  if (bo.loai === "lat-the") stage = <>
    <p className="mb-5 text-center text-lg" role="status">{matched.length / 2} / {bo.muc.length} cặp đã tìm được{matched.length === cards.length ? " · Bé đã hoàn thành!" : " · Chọn hai thẻ để ghép đôi"}</p>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{cards.map((card) => {
      const shown = open.includes(card.id) || matched.includes(card.id);
      return <button key={card.id} type="button" disabled={matched.includes(card.id)} aria-label={shown ? card.text : `Thẻ ${card.id + 1}, chưa mở`} onClick={() => flip(card.id)} className={`${tile} min-h-32 text-center ${matched.includes(card.id) ? "border-emerald-300 bg-emerald-900 text-white" : shown ? "border-white bg-white text-[#172d24]" : "border-white/40 bg-white/10 text-white"}`}>{shown ? card.text : "?"}</button>;
    })}</div>
  </>;
  else if (bo.loai === "vong-quay") stage = <div className="py-14 text-center"><p className="text-2xl text-yellow-200">Nội dung được chọn</p><p className="my-10 break-words text-4xl font-bold sm:text-6xl" aria-live="polite">{pick}</p><button type="button" className={button} onClick={() => setPick(bo.muc[Math.floor(Math.random() * bo.muc.length)])}>Chọn ngẫu nhiên tiếp</button><p className="mt-5 text-white/80">Chọn từ {bo.muc.length} mục; một mục có thể được chọn lại.</p></div>;
  else if (bo.loai === "ai-nhanh-hon") stage = <><p className="mb-5 text-center text-white/80">Cô mời trẻ trả lời, sau đó bấm câu hỏi để xem gợi ý.</p><div className="grid gap-4 sm:grid-cols-2">{bo.muc.map((p, i) => <button type="button" key={i} aria-expanded={revealed.includes(i)} onClick={() => setRevealed((old) => old.includes(i) ? old.filter((x) => x !== i) : [...old, i])} className={`${tile} border-white/40 bg-white/10 text-white`}>Câu {i + 1}: {p.cau}<span className="mt-4 block text-lg font-normal text-yellow-200">{revealed.includes(i) ? p.dapAn : "Bấm để hiện đáp án"}</span></button>)}</div></>;
  else if (bo.loai === "trac-nghiem" || bo.loai === "dung-sai") {
    const q = bo.muc[question];
    if (!q) stage = <div className="py-16 text-center" role="status"><h3 className="text-4xl font-bold">Đã hoàn thành!</h3><p className="mt-6 text-2xl">Trả lời đúng {score} / {bo.muc.length} câu.</p></div>;
    else {
      const options = "luaChon" in q ? q.luaChon : ["Đúng", "Sai"], correct = "luaChon" in q ? q.dung : q.dung ? 0 : 1;
      stage = <div className="mx-auto max-w-4xl"><p className="mb-6 text-white/80">Câu {question + 1} / {bo.muc.length} · {score} câu đúng</p><h3 className="mb-8 break-words text-3xl font-bold leading-relaxed">{q.cau}</h3><div className="grid gap-4 sm:grid-cols-2">{options.map((option, i) => <button key={i} type="button" disabled={answer !== null} onClick={() => { setAnswer(i); if (i === correct) setScore((s) => s + 1); }} className={`${tile} ${answer !== null && i === correct ? "border-emerald-300 bg-emerald-900 text-white" : answer === i ? "border-rose-200 bg-rose-950 text-white" : "border-white/40 bg-white/10 text-white"}`}>{String.fromCharCode(65 + i)}. {option}</button>)}</div>{answer !== null && <div className="mt-7"><p role="status" className="mb-4 text-xl text-yellow-200">{answer === correct ? "Chính xác!" : `Đáp án đúng: ${options[correct]}`}</p><button className={button} type="button" onClick={() => { setQuestion((i) => i + 1); setAnswer(null); }}>{question + 1 === bo.muc.length ? "Xem kết quả" : "Câu tiếp theo"}</button></div>}</div>;
    }
  }
  else if (bo.loai === "o-cua-bi-mat") stage = door !== null ? <div className="mx-auto max-w-3xl py-8 text-center"><p className="text-yellow-200">Ô cửa {door + 1}</p><h3 className="mt-5 break-words text-3xl font-bold leading-relaxed">{bo.muc[door].cau}</h3>{showAnswer && <p className="my-8 text-2xl text-yellow-200" role="status">{bo.muc[door].dapAn}</p>}<div className="mt-8 flex flex-wrap justify-center gap-3">{!showAnswer && <button type="button" className={button} onClick={() => setShowAnswer(true)}>Hiện đáp án gợi ý</button>}<button type="button" className={button} onClick={() => { setRevealed((r) => [...r, door]); setDoor(null); }}>Hoàn thành ô này</button></div></div> : <><p className="mb-6 text-center" role="status">{revealed.length === bo.muc.length ? "Cả lớp đã khám phá tất cả các ô cửa!" : `Chọn một ô cửa · Đã mở ${revealed.length} / ${bo.muc.length} ô`}</p><div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{bo.muc.map((_, i) => <button key={i} type="button" disabled={revealed.includes(i)} onClick={() => { setDoor(i); setShowAnswer(false); }} className={`${tile} min-h-36 text-center text-4xl ${revealed.includes(i) ? "border-white/20 bg-white/5 text-white/50" : "border-yellow-200/50 bg-white/10 text-yellow-200"}`}>{revealed.includes(i) ? `✓ ${i + 1}` : i + 1}</button>)}</div></>;
  else if (bo.loai === "sap-xep") stage = <>
    <p className="mb-5 text-center text-lg">Bấm các thẻ theo thứ tự đúng. Cô có thể bấm “Bỏ bước cuối” để sửa.</p>
    <ol className="mb-7 space-y-2" aria-label="Thứ tự đã chọn">{order.map((v, i) => <li key={v} className="rounded-xl bg-white/10 px-5 py-3 text-xl">{i + 1}. {bo.muc[v]}</li>)}</ol>
    <div className="grid gap-3 sm:grid-cols-2">{shuffled.map((v) => <button key={v} type="button" disabled={checked || order.includes(v)} onClick={() => setOrder((old) => [...old, v])} className={`${tile} border-white/40 bg-white/10 text-white disabled:opacity-40`}>{bo.muc[v]}</button>)}</div>
    <div className="mt-6 flex flex-wrap gap-3"><button type="button" className={button} disabled={!order.length || checked} onClick={() => setOrder((o) => o.slice(0, -1))}>Bỏ bước cuối</button><button type="button" className={button} disabled={order.length !== bo.muc.length || checked} onClick={() => setChecked(true)}>Kiểm tra thứ tự</button></div>
    {checked && <div className="mt-6 text-xl text-yellow-200" role="status">{order.every((v, i) => v === i) ? "Chính xác! Các bước đã đúng thứ tự." : <><p>Cùng xem lại thứ tự đúng:</p><ol className="mt-3 list-inside list-decimal space-y-2">{bo.muc.map((v, i) => <li key={i}>{v}</li>)}</ol></>}</div>}
  </>;
  return <dialog ref={ref} aria-label={title || tenTroChoi(bo.loai)} onCancel={(e) => { e.preventDefault(); onClose(); }} className="giay-co-dinh fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto border-0 bg-[#10251d] p-4 text-white sm:p-8">
    <header className="mx-auto mb-10 flex max-w-6xl flex-wrap items-center justify-between gap-4"><div><p className="text-base text-yellow-200">{tenTroChoi(bo.loai)}</p><h2 className="mt-1 text-2xl font-bold">{title}</h2></div><button type="button" className={button} onClick={onClose}><X size={18} className="mr-2 inline" aria-hidden="true" />Thoát <span className="text-sm">(Esc)</span></button></header>
    <main className="mx-auto max-w-5xl">{stage}</main><footer className="mx-auto mt-10 max-w-5xl border-t border-white/20 pt-5 text-center">{replay}</footer>
  </dialog>;
}
