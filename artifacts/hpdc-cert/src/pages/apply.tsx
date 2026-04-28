import { useState } from "react";
import { useUser } from "@clerk/react";
import { useLocation, Link } from "wouter";
import {
  Building2, MapPin, FileText, ChevronLeft, ChevronRight,
  Leaf, CheckCircle2, AlertCircle, Globe, ClipboardList,
  Target, Calendar, Info, ArrowLeft, ArrowRight
} from "lucide-react";
import { Layout } from "@/components/layout";
import { useLanguage } from "@/contexts/language-context";
import { useGetMe, getGetMeQueryKey, useCreateApplication } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const G = "#1A4D2E";
const GOLD = "#C9A84C";
const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

type Lang = "ar" | "en";
const s = (ar: string, en: string, lang: Lang) => lang === "ar" ? ar : en;

const SITE_COUNTS = [
  { ar: "موقع واحد", en: "1 site" },
  { ar: "2 – 5 مواقع", en: "2 – 5 sites" },
  { ar: "6 – 10 مواقع", en: "6 – 10 sites" },
  { ar: "أكثر من 10", en: "More than 10" },
];

const ESG_GOALS_LIST = [
  { ar: "تخفيض البصمة الكربونية", en: "Reduce carbon footprint" },
  { ar: "تحسين ظروف العمل", en: "Improve working conditions" },
  { ar: "تعزيز الحوكمة المؤسسية", en: "Strengthen corporate governance" },
  { ar: "الامتثال للوائح والقوانين", en: "Regulatory compliance" },
  { ar: "تحسين الصورة الذهنية للشركة", en: "Improve company reputation" },
  { ar: "جذب المستثمرين المستدامين", en: "Attract ESG investors" },
  { ar: "تطوير سلسلة الإمداد المستدامة", en: "Develop sustainable supply chain" },
  { ar: "تحقيق أهداف رؤية 2030", en: "Achieve Vision 2030 goals" },
  { ar: "الحصول على العلامة الذهبية", en: "Achieve the Gold Badge" },
];

