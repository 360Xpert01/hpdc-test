import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useLanguage } from "@/contexts/language-context";
import { t } from "@/lib/translations";
import {
  Search, Building2, MapPin, CalendarDays, ShieldCheck,
  XCircle, AlertTriangle, ExternalLink, X, Award, ChevronDown, Loader2,
} from "lucide-react";
const BASE = import.meta.env.BASE_URL;

type CertRecord = {
  id: string;
  certificateId: string;
  companyName: string;
  siteName: string;
  location: string;
  country: string;
  issueDate: string;
  expiryDate: string;
  status: "valid" | "expired" | "suspended";
  scopeStatement?: string;
};

/* ── kept only as fallback type reference, NOT used for data ── */
const _UNUSED_SEED: CertRecord[] = [
  /* ── Saudi Arabia ── */
  {
    id: "1", certificateId: "HPDC-ESG-2024-001", companyName: "Saudi Aramco",
    siteName: "Dhahran Headquarters", location: "Dhahran, Eastern Province, Saudi Arabia",
    country: "Saudi Arabia", issueDate: "2024-01-15", expiryDate: "2027-01-14", status: "valid",
    scopeStatement: "Environmental management, social responsibility, and corporate governance practices across upstream oil and gas operations, including environmental impact assessments, community engagement programs, and board-level governance structures.",
  },
  {
    id: "2", certificateId: "HPDC-ESG-2024-002", companyName: "Saudi Electricity Company (SEC)",
    siteName: "Riyadh Power Plant No. 10", location: "Riyadh, Riyadh Province, Saudi Arabia",
    country: "Saudi Arabia", issueDate: "2024-03-01", expiryDate: "2027-02-28", status: "valid",
    scopeStatement: "Sustainable energy generation and distribution operations, including renewable energy integration, emissions monitoring, and employee occupational health and safety programs.",
  },
  {
    id: "3", certificateId: "HPDC-ESG-2023-015", companyName: "SABIC",
    siteName: "Al Jubail Industrial City Plant", location: "Al Jubail, Eastern Province, Saudi Arabia",
    country: "Saudi Arabia", issueDate: "2021-06-10", expiryDate: "2024-06-09", status: "expired",
    scopeStatement: "Petrochemical manufacturing operations covering environmental compliance, chemical waste management, and employee welfare programs across Al Jubail production facilities.",
  },
  {
    id: "4", certificateId: "HPDC-ESG-2024-008", companyName: "Ma'aden (Saudi Arabian Mining Company)",
    siteName: "Wa'ad Al Shamal Phosphate Complex", location: "Northern Borders Province, Saudi Arabia",
    country: "Saudi Arabia", issueDate: "2023-09-01", expiryDate: "2026-08-31", status: "suspended",
    scopeStatement: "Mining and minerals processing operations, land reclamation, environmental restoration, and occupational health management across phosphate extraction and processing facilities.",
  },
  {
    id: "5", certificateId: "HPDC-ESG-2024-011", companyName: "stc (Saudi Telecom Company)",
    siteName: "Riyadh HQ — Digital Infrastructure Division", location: "Riyadh, Riyadh Province, Saudi Arabia",
    country: "Saudi Arabia", issueDate: "2024-05-20", expiryDate: "2027-05-19", status: "valid",
    scopeStatement: "Digital infrastructure operations, data center energy efficiency, employee diversity programs, and cybersecurity governance frameworks aligned with Vision 2030 digital economy objectives.",
  },
  /* ── UAE ── */
  {
    id: "6", certificateId: "HPDC-ESG-2024-020", companyName: "Emirates Global Aluminium (EGA)",
    siteName: "Jebel Ali Smelting Complex", location: "Jebel Ali, Dubai, United Arab Emirates",
    country: "United Arab Emirates", issueDate: "2024-02-10", expiryDate: "2027-02-09", status: "valid",
    scopeStatement: "Primary aluminium smelting operations covering carbon footprint reduction, water recycling initiatives, community development programs, and supply chain transparency reporting.",
  },
  {
    id: "7", certificateId: "HPDC-ESG-2023-031", companyName: "ADNOC Logistics & Services",
    siteName: "Abu Dhabi Marine Terminal", location: "Abu Dhabi, United Arab Emirates",
    country: "United Arab Emirates", issueDate: "2022-11-01", expiryDate: "2025-10-31", status: "expired",
    scopeStatement: "Marine logistics, port operations, and petroleum product distribution covering vessel emission monitoring, spill prevention protocols, and port community welfare programs.",
  },
  /* ── Kuwait ── */
  {
    id: "8", certificateId: "HPDC-ESG-2024-035", companyName: "Kuwait Finance House (KFH)",
    siteName: "Shuwaikh Central Operations", location: "Shuwaikh, Kuwait City, Kuwait",
    country: "Kuwait", issueDate: "2024-06-01", expiryDate: "2027-05-31", status: "valid",
    scopeStatement: "Islamic banking and financial services operations including green financing products, ethical investment screening, financial inclusion programs, and Sharia-compliant ESG governance frameworks.",
  },
  /* ── Qatar ── */
  {
    id: "9", certificateId: "HPDC-ESG-2024-042", companyName: "QatarEnergy",
    siteName: "Ras Laffan LNG Facility", location: "Ras Laffan Industrial City, Qatar",
    country: "Qatar", issueDate: "2024-04-15", expiryDate: "2027-04-14", status: "valid",
    scopeStatement: "Liquefied natural gas production and export operations, including greenhouse gas reduction targets, flare minimization programs, worker welfare standards, and independent ESG audit frameworks.",
  },
  /* ── Bahrain ── */
  {
    id: "10", certificateId: "HPDC-ESG-2023-048", companyName: "Alba (Aluminium Bahrain)",
    siteName: "Bahrain Smelter — Line 6 Expansion", location: "Askar, Southern Governorate, Bahrain",
    country: "Bahrain", issueDate: "2023-07-01", expiryDate: "2026-06-30", status: "valid",
    scopeStatement: "Primary aluminium production with focus on energy efficiency upgrades, water desalination sustainability, occupational health management, and board diversity in line with GCC ESG standards.",
  },
  /* ── Jordan ── */
  {
    id: "11", certificateId: "HPDC-ESG-2024-055", companyName: "Jordan Phosphate Mines Company",
    siteName: "Aqaba Phosphate Port Terminal", location: "Aqaba Special Economic Zone, Jordan",
    country: "Jordan", issueDate: "2024-01-20", expiryDate: "2027-01-19", status: "valid",
    scopeStatement: "Phosphate mining, processing, and port export operations covering land rehabilitation, dust suppression programs, mine community development, and export-chain environmental compliance.",
  },
  /* ── Egypt ── */
  {
    id: "12", certificateId: "HPDC-ESG-2023-060", companyName: "Egyptian Chemical Industries (KIMA)",
    siteName: "Aswan Fertiliser Plant", location: "Aswan, Upper Egypt, Egypt",
    country: "Egypt", issueDate: "2022-09-15", expiryDate: "2025-09-14", status: "suspended",
    scopeStatement: "Nitrogen fertiliser production including ammonia synthesis, agricultural community programs, Nile water management compliance, and worker health and safety monitoring programs.",
  },
  /* ── Malaysia ── */
  {
    id: "13", certificateId: "HPDC-ESG-2024-067", companyName: "Petronas Dagangan Berhad",
    siteName: "Kuala Lumpur Retail Network HQ", location: "Kuala Lumpur, Federal Territory, Malaysia",
    country: "Malaysia", issueDate: "2024-03-25", expiryDate: "2027-03-24", status: "valid",
    scopeStatement: "Downstream petroleum retail operations including fuel station decarbonisation, EV charging rollout, vendor supply chain ESG audits, and community financial literacy programs.",
  },
  /* ── Indonesia ── */
  {
    id: "14", certificateId: "HPDC-ESG-2024-072", companyName: "PT Pertamina (Persero)",
    siteName: "Balikpapan Refinery Complex", location: "Balikpapan, East Kalimantan, Indonesia",
    country: "Indonesia", issueDate: "2024-07-01", expiryDate: "2027-06-30", status: "valid",
    scopeStatement: "Crude oil refining and distribution operations with biodiversity offset programs, mangrove restoration initiatives, refinery community health programs, and ISO 14001-aligned environmental management.",
  },
  /* ── Turkey ── */
  {
    id: "15", certificateId: "HPDC-ESG-2023-078", companyName: "Türkiye Petrolleri (TPAO)",
    siteName: "Ankara Exploration & Production HQ", location: "Ankara, Central Anatolia, Turkey",
    country: "Turkey", issueDate: "2022-04-01", expiryDate: "2025-03-31", status: "expired",
    scopeStatement: "Onshore and offshore petroleum exploration and production with seismic monitoring protocols, indigenous community engagement, petroleum infrastructure environmental impact reporting.",
  },
  /* ── United Kingdom ── */
  {
    id: "16", certificateId: "HPDC-ESG-2024-085", companyName: "Halal Food Authority (HFA)",
    siteName: "London Certification Centre", location: "London, England, United Kingdom",
    country: "United Kingdom", issueDate: "2024-08-01", expiryDate: "2027-07-31", status: "valid",
    scopeStatement: "Halal food certification, inspection, and compliance auditing services with sustainable certification methodology, ethical auditing practices, and stakeholder transparency reporting.",
  },
  /* ── Germany ── */
  {
    id: "17", certificateId: "HPDC-ESG-2024-091", companyName: "BASF SE — Catalysts Division",
    siteName: "Ludwigshafen Chemical Complex", location: "Ludwigshafen, Rhineland-Palatinate, Germany",
    country: "Germany", issueDate: "2024-05-05", expiryDate: "2027-05-04", status: "valid",
    scopeStatement: "Chemical catalysts research, manufacturing, and supply operations with scope 1-3 emissions tracking, circular economy initiatives, chemical waste neutralisation, and EU taxonomy compliance.",
  },
  /* ── USA ── */
  {
    id: "18", certificateId: "HPDC-ESG-2024-097", companyName: "Cargill Protein — Halal Division",
    siteName: "Wichita Processing Facility", location: "Wichita, Kansas, United States",
    country: "United States", issueDate: "2024-09-10", expiryDate: "2027-09-09", status: "valid",
    scopeStatement: "Halal-certified meat processing and global protein supply chain operations with animal welfare auditing, antibiotic stewardship programs, water usage reduction targets, and living wage compliance.",
  },
];

