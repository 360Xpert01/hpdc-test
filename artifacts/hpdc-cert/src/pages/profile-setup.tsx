import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/react";
import { useLocation } from "wouter";
import {
  Building2, User, Leaf, CheckCircle2, ChevronLeft, ChevronRight
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const G = "#1A4D2E";
const GOLD = "#C9A84C";
const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

type Lang = "ar" | "en";
const s = (ar: string, en: string, lang: Lang) => lang === "ar" ? ar : en;

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
  { ar: "الإمارات",                 en: "UAE" },
  { ar: "الكويت",                   en: "Kuwait" },
  { ar: "قطر",                      en: "Qatar" },
  { ar: "البحرين",                  en: "Bahrain" },
  { ar: "عُمان",                    en: "Oman" },
  { ar: "مصر",                      en: "Egypt" },
  { ar: "الأردن",                   en: "Jordan" },
  { ar: "أخرى",                     en: "Other" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", required }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white transition-all"
      style={{ "--tw-ring-color": G } as any}
    />
  );
}

function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: { ar: string; en: string }[]; placeholder: string;
}) {
  const { lang } = useLanguage();
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all appearance-none"
      style={{ "--tw-ring-color": G } as any}
    >
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o.en} value={o.en}>{lang === "ar" ? o.ar : o.en}</option>
      ))}
    </select>
  );
}

export default function ProfileSetupPage() {
  const { lang } = useLanguage();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const { user, isLoaded } = useUser();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  const { data: me, isLoading: meLoading } = useGetMe({
    query: { queryKey: getGetMeQueryKey(), enabled: isLoaded && !!user }
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [sector, setSector] = useState("");
  const [employees, setEmployees] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");

  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && me) {
      initialized.current = true;
      setCompanyName(me.companyName ?? "");
      setPhone(me.phone ?? "");
      setSector(me.sector ?? "");
      setCountry(me.country ?? "");
      setWebsite(me.website ?? "");
      setContactPerson(me.contactPersonName ?? "");
      setRegNumber(me.companyRegistrationNumber ?? "");
      setEmployees(me.numberOfEmployees ?? "");
    }
  }, [me]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      accountType: "company",
      companyName,
      companyRegistrationNumber: regNumber,
      sector,
      numberOfEmployees: employees,
      country,
      website,
      contactPersonName: contactPerson,
      phone,
    };

    try {
      const res = await fetch(`${BASE}/api/users/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("فشل الحفظ");
      qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
      setLocation("/dashboard");
    } catch {
      setError(s("حدث خطأ أثناء الحفظ. حاول مرة أخرى.", "An error occurred. Please try again.", lang));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded || meLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7FAF8" }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: `${G}40`, borderTopColor: G }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F7FAF8" }} dir={dir}>
      {/* ── Top bar ── */}
      <div className="px-6 py-3 flex items-center gap-3" style={{ background: G }}>
        <a href={`${BASE}/`}>
          <img src={`${BASE}/hpdc-logo-transparent.png`} alt="HPDC" className="h-9 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
        </a>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${GOLD}25`, color: GOLD }}>ESG Platform</span>
        <div className="flex-1" />
        <span className="text-xs px-3 py-1 rounded-full font-bold border" style={{ borderColor: `${GOLD}60`, color: GOLD, background: `${GOLD}15` }}>
          {s("منشأة / شركة", "Company", lang)}
        </span>
        <a href={`${BASE}/dashboard`} className="text-xs text-white/60 hover:text-white transition-colors">
          {s("تخطي للآن", "Skip for now", lang)}
        </a>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* ── Page header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-4"
            style={{ background: `${G}10`, color: G }}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {s("خطوة 1 من 1", "Step 1 of 1", lang)}
          </div>
          <h1 className="text-2xl font-black mb-2" style={{ color: G }}>
            {s("أكمل بيانات حسابك", "Complete Your Profile", lang)}
          </h1>
          <p className="text-sm text-gray-500">
            {s(
              "هذه البيانات ستُستخدم لتسريع عملية تقديم طلب الاعتماد لاحقاً",
              "This information will be used to speed up your certification application later",
              lang
            )}
          </p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-gray-100">
              <Building2 className="w-4 h-4" style={{ color: G }} />
              <span className="text-sm font-bold" style={{ color: G }}>
                {s("بيانات المنشأة", "Organization Details", lang)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label={s("اسم الشركة / المنشأة *", "Company / Organization Name *", lang)}>
                  <Input value={companyName} onChange={setCompanyName} required
                    placeholder={s("شركة تطوير المنتجات المستدامة", "Sustainable Products Company Ltd.", lang)} />
                </Field>
              </div>

              <Field label={s("رقم السجل التجاري *", "Commercial Registration No. *", lang)}>
                <Input value={regNumber} onChange={setRegNumber} required
                  placeholder={s("1010xxxxxxx", "1010xxxxxxx", lang)} />
              </Field>

              <Field label={s("القطاع *", "Sector *", lang)}>
                <Select value={sector} onChange={setSector}
                  options={SECTORS}
                  placeholder={s("اختر القطاع", "Select sector", lang)} />
              </Field>

              <Field label={s("عدد الموظفين *", "Number of Employees *", lang)}>
                <Select value={employees} onChange={setEmployees}
                  options={EMP_RANGES}
                  placeholder={s("اختر النطاق", "Select range", lang)} />
              </Field>

              <Field label={s("الدولة *", "Country *", lang)}>
                <Select value={country} onChange={setCountry}
                  options={COUNTRIES}
                  placeholder={s("اختر الدولة", "Select country", lang)} />
              </Field>

              <Field label={s("الموقع الإلكتروني (اختياري)", "Website (optional)", lang)}>
                <Input value={website} onChange={setWebsite} type="url"
                  placeholder="https://www.company.com" />
              </Field>

              <div className="sm:col-span-2 pt-2 pb-1 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4" style={{ color: G }} />
                  <span className="text-sm font-bold" style={{ color: G }}>
                    {s("بيانات المسؤول", "Contact Person Details", lang)}
                  </span>
                </div>
              </div>

              <Field label={s("اسم المسؤول / جهة الاتصال *", "Contact Person Name *", lang)}>
                <Input value={contactPerson} onChange={setContactPerson} required
                  placeholder={s("الاسم الكامل", "Full name", lang)} />
              </Field>

              <Field label={s("رقم الجوال *", "Phone Number *", lang)}>
                <Input value={phone} onChange={setPhone} type="tel" required
                  placeholder="+966 5X XXX XXXX" />
              </Field>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: G }}
            >
              {submitting
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <>
                    {s("حفظ والانتقال للوحة التحكم", "Save & Go to Dashboard", lang)}
                    {lang === "ar" ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </>}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            {s(
              "يمكنك تعديل هذه البيانات لاحقاً من صفحة الملف الشخصي",
              "You can update this information later from your profile settings",
              lang
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
