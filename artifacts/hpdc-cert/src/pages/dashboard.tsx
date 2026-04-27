import { useEffect, useRef } from "react";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useUser } from "@clerk/react";
import { format } from "date-fns";
import {
  ShieldCheck, XCircle, FileText, User as UserIcon,
  Building, Plus, CheckCircle2, Clock, ClipboardList,
  Search, Award, ChevronRight, Send, Globe, BookOpen,
  ArrowRight, ArrowLeft, Eye, Star, Leaf
} from "lucide-react";
import {
  useSyncUser, useGetMe, useGetMyCertificates, useGetMyApplications,
  getGetMeQueryKey, getGetMyCertificatesQueryKey,
  getGetMyApplicationsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/language-context";
import { t } from "@/lib/translations";

const G = "#1A4D2E";
const GOLD = "#C9A84C";
const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

// ─── Stage Config ───────────────────────────────────────────────────────────
const STAGES = [
  { key: "submitted", ar: "التقديم", en: "Submitted", icon: Send },
  { key: "under_review", ar: "قيد المراجعة", en: "Under Review", icon: ClipboardList },
  { key: "assessment_scheduled", ar: "جدولة التقييم", en: "Assessment Scheduled", icon: Clock },
  { key: "assessment_done", ar: "التقييم الميداني", en: "Assessment Done", icon: Search },
  { key: "approved", ar: "الاعتماد", en: "Approved", icon: CheckCircle2 },
  { key: "certificate_issued", ar: "إصدار الشهادة", en: "Certificate Issued", icon: Award },
];

const STAGE_IDX: Record<string, number> = Object.fromEntries(STAGES.map((s, i) => [s.key, i]));

// ─── Helpers ────────────────────────────────────────────────────────────────
function stageBadge(stage: string, isAr: boolean) {
  const cfg: Record<string, { label_ar: string; label_en: string; color: string }> = {
    submitted: { label_ar: "مُقدَّم", label_en: "Submitted", color: "bg-blue-100 text-blue-700" },
    under_review: { label_ar: "قيد المراجعة", label_en: "Under Review", color: "bg-yellow-100 text-yellow-700" },
    assessment_scheduled: { label_ar: "التقييم مجدوَل", label_en: "Assessment Scheduled", color: "bg-purple-100 text-purple-700" },
    assessment_done: { label_ar: "التقييم مكتمل", label_en: "Assessment Done", color: "bg-indigo-100 text-indigo-700" },
    approved: { label_ar: "معتمَد", label_en: "Approved", color: "bg-green-100 text-green-700" },
    certificate_issued: { label_ar: "الشهادة صادرة", label_en: "Certificate Issued", color: "bg-emerald-100 text-emerald-800 font-bold" },
    rejected: { label_ar: "مرفوض", label_en: "Rejected", color: "bg-red-100 text-red-700" },
  };
  const c = cfg[stage] ?? { label_ar: stage, label_en: stage, color: "bg-gray-100 text-gray-700" };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${c.color}`}>{isAr ? c.label_ar : c.label_en}</span>;
}

function certStatusBadge(status: string) {
  switch (status) {
    case "valid": return <Badge className="bg-[#1A4D2E] hover:bg-[#1A4D2E]">سارية / Valid</Badge>;
    case "expired": return <Badge variant="destructive">منتهية / Expired</Badge>;
    case "suspended": return <Badge className="bg-[#C9A84C] hover:bg-[#C9A84C] text-white">موقوفة / Suspended</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

// ─── Stage Progress Tracker ──────────────────────────────────────────────────
function StageTracker({ stage, isAr }: { stage: string; isAr: boolean }) {
  const currentIdx = STAGE_IDX[stage] ?? -1;
  const isRejected = stage === "rejected";

  if (isRejected) {
    return (
      <div className="p-6 rounded-2xl border-2 border-red-200 bg-red-50 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-lg font-bold text-red-700">{isAr ? "الطلب مرفوض" : "Application Rejected"}</p>
        <p className="text-sm text-red-500 mt-1">{isAr ? "يرجى التواصل مع HPDC لمزيد من التوضيح" : "Please contact HPDC for further clarification"}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-start justify-between gap-1">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={s.key} className="flex-1 flex flex-col items-center gap-2 relative">
              {i < STAGES.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-0.5 transition-all duration-500 ${done ? "bg-[#1A4D2E]" : "bg-gray-200"}`}
                  style={{ left: "50%", width: "100%" }}
                />
              )}
              <div
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${done ? "bg-[#1A4D2E] border-[#1A4D2E] text-white"
                  : active ? "bg-white border-[#1A4D2E] text-[#1A4D2E] shadow-lg ring-4 ring-[#1A4D2E]/10"
                    : "bg-white border-gray-200 text-gray-300"
                  }`}
              >
                {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-[10px] md:text-xs font-medium text-center leading-tight px-1 ${active ? "text-[#1A4D2E] font-bold" : done ? "text-[#1A4D2E]" : "text-gray-400"
                }`}>
                {isAr ? s.ar : s.en}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Company Dashboard ────────────────────────────────────────────────────────