/* Comprehensive static country list for the filter dropdown */
const ALL_COUNTRIES = [
  "Saudi Arabia", "United Arab Emirates", "Kuwait", "Qatar", "Bahrain", "Oman",
  "Jordan", "Egypt", "Lebanon", "Iraq", "Syria", "Yemen", "Libya", "Tunisia", "Morocco", "Algeria", "Sudan",
  "Malaysia", "Indonesia", "Pakistan", "Bangladesh", "India", "Turkey",
  "United Kingdom", "Germany", "France", "Italy", "Netherlands", "Spain",
  "United States", "Canada", "Australia",
];

const STATUS_CFG = {
  valid:     { color: "#6BAE45", bg: "#6BAE4515", border: "#6BAE4540", icon: <ShieldCheck className="w-4 h-4" />, labelKey: "certified.valid" },
  expired:   { color: "#DC2626", bg: "#DC262615", border: "#DC262640", icon: <XCircle className="w-4 h-4" />,    labelKey: "certified.expired" },
  suspended: { color: "#C9A84C", bg: "#C9A84C15", border: "#C9A84C40", icon: <AlertTriangle className="w-4 h-4" />, labelKey: "certified.suspended" },
};

function StatusBadge({ status, lang }: { status: CertRecord["status"]; lang: string }) {
  const cfg = STATUS_CFG[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {cfg.icon}
      {t(lang as any, cfg.labelKey)}
    </span>
  );
}

