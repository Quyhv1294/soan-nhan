export type NguonBanSoan = "ai" | "mau" | "chinh-sua" | "khong-ro";
export type PhienBan<T> = { data: T; luc: string; nhan: string; nguon: NguonBanSoan };
export type TaiLieuCoId = { id: string };
const MAX_HISTORY = 5;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function boLichSu<T>(data: T): T {
  const result = { ...data } as T & { _soanNhan?: unknown };
  delete result._soanNhan;
  return result;
}

export function docBanSoan<T extends TaiLieuCoId>(raw: T) {
  const meta = (raw as T & { _soanNhan?: { nguon?: NguonBanSoan; phienBan?: PhienBan<T>[] } })._soanNhan;
  const phienBan = Array.isArray(meta?.phienBan) ? meta.phienBan.filter((item) => item?.data && typeof item.luc === "string").slice(0, MAX_HISTORY).map((item) => ({ ...item, data: boLichSu(item.data) })) : [];
  return { data: boLichSu(raw), nguon: meta?.nguon ?? "khong-ro", phienBan };
}

export function dongGoiBanSoan<T extends TaiLieuCoId>(data: T, phienBan: PhienBan<T>[], nguon: NguonBanSoan) {
  return { ...boLichSu(data), _soanNhan: { nguon, phienBan: phienBan.slice(0, MAX_HISTORY).map((item) => ({ ...item, data: boLichSu(item.data) })) } };
}

export function themPhienBan<T>(history: PhienBan<T>[], data: T, nguon: NguonBanSoan, nhan: string): PhienBan<T>[] {
  return [{ data: boLichSu(data), nguon, nhan, luc: new Date().toISOString() }, ...history].slice(0, MAX_HISTORY);
}

export function giuIdTaiLieu<T extends TaiLieuCoId>(next: T, current?: TaiLieuCoId | null): T {
  const id = current?.id ?? next.id;
  const context = current && "nguCanhKeHoach" in current ? current.nguCanhKeHoach : undefined;
  return { ...next, ...(context && !("nguCanhKeHoach" in next) ? { nguCanhKeHoach: context } : {}), id: UUID.test(id) ? id : crypto.randomUUID() };
}

/** Update an editor field without mutating the committed document or other versions. */
export function suaTruong<T>(value: T, path: (string | number)[], next: unknown): T {
  if (path.length === 0) return next as T;
  const [key, ...rest] = path;
  const copy = (Array.isArray(value) ? [...value] : { ...value }) as Record<string | number, unknown>;
  copy[key] = suaTruong(copy[key], rest, next);
  return copy as T;
}

export function chuanHoaNoiDung<T>(value: T): T {
  if (typeof value === "string") return value.trim() as T;
  if (Array.isArray(value)) return value.map(chuanHoaNoiDung).filter((item) => typeof item !== "string" || item.length > 0) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, chuanHoaNoiDung(v)])) as T;
  return value;
}
