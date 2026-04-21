import { useSearch, useLocation } from "wouter";
import { useGetCertificate } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";

import { Button } from "@/components/ui/button";
import { Printer, Share2, ArrowRight, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/language-context";
import { t } from "@/lib/translations";
import QRCode from "react-qr-code";

const BASE = import.meta.env.BASE_URL;

/* ════════════════════════════════════════════════════════════════
   HPDC ESG CERTIFICATE — Final hybrid design
   ─ A4 portrait fits on a SINGLE page (multi-site → annex page 2)
   ─ HPDC logo top-LEFT,  TAYYIB top-RIGHT
   ─ Combines old design (decorative center title, ribbon, watermark,
     gold dividers, big org name) with the official PDF's bilingual
     content (EN-left, AR-right rows)
   ─ "Activities Covered" added to scope block
   ════════════════════════════════════════════════════════════════ */

type AdditionalSite = { name: string; address: string; activities: string; siteScope: string };
type CertExtra = { activities?: string; exclusions?: string; signingAuthority?: string; signingPosition?: string; additionalSites?: AdditionalSite[] };

export default function CertificatePage() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const idParam = searchParams.get("id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { lang, dir } = useLanguage();

  const { data: cert, isLoading, isError } = useGetCertificate(idParam || "", {
    query: { enabled: !!idParam, queryKey: ["/api/certificates", idParam] }
  });

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  const handlePrint = () => window.print();
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      toast({ title: lang === "ar" ? "تم نسخ الرابط" : "Link copied", description: lang === "ar" ? "تم نسخ رابط الشهادة بنجاح." : "Certificate link copied to clipboard." });
    } catch {
      toast({ title: lang === "ar" ? "خطأ" : "Error", description: lang === "ar" ? "تعذر نسخ الرابط." : "Could not copy the link.", variant: "destructive" });
    }
  };

  const statusMap: Record<string, { ar: string; en: string; color: string }> = {
    valid:     { ar: "سارية",   en: "VALID",      color: "#1A4D2E" },
    expired:   { ar: "منتهية",  en: "EXPIRED",    color: "#991b1b" },
    suspended: { ar: "معلّقة",  en: "SUSPENDED",  color: "#92400e" },
  };

  if (!idParam) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center" dir={dir}>
          <h2 className="text-2xl font-bold mb-4">{t(lang, "cert.noId")}</h2>
          <Button onClick={() => setLocation("/verify")}>{t(lang, "cert.backVerify")}</Button>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex flex-col items-center gap-4" dir={dir}>
          <div className="w-12 h-12 border-4 border-[#1A4D2E] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#1A4D2E] font-medium">{t(lang, "cert.loading")}</p>
        </div>
      </Layout>
    );
  }

  if (isError || !cert) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center" dir={dir}>
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">{t(lang, "cert.notFound")}</h2>
          <p className="text-gray-500 mb-6">{t(lang, "cert.notFoundDesc")}</p>
          <Button style={{ background: "#1A4D2E" }} className="text-white" onClick={() => setLocation("/verify")}>{t(lang, "cert.backVerify")}</Button>
        </div>
      </Layout>
    );
  }

  const extra = cert as typeof cert & CertExtra;
  const status = statusMap[cert.status] || statusMap.valid;
  const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}${BASE}qr/${encodeURIComponent(cert.certificateId)}`;
  const fmt = (d: string) => format(new Date(d), "yyyy/MM/dd");
  const additionalSites = extra.additionalSites || [];
  const hasMultiSite = additionalSites.length > 0;

  /* ─── Reusable bilingual row ─── */
  const BiRow = ({ en, ar, className = "" }: { en: React.ReactNode; ar: React.ReactNode; className?: string }) => (
    <div className={`grid grid-cols-2 gap-x-6 ${className}`}>
      <div className="text-left" dir="ltr">{en}</div>
      <div className="text-right" dir="rtl">{ar}</div>
    </div>
  );

  return (
    <Layout>
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          header, footer, .no-print { display: none !important; }
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .cert-page { padding: 0 !important; background: white !important; min-height: auto !important; }
          .cert-sheet { box-shadow: none !important; margin: 0 auto !important; page-break-after: always; }
          .annex-sheet { box-shadow: none !important; margin: 0 auto !important; page-break-before: always; }
        }
        .cert-sheet, .annex-sheet {
          width: 210mm;
          height: 297mm;
          margin: 0 auto;
          background: white;
          font-family: "Times New Roman", "Traditional Arabic", serif;
          color: #1f2937;
          position: relative;
          overflow: hidden;
        }
        @media (max-width: 820px) {
          .cert-sheet, .annex-sheet { width: 100%; height: auto; min-height: 297mm; }
        }
        .sec-title { font-weight: 700; color: #1A4D2E; font-size: 9pt; }
        .body-sm   { font-size: 8.5pt; line-height: 1.5; color: #374151; }
        .field-lbl { color: #6b7280; font-size: 7.5pt; font-weight: 600; }
        .field-val { color: #111827; font-size: 8.5pt; font-weight: 500; }
        .mono-id   { font-family: ui-monospace, "SFMono-Regular", Consolas, monospace; }
      `}</style>

      <div className="cert-page bg-gray-100 min-h-screen py-6 md:py-10">
        <div className="container mx-auto px-3 sm:px-4 max-w-5xl">

          {/* ── Action bar ── */}
          <div className="no-print flex flex-wrap justify-between items-center gap-3 mb-6" dir={dir}>
            <Button variant="ghost" onClick={() => window.history.back()} className="text-gray-500 hover:text-[#1A4D2E]">
              <ArrowRight className={`w-4 h-4 ${lang === "ar" ? "ml-2" : "mr-2 rotate-180"}`} />
              {t(lang, "cert.back")}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare} style={{ borderColor: "#1A4D2E", color: "#1A4D2E" }}>
                <Share2 className="w-4 h-4 sm:ml-2" />
                <span className="hidden sm:inline">{t(lang, "cert.share")}</span>
              </Button>
              <Button size="sm" onClick={handlePrint} style={{ background: "#1A4D2E" }} className="text-white">
                <Printer className="w-4 h-4 sm:ml-2" />
                <span className="hidden sm:inline">{t(lang, "cert.print")}</span>
              </Button>
            </div>
          </div>

          {/* ════════════════════════════════════════════
              PAGE 1 — Main certificate
          ════════════════════════════════════════════ */}
          <div className="cert-sheet shadow-2xl">

            {/* Status ribbon */}
            <div className="absolute top-0 right-0 overflow-hidden w-36 h-36 pointer-events-none z-30">
              <div className="absolute top-6 right-[-50px] rotate-45 px-12 py-1 text-[9pt] font-black tracking-widest"
                style={{ background: status.color, color: "white", minWidth: "200px", textAlign: "center" }}>
                {status.ar} · {status.en}
              </div>
            </div>

            {/* Watermark */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center" style={{ opacity: 0.04 }}>
              <span className="font-black text-[170pt] text-[#1A4D2E]" style={{ transform: "rotate(-30deg)" }}>HPDC</span>
            </div>

            {/* Double border frame */}
            <div style={{ padding: "10mm" }} className="relative z-10 h-full">
              <div className="border-[2px] border-[#1A4D2E] p-[1mm] h-full">
                <div className="border border-[#C9A84C] h-full flex flex-col" style={{ padding: "8mm 10mm 6mm 10mm" }}>

                  {/* ═══ HEADER: HPDC (left) | Title (center) | TAYYIB (right) ═══ */}
                  <div dir="ltr" className="grid grid-cols-[80px_1fr_80px] sm:grid-cols-[100px_1fr_100px] items-center gap-3 mb-3">
                    {/* HPDC logo - LEFT */}
                    <div className="flex justify-start">
                      <img src={`${BASE}hpdc-logo-transparent.png`} alt="HALAL DEVCO." style={{ height: "18mm", width: "auto", objectFit: "contain" }} className="mix-blend-multiply" />
                    </div>
                    {/* Center title block */}
                    <div className="flex flex-col items-center text-center gap-0.5">
                      <h1 style={{ color: "#1A4D2E", fontSize: "10.5pt", fontWeight: 700, lineHeight: 1.3, fontFamily: "Georgia, serif" }}>
                        Compliance Certificate for Environmental,
                        <br />Social & Governance Standards
                      </h1>
                      <div className="flex items-center gap-2 w-full my-0.5">
                        <div className="h-px flex-1" style={{ background: "#C9A84C" }} />
                        <span className="font-mono font-black" style={{ color: "#C9A84C", fontSize: "13pt" }}>(ESG)</span>
                        <div className="h-px flex-1" style={{ background: "#C9A84C" }} />
                      </div>
                      <h2 style={{ color: "#1A4D2E", fontSize: "10pt", fontWeight: 700, lineHeight: 1.4 }} dir="rtl">
                        شهادة الامتثال للمعايير البيئية والاجتماعية والحوكمة
                      </h2>
                    </div>
                    {/* TAYYIB logo - RIGHT */}
                    <div className="flex justify-end">
                      <img src={`${BASE}tayyib-logo.png`} alt="TAYYIB" style={{ height: "18mm", width: "auto", objectFit: "contain" }} />
                    </div>
                  </div>

                  {/* Gold divider */}
                  <div className="h-[1.5px] mb-3" style={{ background: "linear-gradient(to right, transparent, #C9A84C 15%, #C9A84C 85%, transparent)" }} />

                  {/* ═══ CERTIFY THAT (bilingual) ═══ */}
                  <BiRow
                    className="mb-1"
                    en={<span className="body-sm italic" style={{ color: "#6b7280" }}>This is to certify that:</span>}
                    ar={<span className="body-sm italic" style={{ color: "#6b7280" }}>:تشهد هذه الوثيقة بأن</span>}
                  />

                  {/* ═══ ORGANIZATION NAME (centered, hero) ═══ */}
                  <div className="text-center my-2">
                    <h3 style={{ color: "#1A4D2E", fontSize: "20pt", fontWeight: 900, letterSpacing: "0.3px", lineHeight: 1.1 }}>
                      {cert.companyName}
                    </h3>
                    <p className="text-gray-600 mt-1" style={{ fontSize: "9pt" }}>
                      {cert.siteName} — {cert.location}
                    </p>
                  </div>

                  {/* Multi-site annex pointer */}
                  {hasMultiSite && (
                    <BiRow
                      className="mb-2"
                      en={<span style={{ fontSize: "7.5pt", fontStyle: "italic", color: "#6b7280" }}>(For multi-site organizations, see Annex on page 2 for additional sites)</span>}
                      ar={<span style={{ fontSize: "7.5pt", fontStyle: "italic", color: "#6b7280" }}>(للمنظمات متعددة المواقع، يُرجى الرجوع إلى الملحق في الصفحة الثانية للمواقع الإضافية)</span>}
                    />
                  )}

                  {/* ═══ CERTIFICATE NUMBER (highlight box) ═══ */}
                  <div className="flex justify-center my-2">
                    <div className="border border-[#C9A84C]/60 rounded px-4 py-1.5 bg-[#FBF8EE] text-center">
                      <p className="text-gray-500" style={{ fontSize: "7pt" }}>Holds Certificate No · تحمل الشهادة رقم</p>
                      <p className="mono-id font-bold text-[#1A4D2E]" style={{ fontSize: "12pt", letterSpacing: "1.5px" }}>{cert.certificateId}</p>
                    </div>
                  </div>

                  {/* ═══ DESCRIPTION (bilingual) ═══ */}
                  <BiRow
                    className="mb-3"
                    en={<p className="body-sm">The ESG management practices and performance of <strong>{cert.companyName}</strong> comply with internationally recognised ESG standards, in relation to the following activities, products, and/or services:</p>}
                    ar={<p className="body-sm">تتوافق ممارسات وأداء الحوكمة البيئية والاجتماعية وحوكمة الشركات (ESG) الخاصة بـ <strong>{cert.companyName}</strong> مع المعايير الدولية المُعتمدة، فيما يتعلق بالأنشطة والمنتجات و/أو الخدمات التالية:</p>}
                  />

                  {/* Gold divider */}
                  <div className="h-px mb-3" style={{ background: "linear-gradient(to right, transparent, #C9A84C 30%, #C9A84C 70%, transparent)" }} />

                  {/* ═══ SCOPE OF CERTIFICATION (boxed) ═══ */}
                  <div className="border border-[#1A4D2E]/20 rounded p-3 bg-[#F8FCF6] mb-3">
                    <BiRow
                      className="mb-2"
                      en={<h4 className="sec-title" style={{ fontSize: "10pt", letterSpacing: "0.5px" }}>SCOPE OF CERTIFICATION</h4>}
                      ar={<h4 className="sec-title" style={{ fontSize: "10pt", letterSpacing: "0.5px" }}>نطاق الشهادة</h4>}
                    />

                    {/* Products / Services */}
                    <BiRow
                      className="mb-1.5"
                      en={<p className="body-sm"><span className="field-lbl">Products / Services: </span><span className="field-val">{cert.siteName || "—"}</span></p>}
                      ar={<p className="body-sm"><span className="field-lbl">: المنتجات / الخدمات </span><span className="field-val">{cert.siteName || "—"}</span></p>}
                    />

                    {/* Activities Covered (NEW) */}
                    <BiRow
                      className="mb-1.5"
                      en={<p className="body-sm"><span className="field-lbl">Activities Covered: </span><span className="field-val">{extra.activities || cert.scopeStatement}</span></p>}
                      ar={<p className="body-sm"><span className="field-lbl">: الأنشطة المشمولة </span><span className="field-val">{extra.activities || cert.scopeStatement}</span></p>}
                    />

                    {/* Scope Statement (only if separate from activities) */}
                    {extra.activities && (
                      <BiRow
                        className="mb-1.5"
                        en={<p className="body-sm"><span className="field-lbl">Scope Statement: </span><span className="field-val">{cert.scopeStatement}</span></p>}
                        ar={<p className="body-sm"><span className="field-lbl">: بيان النطاق </span><span className="field-val">{cert.scopeStatement}</span></p>}
                      />
                    )}

                    {/* Exclusions */}
                    <BiRow
                      en={<p className="body-sm"><span className="field-lbl">Exclusions (if any): </span><span className="field-val italic text-gray-500">{extra.exclusions || "Not applicable"}</span></p>}
                      ar={<p className="body-sm"><span className="field-lbl">: الاستثناءات (إن وجدت) </span><span className="field-val italic text-gray-500">{extra.exclusions || "لا يوجد"}</span></p>}
                    />
                  </div>

                  {/* ═══ SIGNATURE & QR & DATES (3-column compact layout) ═══ */}
                  <div className="grid grid-cols-[1.2fr_auto_1.2fr] gap-3 items-start mb-3">

                    {/* Left: Signature block (For and on behalf) */}
                    <div className="text-left" dir="ltr">
                      <p className="sec-title mb-1">For and on behalf of HPDC:</p>
                      <p className="body-sm font-semibold">{extra.signingAuthority || "[Name of Signing Authority]"}</p>
                      <p style={{ fontSize: "8pt", color: "#6b7280" }}>{extra.signingPosition || "[Position / Title]"}</p>
                      {/* Signature line */}
                      <div className="mt-3 border-b border-[#1A4D2E]/40 h-7 relative">
                        <span className="absolute bottom-0 left-1 text-[#1A4D2E]/30" style={{ fontFamily: "'Brush Script MT', cursive", fontSize: "20pt" }}>HPDC</span>
                      </div>
                      <p className="text-center mt-1" style={{ fontSize: "7pt", color: "#1A4D2E", fontWeight: 600 }}>HALAL PRODUCTS DEVELOPMENT COMPANY</p>
                    </div>

                    {/* Center: QR */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="border border-[#1A4D2E]/30 p-1.5 bg-white rounded">
                        <QRCode value={verifyUrl} size={75} fgColor="#1A4D2E" bgColor="white" level="M" />
                      </div>
                      <p className="text-center" style={{ fontSize: "6.5pt", color: "#6b7280" }}>Scan / امسح للتحقق</p>
                    </div>

                    {/* Right: Signature in Arabic */}
                    <div className="text-right" dir="rtl">
                      <p className="sec-title mb-1">:صادرة نيابةً عن شركة تطوير منتجات الحلال</p>
                      <p className="body-sm font-semibold">{extra.signingAuthority || "[اسم المفوّض بالتوقيع]"}</p>
                      <p style={{ fontSize: "8pt", color: "#6b7280" }}>{extra.signingPosition || "[المنصب / المسمى الوظيفي]"}</p>
                      {/* Signature line */}
                      <div className="mt-3 border-b border-[#1A4D2E]/40 h-7 relative">
                        <span className="absolute bottom-0 right-1 text-[#1A4D2E]/30" style={{ fontFamily: "'Brush Script MT', cursive", fontSize: "20pt" }}>HPDC</span>
                      </div>
                      <p className="text-center mt-1" style={{ fontSize: "7pt", color: "#1A4D2E", fontWeight: 600 }}>شركة تطوير منتجات الحلال</p>
                    </div>
                  </div>

                  {/* ═══ DATES (2 cols × 2 rows compact strip) ═══ */}
                  <div className="border-t border-b border-[#C9A84C]/40 py-2 mb-3">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      {[
                        { en: "Certificate Issue Date", ar: "تاريخ إصدار الشهادة", date: cert.issueDate },
                        { en: "Latest Revision Date",   ar: "تاريخ آخر تحديث",     date: cert.expiryDate },
                        { en: "Effective Date",         ar: "تاريخ السريان",        date: cert.issueDate },
                        { en: "Expiry Date",            ar: "تاريخ الانتهاء",        date: cert.expiryDate },
                      ].map((row) => (
                        <div key={row.en} className="grid grid-cols-2 gap-x-3">
                          <div className="text-left body-sm" dir="ltr">
                            <span className="field-lbl">{row.en}: </span>
                            <span className="mono-id font-semibold text-[#1A4D2E]">{fmt(row.date)}</span>
                          </div>
                          <div className="text-right body-sm" dir="rtl">
                            <span className="field-lbl">: {row.ar} </span>
                            <span className="mono-id font-semibold text-[#1A4D2E]" dir="ltr">{fmt(row.date)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ═══ TAGLINE ═══ */}
                  <BiRow
                    className="mb-2"
                    en={<span style={{ color: "#1A4D2E", fontWeight: 700, fontStyle: "italic", fontSize: "10pt" }}>Building Trusted ESG..</span>}
                    ar={<span style={{ color: "#1A4D2E", fontWeight: 700, fontStyle: "italic", fontSize: "10pt" }}>..ثقة معتمدة وفق معايير ESG</span>}
                  />

                  {/* ═══ TERMS OF USE FOOTER (auto pushes to bottom) ═══ */}
                  <div className="mt-auto pt-2 border-t border-gray-200">
                    <BiRow
                      en={<p style={{ fontSize: "6.5pt", color: "#6b7280", lineHeight: 1.4 }}>
                        <strong style={{ color: "#1A4D2E" }}>Links for terms of use: </strong>
                        This certificate was issued electronically and remains the property of HPDC and is bound by the conditions of contract. Verify online or printed copies at <span dir="ltr" style={{ color: "#1A4D2E", textDecoration: "underline" }}>https://www.hpdc.sa/en</span>
                      </p>}
                      ar={<p style={{ fontSize: "6.5pt", color: "#6b7280", lineHeight: 1.5 }}>
                        <strong style={{ color: "#1A4D2E" }}>:روابط شروط الاستخدام </strong>
                        تـم إصـدار هذه الشهادة إلكترونيًا وتظل ملكًا لشركة HPDC وتخضع لشروط التعاقد. يمكن التحقق إلكترونيًا أو من النسخ المطبوعة عبر <span dir="ltr" style={{ color: "#1A4D2E", textDecoration: "underline" }}>https://www.hpdc.sa/en</span>
                      </p>}
                    />
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════
              PAGE 2 — ANNEX (Multi-Site Certification)
              Renders only when cert has additionalSites
          ════════════════════════════════════════════ */}
          {hasMultiSite && (
            <div className="annex-sheet shadow-2xl mt-8">
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center" style={{ opacity: 0.04 }}>
                <span className="font-black text-[170pt] text-[#1A4D2E]" style={{ transform: "rotate(-30deg)" }}>HPDC</span>
              </div>

              <div style={{ padding: "10mm" }} className="relative z-10 h-full">
                <div className="border-[2px] border-[#1A4D2E] p-[1mm] h-full">
                  <div className="border border-[#C9A84C] h-full flex flex-col" style={{ padding: "8mm 10mm" }}>

                    {/* Annex header */}
                    <div className="grid grid-cols-[100px_1fr_100px] items-center gap-3 mb-3">
                      <img src={`${BASE}hpdc-logo-transparent.png`} alt="HPDC" style={{ height: "18mm", width: "auto", objectFit: "contain" }} className="justify-self-start mix-blend-multiply" />
                      <div className="text-center">
                        <h1 style={{ color: "#1A4D2E", fontSize: "12pt", fontWeight: 700, fontFamily: "Georgia, serif" }}>Multi-Site Certification — Annex</h1>
                        <h2 style={{ color: "#1A4D2E", fontSize: "11pt", fontWeight: 700, marginTop: "4px" }} dir="rtl">ملحق شهادة متعددة المواقع</h2>
                      </div>
                      <img src={`${BASE}tayyib-logo.png`} alt="TAYYIB" style={{ height: "18mm", width: "auto", objectFit: "contain" }} className="justify-self-end" />
                    </div>

                    <div className="h-[1.5px] mb-3" style={{ background: "linear-gradient(to right, transparent, #C9A84C 15%, #C9A84C 85%, transparent)" }} />

                    {/* Reference to main cert */}
                    <BiRow
                      className="mb-3 px-3 py-2 rounded bg-[#FBF8EE] border border-[#C9A84C]/50"
                      en={<p className="body-sm"><span className="field-lbl">Reference to Main Certificate Number: </span><span className="mono-id font-bold text-[#1A4D2E]">{cert.certificateId}</span></p>}
                      ar={<p className="body-sm"><span className="field-lbl">: الإشارة إلى رقم الشهادة الرئيسي </span><span className="mono-id font-bold text-[#1A4D2E]" dir="ltr">{cert.certificateId}</span></p>}
                    />

                    <BiRow
                      className="mb-3"
                      en={<p className="body-sm"><strong>{cert.companyName}</strong> — Additional certified sites listed below:</p>}
                      ar={<p className="body-sm"><strong>{cert.companyName}</strong> — المواقع الإضافية المعتمدة المدرجة أدناه:</p>}
                    />

                    {/* Sites list */}
                    <div className="space-y-3">
                      {additionalSites.map((site, idx) => (
                        <div key={idx} className="border border-[#1A4D2E]/20 rounded p-3 bg-[#F8FCF6]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-[#1A4D2E]" style={{ fontSize: "9pt" }}>Site #{idx + 1} · موقع رقم {idx + 1}</span>
                          </div>
                          <BiRow
                            className="mb-1.5"
                            en={<p className="body-sm"><span className="field-lbl">Site Name: </span><span className="field-val">{site.name}</span></p>}
                            ar={<p className="body-sm"><span className="field-lbl">: اسم الموقع </span><span className="field-val">{site.name}</span></p>}
                          />
                          <BiRow
                            className="mb-1.5"
                            en={<p className="body-sm"><span className="field-lbl">Site Address: </span><span className="field-val">{site.address}</span></p>}
                            ar={<p className="body-sm"><span className="field-lbl">: عنوان الموقع </span><span className="field-val">{site.address}</span></p>}
                          />
                          <BiRow
                            className="mb-1.5"
                            en={<p className="body-sm"><span className="field-lbl">Activities Covered: </span><span className="field-val">{site.activities}</span></p>}
                            ar={<p className="body-sm"><span className="field-lbl">: الأنشطة المشمولة </span><span className="field-val">{site.activities}</span></p>}
                          />
                          <BiRow
                            en={<p className="body-sm"><span className="field-lbl">Site-Specific Scope: </span><span className="field-val">{site.siteScope}</span></p>}
                            ar={<p className="body-sm"><span className="field-lbl">: نطاق خاص بالموقع </span><span className="field-val">{site.siteScope}</span></p>}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-2 border-t border-gray-200">
                      <BiRow
                        en={<p style={{ fontSize: "10pt", color: "#1A4D2E", fontWeight: 700, fontStyle: "italic" }}>Building Trusted ESG..</p>}
                        ar={<p style={{ fontSize: "10pt", color: "#1A4D2E", fontWeight: 700, fontStyle: "italic" }}>..ثقة معتمدة وفق معايير ESG</p>}
                      />
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
