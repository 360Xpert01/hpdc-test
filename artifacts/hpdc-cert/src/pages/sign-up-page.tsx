import { useState } from "react";
import { useClerk } from "@clerk/react";
import { useLocation, Link } from "wouter";
import {
  Building2, User, Leaf, Shield, Award, CheckCircle2,
  ChevronLeft, ChevronRight, Eye, EyeOff, Mail, Lock,
  Phone, Globe, Hash, Users, Briefcase, MapPin, AlertCircle,
  ArrowLeft, ArrowRight, ShieldCheck, Check
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

const G = "#1A4D2E";
const GOLD = "#C9A84C";
const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
type Lang = "ar" | "en";
const s = (ar: string, en: string, lang: Lang) => lang === "ar" ? ar : en;

// ─── Data lists ──────────────────────────────────────────────────────────────
const SECTORS = [
  { ar: "النفط والغاز",              en: "Oil & Gas" },
  { ar: "الطاقة المتجددة",          en: "Renewable Energy" },
  { ar: "التصنيع",                   en: "Manufacturing" },
  { ar: "الرعاية الصحية",           en: "Healthcare" },
  { ar: "المالية والبنوك",          en: "Finance & Banking" },
  { ar: "التقنية",                   en: "Technology" },
  { ar: "الزراعة والغذاء",          en: "Agriculture & Food" },
  { ar: "البناء والتشييد",          en: "Construction" },
  { ar: "النقل والخدمات اللوجستية", en: "Transport & Logistics" },
  { ar: "الاستشارات والبحث",        en: "Consulting & Research" },
  { ar: "التعليم",                   en: "Education" },
  { ar: "الخدمات الحكومية",         en: "Government Services" },
  { ar: "قطاع آخر",                 en: "Other" },
];

const EMP_RANGES = [
  { ar: "أقل من 10",    en: "Less than 10" },
  { ar: "10 – 50",      en: "10 – 50" },
  { ar: "51 – 200",     en: "51 – 200" },
  { ar: "201 – 500",    en: "201 – 500" },
  { ar: "501 – 1000",   en: "501 – 1000" },
  { ar: "أكثر من 1000", en: "More than 1,000" },
];

const COUNTRIES = [
  { ar: "المملكة العربية السعودية", en: "Saudi Arabia" },
  { ar: "الإمارات العربية المتحدة", en: "UAE" },
  { ar: "الكويت",                   en: "Kuwait" },
  { ar: "قطر",                      en: "Qatar" },
  { ar: "البحرين",                  en: "Bahrain" },
  { ar: "عُمان",                    en: "Oman" },
  { ar: "مصر",                      en: "Egypt" },
  { ar: "الأردن",                   en: "Jordan" },
  { ar: "أخرى",                     en: "Other" },
];

const ESG_REASONS = [
  { ar: "متطلبات تنظيمية وامتثال",  en: "Regulatory & compliance requirements" },
  { ar: "تطوير مهني وتدريب",        en: "Professional development & training" },
  { ar: "بحث أكاديمي",              en: "Academic research" },
  { ar: "تقديم استشارات ESG",       en: "ESG consulting services" },
  { ar: "اهتمام شخصي بالاستدامة",  en: "Personal interest in sustainability" },
  { ar: "ممثّل عن جهة / شركة",      en: "Representing an organization" },
  { ar: "صحافة ووسائل إعلام",       en: "Journalism & media" },
];

// ─── Small UI helpers ─────────────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-bold text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ms-0.5"> *</span>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", required, disabled, icon: Icon }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; required?: boolean; disabled?: boolean; icon?: any;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 start-3 flex items-center pointer-events-none">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <input
        type={isPassword ? (show ? "text" : "password") : type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 transition-all disabled:bg-gray-50 disabled:text-gray-400 ${Icon ? "ps-9" : "px-3.5"} ${isPassword ? "pe-10" : "pe-3.5"}`}
        style={{ "--tw-ring-color": `${G}50` } as any}
      />
      {isPassword && (
        <button type="button" onClick={() => setShow(!show)}
          className="absolute inset-y-0 end-3 flex items-center text-gray-400 hover:text-gray-600">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

function SelectInput({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: { ar: string; en: string }[]; placeholder: string;
}) {
  const { lang } = useLanguage();
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 transition-all appearance-none"
      style={{ "--tw-ring-color": `${G}50` } as any}>
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o.en} value={o.en}>{lang === "ar" ? o.ar : o.en}</option>
      ))}
    </select>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepBar({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-0 w-full mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="relative flex flex-col items-center flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
              i < current ? `text-white border-transparent` :
              i === current ? `border-2 text-white` :
              `border-gray-200 text-gray-400 bg-white`
            }`} style={{
              background: i < current ? G : i === current ? G : "white",
              borderColor: i <= current ? G : "#e5e7eb",
            }}>
              {i < current ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`absolute -bottom-5 text-[10px] font-semibold whitespace-nowrap ${
              i <= current ? "text-gray-700" : "text-gray-400"
            }`}>{labels[i]}</span>
          </div>
          {i < total - 1 && (
            <div className="flex-1 h-0.5 mx-1 transition-all duration-300"
              style={{ background: i < current ? G : "#e5e7eb" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Error display ────────────────────────────────────────────────────────────
function ErrorBox({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>{msg}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SignUpPage() {
  const { lang } = useLanguage();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const clerk = useClerk();
  const [, setLocation] = useLocation();

  // Step state: 1=profile, 2=credentials, 3=verify (start at 1, skip account type step)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Platform is for companies only
  const accountType = "company" as const;

  // Step 1 — Company profile
  const [companyName, setCompanyName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [sector, setSector] = useState("");
  const [employees, setEmployees] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2 — Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // Step 3 — Verification
  const [verifyCode, setVerifyCode] = useState("");

  const STEP_LABELS = [
    s("البيانات", "Profile", lang),
    s("الحساب", "Credentials", lang),
    s("التحقق", "Verify", lang),
  ];

  // ── Validation per step ───────────────────────────────────────────────────
  const validateStep = (): string => {
    if (step === 1) {
      if (!companyName.trim()) return s("اسم الشركة مطلوب", "Company name is required", lang);
      if (!regNumber.trim()) return s("رقم السجل التجاري مطلوب", "Commercial registration number is required", lang);
      if (!sector) return s("القطاع مطلوب", "Sector is required", lang);
      if (!employees) return s("عدد الموظفين مطلوب", "Number of employees is required", lang);
      if (!country) return s("الدولة مطلوبة", "Country is required", lang);
      if (!contactPerson.trim()) return s("اسم المسؤول مطلوب", "Contact person name is required", lang);
      if (!phone.trim()) return s("رقم الجوال مطلوب", "Phone number is required", lang);
    }
    if (step === 2) {
      if (!email.trim() || !email.includes("@")) return s("بريد إلكتروني صحيح مطلوب", "A valid email is required", lang);
      if (password.length < 8) return s("كلمة المرور يجب أن تكون 8 أحرف على الأقل", "Password must be at least 8 characters", lang);
      if (password !== passwordConfirm) return s("كلمتا المرور غير متطابقتين", "Passwords do not match", lang);
    }
    if (step === 3) {
      if (verifyCode.length !== 6) return s("أدخل رمز التحقق المكوّن من 6 أرقام", "Enter the 6-digit verification code", lang);
    }
    return "";
  };

  const handleNext = async () => {
    setError("");
    const err = validateStep();
    if (err) { setError(err); return; }

    if (step === 2) {
      // Create Clerk signup using clerk.client.signUp (Clerk v6 compatible)
      const su = (clerk as any).client?.signUp;
      if (!su) {
        setError(s("جارٍ تحميل النظام، حاول مرة أخرى", "System loading, please try again", lang));
        return;
      }
      setLoading(true);
      try {
        await su.create({ emailAddress: email, password });
        await su.prepareEmailAddressVerification({ strategy: "email_code" });
        setStep(3);
      } catch (e: any) {
        const msg =
          e?.errors?.[0]?.longMessage ??
          e?.errors?.[0]?.message ??
          e?.message ??
          JSON.stringify(e) ??
          s("حدث خطأ غير متوقع", "An unexpected error occurred", lang);
        setError(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 3) {
      // Verify email code
      const su = (clerk as any).client?.signUp;
      if (!su) {
        setError(s("جارٍ تحميل النظام، حاول مرة أخرى", "System loading, please try again", lang));
        return;
      }
      setLoading(true);
      try {
        const result = await su.attemptEmailAddressVerification({ code: verifyCode });
        if (result.status === "complete") {
          // Save full profile payload so dashboard can POST it to /api/users/onboarding
          const payload = { accountType, companyName, companyRegistrationNumber: regNumber, sector, numberOfEmployees: employees, country, website, contactPersonName: contactPerson, phone };
          try {
            localStorage.setItem("hpdc_onboarding_payload", JSON.stringify(payload));
          } catch {}
          // Activate the Clerk session
          await (clerk as any).setActive({ session: result.createdSessionId });
          setLocation("/dashboard");
        } else {
          setError(s("رمز التحقق خاطئ أو منتهي الصلاحية", "Invalid or expired verification code", lang));
        }
      } catch (e: any) {
        const msg =
          e?.errors?.[0]?.longMessage ??
          e?.errors?.[0]?.message ??
          e?.message ??
          JSON.stringify(e) ??
          s("حدث خطأ غير متوقع", "An unexpected error occurred", lang);
        setError(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    setStep(s => s + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(s => Math.max(0, s - 1));
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex" dir={dir}>
      {/* ═══ LEFT side panel ═══ */}
      <div className="hidden lg:flex flex-col w-[360px] flex-shrink-0 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1A4D2E 0%, #0e2e1a 100%)" }}>
        <div className="absolute -top-20 -start-20 w-64 h-64 rounded-full opacity-10" style={{ background: GOLD }} />
        <div className="absolute bottom-0 end-0 w-72 h-72 rounded-full opacity-5" style={{ background: "#fff" }} />

        {/* Logo pinned to top — clickable → home */}
        <a href={`${BASE}/`} className="absolute top-5 right-5 z-20 hover:opacity-80 transition-opacity">
          <img
            src={`${BASE}/hpdc-logo-transparent.png`}
            alt="HPDC"
            className="h-12 object-contain"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </a>

        <div className="relative z-10 flex flex-col h-full p-8 pt-20">
          {/* Hero text */}
          <h2 className="text-2xl font-black text-white leading-tight mb-3">
            {s("سجّل حسابك\nوابدأ رحلتك مع\nالاستدامة", "Register your account\nand start your\nESG journey", lang)}
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "#ffffff80" }}>
            {s(
              "يجب إكمال جميع البيانات المطلوبة لإنشاء الحساب. لا يُقبل التسجيل دون تعبئة الحقول الإلزامية.",
              "All required information must be completed to create an account. Registration is not accepted without filling mandatory fields.",
              lang
            )}
          </p>

          {/* What you'll get */}
          <div className="space-y-4 mb-auto">
            {[
              { icon: ShieldCheck, ar: "تتبع طلبات الاعتماد وحالتها", en: "Track your certification applications" },
              { icon: Award, ar: "استلام الشهادات الرسمية من HPDC", en: "Receive official HPDC certificates" },
              { icon: Globe, ar: "الوصول لسجل المنشآت المعتمدة", en: "Access the certified registry" },
              { icon: Shield, ar: "بيانات مشفرة وآمنة بالكامل", en: "Fully encrypted and secure data" },
            ].map(({ icon: Icon, ar, en }) => (
              <div key={en} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${GOLD}20` }}>
                  <Icon className="w-4 h-4" style={{ color: GOLD }} />
                </div>
                <span className="text-sm" style={{ color: "#ffffffcc" }}>{s(ar, en, lang)}</span>
              </div>
            ))}
          </div>

          {/* Step summary on side panel */}
          <div className="mt-8 pt-6 border-t" style={{ borderColor: "#ffffff15" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
              {s("خطوات التسجيل", "Registration Steps", lang)}
            </p>
            <div className="space-y-2">
              {STEP_LABELS.map((label, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    i < step ? "text-white" : i === step ? "text-white" : "text-gray-500"
                  }`} style={{ background: i <= step ? GOLD : "#ffffff15" }}>
                    {i < step ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className={`text-xs ${i === step ? "text-white font-bold" : i < step ? "line-through" : "text-gray-500"}`} style={{ color: i === step ? "#fff" : undefined }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT main content ═══ */}
      <div className="flex-1 flex flex-col min-h-screen" style={{ background: "#F7FAF8" }}>
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3" style={{ background: "#1A4D2E" }}>
          <a href={`${BASE}/`}>
            <img src={`${BASE}/hpdc-logo-transparent.png`} alt="HPDC" className="h-8 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
          </a>
          <span className="text-white font-bold text-sm flex-1">HPDC ESG</span>
          <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: `${GOLD}25`, color: GOLD }}>
            {s("خطوة", "Step", lang)} {step - 1 + 1}/{STEP_LABELS.length}
          </span>
        </div>

        <div className="flex-1 flex items-start justify-center p-6 pt-10">
          <div className="w-full max-w-lg">

            {/* ── Auth tabs ── */}
            <div className="flex rounded-2xl border border-gray-100 p-1 gap-1 mb-8" style={{ background: "#f0f4f0" }}>
              <Link href="/sign-in" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all text-gray-500 hover:text-gray-800">
                {s("تسجيل الدخول", "Sign In", lang)}
              </Link>
              <div
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all"
                style={{ background: G, color: "#fff", boxShadow: "0 2px 8px #1A4D2E30" }}
              >
                {s("حساب جديد", "New Account", lang)}
              </div>
            </div>

            {/* Step bar */}
            <div className="mb-12">
              <StepBar current={step - 1} total={3} labels={STEP_LABELS} />
            </div>

            {/* ── STEP 1: Profile Data ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl font-black mb-1" style={{ color: G }}>
                    {s("بيانات المنشأة", "Organization Details", lang)}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {s("جميع الحقول المشار إليها بـ * إلزامية", "All fields marked with * are required", lang)}
                  </p>
                </div>

                <div className="space-y-4">
                    {/* Company section */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: G }}>
                        {s("معلومات الشركة", "Company Information", lang)}
                      </p>

                      <div>
                        <FieldLabel required>{s("اسم الشركة / المنشأة", "Company / Organization Name", lang)}</FieldLabel>
                        <TextInput value={companyName} onChange={setCompanyName} required icon={Building2}
                          placeholder={s("شركة...", "Company Ltd...", lang)} />
                      </div>

                      <div>
                        <FieldLabel required>{s("رقم السجل التجاري", "Commercial Registration No.", lang)}</FieldLabel>
                        <TextInput value={regNumber} onChange={setRegNumber} required icon={Hash}
                          placeholder="1010xxxxxxx" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <FieldLabel required>{s("القطاع", "Sector", lang)}</FieldLabel>
                          <SelectInput value={sector} onChange={setSector}
                            options={SECTORS} placeholder={s("اختر", "Select", lang)} />
                        </div>
                        <div>
                          <FieldLabel required>{s("عدد الموظفين", "Employees", lang)}</FieldLabel>
                          <SelectInput value={employees} onChange={setEmployees}
                            options={EMP_RANGES} placeholder={s("اختر", "Select", lang)} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <FieldLabel required>{s("الدولة", "Country", lang)}</FieldLabel>
                          <SelectInput value={country} onChange={setCountry}
                            options={COUNTRIES} placeholder={s("اختر", "Select", lang)} />
                        </div>
                        <div>
                          <FieldLabel>{s("الموقع الإلكتروني", "Website", lang)}</FieldLabel>
                          <TextInput value={website} onChange={setWebsite} icon={Globe}
                            placeholder="https://..." />
                        </div>
                      </div>
                    </div>

                    {/* Contact section */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: G }}>
                        {s("بيانات المسؤول", "Contact Person", lang)}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <FieldLabel required>{s("اسم المسؤول", "Contact Name", lang)}</FieldLabel>
                          <TextInput value={contactPerson} onChange={setContactPerson} required icon={User}
                            placeholder={s("الاسم الكامل", "Full name", lang)} />
                        </div>
                        <div>
                          <FieldLabel required>{s("رقم الجوال", "Phone", lang)}</FieldLabel>
                          <TextInput value={phone} onChange={setPhone} type="tel" required icon={Phone}
                            placeholder="+966 5X XXX" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {/* ── STEP 2: Credentials ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl font-black mb-1" style={{ color: G }}>
                    {s("بيانات الحساب", "Account Credentials", lang)}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {s(
                      "أدخل بريدك الإلكتروني وكلمة مرور قوية لإنشاء حسابك",
                      "Enter your email and a strong password to create your account",
                      lang
                    )}
                  </p>
                </div>

                {/* Summary card */}
                <div className="p-4 rounded-2xl border" style={{ background: `${G}06`, borderColor: `${G}20` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: G }}>
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: G }}>
                        {companyName} {sector ? `— ${sector}` : ""}
                      </p>
                      <p className="text-xs text-gray-400">
                        {s("حساب منشأة / شركة", "Company account", lang)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4" dir="ltr">
                  <div>
                    <FieldLabel required>Email address</FieldLabel>
                    <TextInput value={email} onChange={setEmail} type="email" required icon={Mail}
                      placeholder="email@example.com" />
                  </div>
                  <div>
                    <FieldLabel required>Password (min. 8 characters)</FieldLabel>
                    <TextInput value={password} onChange={setPassword} type="password" required icon={Lock}
                      placeholder="••••••••" />
                    {password.length > 0 && (
                      <div className="mt-2 flex gap-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="flex-1 h-1 rounded-full transition-all"
                            style={{
                              background: password.length >= i * 2
                                ? (password.length >= 8 ? G : GOLD)
                                : "#e5e7eb"
                            }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <FieldLabel required>Confirm password</FieldLabel>
                    <TextInput value={passwordConfirm} onChange={setPasswordConfirm} type="password" required icon={Lock}
                      placeholder="••••••••" />
                    {passwordConfirm.length > 0 && password !== passwordConfirm && (
                      <p className="text-xs text-red-500 mt-1">
                        {s("كلمتا المرور غير متطابقتين", "Passwords do not match", lang)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Email Verification ── */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: `${G}12` }}>
                    <Mail className="w-8 h-8" style={{ color: G }} />
                  </div>
                  <h1 className="text-2xl font-black mb-2" style={{ color: G }}>
                    {s("تحقق من بريدك الإلكتروني", "Verify Your Email", lang)}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {s(
                      `أرسلنا رمز التحقق إلى ${email}`,
                      `We sent a verification code to ${email}`,
                      lang
                    )}
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6" dir="ltr">
                  <label className="block text-xs font-bold text-gray-700 mb-2">Verification Code (6 digits)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={verifyCode}
                    onChange={e => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full text-center text-2xl font-mono tracking-widest py-4 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: verifyCode.length === 6 ? G : "#e5e7eb", "--tw-ring-color": `${G}50` } as any}
                    placeholder="000000"
                  />
                </div>

                <button type="button"
                  onClick={async () => {
                    try {
                      const su = (clerk as any).client?.signUp;
                      if (su) await su.prepareEmailAddressVerification({ strategy: "email_code" });
                      setError(s("تم إعادة إرسال الرمز ✓", "Code resent ✓", lang));
                    } catch {}
                  }}
                  className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-2">
                  {s("لم تستلم الرمز؟ أعد الإرسال", "Didn't receive the code? Resend", lang)}
                </button>
              </div>
            )}

            {/* ── Error ── */}
            {error && <div className="mt-4"><ErrorBox msg={error} /></div>}

            {/* ── Navigation ── */}
            <div className="mt-6 flex gap-3">
              {step > 0 && (
                <button type="button" onClick={handleBack}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                  {lang === "ar" ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  {s("السابق", "Back", lang)}
                </button>
              )}
              <button type="button" onClick={handleNext} disabled={loading}
                className="flex-1 py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: G }}>
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : step === 3
                    ? <>{s("إنشاء الحساب", "Create Account", lang)}<CheckCircle2 className="w-4 h-4" /></>
                    : step === 2
                      ? <>{s("إرسال رمز التحقق", "Send Verification Code", lang)}{lang === "ar" ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}</>
                      : <>{s("التالي", "Next", lang)}{lang === "ar" ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}</>}
              </button>
            </div>

            {/* Sign in link */}
            {step === 0 && (
              <p className="text-center text-xs text-gray-400 mt-5">
                {s("لديك حساب بالفعل؟ ", "Already have an account? ", lang)}
                <Link href="/sign-in" className="font-semibold hover:underline" style={{ color: G }}>
                  {s("تسجيل الدخول", "Sign In", lang)}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