const CERT_MONTHS = [
  { ar: "يناير", en: "January" },
  { ar: "فبراير", en: "February" },
  { ar: "مارس", en: "March" },
  { ar: "أبريل", en: "April" },
  { ar: "مايو", en: "May" },
  { ar: "يونيو", en: "June" },
  { ar: "يوليو", en: "July" },
  { ar: "أغسطس", en: "August" },
  { ar: "سبتمبر", en: "September" },
  { ar: "أكتوبر", en: "October" },
  { ar: "نوفمبر", en: "November" },
  { ar: "ديسمبر", en: "December" },
];

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${G}15` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: G }} />
      </div>
      <span className="text-sm font-bold" style={{ color: G }}>{title}</span>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs font-semibold text-gray-700 block mb-1.5">
      {children}{required && <span className="text-red-500 ms-0.5">*</span>}
    </label>
  );
}

function StyledInput({ value, onChange, placeholder, type = "text", required }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} required={required}
      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 transition-all"
      style={{ "--tw-ring-color": `${G}60` } as any}
    />
  );
}

function StyledSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: { ar: string; en: string }[]; placeholder: string;
}) {
  const { lang } = useLanguage();
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 transition-all appearance-none"
      style={{ "--tw-ring-color": `${G}60` } as any}
    >
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o.en} value={o.en}>{lang === "ar" ? o.ar : o.en}</option>
      ))}
    </select>
  );
}

function StyledTextarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 transition-all resize-none"
      style={{ "--tw-ring-color": `${G}60` } as any}
    />
  );
}

export default function ApplyPage() {
  const { lang, isAr, dir } = useLanguage();
  const { user, isLoaded } = useUser();
  const [, setLocation] = useLocation();
  const createApp = useCreateApplication();

  const { data: me, isLoading: meLoading } = useGetMe({
    query: { queryKey: getGetMeQueryKey(), enabled: isLoaded && !!user }
  });

  // Application-specific fields (complementary to profile)
  const [siteName, setSiteName] = useState("");
  const [siteLocation, setSiteLocation] = useState("");
  const [siteCount, setSiteCount] = useState("");
  const [certScope, setCertScope] = useState("");
  const [hasPrevCert, setHasPrevCert] = useState<"yes" | "no" | "">("");
  const [prevCertDetails, setPrevCertDetails] = useState("");
  const [currentPractices, setCurrentPractices] = useState("");
  const [esgGoals, setEsgGoals] = useState<string[]>([]);
  const [preferredMonth, setPreferredMonth] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const toggleGoal = (goal: string) => {
    setEsgGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!siteName || !siteLocation || !certScope || !hasPrevCert) {
      setError(s("يرجى تعبئة الحقول المطلوبة *", "Please fill all required fields *", lang));
      return;
    }

    const goalsText = esgGoals.join(", ");
    const notesComposed = [
      certScope && `${s("نطاق الاعتماد", "Certification Scope", lang)}: ${certScope}`,
      siteCount && `${s("عدد المواقع", "Number of Sites", lang)}: ${siteCount}`,
      hasPrevCert && `${s("شهادات سابقة", "Previous Certifications", lang)}: ${hasPrevCert === "yes" ? s("نعم", "Yes", lang) : s("لا", "No", lang)}${prevCertDetails ? ` — ${prevCertDetails}` : ""}`,
      currentPractices && `${s("الممارسات الحالية", "Current Practices", lang)}: ${currentPractices}`,
      goalsText && `${s("الأهداف", "Goals", lang)}: ${goalsText}`,
      preferredMonth && `${s("الشهر المفضل للتقييم", "Preferred Assessment Month", lang)}: ${preferredMonth}`,
      additionalNotes && `${s("ملاحظات", "Notes", lang)}: ${additionalNotes}`,
    ].filter(Boolean).join("\n");

    try {
      await createApp.mutateAsync({
        data: {
          companyName: me?.companyName ?? me?.contactPersonName ?? user?.fullName ?? "",
          contactName: me?.contactPersonName ?? user?.fullName ?? "",
          email: me?.email ?? user?.primaryEmailAddress?.emailAddress ?? "",
          phone: me?.phone ?? "",
          sector: me?.sector ?? "",
          siteName,
          siteLocation,
          notes: notesComposed,
        }
      });
      setSubmitted(true);
    } catch {
      setError(s("حدث خطأ أثناء الإرسال. حاول مرة أخرى.", "An error occurred. Please try again.", lang));
    }
  };

  if (!isLoaded || meLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: `${G}40`, borderTopColor: G }} />
        </div>
      </Layout>
    );
  }

  if (!user) {
    setLocation("/sign-in");
    return null;
  }

  // Block apply if profile not completed
  if (me && !me.onboardingCompleted) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#F7FAF8" }} dir={dir}>
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ background: `${GOLD}15` }}>
              <AlertCircle className="w-10 h-10" style={{ color: GOLD }} />
            </div>
            <div>
              <h2 className="text-2xl font-black mb-2" style={{ color: G }}>
                {s("أكمل بياناتك أولاً", "Complete Your Profile First", lang)}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                {s(
                  "يجب إكمال بيانات ملفك الشخصي قبل تقديم طلب الاعتماد. بياناتك ستُستخدم تلقائياً في طلب الاعتماد.",
                  "You must complete your profile before submitting a certification application. Your profile data will be used automatically in the application.",
                  lang
                )}
              </p>
            </div>
            <Link href="/profile-setup">
              <button className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                style={{ background: G }}>
                {s("إكمال البيانات الآن", "Complete Profile Now", lang)}
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
                {s("العودة للوحة التحكم", "Back to Dashboard", lang)}
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // ── Success state ──
  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#F7FAF8" }} dir={dir}>
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ background: `${G}12` }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: G }} />
            </div>
            <div>
              <h2 className="text-2xl font-black mb-2" style={{ color: G }}>
                {s("تم إرسال طلبك بنجاح!", "Application Submitted Successfully!", lang)}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                {s(
                  "سيقوم فريق HPDC بمراجعة طلبك والتواصل معك خلال 3 أيام عمل. يمكنك متابعة حالة طلبك من لوحة التحكم.",
                  "The HPDC team will review your application and contact you within 3 business days. You can track your application status from the dashboard.",
                  lang
                )}
              </p>
            </div>
            <div className="p-4 rounded-2xl text-sm" style={{ background: `${G}08`, color: G }}>
              <p className="font-semibold mb-1">{s("ما الخطوة التالية؟", "What's next?", lang)}</p>
              <ul className="text-xs space-y-1 text-start" style={{ paddingInlineStart: "1rem", listStyleType: "disc" }}>
                <li>{s("مراجعة الطلب من قِبل لجنة HPDC", "Application review by the HPDC committee", lang)}</li>
                <li>{s("جدولة موعد التقييم الميداني", "Scheduling the field assessment", lang)}</li>
                <li>{s("إصدار الشهادة بعد اجتياز التقييم", "Certificate issuance after assessment", lang)}</li>
              </ul>
            </div>
            <Link href="/dashboard">
              <button className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                style={{ background: G }}>
                {s("متابعة الطلب من لوحة التحكم", "Track Application in Dashboard", lang)}
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const isCompany = (me?.accountType ?? "company") === "company";

  return (
    <Layout>
      <div className="min-h-screen py-10 px-4" style={{ background: "#F7FAF8" }} dir={dir}>
        <div className="max-w-3xl mx-auto">

          {/* ── Back link ── */}
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
              {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              {s("العودة للوحة التحكم", "Back to Dashboard", lang)}
            </button>
          </Link>

          {/* ── Header ── */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: G }}>
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black" style={{ color: G }}>
                  {s("طلب اعتماد ESG", "ESG Certification Application", lang)}
                </h1>
                <p className="text-xs text-gray-500">
                  {s("شركة تطوير منتجات الحلال (HPDC)", "Halal Products Development Company (HPDC)", lang)}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              {s(
                "أكمل بيانات طلبك أدناه. سيتم دمجها مع معلومات ملفك الشخصي المسجّلة مسبقاً لبدء إجراءات الاعتماد.",
                "Complete your application details below. They will be combined with your registered profile information to begin the certification process.",
                lang
              )}
            </p>
          </div>

          {/* ── Pre-filled profile summary ── */}
          <div className="mb-6 p-4 rounded-2xl border" style={{ background: `${G}06`, borderColor: `${G}20` }}>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4" style={{ color: G }} />
              <span className="text-xs font-bold" style={{ color: G }}>
                {s("بيانات الملف الشخصي (محفوظة مسبقاً)", "Profile Data (Already Saved)", lang)}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { label_ar: "المنشأة", label_en: "Organization", val: me?.companyName ?? me?.contactPersonName ?? "—" },
                { label_ar: "القطاع", label_en: "Sector", val: me?.sector ?? "—" },
                { label_ar: "الجوال", label_en: "Phone", val: me?.phone ?? "—" },
              ].map(row => (
                <div key={row.label_en} className="bg-white rounded-xl px-3 py-2 border border-gray-100">
                  <p className="text-gray-400 mb-0.5">{isAr ? row.label_ar : row.label_en}</p>
                  <p className="font-semibold text-gray-800 truncate">{row.val}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {s(
                "لتعديل هذه البيانات، توجّه إلى صفحة الملف الشخصي.",
                "To update this information, go to your profile page.",
                lang
              )}
            </p>
          </div>

          {/* ── Main form ── */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Section 1: Site / Facility */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionHeader icon={MapPin} title={s("بيانات الموقع / المنشأة", "Site / Facility Details", lang)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>{s("اسم الموقع أو المنشأة", "Site / Facility Name", lang)}</FieldLabel>
                  <StyledInput value={siteName} onChange={setSiteName} required
                    placeholder={s("المقر الرئيسي / مصنع...", "Head Office / Factory...", lang)} />
                </div>
                <div>
                  <FieldLabel required>{s("موقع المنشأة", "Site Location", lang)}</FieldLabel>
                  <StyledInput value={siteLocation} onChange={setSiteLocation} required
                    placeholder={s("الرياض، المملكة العربية السعودية", "Riyadh, Saudi Arabia", lang)} />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>{s("عدد المواقع المطلوب اعتمادها", "Number of Sites for Certification", lang)}</FieldLabel>
                  <StyledSelect value={siteCount} onChange={setSiteCount}
                    options={SITE_COUNTS}
                    placeholder={s("اختر عدد المواقع", "Select number of sites", lang)} />
                </div>
              </div>
            </div>

            {/* Section 2: Certification Scope */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionHeader icon={ClipboardList} title={s("نطاق الاعتماد", "Certification Scope", lang)} />
              <div className="space-y-4">
                <div>
                  <FieldLabel required>
                    {s("وصف نطاق الاعتماد المطلوب", "Description of Requested Certification Scope", lang)}
                  </FieldLabel>
                  <StyledTextarea value={certScope} onChange={setCertScope} rows={4}
                    placeholder={s(
                      "اشرح بإيجاز الأنشطة والعمليات التي تودّ اعتمادها ضمن شهادة ESG (مثال: إدارة النفايات، سياسات الموارد البشرية، حوكمة مجلس الإدارة...)",
                      "Briefly describe the activities and operations you wish to certify under ESG (e.g., waste management, HR policies, board governance...)",
                      lang
                    )} />
                </div>

                {/* Previous Certifications */}
                <div>
                  <FieldLabel required>{s("هل حصلت المنشأة على شهادة ESG سابقة؟", "Has the organization previously obtained an ESG certificate?", lang)}</FieldLabel>
                  <div className="flex gap-3 mt-2">
                    {(["yes", "no"] as const).map(v => (
                      <button key={v} type="button"
                        onClick={() => setHasPrevCert(v)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all"
                        style={{
                          borderColor: hasPrevCert === v ? G : "#e5e7eb",
                          background: hasPrevCert === v ? `${G}12` : "#fff",
                          color: hasPrevCert === v ? G : "#6b7280",
                        }}>
                        {v === "yes" ? s("نعم", "Yes", lang) : s("لا", "No", lang)}
                      </button>
                    ))}
                  </div>
                  {hasPrevCert === "yes" && (
                    <div className="mt-3">
                      <FieldLabel>{s("اذكر تفاصيل الشهادة السابقة", "Provide details of previous certification", lang)}</FieldLabel>
                      <StyledInput value={prevCertDetails} onChange={setPrevCertDetails}
                        placeholder={s("الجهة المانحة / تاريخ الإصدار / النطاق", "Issuing body / Issue date / Scope", lang)} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Current Practices */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionHeader icon={FileText} title={s("الممارسات والمبادرات الحالية", "Current Practices & Initiatives", lang)} />
              <div>
                <FieldLabel>{s("صف الممارسات الاستدامية الحالية في منشأتك (إن وجدت)", "Describe your organization's current sustainability practices (if any)", lang)}</FieldLabel>
                <StyledTextarea value={currentPractices} onChange={setCurrentPractices} rows={4}
                  placeholder={s(
                    "مثال: برنامج إعادة التدوير، مبادرات توفير الطاقة، سياسة التنوع والشمول...",
                    "E.g., recycling program, energy saving initiatives, diversity & inclusion policy...",
                    lang
                  )} />
              </div>
            </div>

            {/* Section 4: ESG Goals */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionHeader icon={Target} title={s("أهداف الاعتماد ESG", "ESG Certification Goals", lang)} />
              <p className="text-xs text-gray-500 mb-4">
                {s("اختر الأهداف الرئيسية التي تسعى إلى تحقيقها من خلال الاعتماد (يمكن اختيار أكثر من هدف)", "Select the main goals you aim to achieve through certification (multiple selection allowed)", lang)}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ESG_GOALS_LIST.map(goal => {
                  const label = isAr ? goal.ar : goal.en;
                  const selected = esgGoals.includes(label);
                  return (
                    <button key={goal.en} type="button"
                      onClick={() => toggleGoal(label)}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 text-start text-xs font-medium transition-all"
                      style={{
                        borderColor: selected ? G : "#e5e7eb",
                        background: selected ? `${G}10` : "#fff",
                        color: selected ? G : "#374151",
                      }}>
                      <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all"
                        style={{ borderColor: selected ? G : "#d1d5db", background: selected ? G : "transparent" }}>
                        {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 5: Preferred Timing */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionHeader icon={Calendar} title={s("التوقيت المفضل للتقييم", "Preferred Assessment Timing", lang)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>{s("الشهر المفضل لإجراء التقييم الميداني", "Preferred Month for Field Assessment", lang)}</FieldLabel>
                  <StyledSelect value={preferredMonth} onChange={setPreferredMonth}
                    options={CERT_MONTHS}
                    placeholder={s("اختر الشهر (اختياري)", "Select month (optional)", lang)} />
                </div>
                <div>
                  <FieldLabel>{s("ملاحظات إضافية (اختياري)", "Additional Notes (optional)", lang)}</FieldLabel>
                  <StyledInput value={additionalNotes} onChange={setAdditionalNotes}
                    placeholder={s("أي معلومات إضافية ترغب في مشاركتها", "Any additional information you'd like to share", lang)} />
                </div>
              </div>
            </div>

            {/* Terms note */}
            <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: `${GOLD}10`, borderColor: `${GOLD}30` }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: GOLD }} />
              <p className="text-xs text-gray-600 leading-relaxed">
                {s(
                  "بتقديم هذا الطلب، أقرّ بصحة المعلومات المدخلة وأوافق على إجراءات تقييم HPDC وفق سياسة الاعتماد المعتمدة.",
                  "By submitting this application, I confirm the accuracy of the provided information and agree to HPDC's assessment procedures in accordance with the approved certification policy.",
                  lang
                )}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={createApp.isPending}
              className="w-full py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60"
              style={{ background: G }}
            >
              {createApp.isPending
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{s("جاري الإرسال...", "Submitting...", lang)}</>
                : <>{s("إرسال طلب الاعتماد", "Submit Certification Application", lang)}{isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}</>}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
