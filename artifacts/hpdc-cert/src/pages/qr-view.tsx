import { useParams, Link } from "wouter";
import { useGetCertificate } from "@workspace/api-client-react";
import { ShieldCheck, XCircle, AlertTriangle, Building2, CalendarDays, Hash, ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";

const BASE = import.meta.env.BASE_URL;

export default function QrViewPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id || "");

  const { data: cert, isLoading, isError } = useGetCertificate(id, {
    query: { enabled: !!id, queryKey: ["/api/certificates", id] },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#EAF5E4" }}>
        <img src={`${BASE}hpdc-logo-transparent.png`} alt="HPDC" className="h-16 w-auto mb-2" />
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#1A4D2E" }} />
        <p className="text-sm font-medium" style={{ color: "#1A4D2E" }}>جارٍ التحقق من الشهادة…</p>
      </div>
    );
  }

  if (isError || !cert) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center" style={{ background: "#EAF5E4" }}>
        <img src={`${BASE}hpdc-logo-transparent.png`} alt="HPDC" className="h-14 w-auto" />
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#fee2e2" }}>
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2" dir="rtl">شهادة غير موجودة</h2>
          <p className="text-gray-500 text-sm mb-1" dir="rtl">رقم الشهادة: <span className="font-mono font-bold">{id}</span></p>
          <p className="text-gray-400 text-xs mt-3" dir="rtl">هذه الشهادة غير مسجّلة في منظومة HPDC أو قد تكون مزوّرة.</p>
          <div className="mt-6 pt-4 border-t text-xs text-gray-400">
            <p>Certificate not found in HPDC system</p>
          </div>
        </div>
        <a href="https://www.hpdc.sa" target="_blank" rel="noopener noreferrer" className="text-xs mt-2" style={{ color: "#1A4D2E" }}>
          www.hpdc.sa
        </a>
      </div>
    );
  }

  const statusConfig: Record<string, { icon: JSX.Element; label_ar: string; label_en: string; color: string; bg: string; iconBg: string }> = {
    valid: {
      icon: <ShieldCheck className="w-10 h-10" style={{ color: "#1A4D2E" }} />,
      label_ar: "شهادة سارية",
      label_en: "VALID CERTIFICATE",
      color: "#1A4D2E",
      bg: "#EAF5E4",
      iconBg: "#c8eabc",
    },
    expired: {
      icon: <XCircle className="w-10 h-10 text-red-500" />,
      label_ar: "شهادة منتهية الصلاحية",
      label_en: "EXPIRED CERTIFICATE",
      color: "#991b1b",
      bg: "#fee2e2",
      iconBg: "#fecaca",
    },
    suspended: {
      icon: <AlertTriangle className="w-10 h-10 text-amber-600" />,
      label_ar: "شهادة معلّقة",
      label_en: "SUSPENDED CERTIFICATE",
      color: "#92400e",
      bg: "#fef3c7",
      iconBg: "#fde68a",
    },
  };

  const sc = statusConfig[cert.status] ?? statusConfig.valid;

  const fmt = (d: string | null | undefined) => {
    if (!d) return "—";
    try { return format(new Date(d), "dd/MM/yyyy"); } catch { return d; }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 gap-5" style={{ background: "#EAF5E4" }} dir="rtl">

      {/* Logo */}
      <img src={`${BASE}hpdc-logo-transparent.png`} alt="HPDC" className="h-14 w-auto" />

      {/* Status card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Status header */}
        <div className="px-6 py-8 text-center" style={{ background: sc.bg }}>
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: sc.iconBg }}>
            {sc.icon}
          </div>
          <p className="text-xl font-black mb-0.5" style={{ color: sc.color }}>{sc.label_ar}</p>
          <p className="text-xs font-mono tracking-widest" style={{ color: sc.color, opacity: 0.7 }}>{sc.label_en}</p>
        </div>

        {/* Details */}
        <div className="px-6 py-6 space-y-4">

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#EAF5E4" }}>
              <Hash className="w-4 h-4" style={{ color: "#1A4D2E" }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">رقم الشهادة</p>
              <p className="font-mono font-bold text-sm" style={{ color: "#1A4D2E" }} dir="ltr">{cert.certificateId}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#EAF5E4" }}>
              <Building2 className="w-4 h-4" style={{ color: "#1A4D2E" }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">اسم المنشأة</p>
              <p className="font-bold text-sm text-gray-800">{cert.companyName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-2xl p-3 text-center" style={{ background: "#F8FCF6" }}>
              <div className="flex items-center justify-center gap-1 mb-1">
                <CalendarDays className="w-3.5 h-3.5" style={{ color: "#6BAE45" }} />
                <p className="text-xs text-gray-400">تاريخ الإصدار</p>
              </div>
              <p className="font-semibold text-sm" style={{ color: "#1A4D2E" }} dir="ltr">{fmt(cert.issueDate)}</p>
            </div>
            <div className="rounded-2xl p-3 text-center" style={{ background: "#F8FCF6" }}>
              <div className="flex items-center justify-center gap-1 mb-1">
                <CalendarDays className="w-3.5 h-3.5 text-amber-500" />
                <p className="text-xs text-gray-400">تاريخ الانتهاء</p>
              </div>
              <p className="font-semibold text-sm" style={{ color: cert.status === "expired" ? "#991b1b" : "#1A4D2E" }} dir="ltr">
                {fmt(cert.expiryDate)}
              </p>
            </div>
          </div>

          {cert.esgScore != null && (
            <div className="rounded-2xl p-4 text-center" style={{ background: "#EAF5E4" }}>
              <p className="text-xs text-gray-500 mb-1">تقييم ESG الكلي</p>
              <p className="text-3xl font-black" style={{ color: "#1A4D2E" }}>{cert.esgScore}<span className="text-base font-normal">/100</span></p>
            </div>
          )}

          <Link href={`/certificate?id=${encodeURIComponent(cert.certificateId)}`}>
            <button
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white mt-2"
              style={{ background: "#1A4D2E" }}
            >
              <ExternalLink className="w-4 h-4" />
              عرض الشهادة الرسمية كاملة
            </button>
          </Link>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t text-center" style={{ background: "#F8FCF6" }}>
          <p className="text-xs text-gray-400">تم التحقق بواسطة منصة HPDC الرسمية</p>
          <a href="https://www.hpdc.sa" target="_blank" rel="noopener noreferrer"
            className="text-xs font-semibold" style={{ color: "#6BAE45" }}>
            www.hpdc.sa
          </a>
        </div>
      </div>

      <p className="text-xs text-center" style={{ color: "#2a5a36", opacity: 0.6 }}>
        شركة تطوير منتجات الحلال — إحدى شركات صندوق الاستثمارات العامة
      </p>
    </div>
  );
}
