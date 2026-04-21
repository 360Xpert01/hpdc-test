import { useSearch, useLocation, Link } from "wouter";
import { useGetCertificate } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search, ShieldCheck, XCircle, AlertTriangle,
  Building2, MapPin, CalendarDays, Award,
  Leaf, Users, Scale, ArrowLeft, Target,
  TrendingUp, CheckCircle2,
  ClipboardList, ScanSearch, BarChart3, FileBarChart2, BadgeCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/language-context";
import { t } from "@/lib/translations";

const BASE = import.meta.env.BASE_URL;

export default function HomePage() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const idParam = searchParams.get("id");
  const [, setLocation] = useLocation();
  const [searchInput, setSearchInput] = useState(idParam || "");
  const { lang, dir } = useLanguage();

  const { data: certificate, isLoading, isError } = useGetCertificate(idParam || "", {
    query: { enabled: !!idParam, queryKey: ["/api/certificates", idParam] }
  });

  useEffect(() => {
    if (idParam) {
      setSearchInput(idParam);
      const el = document.getElementById("verify-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [idParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) setLocation(`/?id=${encodeURIComponent(searchInput.trim())}`);
  };

  const scrollToVerify = () => {
    const el = document.getElementById("verify-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "valid":
        return { icon: <ShieldCheck className="w-12 h-12 text-primary" />, badge: <Badge className="bg-primary text-white text-lg px-4 py-1">{t(lang, "status.valid")}</Badge>, bg: "bg-primary/5", border: "border-primary/20" };
      case "expired":
        return { icon: <XCircle className="w-12 h-12 text-destructive" />, badge: <Badge variant="destructive" className="text-lg px-4 py-1">{t(lang, "status.expired")}</Badge>, bg: "bg-destructive/5", border: "border-destructive/20" };
      case "suspended":
        return { icon: <AlertTriangle className="w-12 h-12 text-secondary" />, badge: <Badge className="bg-secondary text-white text-lg px-4 py-1">{t(lang, "status.suspended")}</Badge>, bg: "bg-secondary/5", border: "border-secondary/20" };
      default:
        return { icon: <ShieldCheck className="w-12 h-12 text-muted-foreground" />, badge: <Badge variant="outline" className="text-lg px-4 py-1">{t(lang, "status.unknown")}</Badge>, bg: "bg-muted", border: "border-border" };
    }
  };

  return (
    <Layout>
      <div dir={dir} className="font-sans">

        {/* ═══════════════ HERO ═══════════════ */}
        <section style={{ background: "linear-gradient(135deg, #EAF5E4 0%, #D8EDCE 60%, #C8E4BB 100%)" }} className="relative overflow-hidden">
          <div className="container mx-auto px-6 lg:px-10">
            <div className={`flex flex-col lg:flex-row items-stretch min-h-[88vh] gap-0 ${lang === "en" ? "lg:flex-row-reverse" : ""}`}>

              {/* Text side */}
              <div className={`flex-1 flex flex-col justify-center py-16 lg:py-20 ${lang === "ar" ? "lg:pl-16 order-2 lg:order-1" : "lg:pr-16 order-2 lg:order-2"}`}>
                <div className="inline-flex mb-6">
                  <span style={{ background: "#6BAE45", color: "#fff" }} className="text-sm font-semibold rounded-full px-4 py-1.5 tracking-wide">
                    {t(lang, "hero.badge")}
                  </span>
                </div>

                {lang === "ar" ? (
                  <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold leading-snug mb-6" style={{ color: "#1A4D2E" }}>
                    شهادة الامتثال للمعايير
                    <br />
                    <span style={{ color: "#6BAE45" }}>البيئية والاجتماعية</span>
                    <br />
                    والحوكمة
                    <span className="font-mono mr-2 text-xl lg:text-2xl" style={{ color: "#C9A84C" }}>(ESG)</span>
                  </h1>
                ) : (
                  <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold leading-snug mb-6" style={{ color: "#1A4D2E" }}>
                    Compliance Certificate for<br />
                    <span style={{ color: "#6BAE45" }}>Environmental, Social &</span><br />
                    Governance Standards
                    <span className="font-mono ml-2 text-xl lg:text-2xl" style={{ color: "#C9A84C" }}>(ESG)</span>
                  </h1>
                )}

                <p className="text-lg text-gray-600 leading-relaxed mb-10 max-w-xl">{t(lang, "hero.desc")}</p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/sign-up">
                    <Button size="lg" style={{ background: "#1A4D2E" }} className="hover:opacity-90 text-white h-14 px-8 text-base w-full sm:w-auto">
                      {lang === "ar" && <ArrowLeft className="mr-2 w-5 h-5" />}
                      {t(lang, "hero.cta.apply")}
                      {lang === "en" && <ArrowLeft className="ml-2 w-5 h-5 rotate-180" />}
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" onClick={scrollToVerify}
                    style={{ borderColor: "#1A4D2E", color: "#1A4D2E" }}
                    className="bg-white/70 hover:bg-white h-14 px-8 text-base w-full sm:w-auto">
                    <Search className="w-5 h-5" style={{ marginLeft: lang === "ar" ? "0" : "0.5rem", marginRight: lang === "ar" ? "0.5rem" : "0" }} />
                    {t(lang, "hero.cta.verify")}
                  </Button>
                </div>
              </div>

              {/* Image side */}
              <div className={`flex-1 order-1 ${lang === "ar" ? "lg:order-2" : "lg:order-1"} relative min-h-[300px] lg:min-h-0`}>
                <img
                  src={`${BASE}hero-riyadh.png`}
                  alt="أبراج مدينة الرياض - المملكة العربية السعودية"
                  className="w-full h-full object-cover lg:absolute inset-0"
                  style={{ borderRadius: lang === "ar" ? "0 0 0 3rem" : "0 0 3rem 0", objectPosition: "center center" }}
                />
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to left, rgba(0,0,0,0.08), transparent)", borderRadius: lang === "ar" ? "0 0 0 3rem" : "0 0 3rem 0" }}></div>
                <div className={`absolute bottom-8 ${lang === "ar" ? "right-8" : "left-8"} bg-white rounded-2xl shadow-xl px-6 py-4 flex items-center gap-3`}>
                  <div style={{ background: "#EAF5E4" }} className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck style={{ color: "#1A4D2E" }} className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "#1A4D2E" }}>{t(lang, "hero.badge.trusted")}</p>
                    <p className="text-xs text-gray-500">{t(lang, "hero.badge.platform")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ TRUST BAR ═══════════════ */}
        <section className="bg-white border-b border-gray-100 py-8">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-6 text-center max-w-2xl mx-auto">
              {[
                { num: t(lang, "trust.pillars.num"), label: t(lang, "trust.pillars.label"), sub: t(lang, "trust.pillars.sub"), gold: false },
                { num: t(lang, "trust.stages.num"), label: t(lang, "trust.stages.label"), sub: t(lang, "trust.stages.sub"), gold: false },
              ].map((item, i) => (
                <div key={i} className={`px-4 ${i < 1 ? (lang === "ar" ? "border-l" : "border-r") + " border-gray-100" : ""}`}>
                  <p className="text-xl sm:text-3xl font-bold mb-1" style={{ color: item.gold ? "#C9A84C" : "#1A4D2E" }}>{item.num}</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-0.5">{item.label}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ ABOUT ═══════════════ */}
        <section className="py-24" style={{ background: "#F8FCF6" }}>
          <div className="container mx-auto px-6">
            <div className={`flex flex-col lg:flex-row items-center gap-16 ${lang === "en" ? "lg:flex-row-reverse" : ""}`}>
              <div className="flex-1 relative">
                <img
                  src={`${BASE}about-sustainability.png`}
                  alt="الاستدامة والامتثال البيئي والاجتماعي"
                  className="w-full h-80 lg:h-[480px] object-cover rounded-3xl shadow-lg"
                />
                <div className={`absolute -bottom-6 ${lang === "ar" ? "-left-6" : "-right-6"} bg-white rounded-2xl shadow-xl p-5 items-center gap-4 hidden lg:flex`}>
                  <div style={{ background: "#EAF5E4" }} className="w-14 h-14 rounded-xl flex items-center justify-center">
                    <Award style={{ color: "#6BAE45" }} className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: "#1A4D2E" }}>{t(lang, "about.floatTitle")}</p>
                    <p className="text-sm text-gray-500">{t(lang, "about.floatSub")}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <span style={{ color: "#6BAE45" }} className="text-sm font-bold uppercase tracking-widest">{t(lang, "about.tag")}</span>
                  <h2 className="text-3xl lg:text-4xl font-bold mt-2 mb-4 leading-tight" style={{ color: "#1A4D2E" }}>{t(lang, "about.title")}</h2>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">{t(lang, "about.p1")}</p>
                <p className="text-gray-600 leading-relaxed">{t(lang, "about.p2")}</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {["tag.env", "tag.gov", "tag.social", "tag.halal"].map((k) => (
                    <span key={k} style={{ background: "#EAF5E4", color: "#1A4D2E" }} className="px-4 py-1.5 rounded-full text-sm font-medium">
                      {t(lang, k)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ ESG PILLARS ═══════════════ */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-14">
              <span style={{ color: "#6BAE45" }} className="text-sm font-bold uppercase tracking-widest">{t(lang, "pillars.tag")}</span>
              <h2 className="text-3xl lg:text-4xl font-bold mt-2" style={{ color: "#1A4D2E" }}>{t(lang, "pillars.title")}</h2>
              <div className="w-16 h-1 mx-auto mt-4 rounded-full" style={{ background: "#C9A84C" }}></div>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              {[
                { letter: "E", titleKey: "pillar.e.title", subKey: "pillar.e.sub", icon: <Leaf className="w-7 h-7" />, color: "#6BAE45", itemKeys: ["pillar.e.i1","pillar.e.i2","pillar.e.i3"], img: `${BASE}environmental-pillar.jpg` },
                { letter: "S", titleKey: "pillar.s.title", subKey: "pillar.s.sub", icon: <Users className="w-7 h-7" />, color: "#1A4D2E", itemKeys: ["pillar.s.i1","pillar.s.i2","pillar.s.i3"], img: `${BASE}social-pillar-new.png` },
                { letter: "G", titleKey: "pillar.g.title", subKey: "pillar.g.sub", icon: <Scale className="w-7 h-7" />, color: "#C9A84C", itemKeys: ["pillar.g.i1","pillar.g.i2","pillar.g.i3"], img: `${BASE}governance-pillar.jpg` },
              ].map((p) => (
                <div key={p.letter} className="rounded-3xl overflow-hidden shadow-md border border-gray-100 flex flex-col hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-44 overflow-hidden">
                    <img src={p.img} alt={t(lang, p.titleKey)} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${p.color}ee 0%, transparent 60%)` }}></div>
                    <div className={`absolute bottom-4 ${lang === "ar" ? "right-4" : "left-4"} flex items-baseline gap-2`}>
                      <span className="text-5xl font-black text-white/30">{p.letter}</span>
                      <span className="text-xl font-bold text-white">{t(lang, p.titleKey)}</span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">{t(lang, p.subKey)}</p>
                    <ul className="space-y-3 flex-1">
                      {p.itemKeys.map((k) => (
                        <li key={k} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color }}></div>
                          <span className="text-sm text-gray-700">{t(lang, k)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ WHY / WHO ═══════════════ */}
        <section className="py-24" style={{ background: "#EAF5E4" }}>
          <div className="container mx-auto px-6">
            {/* Section divider top */}
            <div className="flex items-center gap-4 mb-16">
              <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, #6BAE45, transparent)" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#6BAE45" }} />
              <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, #6BAE45, transparent)" }} />
            </div>

            <div className={`grid lg:grid-cols-2 gap-12 items-stretch ${lang === "en" ? "" : ""}`}>
              {/* WHY column */}
              <div className="bg-white rounded-3xl shadow-sm border border-green-100 p-10 flex flex-col">
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: "#EAF5E4", color: "#6BAE45" }}>{t(lang, "why.tag")}</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold mb-8 leading-snug" style={{ color: "#1A4D2E" }}>{t(lang, "why.title")}</h2>
                <div className="space-y-5 flex-1">
                  {["why.i1","why.i2","why.i3","why.i4","why.i5"].map((k) => (
                    <div key={k} className="flex items-start gap-4 group">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm transition-transform group-hover:scale-110"
                        style={{ background: "#1A4D2E" }}>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 leading-relaxed pt-1">{t(lang, k)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* WHO column */}
              <div className="flex flex-col">
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: "#EAF5E4", color: "#6BAE45" }}>{t(lang, "who.tag")}</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold mb-8 leading-snug" style={{ color: "#1A4D2E" }}>{t(lang, "who.title")}</h2>
                <div className="grid sm:grid-cols-2 gap-4 flex-1">
                  {[
                    { icon: <Building2 className="w-6 h-6" />, titleKey: "who.c1.title", descKey: "who.c1.desc" },
                    { icon: <Target className="w-6 h-6" />, titleKey: "who.c2.title", descKey: "who.c2.desc" },
                    { icon: <TrendingUp className="w-6 h-6" />, titleKey: "who.c3.title", descKey: "who.c3.desc" },
                    { icon: <Award className="w-6 h-6" />, titleKey: "who.c4.title", descKey: "who.c4.desc" },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border-2 border-green-100 hover:border-green-300 hover:shadow-md transition-all duration-300 flex flex-col gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: "#EAF5E4" }}>
                        <span style={{ color: "#1A4D2E" }}>{item.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-base mb-1" style={{ color: "#1A4D2E" }}>{t(lang, item.titleKey)}</p>
                        <p className="text-sm text-gray-500 leading-relaxed">{t(lang, item.descKey)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ STEPS ═══════════════ */}
        <section className="py-24" style={{ background: "#F0F9EB" }}>
          <div className="container mx-auto px-6 max-w-6xl">
            {/* Header */}
            <div className="text-center mb-16">
              <span className="text-xs font-bold tracking-widest px-4 py-1.5 rounded-full border" style={{ background: "#fff", color: "#1A4D2E", borderColor: "#1A4D2E33" }}>{t(lang, "steps.tag")}</span>
              <h2 className="text-3xl lg:text-4xl font-bold mt-5 mb-3" style={{ color: "#1A4D2E" }}>{t(lang, "steps.title")}</h2>
              <div className="w-14 h-[3px] mx-auto rounded-full" style={{ background: "#C9A84C" }} />
            </div>

            {/* Desktop: horizontal timeline */}
            {(() => {
              const stepsData = [
                { n: 1, titleKey: "steps.s1.title", descKey: "steps.s1.desc", icon: <ClipboardList className="w-7 h-7" /> },
                { n: 2, titleKey: "steps.s2.title", descKey: "steps.s2.desc", icon: <ScanSearch className="w-7 h-7" /> },
                { n: 3, titleKey: "steps.s3.title", descKey: "steps.s3.desc", icon: <BadgeCheck className="w-7 h-7" /> },
              ];
              return (
                <>
                  {/* Desktop */}
                  <div className="hidden lg:block">
                    {/* Timeline row — dir inherited from parent, flex flows RTL in Arabic, LTR in English */}
                    <div className="relative flex items-center justify-between mb-8 px-8">
                      {/* Connecting line */}
                      <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-[2px] z-0" style={{ background: "#1A4D2E26" }} />
                      {stepsData.map((step) => (
                        <div key={step.n} className="relative z-10 flex flex-col items-center gap-2 group">
                          {/* Circle */}
                          <div
                            className="w-[88px] h-[88px] rounded-full flex items-center justify-center border-2 bg-white shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105"
                            style={{ borderColor: "#1A4D2E" }}
                          >
                            <span style={{ color: "#1A4D2E" }}>{step.icon}</span>
                          </div>
                          {/* Step number badge */}
                          <span className="text-xs font-black tabular-nums" style={{ color: "#C9A84C" }}>
                            {String(step.n).padStart(2, "0")}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Cards row — same direction as timeline, aligned with circles above */}
                    <div className="grid grid-cols-3 gap-6 px-8">
                      {stepsData.map((step) => (
                        <div
                          key={step.n}
                          className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md hover:border-green-200 transition-all duration-300 text-center"
                        >
                          <h4 className="font-bold text-base mb-2 leading-snug" style={{ color: "#1A4D2E" }}>{t(lang, step.titleKey)}</h4>
                          <p className="text-gray-500 text-sm leading-relaxed">{t(lang, step.descKey)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mobile: vertical — dir on each row handles RTL/LTR */}
                  <div className="lg:hidden relative">
                    {/* Vertical connector — inline-start so it respects RTL */}
                    <div className="absolute top-0 bottom-0 w-[2px] z-0" style={{ background: "#1A4D2E26", insetInlineStart: "27px" }} />
                    <div className="space-y-6">
                      {stepsData.map((step) => (
                        <div key={step.n} className="flex items-start gap-4 relative z-10">
                          {/* Circle */}
                          <div
                            className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center bg-white border-2 shadow-sm"
                            style={{ borderColor: "#1A4D2E" }}
                          >
                            <span style={{ color: "#1A4D2E" }}>{step.icon}</span>
                          </div>
                          {/* Card */}
                          <div className="flex-1 bg-white rounded-2xl p-4 border border-green-100 shadow-sm">
                            <span className="text-[10px] font-black" style={{ color: "#C9A84C" }}>{String(step.n).padStart(2, "0")}</span>
                            <h4 className="font-bold text-sm mt-0.5 mb-1" style={{ color: "#1A4D2E" }}>{t(lang, step.titleKey)}</h4>
                            <p className="text-gray-400 text-xs leading-relaxed">{t(lang, step.descKey)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </section>

        {/* ═══════════════ VERIFY ═══════════════ */}
        <section id="verify-section" className="py-24 bg-white border-t border-gray-100">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-12">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "#EAF5E4" }}>
                <ShieldCheck className="w-8 h-8" style={{ color: "#1A4D2E" }} />
              </div>
              <span style={{ color: "#6BAE45" }} className="text-sm font-bold uppercase tracking-widest">{t(lang, "verify.tag")}</span>
              <h2 className="text-3xl lg:text-4xl font-bold mt-2 mb-3" style={{ color: "#1A4D2E" }}>{t(lang, "verify.title")}</h2>
              <p className="text-gray-500">{t(lang, "verify.desc")}</p>
            </div>

            <div className="bg-gray-50 rounded-3xl border border-gray-100 p-8 md:p-12 shadow-sm">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-10" dir="ltr">
                <Input
                  placeholder={t(lang, "verify.placeholder")}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-13 text-base bg-white border-gray-200 rounded-xl flex-1"
                  dir="ltr"
                />
                <Button type="submit" style={{ background: "#1A4D2E" }} className="h-13 px-8 text-white rounded-xl hover:opacity-90 shrink-0">
                  <Search className="w-4 h-4 ml-2" />
                  {t(lang, "verify.btn")}
                </Button>
              </form>

              {isLoading && idParam && (
                <div className="flex flex-col items-center py-10 gap-3">
                  <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: "#1A4D2E", borderTopColor: "transparent" }}></div>
                  <p className="text-sm text-gray-500">{t(lang, "verify.loading")}</p>
                </div>
              )}

              {isError && idParam && (
                <div className="text-center py-10 space-y-3">
                  <XCircle className="w-14 h-14 text-red-400 mx-auto" />
                  <h3 className="text-xl font-bold text-red-500">{t(lang, "verify.notFound.title")}</h3>
                  <p className="text-gray-500 max-w-md mx-auto text-sm">
                    {t(lang, "verify.notFound.desc")} <strong className="font-mono">{idParam}</strong>. {t(lang, "verify.notFound.hint")}
                  </p>
                </div>
              )}

              {certificate && !isLoading && !isError && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <Card className={`border-2 ${getStatusConfig(certificate.status).border} ${getStatusConfig(certificate.status).bg} overflow-hidden`}>
                    <CardContent className="p-8 text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="bg-white p-4 rounded-full shadow-sm">{getStatusConfig(certificate.status).icon}</div>
                      </div>
                      {getStatusConfig(certificate.status).badge}
                      <h2 className="text-2xl font-bold font-mono text-foreground" dir="ltr">{certificate.certificateId}</h2>
                      <p className="text-base text-gray-600">{certificate.verificationMessage || t(lang, "verify.official")}</p>
                      <Link href={`/certificate?id=${encodeURIComponent(certificate.certificateId)}`}>
                        <Button size="lg" style={{ background: "#1A4D2E" }} className="text-white mt-2 h-12 px-8 rounded-xl hover:opacity-90">
                          {t(lang, "cert.viewFull")}
                          {lang === "ar" ? <ArrowLeft className="mr-2 w-5 h-5" /> : <ArrowLeft className="ml-2 w-5 h-5 rotate-180" />}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-5">
                    <Card className="shadow-sm border-gray-100 rounded-2xl">
                      <CardContent className="p-6 space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">{t(lang, "verify.details.company")}</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Building2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                            <div><p className="text-xs text-gray-400">{t(lang, "verify.field.company")}</p><p className="font-semibold">{certificate.companyName}</p></div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Building2 className="w-4 h-4 text-primary mt-1 shrink-0 opacity-60" />
                            <div><p className="text-xs text-gray-400">{t(lang, "verify.field.site")}</p><p className="font-medium text-sm">{certificate.siteName}</p></div>
                          </div>
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-primary mt-1 shrink-0" />
                            <div><p className="text-xs text-gray-400">{t(lang, "verify.field.address")}</p><p className="font-medium text-sm">{certificate.location}</p></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border-gray-100 rounded-2xl">
                      <CardContent className="p-6 space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">{t(lang, "verify.details.validity")}</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <CalendarDays className="w-4 h-4 text-primary mt-1 shrink-0" />
                            <div className="flex gap-6">
                              <div><p className="text-xs text-gray-400">{t(lang, "verify.field.issued")}</p><p className="font-medium text-sm" dir="ltr">{format(new Date(certificate.issueDate), "MMMM d, yyyy")}</p></div>
                              <div><p className="text-xs text-gray-400">{t(lang, "verify.field.expiry")}</p><p className="font-medium text-sm" dir="ltr">{format(new Date(certificate.expiryDate), "MMMM d, yyyy")}</p></div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Award className="w-4 h-4 text-primary mt-1 shrink-0" />
                            <div><p className="text-xs text-gray-400">{t(lang, "verify.field.accreditor")}</p><p className="font-bold text-primary">شركة تطوير منتجات الحلال (HPDC)</p><p className="text-sm text-gray-500 mt-0.5">HALAL PRODUCTS DEVELOPMENT COMPANY</p></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border-gray-100 rounded-2xl md:col-span-2">
                      <CardContent className="p-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2 mb-4">{t(lang, "verify.details.scope")}</h3>
                        <p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap">{certificate.scopeStatement}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}
