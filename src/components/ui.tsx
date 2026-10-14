import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { OBieuTuong, TINH_NANG } from "./TinhNang";

type Variant = "chinh" | "phu" | "nhe";

const VARIANT: Record<Variant, string> = {
  chinh: "bg-bang text-tren-bang hover:bg-bang-dam",
  phu: "bg-trang text-muc border border-vien hover:border-muc-nhat",
  nhe: "text-bang hover:bg-bang-nhat",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-o px-4 h-11 text-base font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none";

export function Button({
  variant = "chinh",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`${BASE} ${VARIANT[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "chinh",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${BASE} ${VARIANT[variant]} ${className}`} {...props} />;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-base font-semibold text-muc">{label}</span>
      {hint && <span className="block text-sm leading-relaxed text-muc-nhat mt-0.5">{hint}</span>}
      <span className="block mt-1.5">{children}</span>
    </label>
  );
}

const INPUT =
  "w-full h-11 rounded-o border border-vien-nhap bg-trang px-3 text-base text-muc placeholder:text-muc-nhat/80 transition focus:border-bang focus:outline-none focus:ring-4 focus:ring-bang/10";

export function Input(props: ComponentProps<"input">) {
  return <input className={INPUT} {...props} />;
}

export function Select({ options, ...props }: ComponentProps<"select"> & { options: string[] }) {
  return (
    <select className={INPUT} {...props}>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea className={`${INPUT} h-auto py-2.5 leading-relaxed`} {...props} />;
}

// Lựa chọn dạng thẻ (cấp học, mẫu phiếu…) — dễ bấm trên điện thoại hơn danh sách thả xuống.
export function ChoiceGroup({
  name,
  options,
  defaultValue,
  value,
  onValueChange,
  cot = 2,
}: {
  name: string;
  options: { value: string; label: string; note?: string; icon?: LucideIcon }[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  cot?: 2 | 3;
}) {
  return (
    <div className={`grid gap-2.5 sm:grid-cols-2 ${cot === 3 ? "lg:grid-cols-3" : ""}`}>
      {options.map((o) => (
        <label
          key={o.value}
          className="group relative flex gap-3 items-start rounded-the border border-vien bg-trang p-3.5 cursor-pointer transition hover:border-muc-nhat/50 has-[:checked]:border-bang has-[:checked]:bg-bang-nhat has-[:checked]:shadow-the has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-bang"
        >
          <input type="radio" name={name} value={o.value} {...(value === undefined ? { defaultChecked: o.value === defaultValue } : { checked: o.value === value })} onChange={() => onValueChange?.(o.value)} className="peer sr-only" />
          {o.icon ? (
            <span className="h-9 w-9 rounded-lg grid place-items-center shrink-0 bg-giay text-muc-nhat group-has-[:checked]:bg-trang group-has-[:checked]:text-bang" aria-hidden="true">
              <o.icon size={18} />
            </span>
          ) : (
            <span className="mt-0.5 h-4.5 w-4.5 rounded-full border-2 border-vien shrink-0 grid place-items-center group-has-[:checked]:border-bang" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-bang opacity-0 group-has-[:checked]:opacity-100" />
            </span>
          )}
          <span className="min-w-0">
            <span className="block font-semibold text-base leading-snug">{o.label}</span>
            {o.note && <span className="block mt-0.5 text-sm text-muc-nhat leading-relaxed">{o.note}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}

// tinhNang: đường dẫn trang trong TINH_NANG, để hiện ô biểu tượng màu của tính năng.
export function PageHeader({ title, lead, actions, tinhNang }: { title: string; lead?: string; actions?: ReactNode; tinhNang?: string }) {
  const t = tinhNang ? TINH_NANG[tinhNang] : undefined;
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pb-6 mb-8 border-b border-vien">
      <div className="max-w-2xl flex gap-4 items-start">
        {t && <OBieuTuong icon={t.icon} mau={t.mau} size="lg" />}
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight text-balance">{title}</h1>
          {lead && <p className="mt-1.5 text-muc-nhat leading-relaxed">{lead}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

// Logo: một ô vở với dấu tích của cô — ghép từ chất liệu ô ly và bút đỏ.
// nenToi: đặt trên nền bảng phấn — ô vở chuyển sang trắng mờ, chữ trắng.
export function Logo({ className = "", nenToi = false }: { className?: string; nenToi?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap font-bold text-[17px] ${nenToi ? "text-white" : "text-muc"} ${className}`}>
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <rect x="1" y="1" width="24" height="24" rx="5" fill={nenToi ? "#ffffff" : "#1e4b3a"} fillOpacity={nenToi ? 0.14 : 1} />
        <path d="M7 1v24M13 1v24M19 1v24M1 7h24M1 13h24M1 19h24" stroke="#ffffff" strokeOpacity="0.18" />
        <path d="M7.5 13.5l3.5 3.5 7.5-8" fill="none" stroke="#f3d36b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Soạn Nhàn
    </span>
  );
}