/* ── shared field styles ── */
const fieldBase = "w-full bg-white border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#1A4D2E]/20 focus:border-[#1A4D2E] transition-all px-4 py-3";

export default function RegistryPage() {
  const { lang, dir } = useLanguage();
  const [certs, setCerts] = useState<CertRecord[]>([]);
  const [loading, setLoading] = useState(true);

  /* form state */
  const [nameQ, setNameQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "valid" | "expired" | "suspended">("");
  const [countryFilter, setCountryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  /* applied (only when Search button is clicked) */
  const [applied, setApplied] = useState({ name: "", status: "" as typeof statusFilter, country: "", from: "", to: "" });

  useEffect(() => {
    /* Load ALL certificates directly from the database via API */
    setLoading(true);
    fetch(`${BASE.replace(/\/$/, "")}/api/certificates`)
      .then(r => r.json())
      .then((d: any[]) => {
        if (!Array.isArray(d)) return;
        const mapped: CertRecord[] = d.map((c, i) => ({
          id: String(c.id ?? i),
          certificateId: c.certificateId,
          companyName: c.companyName,
          siteName: c.siteName,
          location: c.location ?? "",
          country: (c.location ?? "").split(",").pop()?.trim() || "Saudi Arabia",
          issueDate: c.issueDate,
          expiryDate: c.expiryDate,
          status: c.status as CertRecord["status"],
          scopeStatement: c.scopeStatement ?? "",
        }));
        setCerts(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const countries = useMemo(() => {
    const fromData = new Set(certs.map(c => c.country).filter(Boolean));
    const merged = ALL_COUNTRIES.filter(c => fromData.has(c));
    const rest = ALL_COUNTRIES.filter(c => !fromData.has(c));
    return [...merged, ...rest];
  }, [certs]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setApplied({ name: nameQ, status: statusFilter, country: countryFilter, from: dateFrom, to: dateTo });
  }

  function clearAll() {
    setNameQ(""); setStatusFilter(""); setCountryFilter(""); setDateFrom(""); setDateTo("");
    setApplied({ name: "", status: "", country: "", from: "", to: "" });
  }

  const filtered = useMemo(() => {
    return certs.filter(c => {
      const q = applied.name.toLowerCase().trim();
      const matchName = !q || c.companyName.toLowerCase().includes(q) || c.certificateId.toLowerCase().includes(q);
      const matchStatus = !applied.status || c.status === applied.status;
      const matchCountry = !applied.country || c.country === applied.country;
      const matchFrom = !applied.from || c.issueDate >= applied.from;
      const matchTo = !applied.to || c.issueDate <= applied.to;
      return matchName && matchStatus && matchCountry && matchFrom && matchTo;
    });
  }, [certs, applied]);

  const hasApplied = applied.name || applied.status || applied.country || applied.from || applied.to;

  return (
    <Layout>
      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden pb-0" style={{ background: "linear-gradient(160deg, #1A4D2E 0%, #0F3320 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

        <div className="container mx-auto px-6 pt-14 pb-0 relative z-10" dir={dir}>
          {/* HPDC issuer badge */}
          <div className="flex justify-center mb-7">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl"
              style={{ background: "#C9A84C18", border: "1px solid #C9A84C40" }}>
              <Award className="w-4 h-4 flex-shrink-0" style={{ color: "#C9A84C" }} />
              <span className="text-sm font-semibold" style={{ color: "#C9A84C" }}>
                {t(lang, "certified.issuedBy")}:&nbsp;
                <span className="font-bold">
                  {lang === "ar" ? "شركة تطوير منتجات الحلال (HPDC)" : "Halal Products Development Company (HPDC)"}
                </span>
              </span>
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{t(lang, "certified.tag")}</h1>
            <div className="w-16 h-[3px] mx-auto mb-4 rounded-full" style={{ background: "#C9A84C" }} />
            <p className="text-white/65 text-base">{t(lang, "certified.sub")}</p>
          </div>

          {/* ── Search Panel Card (overlaps hero bottom) ── */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-t-2xl shadow-2xl px-6 pt-6 pb-7" dir={dir}>
              <form onSubmit={handleSearch}>
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Name / reference */}
                  <div className="md:col-span-1">
                    <div className="relative">
                      <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                        style={{ [dir === "rtl" ? "right" : "left"]: "0.9rem" }} />
                      <input
                        type="text" value={nameQ} onChange={e => setNameQ(e.target.value)}
                        placeholder={lang === "ar" ? "اسم الجهة - الرقم المرجعي" : "Organization Name / Reference"}
                        className={fieldBase}
                        style={{ paddingInlineStart: "2.5rem" }}
                        dir={dir}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="relative">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
                      className={`${fieldBase} appearance-none cursor-pointer`}
                      dir={dir}>
                      <option value="">{lang === "ar" ? "جميع الحالات" : "All Statuses"}</option>
                      <option value="valid">{lang === "ar" ? "سارية" : "Valid"}</option>
                      <option value="expired">{lang === "ar" ? "منتهية" : "Expired"}</option>
                      <option value="suspended">{lang === "ar" ? "موقوفة" : "Suspended"}</option>
                    </select>
                    <ChevronDown className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      style={{ [dir === "rtl" ? "left" : "right"]: "0.9rem" }} />
                  </div>

                  {/* Country */}
                  <div className="relative">
                    <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
                      className={`${fieldBase} appearance-none cursor-pointer`}
                      dir={dir}>
                      <option value="">{lang === "ar" ? "الدولة" : "Country"}</option>
                      {(() => {
                        const withData = new Set(certs.map(c => c.country).filter(Boolean));
                        const active = countries.filter(c => withData.has(c));
                        const inactive = countries.filter(c => !withData.has(c));
                        return (
                          <>
                            <optgroup label={lang === "ar" ? "── دول فيها شهادات ──" : "── With Certificates ──"}>
                              {active.map(c => <option key={c} value={c}>{c}</option>)}
                            </optgroup>
                            <optgroup label={lang === "ar" ? "── جميع الدول ──" : "── All Countries ──"}>
                              {inactive.map(c => <option key={c} value={c}>{c}</option>)}
                            </optgroup>
                          </>
                        );
                      })()}
                    </select>
                    <ChevronDown className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      style={{ [dir === "rtl" ? "left" : "right"]: "0.9rem" }} />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  {/* Date from */}
                  <div className="relative">
                    <CalendarDays className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      style={{ [dir === "rtl" ? "right" : "left"]: "0.9rem" }} />
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                      placeholder={lang === "ar" ? "من تاريخ" : "From Date"}
                      className={`${fieldBase} text-gray-400`}
                      style={{ paddingInlineStart: "2.5rem" }}
                      dir="ltr"
                    />
                  </div>

                  {/* Date to */}
                  <div className="relative">
                    <CalendarDays className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      style={{ [dir === "rtl" ? "right" : "left"]: "0.9rem" }} />
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                      placeholder={lang === "ar" ? "إلى تاريخ" : "To Date"}
                      className={`${fieldBase} text-gray-400`}
                      style={{ paddingInlineStart: "2.5rem" }}
                      dir="ltr"
                    />
                  </div>

                  {/* Search button */}
                  <button type="submit"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                    style={{ background: "#1A4D2E" }}>
                    <Search className="w-4 h-4" />
                    {lang === "ar" ? "بحث" : "Search"}
                  </button>
                </div>

                {/* Date hint */}
                <p className="text-xs text-gray-400" dir={dir}>
                  {lang === "ar" ? "تاريخ بداية الاعتماد يقع بين التاريخين" : "Certificate issue date falls between the selected dates"}
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ RESULTS ══════════ */}
      <div style={{ background: "#F8F9FA" }} className="min-h-screen">
        {/* White card continues seamlessly */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-b-2xl shadow-2xl px-6 py-4 mb-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100" dir={dir}>
            <p className="text-sm text-gray-500">
              {hasApplied
                ? <><strong style={{ color: "#1A4D2E" }}>{filtered.length}</strong> {t(lang, "certified.results")}</>
                : <><strong style={{ color: "#1A4D2E" }}>{certs.length}</strong> {t(lang, "certified.results")}</>
              }
            </p>

            {/* Active filter chips */}
            <div className="flex flex-wrap gap-2 items-center">
              {applied.status && (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold"
                  style={{ background: STATUS_CFG[applied.status].bg, color: STATUS_CFG[applied.status].color, border: `1px solid ${STATUS_CFG[applied.status].border}` }}>
                  {t(lang, STATUS_CFG[applied.status].labelKey)}
                </span>
              )}
              {applied.country && (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 bg-gray-50 font-medium">
                  <MapPin className="w-3 h-3" />{applied.country}
                </span>
              )}
              {applied.name && (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 bg-gray-50 font-medium">
                  <Search className="w-3 h-3" />"{applied.name}"
                </span>
              )}
              {(applied.from || applied.to) && (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 bg-gray-50 font-medium">
                  <CalendarDays className="w-3 h-3" />
                  {applied.from || "…"} — {applied.to || "…"}
                </span>
              )}
              {hasApplied && (
                <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-600 transition-colors font-medium flex items-center gap-1">
                  <X className="w-3 h-3" />{lang === "ar" ? "مسح" : "Clear"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="max-w-5xl mx-auto px-4 pb-16">
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
              <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-[#1A4D2E]" />
              <p className="text-sm text-gray-400">{lang === "ar" ? "جارٍ تحميل الشهادات…" : "Loading certificates…"}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-200" />
              <p className="font-semibold text-gray-500 mb-1">{t(lang, "certified.noResults")}</p>
              <p className="text-sm text-gray-400 mb-5">{t(lang, "certified.noResultsSub")}</p>
              <button onClick={clearAll}
                className="px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "#1A4D2E12", color: "#1A4D2E" }}>
                {lang === "ar" ? "مسح الفلاتر" : "Clear filters"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {(hasApplied ? filtered : certs).map((cert, idx) => {
                const cfg = STATUS_CFG[cert.status];
                const initial = cert.companyName.charAt(0).toUpperCase();
                return (
                  <article key={cert.id}
                    className="group bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg"
                    style={{ border: `1px solid ${cfg.color}22`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>

                    <div className="flex" dir={dir}>
                      {/* ── Left status strip + avatar ── */}
                      <div className="flex-shrink-0 flex flex-col items-center justify-center px-5 py-5 gap-3"
                        style={{ borderInlineEnd: `1px solid ${cfg.color}22`, background: `${cfg.color}08` }}>
                        {/* Company initial avatar */}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black text-white shadow-sm"
                          style={{ background: cfg.color }}>
                          {initial}
                        </div>
                        {/* Serial number */}
                        <span className="text-[10px] font-bold tabular-nums" style={{ color: cfg.color }}>
                          #{String(idx + 1).padStart(2, "0")}
                        </span>
                      </div>

                      {/* ── Main content ── */}
                      <div className="flex-1 min-w-0 p-5">
                        {/* Top row: Name + Status */}
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                          <div className="min-w-0">
                            <h3 className="font-bold text-base leading-tight mb-1 truncate" style={{ color: "#1A4D2E" }}>
                              {cert.companyName}
                            </h3>
                            <p className="text-xs text-gray-400 flex items-center gap-1.5">
                              <Building2 className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{cert.siteName}</span>
                            </p>
                          </div>
                          <StatusBadge status={cert.status} lang={lang} />
                        </div>

                        {/* Middle row: Location | Certificate ID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#1A4D2E" }} />
                            <span className="truncate">{cert.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{lang === "ar" ? "رقم الشهادة:" : "Cert No."}</span>
                            <Link href={`/certificate?id=${encodeURIComponent(cert.certificateId)}`}
                              className="text-xs font-mono font-bold px-2 py-0.5 rounded-md transition-all hover:shadow-md hover:scale-105 inline-flex items-center gap-1"
                              style={{ background: "#F0F9EB", color: "#1A4D2E", border: "1px solid #1A4D2E20" }}>
                              {cert.certificateId}
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </Link>
                          </div>
                        </div>

                        {/* Bottom row: Dates + HPDC tag + Action */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-3"
                          style={{ borderTop: "1px dashed #E5E7EB" }}>
                          {/* Dates */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span className="hidden sm:inline">{lang === "ar" ? "إصدار:" : "Issued:"}</span>
                              <strong className="text-gray-600">{cert.issueDate}</strong>
                            </span>
                            <span className="text-gray-200 hidden sm:inline">|</span>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span className="hidden sm:inline">{lang === "ar" ? "انتهاء:" : "Expires:"}</span>
                              <strong style={{ color: cert.status === "expired" ? "#DC2626" : "#4B5563" }}>
                                {cert.expiryDate}
                              </strong>
                            </span>
                          </div>

                          {/* HPDC + Actions */}
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg"
                              style={{ background: "#C9A84C08", color: "#9A7830", border: "1px solid #C9A84C25" }}>
                              <Award className="w-2.5 h-2.5" />
                              HPDC
                            </span>
                            <Link href={`/verify?id=${encodeURIComponent(cert.certificateId)}`}>
                              <button
                                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all hover:opacity-90 border"
                                style={{ color: cfg.color, borderColor: `${cfg.color}50`, background: `${cfg.color}08` }}>
                                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                {lang === "ar" ? "تحقق" : "Verify"}
                              </button>
                            </Link>
                            <Link href={`/certificate?id=${encodeURIComponent(cert.certificateId)}`}>
                              <button
                                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all hover:opacity-90 text-white"
                                style={{ background: "#1A4D2E" }}>
                                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                {lang === "ar" ? "الشهادة" : "Certificate"}
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