function CompanyDashboard({ me, user, applications, certificates, appsLoading, certsLoading, isAr }: any) {
  const latestApp = Array.isArray(applications) ? applications[0] : undefined;
  const { lang } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: G }}>
            {isAr ? "بوابة المنشآت" : "Company Portal"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAr ? "تابع طلبات الاعتماد وشهاداتك" : "Track your certification applications and certificates"}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${G}10` }}>
            <Building className="w-5 h-5" style={{ color: G }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: G }}>{me?.companyName || user?.fullName}</p>
            <p className="text-xs text-gray-400">{me?.email}</p>
          </div>
          {me?.accountType && (
            <span className="text-[10px] font-bold border rounded-full px-2 py-0.5 uppercase" style={{ borderColor: GOLD, color: GOLD }}>
              {isAr ? "شركة" : "Company"}
            </span>
          )}
        </div>
      </div>

      {/* Profile incomplete warning */}
      {!me?.onboardingCompleted && (
        <Link href="/profile-setup">
          <div className="p-4 rounded-2xl border-2 cursor-pointer hover:opacity-90 transition-opacity"
            style={{ borderColor: GOLD, background: `${GOLD}08` }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: GOLD }}>
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: "#92700a" }}>
                  {isAr ? "أكمل بيانات حسابك" : "Complete Your Profile"}
                </p>
                <p className="text-xs text-gray-500">
                  {isAr ? "أضف بيانات شركتك لتسريع طلب الاعتماد" : "Add your company details to speed up the certification process"}
                </p>
              </div>
              {isAr ? <ArrowLeft className="w-4 h-4" style={{ color: GOLD }} /> : <ArrowRight className="w-4 h-4" style={{ color: GOLD }} />}
            </div>
          </div>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label_ar: "إجمالي الطلبات", label_en: "Total Applications", val: Array.isArray(applications) ? applications.length : 0, icon: ClipboardList, color: "text-blue-600 bg-blue-50" },
          { label_ar: "الطلبات الجارية", label_en: "Active", val: Array.isArray(applications) ? applications.filter((a: any) => !["certificate_issued", "rejected"].includes(a.stage)).length : 0, icon: Clock, color: "text-yellow-600 bg-yellow-50" },
          { label_ar: "الشهادات الصادرة", label_en: "Certificates", val: Array.isArray(certificates) ? certificates.length : 0, icon: Award, color: `text-[${G}] bg-green-50` },
          { label_ar: "الشهادات السارية", label_en: "Valid", val: Array.isArray(certificates) ? certificates.filter((c: any) => c.status === "valid").length : 0, icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50" },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${item.color}`}>
              <item.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{item.val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{isAr ? item.label_ar : item.label_en}</p>
          </div>
        ))}
      </div>

      {/* Certification Progress */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" style={{ color: G }} />
            <h2 className="text-lg font-bold" style={{ color: G }}>
              {isAr ? "مسار الاعتماد" : "Certification Progress"}
            </h2>
          </div>
          {me?.onboardingCompleted ? (
            <Link href="/apply">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
                style={{ background: G }}>
                <Plus className="w-4 h-4" />
                {isAr ? "تقديم طلب اعتماد" : "Apply for Certification"}
              </button>
            </Link>
          ) : (
            <Link href="/profile-setup">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all border-2"
                style={{ borderColor: GOLD, color: GOLD, background: `${GOLD}10` }}>
                {isAr ? "أكمل ملفك أولاً" : "Complete Profile First"}
              </button>
            </Link>
          )}
        </div>

        <div className="p-6">
          {appsLoading ? (
            <div className="text-center py-8 text-gray-400">{isAr ? "جارٍ التحميل..." : "Loading..."}</div>
          ) : !latestApp ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">{isAr ? "لا يوجد طلب اعتماد بعد" : "No certification application yet"}</p>
              <p className="text-sm text-gray-400">
                {isAr ? "قدّم طلبك الآن لبدء رحلة الاعتماد ESG" : "Submit your application to begin the ESG certification journey"}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <StageTracker stage={latestApp.stage} isAr={isAr} />
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {isAr ? "تفاصيل الطلب" : "Application Details"}
                    </p>
                    {stageBadge(latestApp.stage, isAr)}
                  </div>
                  <div className="space-y-2">
                    {[
                      { label_ar: "رقم الطلب", label_en: "Application No.", val: latestApp.applicationNumber },
                      { label_ar: "الشركة", label_en: "Company", val: latestApp.companyName },
                      { label_ar: "المسؤول", label_en: "Contact", val: latestApp.contactName },
                      { label_ar: "الموقع", label_en: "Site", val: `${latestApp.siteName} — ${latestApp.siteLocation}` },
                      { label_ar: "القطاع", label_en: "Sector", val: latestApp.sector },
                    ].map(row => (
                      <div key={row.label_en} className="flex justify-between gap-2 text-sm">
                        <span className="text-gray-500 shrink-0">{isAr ? row.label_ar : row.label_en}</span>
                        <span className="font-medium text-gray-800 text-end">{row.val}</span>
                      </div>
                    ))}
                    {latestApp.createdAt && (
                      <div className="flex justify-between gap-2 text-sm">
                        <span className="text-gray-500">{isAr ? "تاريخ التقديم" : "Submitted On"}</span>
                        <span className="font-medium text-gray-800">{format(new Date(latestApp.createdAt), "dd MMM yyyy")}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl p-5 space-y-3 border" style={{ background: `${G}04`, borderColor: `${G}10` }}>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: G }}>
                    {isAr ? "الخطوة الحالية" : "Current Step"}
                  </p>
                  {(() => {
                    const current = STAGES[STAGE_IDX[latestApp.stage] ?? 0];
                    const Icon = current?.icon ?? ClipboardList;
                    const msgs: Record<string, { ar: string; en: string }> = {
                      submitted: { ar: "تم استلام طلبك بنجاح. سيقوم فريق HPDC بمراجعته خلال 3 أيام عمل.", en: "Your application has been received. The HPDC team will review it within 3 business days." },
                      under_review: { ar: "فريقنا يراجع طلبك حالياً. سنتواصل معك قريباً.", en: "Our team is currently reviewing your application. We will contact you soon." },
                      assessment_scheduled: { ar: "تم جدولة زيارة التقييم الميداني. ترقّب التواصل من فريقنا.", en: "The on-site assessment visit has been scheduled. Expect contact from our team." },
                      assessment_done: { ar: "اكتمل التقييم الميداني. جارٍ مراجعة نتائجه.", en: "The field assessment is complete. Results are being reviewed." },
                      approved: { ar: "تهانينا! طلبك معتمد. جارٍ إعداد شهادتك.", en: "Congratulations! Your application is approved. Your certificate is being prepared." },
                      certificate_issued: { ar: "تهانينا! صدرت شهادتك الرسمية.", en: "Congratulations! Your official certificate has been issued." },
                      rejected: { ar: "للأسف تم رفض الطلب. يرجى التواصل مع HPDC.", en: "Unfortunately the application was rejected. Please contact HPDC." },
                    };
                    const msg = msgs[latestApp.stage] ?? { ar: "", en: "" };
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl text-white flex items-center justify-center" style={{ background: G }}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold" style={{ color: G }}>{isAr ? current?.ar : current?.en}</p>
                            <p className="text-xs text-gray-500">{isAr ? "المرحلة الحالية" : "Current stage"}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{isAr ? msg.ar : msg.en}</p>
                        {latestApp.stageNotes && (
                          <div className="bg-white border rounded-lg p-3" style={{ borderColor: `${GOLD}30` }}>
                            <p className="text-xs font-bold mb-1" style={{ color: GOLD }}>{isAr ? "ملاحظة من HPDC" : "Note from HPDC"}</p>
                            <p className="text-sm text-gray-700">{latestApp.stageNotes}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {Array.isArray(applications) && applications.length > 1 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    {isAr ? "الطلبات السابقة" : "Previous Applications"}
                  </p>
                  <div className="space-y-2">
                    {applications.slice(1).map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 text-sm">
                        <span className="font-mono font-bold text-gray-600">{app.applicationNumber}</span>
                        <span className="text-gray-500">{app.companyName}</span>
                        {stageBadge(app.stage, isAr)}
                        {app.createdAt && <span className="text-gray-400 hidden md:block">{format(new Date(app.createdAt), "dd MMM yyyy")}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Certificates */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
          <Award className="w-5 h-5" style={{ color: G }} />
          <h2 className="text-lg font-bold" style={{ color: G }}>
            {isAr ? "شهاداتي" : "My Certificates"}
          </h2>
        </div>
        <div className="p-6">
          {certsLoading ? (
            <div className="text-center py-6 text-gray-400">{isAr ? "جارٍ التحميل..." : "Loading..."}</div>
          ) : !Array.isArray(certificates) || certificates.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <ShieldCheck className="w-10 h-10 text-gray-200 mx-auto" />
              <p className="text-gray-400 text-sm">{isAr ? "لا توجد شهادات مرتبطة بحسابك بعد" : "No certificates linked to your account yet"}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {certificates.map((cert: any) => (
                <div key={cert.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-bold text-sm" style={{ color: G }}>{cert.certificateId}</span>
                    {certStatusBadge(cert.status)}
                  </div>
                  <p className="font-semibold text-gray-800 leading-tight">{cert.companyName}</p>
                  <p className="text-xs text-gray-400">{cert.siteName}</p>
                  <div className="text-xs text-gray-500 space-y-1 pt-1 border-t border-gray-50">
                    <div className="flex justify-between">
                      <span>{isAr ? "الإصدار" : "Issued"}</span>
                      <span className="font-medium">{format(new Date(cert.issueDate), "dd MMM yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isAr ? "الانتهاء" : "Expires"}</span>
                      <span className="font-medium">{format(new Date(cert.expiryDate), "dd MMM yyyy")}</span>
                    </div>
                  </div>
                  <Link href={`/certificate?id=${cert.certificateId}`}
                    className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold py-2 rounded-lg transition-colors"
                    style={{ background: `${G}08`, color: G }}>
                    {isAr ? "عرض الشهادة" : "View Certificate"}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { isAr, dir } = useLanguage();
  const syncUser = useSyncUser();
  const syncAttempted = useRef(false);
  const qc = useQueryClient();

  const { data: me, isLoading: meLoading } = useGetMe({
    query: { queryKey: getGetMeQueryKey(), enabled: isLoaded && !!user }
  });

  const { data: certificates, isLoading: certsLoading } = useGetMyCertificates({
    query: { queryKey: getGetMyCertificatesQueryKey(), enabled: isLoaded && !!user }
  });

  const { data: applications, isLoading: appsLoading } = useGetMyApplications({
    query: { queryKey: getGetMyApplicationsQueryKey(), enabled: isLoaded && !!user }
  });

  useEffect(() => {
    if (isLoaded && user && !syncAttempted.current) {
      syncAttempted.current = true;

      // Read full onboarding payload saved by the sign-up wizard
      let onboardingPayload: Record<string, string> | null = null;
      try {
        const raw = localStorage.getItem("hpdc_onboarding_payload");
        if (raw) {
          onboardingPayload = JSON.parse(raw);
          localStorage.removeItem("hpdc_onboarding_payload");
        }
        // Legacy fallback
        const legacy = localStorage.getItem("hpdc_pending_signup");
        if (legacy && !onboardingPayload) {
          const parsed = JSON.parse(legacy);
          if (parsed.accountType) onboardingPayload = parsed;
          localStorage.removeItem("hpdc_pending_signup");
        }
      } catch { }

      const capturedPayload = onboardingPayload;
      const requestedRole = localStorage.getItem("hpdc_demo_mode") as "admin" | "company" | null;
      if (requestedRole) localStorage.removeItem("hpdc_demo_mode");

      // Sync user first, then post onboarding (so the user record exists in DB)
      syncUser.mutateAsync({
        data: {
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? "",
          companyName: (capturedPayload?.companyName) ?? user.fullName ?? undefined,
          requestedRole: requestedRole ?? undefined
        }
      }).then(() => {
        if (!capturedPayload) return Promise.resolve();
        return fetch(`${BASE}/api/users/onboarding`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(capturedPayload),
        });
      }).then(() => {
        // Refetch me so the dashboard reflects the correct account type from DB
        qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
      }).catch(() => { });
    }
  }, [isLoaded, user, syncUser]);

  if (!isLoaded || meLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: `${G}40`, borderTopColor: G }} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50/60" dir={dir}>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <CompanyDashboard
            me={me} user={user}
            applications={applications} certificates={certificates}
            appsLoading={appsLoading} certsLoading={certsLoading}
            isAr={isAr}
          />
        </div>
      </div>
    </Layout>
  );
}
