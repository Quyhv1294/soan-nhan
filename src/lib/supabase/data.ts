import { createClient } from "./server";
import type { GiaoAnMamNon, KeHoachBaiDay } from "../types";

export async function loadDocument<T extends GiaoAnMamNon | KeHoachBaiDay>(id: string, type: "giao-an" | "khbd"): Promise<T | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("documents").select("noi_dung").eq("id", id).eq("loai", type).maybeSingle();
    return (data?.noi_dung as T | undefined) ?? null;
  } catch { return null; }
}
