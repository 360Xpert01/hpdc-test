import { useState, useRef } from "react";
import { useClerk, useSignIn } from "@clerk/react";
import { useLocation, Link } from "wouter";
import { useLanguage } from "@/contexts/language-context";
import { Eye, EyeOff, Lock, Mail, Building2, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";

const G = "#1A4D2E";
const GOLD = "#C9A84C";
const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
type Lang = "ar" | "en";
const s = (ar: string, en: string, lang: Lang) => lang === "ar" ? ar : en;

const API_BASE = import.meta.env.VITE_API_URL ?? "";

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>{msg}</span>
    </div>
  );
}

export default function SignInPage() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const clerk = useClerk();
  const { signIn: signInHook, setActive: setActiveHook, isLoaded: signInLoaded } = useSignIn();
  const [, setLocation] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<"company" | null>(null);
  const [error, setError] = useState("");
  // OTP second-factor state
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const pendingSI = useRef<any>(null); // stores the sign-in attempt during OTP step
  // Forgot password state
  const [forgotStep, setForgotStep] = useState<"" | "email" | "reset">("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  /* ── Shared helpers ── */
  const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T> =>
    Promise.race([
      p,
      new Promise<T>((_, rej) =>
        setTimeout(() => rej(new Error(s("انتهت مهلة الاتصال، أعد المحاولة", "Connection timed out, please retry", lang))), ms)
      ),
    ]);

  const activateSession = async (sessionId: string) => {
    if (setActiveHook) {
      await setActiveHook({ session: sessionId });
    } else {
      await (clerk as any).setActive({ session: sessionId });
    }
    setLocation("/dashboard");
  };

  const getSignInResource = () => {
    const si = (signInLoaded && signInHook) ? signInHook : (clerk as any).client?.signIn;
    if (!si) throw new Error(s("جارٍ تحميل النظام، أعد المحاولة", "System loading, please retry", lang));
    return si;
  };

  /* ── OTP submission (second factor) ── */
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || !pendingSI.current) return;
    setError("");
    setLoading(true);
    try {
      const result = await withTimeout(
        pendingSI.current.attemptSecondFactor({ strategy: "email_code", code: otpCode.trim() }),
        10_000
      );
      if (result.status === "complete") {
        await activateSession(result.createdSessionId);
      } else {
        throw new Error(s("رمز غير صحيح، حاول مرة أخرى", "Incorrect code, please try again", lang));
      }
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        err?.message ??
        s("رمز غير صحيح", "Incorrect code", lang)
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Password form submission ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError("");
    setLoading(true);
    try {
      const si = getSignInResource();

      // Step 1: Try password sign-in
      let result = await withTimeout(
        si.create({ strategy: "password", identifier: email.trim(), password }),
        10_000
      );

      if (result.status === "complete") {
        await activateSession(result.createdSessionId);
        return;
      }

      // Step 2: Handle needs_first_factor
      if (result.status === "needs_first_factor") {
        result = await withTimeout(
          result.attemptFirstFactor({ strategy: "password", password }),
          10_000
        );
        if (result.status === "complete") {
          await activateSession(result.createdSessionId);
          return;
        }
      }

      // Step 3: Second factor required — prepare the code, then show OTP input
      if (result.status === "needs_second_factor") {
        // Prepare sends the verification code to the user's email
        const prepared = await withTimeout(
          result.prepareSecondFactor({ strategy: "email_code" }),
          10_000
        );
        pendingSI.current = prepared ?? result;
        setOtpStep(true);
        return;
      }

      throw new Error(s(
        "تحقق من بريدك الإلكتروني وكلمة المرور",
        "Check your email and password",
        lang
      ));
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        err?.message ??
        s("حدث خطأ غير متوقع", "An unexpected error occurred", lang)
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Demo sign-in via server-issued sign-in token (bypasses 2FA) ── */
  const handleDemo = async (type: "company" | "admin") => {
    setError("");
    setDemoLoading(type);
    try {
      // 1. Ask our API to create a Clerk sign-in token for the demo account
      const resp = await fetch(`${API_BASE}/api/auth/demo-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!resp.ok) throw new Error(s("فشل إنشاء رمز الدخول", "Failed to create login token", lang));
      const { token } = await resp.json() as { token: string };
      localStorage.setItem("hpdc_demo_mode", type);

      // 2. Use "ticket" strategy — bypasses password & 2FA entirely
      const si = (signInLoaded && signInHook) ? signInHook : (clerk as any).client?.signIn;
      if (!si) throw new Error(s("جارٍ تحميل النظام، أعد المحاولة", "System loading, please retry", lang));

      const result = await si.create({ strategy: "ticket", ticket: token });
      if (result.status === "complete") {
        if (setActiveHook) {
          await setActiveHook({ session: result.createdSessionId });
        } else {
          await (clerk as any).setActive({ session: result.createdSessionId });
        }
        setLocation("/dashboard");
      } else {
        throw new Error(s("فشل الدخول التجريبي", "Demo login failed", lang));
      }
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        err?.message ??
        s("فشل الدخول التجريبي، حاول مرة أخرى", "Demo login failed, please retry", lang)
      );
    } finally {
      setDemoLoading(null);
    }
  };

  /* ── Forgot password: send reset code ── */
  const handleForgotSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setError("");
    setForgotLoading(true);
    try {
      const si = getSignInResource();
      await withTimeout(
        si.create({ strategy: "reset_password_email_code", identifier: forgotEmail.trim() }),
        10_000
      );
      setForgotStep("reset");
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        err?.message ??
        s("تعذّر إرسال رمز الاسترداد، تحقق من البريد الإلكتروني", "Could not send reset code, check your email", lang)
      );
    } finally {
      setForgotLoading(false);
    }
  };

  /* ── Forgot password: submit new password ── */
  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode.trim() || !newPassword) return;
    setError("");
    setForgotLoading(true);
    try {
      const si = getSignInResource();
      const result = await withTimeout(
        si.attemptFirstFactor({ strategy: "reset_password_email_code", code: resetCode.trim(), password: newPassword }),
        10_000
      );
      if (result.status === "complete") {
        setForgotSuccess(true);
        await activateSession(result.createdSessionId);
      } else {
        throw new Error(s("فشلت عملية الاسترداد، حاول مجدداً", "Reset failed, please try again", lang));
      }
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        err?.message ??
        s("رمز غير صحيح أو منتهي الصلاحية", "Invalid or expired reset code", lang)
      );
    } finally {
      setForgotLoading(false);
    }
  };

  /* ── Render ── */
  return (
    <div className="min-h-screen flex" dir={isAr ? "rtl" : "ltr"}>

      {/* ═══ Left / brand panel ═══ */}
      <div className="hidden lg:flex flex-col w-[360px] flex-shrink-0 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1A4D2E 0%, #0e2e1a 100%)" }}>
        <div className="absolute -top-20 -start-20 w-64 h-64 rounded-full opacity-10" style={{ background: GOLD }} />
        <div className="absolute bottom-0 end-0 w-72 h-72 rounded-full opacity-5" style={{ background: "#fff" }} />

        <a href={`${BASE}/`} className="absolute top-5 right-5 z-20 hover:opacity-80 transition-opacity">
          <img src={`${BASE}/hpdc-logo-transparent.png`} alt="HPDC"
            className="h-14 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
        </a>

        <div className="flex-1 flex flex-col justify-center px-10 z-10">
          <div className="mb-8">
            <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
              style={{ background: `${GOLD}30`, color: GOLD }}>
              {s("منصة حلال طيب للاستدامة", "Halal Tayib Sustainability Platform", lang)}
            </span>
          </div>
          <h2 className="text-3xl font-black text-white leading-tight mb-4">
            {s("أهلاً بك في منصة حلال طيب للاستدامة", "Welcome to Halal Tayib Sustainability Platform", lang)}
          </h2>
          <p className="text-sm text-white/60 leading-relaxed">
            {s(
              "منصة اعتماد شهادة الاستدامة (ESG)",
              "ESG Sustainability Certification Platform",
              lang
            )}
          </p>
          <div className="mt-10 space-y-3">
            {[
              s("تتبع مسار طلبات اعتمادك", "Track certification applications", lang),
              s("استلام شهاداتك الرسمية", "Receive your official certificates", lang),
              s("الوصول لسجل المنشآت المعتمدة", "Access the certified entities registry", lang),
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: GOLD }} />
                <span className="text-sm text-white/80">{feat}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-10 pb-8 z-10">
          <p className="text-xs text-white/30">www.hpdc.sa · منصة ESG الرسمية</p>
        </div>
      </div>

      {/* ═══ Right / form ═══ */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12 overflow-y-auto">
        {/* Mobile logo */}
        <a href={`${BASE}/`} className="lg:hidden mb-8">
          <img src={`${BASE}/hpdc-logo-transparent.png`} alt="HPDC" className="h-12 object-contain" />
        </a>

        <div className="w-full max-w-md space-y-7">

          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-black mb-1" style={{ color: G }}>
              {s("أهلاً بك في منصة HPDC", "Welcome to HPDC Platform", lang)}
            </h1>
            <p className="text-sm text-gray-500">
              {s("منصة اعتماد ESG الرسمية لشركة تطوير منتجات الحلال", "The official ESG certification platform of Halal Products Development Company", lang)}
            </p>
          </div>

          {/* ── Auth tabs ── */}
          <div className="flex rounded-2xl border border-gray-100 p-1 gap-1" style={{ background: "#f8faf8" }}>
            <div
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all"
              style={{ background: G, color: "#fff", boxShadow: "0 2px 8px #1A4D2E30" }}
            >
              {s("تسجيل الدخول", "Sign In", lang)}
            </div>
            <Link href="/sign-up" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all text-gray-500 hover:text-gray-800">
              {s("حساب جديد", "New Account", lang)}
            </Link>
          </div>

          {/* ── Demo quick-access ── */}
          <div className="rounded-2xl border-2 p-5 space-y-3"
            style={{ borderColor: `${GOLD}50`, background: `${GOLD}06` }}>
            <p className="text-xs font-bold text-center uppercase tracking-wider" style={{ color: GOLD }}>
              {s("دخول تجريبي سريع — بدون بيانات", "Quick Demo Access — No credentials needed", lang)}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button type="button"
                onClick={() => handleDemo("company")}
                disabled={demoLoading !== null || loading}
                className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: `${G}30`, background: "#fff" }}>
                {demoLoading === "company"
                  ? <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
                    style={{ borderColor: `${G}40`, borderTopColor: G }} />
                  : <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${G}10` }}>
                    <Building2 className="w-4 h-4" style={{ color: G }} />
                  </div>}
                <div className="text-start">
                  <p className="text-xs font-bold leading-tight" style={{ color: G }}>
                    {s("بوابة المنشآت", "Company Portal", lang)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">
                    {s("دخول تجريبي كمنشأة", "Demo as company", lang)}
                  </p>
                </div>
              </button>

              <button type="button"
                onClick={() => handleDemo("admin")}
                disabled={demoLoading !== null || loading}
                className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: `${GOLD}50`, background: "#fff" }}>
                {demoLoading === "admin"
                  ? <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
                    style={{ borderColor: `${GOLD}60`, borderTopColor: GOLD }} />
                  : <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${GOLD}20` }}>
                    <ShieldCheck className="w-4 h-4" style={{ color: GOLD }} />
                  </div>}
                <div className="text-start">
                  <p className="text-xs font-bold leading-tight" style={{ color: GOLD }}>
                    {s("بوابة الأدمن", "Admin Portal", lang)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">
                    {s("دخول تجريبي كمسؤول", "Demo as admin", lang)}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">
              {s("أو سجّل الدخول بحسابك", "or sign in with your account", lang)}
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* ── Forgot Password Steps ── */}
          {forgotStep === "email" && (
            <form onSubmit={handleForgotSend} className="space-y-4">
              <div className="rounded-2xl p-5 text-center space-y-2"
                style={{ background: `${G}08`, border: `1.5px solid ${G}20` }}>
                <Lock className="w-7 h-7 mx-auto mb-1" style={{ color: G }} />
                <p className="text-sm font-bold" style={{ color: G }}>
                  {s("استعادة كلمة المرور", "Reset Your Password", lang)}
                </p>
                <p className="text-xs text-gray-500">
                  {s("أدخل بريدك الإلكتروني وسنرسل لك رمز الاسترداد", "Enter your email and we'll send you a reset code", lang)}
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {s("البريد الإلكتروني", "Email Address", lang)}
                  <span className="text-red-500 ms-0.5"> *</span>
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    style={{ [isAr ? "right" : "left"]: "14px" }} />
                  <input
                    type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                    required autoComplete="email" placeholder="you@example.com"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{
                      [isAr ? "paddingRight" : "paddingLeft"]: "42px",
                      [isAr ? "paddingLeft" : "paddingRight"]: "14px",
                      "--tw-ring-color": `${G}50`,
                    } as any}
                    autoFocus
                  />
                </div>
              </div>
              {error && <ErrorBox msg={error} />}
              <button type="submit" disabled={forgotLoading}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: G }}>
                {forgotLoading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : s("إرسال رمز الاسترداد", "Send Reset Code", lang)}
              </button>
              <button type="button"
                onClick={() => { setForgotStep(""); setForgotEmail(""); setError(""); }}
                className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors">
                {s("← العودة لتسجيل الدخول", "← Back to sign in", lang)}
              </button>
            </form>
          )}

          {forgotStep === "reset" && (
            <form onSubmit={handleForgotReset} className="space-y-4">
              <div className="rounded-2xl p-5 text-center space-y-2"
                style={{ background: `${G}08`, border: `1.5px solid ${G}20` }}>
                <KeyRound className="w-7 h-7 mx-auto mb-1" style={{ color: G }} />
                <p className="text-sm font-bold" style={{ color: G }}>
                  {s("أدخل الرمز وكلمة المرور الجديدة", "Enter Code & New Password", lang)}
                </p>
                <p className="text-xs text-gray-500">
                  {s(`أُرسل الرمز إلى ${forgotEmail}`, `Code sent to ${forgotEmail}`, lang)}
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {s("رمز الاسترداد", "Reset Code", lang)}
                  <span className="text-red-500 ms-0.5"> *</span>
                </label>
                <input
                  type="text" value={resetCode} onChange={e => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required inputMode="numeric" maxLength={6} placeholder="••••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm text-center tracking-[0.4em] font-mono focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  style={{ "--tw-ring-color": `${G}50` } as any}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {s("كلمة المرور الجديدة", "New Password", lang)}
                  <span className="text-red-500 ms-0.5"> *</span>
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    style={{ [isAr ? "right" : "left"]: "14px" }} />
                  <input
                    type={showNewPass ? "text" : "password"} value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required minLength={8} placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{
                      [isAr ? "paddingRight" : "paddingLeft"]: "42px",
                      [isAr ? "paddingLeft" : "paddingRight"]: "42px",
                      "--tw-ring-color": `${G}50`,
                    } as any}
                  />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowNewPass(v => !v)}
                    className="absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    style={{ [isAr ? "left" : "right"]: "14px" }}>
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <ErrorBox msg={error} />}
              <button type="submit" disabled={forgotLoading}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: G }}>
                {forgotLoading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : s("تعيين كلمة المرور الجديدة", "Set New Password", lang)}
              </button>
              <button type="button"
                onClick={() => { setForgotStep("email"); setResetCode(""); setNewPassword(""); setError(""); }}
                className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors">
                {s("← إعادة إرسال الرمز", "← Resend code", lang)}
              </button>
            </form>
          )}

          {/* ── OTP / Password form (hidden while forgot-password is active) ── */}
          {!forgotStep && (otpStep ? (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="rounded-2xl p-5 text-center space-y-2"
                style={{ background: `${G}08`, border: `1.5px solid ${G}20` }}>
                <KeyRound className="w-8 h-8 mx-auto mb-1" style={{ color: G }} />
                <p className="text-sm font-bold" style={{ color: G }}>
                  {s("أدخل رمز التحقق", "Enter Verification Code", lang)}
                </p>
                <p className="text-xs text-gray-500">
                  {s(
                    `أُرسل رمز التحقق إلى ${email}`,
                    `A verification code was sent to ${email}`,
                    lang
                  )}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {s("رمز التحقق", "Verification Code", lang)}
                  <span className="text-red-500 ms-0.5"> *</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    style={{ [isAr ? "right" : "left"]: "14px" }} />
                  <input
                    type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)}
                    required autoComplete="one-time-code" inputMode="numeric"
                    maxLength={6}
                    placeholder="••••••"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm text-center tracking-[0.4em] font-mono focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ "--tw-ring-color": `${G}50` } as any}
                    autoFocus
                  />
                </div>
              </div>

              {error && <ErrorBox msg={error} />}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                style={{ background: G }}>
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <>{s("تأكيد الرمز", "Verify Code", lang)}
                    {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}</>}
              </button>

              <button type="button"
                onClick={() => { setOtpStep(false); setOtpCode(""); setError(""); pendingSI.current = null; }}
                className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors">
                {s("← العودة لتسجيل الدخول", "← Back to sign in", lang)}
              </button>
            </form>
          ) : (
            /* ── Password Form ── */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {s("البريد الإلكتروني", "Email Address", lang)}
                  <span className="text-red-500 ms-0.5"> *</span>
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    style={{ [isAr ? "right" : "left"]: "14px" }} />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    required autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{
                      [isAr ? "paddingRight" : "paddingLeft"]: "42px",
                      [isAr ? "paddingLeft" : "paddingRight"]: "14px",
                      "--tw-ring-color": `${G}50`,
                    } as any}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {s("كلمة المرور", "Password", lang)}
                  <span className="text-red-500 ms-0.5"> *</span>
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    style={{ [isAr ? "right" : "left"]: "14px" }} />
                  <input
                    type={showPass ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)}
                    required autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{
                      [isAr ? "paddingRight" : "paddingLeft"]: "42px",
                      [isAr ? "paddingLeft" : "paddingRight"]: "42px",
                      "--tw-ring-color": `${G}50`,
                    } as any}
                  />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowPass(v => !v)}
                    className="absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    style={{ [isAr ? "left" : "right"]: "14px" }}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot password link */}
              <div className={`flex ${isAr ? "justify-start" : "justify-end"} -mt-1`}>
                <button type="button"
                  onClick={() => { setForgotEmail(email); setForgotStep("email"); setError(""); }}
                  className="text-xs font-semibold hover:underline transition-colors"
                  style={{ color: G }}>
                  {s("نسيت كلمة المرور؟", "Forgot password?", lang)}
                </button>
              </div>

              {error && <ErrorBox msg={error} />}

              <button type="submit" disabled={loading || demoLoading !== null}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                style={{ background: G }}>
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <>{s("تسجيل الدخول", "Sign In", lang)}
                    {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}</>}
              </button>
            </form>
          ))}

          <p className="text-center text-xs text-gray-400">
            {s("ليس لديك حساب؟ ", "Don't have an account? ", lang)}
            <Link href="/sign-up" className="font-semibold hover:underline" style={{ color: G }}>
              {s("إنشاء حساب", "Create Account", lang)}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
