"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, ButtonLink, Field, Input } from "@/components/ui";
import { Loader2, Send, ShieldCheck } from "lucide-react";

type Action = "sending" | "verifying";
const validOtp = (value: string) => /^[0-9]{6,10}$/.test(value);
const safeNext = (value: string | null) => value?.startsWith("/") && !value.startsWith("//") && !/[\\\u0000-\u001f]/.test(value) ? value : "/tong-quan";
function authMessage(error: { code?: string; status?: number; name?: string }, action: Action): string {
  if (error.name === "AuthRetryableFetchError" || (error.status !== undefined && error.status >= 500)) return "Dịch vụ đăng nhập đang gặp lỗi kết nối. Cô thử lại sau ít phút nhé.";
  if (error.status === 429 || error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit") return "Đã yêu cầu quá nhiều lần. Cô đợi một lúc rồi thử lại nhé.";
  if (error.code === "email_address_not_authorized") return "Dịch vụ email chưa cho phép gửi tới địa chỉ này. Cô liên hệ người quản trị để thiết lập gửi email nhé.";
  if (error.code === "email_provider_disabled" || error.code === "otp_disabled") return "Đăng nhập bằng email chưa được bật. Cô liên hệ người quản trị nhé.";
  if (error.code === "signup_disabled") return "Địa chỉ email này chưa được phép tạo tài khoản mới. Cô liên hệ người quản trị nhé.";
  if (error.code === "user_banned") return "Tài khoản hiện không được phép đăng nhập. Cô liên hệ người quản trị nhé.";
  return action === "verifying" ? "Mã OTP chưa đúng hoặc đã hết hạn. Cô kiểm tra lại mã hoặc yêu cầu mã mới nhé." : "Chưa gửi được mã OTP. Cô kiểm tra email rồi thử lại sau ít phút nhé.";
}

export function DangNhapForm({ configured, allowDemo = false }: { configured: boolean; allowDemo?: boolean }) {
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<Action | null>(null);
  const [next, setNext] = useState("/tong-quan");
  const [hasError, setHasError] = useState(false);
  const [sendError, setSendError] = useState(false);
  const working = useRef(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownEmail, setCooldownEmail] = useState("");
  const [now, setNow] = useState(0);
  const emailInput = useRef<HTMLInputElement>(null);
  const otpInput = useRef<HTMLInputElement>(null);
  const currentEmail = step === "otp" ? sentEmail : email.trim();
  const secondsLeft = currentEmail.toLowerCase() === cooldownEmail.toLowerCase() ? Math.max(0, Math.ceil((cooldownUntil - now) / 1000)) : 0;
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNext(safeNext(params.get("next")));
    setHasError(params.has("error"));
  }, []);
  useEffect(() => {
    if (!cooldownUntil) return;
    setNow(Date.now());
    const timer = window.setInterval(() => {
      const time = Date.now(); setNow(time);
      if (time >= cooldownUntil) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);
  useEffect(() => { if (step === "otp") otpInput.current?.focus(); else emailInput.current?.focus(); }, [step]);

  function startCooldown(address: string) {
    const time = Date.now(); setNow(time); setCooldownEmail(address); setCooldownUntil(time + 60_000);
  }
  async function sendOtp() {
    const address = currentEmail.trim();
    if (!configured || working.current || !address) return;
    if (address.toLowerCase() === cooldownEmail.toLowerCase() && Date.now() < cooldownUntil) return;
    working.current = true;
    setBusy("sending");
    setMessage(""); setSendError(false); setHasError(false);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: address,
        options: { shouldCreateUser: true },
      });
      if (error) {
        setSendError(true); setMessage(authMessage(error, "sending"));
        if (error.status === 429 || error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit") startCooldown(address);
        return;
      }
      setSentEmail(address); setOtp(""); setStep("otp"); startCooldown(address);
      setMessage("Đã yêu cầu gửi mã OTP. Cô kiểm tra hộp thư đến và thư rác rồi nhập mã bên dưới nhé.");
      requestAnimationFrame(() => otpInput.current?.focus());
    } catch {
      setSendError(true);
      setMessage("Chưa kết nối được dịch vụ đăng nhập. Cô kiểm tra mạng rồi thử gửi mã lại nhé.");
    } finally {
      working.current = false; setBusy(null);
    }
  }
  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || working.current || !sentEmail) return;
    if (!validOtp(otp)) { setSendError(true); setMessage("Cô nhập đầy đủ mã số trong email nhé."); return; }
    working.current = true; setBusy("verifying"); setMessage(""); setSendError(false); setHasError(false);
    let navigating = false;
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.verifyOtp({ email: sentEmail, token: otp, type: "email" });
      if (error || !data.session || !data.user) {
        setSendError(true); setMessage(error ? authMessage(error, "verifying") : "Chưa tạo được phiên đăng nhập. Cô thử yêu cầu mã mới nhé.");
        otpInput.current?.focus(); return;
      }
      setOtp(""); setMessage("Đăng nhập thành công. Đang mở trang làm việc…");
      // A full navigation reads the new auth cookies and clears cached account data.
      window.location.replace(next);
      navigating = true;
    } catch {
      setSendError(true); setMessage("Chưa xác minh được mã do lỗi kết nối. Cô kiểm tra mạng rồi thử lại nhé.");
    } finally {
      if (!navigating) { working.current = false; setBusy(null); requestAnimationFrame(() => otpInput.current?.focus()); }
    }
  }
  function changeEmail() {
    if (working.current) return;
    setEmail(sentEmail); setStep("email"); setOtp(""); setMessage(""); setSendError(false); setHasError(false);
  }

  return (
    <>
      {step === "email" ? <form className="mt-7 space-y-4" onSubmit={(event) => { event.preventDefault(); void sendOtp(); }} aria-busy={Boolean(busy)}>
        <Field label="Địa chỉ email"><Input ref={emailInput} type="email" name="email" placeholder="co.lan@gmail.com" autoComplete="email" autoCapitalize="none" spellCheck={false} disabled={!configured || Boolean(busy)} required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Button type="submit" className="w-full h-12" disabled={!configured || Boolean(busy) || secondsLeft > 0}>{busy ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <Send size={17} aria-hidden="true" />}{busy === "sending" ? "Đang gửi mã…" : secondsLeft > 0 ? `Gửi lại sau ${secondsLeft} giây` : "Gửi mã OTP"}</Button>
      </form> : <div className="mt-6 space-y-5">
        <div className="rounded-o border border-vien bg-giay p-3"><p className="text-sm text-muc-nhat">Email nhận mã</p><p className="mt-1 break-all font-semibold">{sentEmail}</p><Button type="button" variant="nhe" disabled={Boolean(busy)} className="mt-1" onClick={changeEmail}>Đổi địa chỉ email</Button></div>
        <form className="space-y-4" onSubmit={verifyOtp} aria-busy={Boolean(busy)}>
          <Field label="Mã OTP" hint="Nhập đầy đủ mã số trong email. Cô có thể dán mã vào ô này."><Input ref={otpInput} type="text" name="otp" inputMode="numeric" autoComplete="one-time-code" autoCapitalize="none" spellCheck={false} pattern="[0-9]{6,10}" minLength={6} maxLength={10} required disabled={Boolean(busy)} value={otp} onChange={(e) => { setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 10)); setSendError(false); setMessage(""); }} /></Field>
          <Button type="submit" className="w-full h-12" disabled={Boolean(busy) || !validOtp(otp)}>{busy === "verifying" ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <ShieldCheck size={17} aria-hidden="true" />}{busy === "verifying" ? "Đang xác minh…" : "Xác nhận và đăng nhập"}</Button>
        </form>
        <div className="border-t border-vien pt-3"><p className="text-sm text-muc-nhat">Chưa nhận được mã? Cô kiểm tra thư rác hoặc yêu cầu gửi lại.</p><Button type="button" variant="nhe" disabled={Boolean(busy) || secondsLeft > 0} onClick={() => void sendOtp()}>{busy === "sending" ? "Đang gửi mã…" : secondsLeft > 0 ? `Gửi lại sau ${secondsLeft} giây` : "Gửi lại mã OTP"}</Button></div>
      </div>}
      {!configured && (
        <div className="mt-4 rounded-o bg-phan-nhat px-3 py-3 text-[13px] text-muc">
          <p>Đăng nhập chưa được thiết lập.{allowDemo ? " Cô có thể dùng thử bản demo; tài liệu được lưu trên trình duyệt này." : " Vui lòng quay lại sau."}</p>
          {allowDemo && <ButtonLink href="/bat-dau" variant="phu" className="mt-3 w-full">Dùng thử bản demo</ButtonLink>}
        </div>
      )}
      {message && <p className={`mt-4 text-sm ${sendError ? "text-butdo" : "text-muc-nhat"}`} role={sendError ? "alert" : "status"}>{message}</p>}
      {hasError && <p className="mt-4 text-sm text-butdo" role="alert">Phiên đăng nhập chưa hoàn tất. Cô yêu cầu mã OTP mới để đăng nhập nhé.</p>}
    </>
  );
}
