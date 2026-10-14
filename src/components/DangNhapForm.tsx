"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, ButtonLink, Field, Input } from "@/components/ui";
import { Send } from "lucide-react";

export function DangNhapForm({ configured, allowDemo = false }: { configured: boolean; allowDemo?: boolean }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [next, setNext] = useState("/bat-dau");
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNext(params.get("next") || "/bat-dau");
    setHasError(params.has("error"));
  }, []);

  async function google() {
    if (!configured) return;
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) setMessage("Chưa thể đăng nhập bằng Google. Cô thử lại sau nhé.");
    setBusy(false);
  }

  async function magicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) return;
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setMessage(error ? "Chưa gửi được đường dẫn. Cô kiểm tra email rồi thử lại." : "Đã gửi đường dẫn đăng nhập. Cô kiểm tra hộp thư nhé.");
    setBusy(false);
  }

  return (
    <>
      <Button type="button" variant="phu" className="w-full mt-7 h-12" onClick={google} disabled={!configured || busy}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" /></svg>
        {busy ? "Đang chuyển tới Google…" : "Tiếp tục với Google"}
      </Button>
      <div className="my-6 flex items-center gap-3 text-[13px] text-muc-nhat"><span className="h-px flex-1 bg-vien" />hoặc nhận đường dẫn qua email<span className="h-px flex-1 bg-vien" /></div>
      <form className="space-y-4" onSubmit={magicLink}>
        <Field label="Email"><Input type="email" name="email" placeholder="co.lan@gmail.com" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Button type="submit" className="w-full h-12" disabled={!configured || busy}><Send size={17} aria-hidden="true" />{busy ? "Đang gửi…" : "Gửi đường dẫn đăng nhập"}</Button>
      </form>
      {!configured && (
        <div className="mt-4 rounded-o bg-phan-nhat px-3 py-3 text-[13px] text-muc">
          <p>Đăng nhập chưa được thiết lập.{allowDemo ? " Cô có thể dùng thử bản demo; tài liệu được lưu trên trình duyệt này." : " Vui lòng quay lại sau."}</p>
          {allowDemo && <ButtonLink href="/bat-dau" variant="phu" className="mt-3 w-full">Dùng thử bản demo</ButtonLink>}
        </div>
      )}
      {message && <p className="mt-4 text-sm" role="status">{message}</p>}
      {hasError && <p className="mt-4 text-sm text-butdo" role="alert">Phiên đăng nhập chưa hoàn tất. Cô thử gửi lại đường dẫn nhé.</p>}
    </>
  );
}
