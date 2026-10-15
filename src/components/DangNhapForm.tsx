"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, ButtonLink, Field, Input } from "@/components/ui";
import { Send } from "lucide-react";

export function DangNhapForm({ configured, allowDemo = false }: { configured: boolean; allowDemo?: boolean }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [next, setNext] = useState("/bat-dau");
  const [hasError, setHasError] = useState(false);
  const [sendError, setSendError] = useState(false);
  const sending = useRef(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNext(params.get("next") || "/bat-dau");
    setHasError(params.has("error"));
  }, []);

  async function magicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || sending.current) return;
    sending.current = true;
    setBusy(true);
    setMessage(""); setSendError(false); setHasError(false);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      setSendError(Boolean(error));
      setMessage(error ? "Chưa gửi được đường dẫn. Cô kiểm tra email rồi thử lại sau ít phút nhé." : "Đã gửi đường dẫn đăng nhập. Cô kiểm tra hộp thư đến và thư rác, rồi bấm đường dẫn trên trình duyệt này nhé.");
    } catch {
      setSendError(true);
      setMessage("Chưa kết nối được dịch vụ đăng nhập. Cô kiểm tra mạng rồi thử gửi lại nhé.");
    } finally {
      sending.current = false; setBusy(false);
    }
  }

  return (
    <>
      <form className="mt-7 space-y-4" onSubmit={magicLink} aria-busy={busy}>
        <Field label="Địa chỉ email"><Input type="email" name="email" placeholder="co.lan@gmail.com" autoComplete="email" autoCapitalize="none" spellCheck={false} disabled={!configured || busy} required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Button type="submit" className="w-full h-12" disabled={!configured || busy}><Send size={17} aria-hidden="true" />{busy ? "Đang gửi…" : "Gửi đường dẫn đăng nhập"}</Button>
      </form>
      {!configured && (
        <div className="mt-4 rounded-o bg-phan-nhat px-3 py-3 text-[13px] text-muc">
          <p>Đăng nhập chưa được thiết lập.{allowDemo ? " Cô có thể dùng thử bản demo; tài liệu được lưu trên trình duyệt này." : " Vui lòng quay lại sau."}</p>
          {allowDemo && <ButtonLink href="/bat-dau" variant="phu" className="mt-3 w-full">Dùng thử bản demo</ButtonLink>}
        </div>
      )}
      {message && <p className={`mt-4 text-sm ${sendError ? "text-butdo" : "text-muc-nhat"}`} role={sendError ? "alert" : "status"}>{message}</p>}
      {hasError && <p className="mt-4 text-sm text-butdo" role="alert">Phiên đăng nhập chưa hoàn tất. Cô thử gửi lại đường dẫn nhé.</p>}
    </>
  );
}
