export const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export function demoAllowed() {
  return process.env.NODE_ENV !== "production" && !supabaseConfigured;
}
