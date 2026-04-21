import { useState } from "react";
import { Layout } from "@/components/layout";
import { Leaf, Users, Scale, Target, Award, RefreshCw, CheckCircle2, ChevronLeft, ChevronRight, Star, X, Sparkles, Globe2, ShieldCheck, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { t, tArr } from "@/lib/translations";
import goldBadgeImg from "@/assets/gold-badge.png";

const BASE = import.meta.env.BASE_URL;

/* ────────────────────────────────────────────────────────────
   Reusable: Bullet list
──────────────────────────────────────────────────────────── */
function BulletList({ items, color }: { items: string[]; color: string }) {
  return (
    <ul className="space-y-2.5 mt-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color }} />
          <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ────────────────────────────────────────────────────────────
   Pillar block — alternating image / text layout
──────────────────────────────────────────────────────────── */
interface PillarProps {
  letter: string;
  color: string;
  icon: React.ReactNode;
  titleKey: string;
  introKey: string;
  itemsKey: string;
  closingKey: string;
  image: string;
  imageAlt: string;
  flip?: boolean;
  dir: "rtl" | "ltr";
}

function PillarBlock({ letter, color, icon, titleKey, introKey, itemsKey, closingKey, image, imageAlt, flip, dir }: PillarProps) {
  const { lang } = useLanguage();

  /* In RTL, "flip" means image on the left (which in RTL is visually right) */
  const imgFirst = dir === "rtl" ? !flip : flip;

  return (
    <div className={`flex flex-col ${imgFirst ? "lg:flex-row-reverse" : "lg:flex-row"} gap-0 rounded-3xl overflow-hidden shadow-md border border-gray-100 bg-white`}>
      {/* Image */}
      <div className="lg:w-2/5 xl:w-[45%] relative flex-shrink-0">
        <img
          src={`${BASE}${image}`}
          alt={imageAlt}
          className="w-full h-64 lg:h-full object-cover"
        />
        {/* Letter overlay */}
        <div
          className="absolute bottom-4 start-4 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: color }}
        >
          <span className="text-2xl font-black text-white">{letter}</span>
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 p-7 lg:p-10 flex flex-col justify-center" dir={dir}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
            <span style={{ color }}>{icon}</span>
          </div>
          <h3 className="text-xl font-bold" style={{ color: "#1A4D2E" }}>{t(lang, titleKey)}</h3>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed mb-1">{t(lang, introKey)}</p>
        <BulletList items={tArr(lang, itemsKey)} color={color} />
        <div className="mt-5 pt-5 border-t border-dashed border-gray-200">
          <p className="text-sm font-semibold leading-relaxed" style={{ color }}>{t(lang, closingKey)}</p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main Page
──────────────────────────────────────────────────────────── */
export default function AboutPage() {
  const { lang, dir } = useLanguage();

  const pillars = [
    {
      letter: "E",
      color: "#6BAE45",
      icon: <Leaf className="w-5 h-5" />,
      titleKey: "aboutPage.pillar.e.title",
      introKey: "aboutPage.pillar.e.intro",
      itemsKey: "aboutPage.pillar.e.items",
      closingKey: "aboutPage.pillar.e.closing",
      image: "esg-environmental.png",
      imageAlt: "Environmental Responsibility",
      flip: false,
    },
    {
      letter: "S",
      color: "#1A4D2E",
      icon: <Users className="w-5 h-5" />,
      titleKey: "aboutPage.pillar.s.title",
      introKey: "aboutPage.pillar.s.intro",
      itemsKey: "aboutPage.pillar.s.items",
      closingKey: "aboutPage.pillar.s.closing",
      image: "esg-social.png",
      imageAlt: "Social Responsibility",
      flip: true,
    },
    {
      letter: "G",
      color: "#C9A84C",
      icon: <Scale className="w-5 h-5" />,
      titleKey: "aboutPage.pillar.g.title",
      introKey: "aboutPage.pillar.g.intro",
      itemsKey: "aboutPage.pillar.g.items",
      closingKey: "aboutPage.pillar.g.closing",
      image: "esg-governance.png",
      imageAlt: "Corporate Governance",
      flip: false,
    },
  ];

  const objectives = tArr(lang, "aboutPage.objectives.items");
  const [goldModalOpen, setGoldModalOpen] = useState(false);

  return (
    <Layout>
      {/* ── Hero with background image ── */}
      <section className="relative min-h-[420px] flex items-center overflow-hidden">
        <img
          src={`${BASE}esg-hero.png`}
          alt="ESG Certification"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1A4D2Eee 60%, #1A4D2E99)" }} />
        <div className="relative z-10 container mx-auto px-6 py-20 max-w-3xl text-center" dir={dir}>
          <span
            className="inline-block text-xs font-bold tracking-widest px-4 py-1.5 rounded-full mb-6"
            style={{ background: "#C9A84C22", color: "#C9A84C", border: "1px solid #C9A84C66" }}
          >
            HPDC
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {t(lang, "aboutPage.hero.title")}
          </h1>
          <div className="w-16 h-[3px] mx-auto mb-6 rounded-full" style={{ background: "#C9A84C" }} />
          <p className="text-lg text-white/80 leading-relaxed">{t(lang, "aboutPage.hero.sub")}</p>
        </div>
      </section>

      {/* ── Intro: featured definition + 3 concept cards ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl" dir={dir}>
          {/* Featured definition card (p1) */}
          <div className="relative rounded-3xl overflow-hidden mb-10 shadow-sm border border-green-100">
            <div
              className="absolute inset-0 opacity-95"
              style={{ background: "linear-gradient(135deg, #1A4D2E 0%, #2D6E45 100%)" }}
            />
            <div className="absolute top-0 end-0 w-64 h-64 rounded-full -translate-y-1/3 translate-x-1/3"
                 style={{ background: "#C9A84C", opacity: 0.08 }} />
            <div className="relative z-10 p-8 md:p-12 grid md:grid-cols-[auto_1fr] gap-6 items-start">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "#C9A84C22", border: "1px solid #C9A84C66" }}
              >
                <Sparkles className="w-8 h-8" style={{ color: "#C9A84C" }} />
              </div>
              <div>
                <span className="inline-block text-[11px] font-bold tracking-widest px-3 py-1 rounded-full mb-3"
                      style={{ background: "#C9A84C22", color: "#C9A84C", border: "1px solid #C9A84C66" }}>
                  {lang === "ar" ? "تعريف الشهادة" : "Definition"}
                </span>
                <p className="text-white text-lg md:text-xl font-medium leading-relaxed">
                  {t(lang, "aboutPage.intro.p1")}
                </p>
              </div>
            </div>
          </div>

          {/* Three concept cards (p2, p3, p4) */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { textKey: "aboutPage.intro.p2", icon: <Globe2 className="w-6 h-6" />, label: lang === "ar" ? "الإطار" : "Framework", color: "#6BAE45" },
              { textKey: "aboutPage.intro.p3", icon: <TrendingUp className="w-6 h-6" />, label: lang === "ar" ? "الأهمية" : "Importance", color: "#1A4D2E" },
              { textKey: "aboutPage.intro.p4", icon: <ShieldCheck className="w-6 h-6" />, label: lang === "ar" ? "الإثبات" : "Assurance", color: "#C9A84C" },
            ].map((card, i) => (
              <div
                key={i}
                className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${card.color}15`, color: card.color }}
                >
                  {card.icon}
                </div>
                <span className="text-[11px] font-bold tracking-widest uppercase block mb-2" style={{ color: card.color }}>
                  {card.label}
                </span>
                <p className="text-gray-600 leading-relaxed text-sm">{t(lang, card.textKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Three Pillars label ── */}
      <div className="py-10" style={{ background: "#F0F9EB" }}>
        <div className="container mx-auto px-6 max-w-4xl" dir={dir}>
          <div className="flex items-center gap-4 mb-2">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1A4D2E" }}>
              <Target className="w-4 h-4 text-white" />
            </span>
            <h2 className="text-2xl lg:text-3xl font-bold" style={{ color: "#1A4D2E" }}>
              {t(lang, "aboutPage.pillars.title")}
            </h2>
          </div>
          <div className="w-14 h-[3px] rounded-full ms-12 mb-3" style={{ background: "#C9A84C" }} />
          <p className="text-gray-500 ms-12">{t(lang, "aboutPage.pillars.sub")}</p>
        </div>
      </div>

      {/* ── Pillar blocks ── */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-6 max-w-5xl space-y-8">
          {pillars.map((p) => (
            <PillarBlock key={p.letter} {...p} dir={dir as "rtl" | "ltr"} />
          ))}
        </div>
      </section>

      {/* ── Objectives + Value (two-column) ── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-5xl" dir={dir}>
          <div className="grid lg:grid-cols-2 gap-8">

            {/* Objectives */}
            <div className="rounded-3xl border border-gray-100 shadow-sm p-8 bg-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#C9A84C18" }}>
                  <Target className="w-5 h-5" style={{ color: "#C9A84C" }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: "#1A4D2E" }}>
                  {t(lang, "aboutPage.objectives.title")}
                </h2>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{t(lang, "aboutPage.objectives.intro")}</p>
              <ul className="space-y-3">
                {objectives.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold text-white"
                      style={{ background: "#C9A84C" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}

                {/* Gold Badge — special item */}
                <li className="flex items-start gap-2.5">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold text-white"
                    style={{ background: "#C9A84C" }}
                  >
                    {objectives.length + 1}
                  </span>
                  <span className="text-gray-600 text-sm leading-relaxed">
                    {lang === "ar" ? "الحصول على " : "Achieve the "}
                    <button
                      onClick={() => setGoldModalOpen(true)}
                      className="inline-flex items-center gap-1.5 font-black underline decoration-dotted underline-offset-2 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ color: "#C9A84C", fontSize: "1.05rem" }}
                    >
                      <img src={goldBadgeImg} alt="Gold Badge" className="w-6 h-6 object-contain drop-shadow-sm" />
                      {lang === "ar" ? "العلامة الذهبية" : "Gold Badge"}
                    </button>
                  </span>
                </li>
              </ul>
            </div>

            {/* Value & Recognition (image + text stacked) */}
            <div className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden bg-white">
              <img
                src={`${BASE}esg-value.png`}
                alt="Certification Value"
                className="w-full h-44 object-cover"
              />
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#1A4D2E18" }}>
                    <Award className="w-5 h-5" style={{ color: "#1A4D2E" }} />
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: "#1A4D2E" }}>
                    {t(lang, "aboutPage.value.title")}
                  </h2>
                </div>
                <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
                  <p>{t(lang, "aboutPage.value.p1")}</p>
                  <p>{t(lang, "aboutPage.value.p2")}</p>
                  <p>{t(lang, "aboutPage.value.p3")}</p>
                  <p>{t(lang, "aboutPage.value.p4")}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Continuous Improvement ── */}
      <section className="py-20 relative overflow-hidden" style={{ background: "#1A4D2E" }}>
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #C9A84C 0%, transparent 40%), radial-gradient(circle at 80% 80%, #6BAE45 0%, transparent 45%)",
          }}
        />
        <div className="container mx-auto px-6 max-w-5xl relative" dir={dir}>
          {/* Heading */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full mb-5" style={{ background: "#ffffff15", border: "1px solid #ffffff25" }}>
              <RefreshCw className="w-4 h-4" style={{ color: "#C9A84C" }} />
              <span className="text-sm font-semibold tracking-wide text-white/90">
                {t(lang, "aboutPage.continuous.title")}
              </span>
            </div>
            <div className="w-16 h-[3px] rounded-full mx-auto" style={{ background: "#C9A84C" }} />
          </div>

          {/* Unified card */}
          <div
            className="rounded-3xl shadow-2xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #ffffff12 0%, #ffffff05 100%)",
              border: "1px solid #ffffff22",
              backdropFilter: "blur(8px)",
            }}
          >
            {/* Main statement */}
            <div className="p-8 md:p-10">
              <p className="text-white text-base md:text-lg leading-loose">
                {t(lang, "aboutPage.continuous.p1")}
              </p>
            </div>

            {/* Divider */}
            <div className="h-px mx-8 md:mx-10" style={{ background: "linear-gradient(90deg, transparent, #C9A84C55, transparent)" }} />

            {/* Outcome callout */}
            <div
              className="px-8 md:px-10 py-6 flex items-start gap-4"
              style={{ background: "linear-gradient(135deg, #C9A84C18 0%, transparent 100%)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#C9A84C", boxShadow: "0 6px 18px rgba(201,168,76,0.35)" }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <p className="text-white/95 leading-relaxed text-[15px] md:text-base pt-1.5">
                {t(lang, "aboutPage.continuous.p2")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gold Badge Modal ── */}
      {goldModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => setGoldModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            style={{ background: "#fff" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 flex items-center gap-3" style={{ background: "linear-gradient(135deg, #C9A84C 0%, #a07c30 100%)" }}>
              <img src={goldBadgeImg} alt="Gold Badge" className="w-12 h-12 object-contain drop-shadow-md flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-lg font-black text-white">
                  {lang === "ar" ? "العلامة الذهبية" : "Gold Badge"}
                </h2>
                <p className="text-white/70 text-xs">
                  {lang === "ar" ? "HPDC ESG — أعلى مستويات الاعتماد" : "HPDC ESG — Highest Certification Tier"}
                </p>
              </div>
              <button
                onClick={() => setGoldModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]" dir={lang === "ar" ? "rtl" : "ltr"}>

              {/* Badge showcase */}
              <div className="flex flex-col items-center gap-3 py-4 rounded-2xl" style={{ background: "linear-gradient(135deg, #C9A84C08, #C9A84C18)" }}>
                <img src={goldBadgeImg} alt="Gold Badge" className="w-24 h-24 object-contain drop-shadow-lg" />
                <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#C9A84C" }}>
                  {lang === "ar" ? "علامة حلال العالمية الممتثلة للمعايير البيئية والاجتماعية والحوكمة" : "Global Halal Mark Compliant with ESG Standards"}
                </p>
              </div>

              {/* Intro */}
              <p className="text-sm text-gray-600 leading-relaxed border-s-4 ps-4 py-1" style={{ borderColor: "#C9A84C", background: "#C9A84C08" }}>
                {lang === "ar"
                  ? "تتجاوز علامة حلال العالمية الممتثلة للمعايير البيئية والاجتماعية والحوكمة حدود الامتثال: فهي تمثّل تحوّلاً نحو معيار \"الحلال الطيّب\" كمرجعية عالمية، إذ لا تكون المنتجات مباحة فحسب، بل أخلاقية ومستدامة ومسؤولة."
                  : "The Global Halal Mark Compliant with ESG Standards goes beyond compliance: it represents a shift toward \"Halal Tayib\" as a global benchmark, where products are not only permissible, but also ethical, sustainable, and responsible."}
              </p>

              {/* Section 1 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "#C9A84C" }}>1</span>
                  <h3 className="font-black text-sm" style={{ color: "#1A4D2E" }}>
                    {lang === "ar" ? "عن علامة حلال العالمية الممتثلة للمعايير البيئية والاجتماعية والحوكمة" : "About the Global Halal Mark Compliant with ESG Standards"}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed ps-8">
                  {lang === "ar"
                    ? "تمثّل علامة حلال العالمية الممتثلة للمعايير البيئية والاجتماعية والحوكمة معياراً متميزاً للتميز يدمج مبادئ الحلال (الطيّب) مع معايير البيئة والمجتمع والحوكمة (ESG). وتعكس التزاماً بالإنتاج الأخلاقي والمستدام وعالي الجودة، مما يُرسّخ مكانة المنتجات المعتمدة بوصفها منتجات موثوقة ومسؤولة ومستعدة للمستقبل في الأسواق المحلية والعالمية."
                    : "The Global Halal Mark Compliant with ESG Standards represents a premium standard of excellence that integrates Halal (Tayib) principles with Environmental, Social, and Governance (ESG) standards. It reflects a commitment to ethical, sustainable, and high-quality production, positioning certified products as trusted, responsible, and future-ready in both local and global markets."}
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "#C9A84C" }}>2</span>
                  <h3 className="font-black text-sm" style={{ color: "#1A4D2E" }}>
                    {lang === "ar" ? "فوائد علامة حلال العالمية الممتثلة للمعايير البيئية والاجتماعية والحوكمة" : "Benefits of the Global Halal Mark Compliant with ESG Standards"}
                  </h3>
                </div>
                <ul className="space-y-2 ps-8">
                  {(lang === "ar" ? [
                    "التوافق مع اتجاهات الاستثمار العالمية: تعزيز الجاذبية للمستثمرين وأصحاب المصلحة المهتمين بالاستدامة.",
                    "علامة واحدة تدمج معايير الحلال مع معايير الاستدامة (ESG).",
                    "دعم مبادرة وطنية: المساهمة في مبادرة سعودية صادرة عن هيئة الغذاء والدواء السعودية وممكَّنة من HPDC.",
                    "تعزيز الاستعداد للتصدير: تقوية إمكانية الوصول والتنافسية في أسواق دول الخليج والأسواق العالمية.",
                    "بناء ثقة المستهلك وقيمة العلامة التجارية: استهداف المستهلكين المسلمين وغير المسلمين الباحثين عن منتجات تحقق أهداف الاستدامة.",
                    "المساهمة في رؤية 2030: دعم التنويع الاقتصادي المستدام وأهداف التنمية الوطنية.",
                  ] : [
                    "Align with global investment trends: Enhance attractiveness to investors and stakeholders interested in sustainability.",
                    "A single mark that integrates Halal standards with Sustainability (ESG) standards.",
                    "Support a national initiative: Contribute to a Saudi-led initiative issued by the SFDA and enabled by HPDC.",
                    "Enhance export readiness: Strengthen access and competitiveness in GCC and global markets.",
                    "Build consumer trust and brand value: Appeal to both Muslim and non-Muslim consumers seeking products that achieve sustainability goals.",
                    "Contribute to Vision 2030: Support sustainability-driven economic diversification and national development goals.",
                  ]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
                      <Star className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 fill-current" style={{ color: "#C9A84C" }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 3 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "#C9A84C" }}>3</span>
                  <h3 className="font-black text-sm" style={{ color: "#1A4D2E" }}>
                    {lang === "ar" ? "الأهلية وكيفية التقديم" : "Eligibility and How to Apply"}
                  </h3>
                </div>
                <div className="ps-8 space-y-3">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {lang === "ar"
                      ? "للتأهّل للحصول على علامة حلال العالمية الممتثلة للمعايير البيئية والاجتماعية والحوكمة، يجب على المنشآت:"
                      : "To be eligible for the Global Halal Mark Compliant with ESG Standards, organizations must:"}
                  </p>
                  <div className="p-3 rounded-xl text-sm font-semibold" style={{ background: "#C9A84C12", color: "#7a5c1a" }}>
                    {lang === "ar"
                      ? "• الحصول على شهادة حلال سارية المفعول وشهادة ESG سارية المفعول."
                      : "• Hold a valid Halal certification and a valid ESG certification."}
                  </div>
                  <ol className="space-y-2">
                    {(lang === "ar" ? [
                      "إعداد الوثائق المطلوبة: (شهادة الحلال، وشهادة ESG، والمواد الداعمة)",
                      "تقديم الطلب: تقديم طلب الحصول على علامة حلال العالمية الممتثلة للمعايير البيئية والاجتماعية والحوكمة عبر مركز الحلال",
                      "المراجعة والتحقق: سيتم تقييم الوثائق المقدمة للتحقق من امتثالها لمتطلبات البرنامج",
                      "إصدار علامة حلال العالمية الممتثلة للمعايير البيئية والاجتماعية والحوكمة: عند اجتياز التحقق بنجاح، تُمنح العلامة للاستخدام وفق الإرشادات المحددة",
                    ] : [
                      "Prepare required documentation: (Halal certificate, ESG certificate, and supporting materials)",
                      "Submit application: Apply for the Global Halal Mark Compliant with ESG Standards through the Halal Center",
                      "Review and verification: The submitted documents will be assessed for compliance with the program requirements",
                      "Issuance of the Global Halal Mark Compliant with ESG Standards: Upon successful verification, the mark will be granted for use in accordance with the guidelines",
                    ]).map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5" style={{ background: "#1A4D2E" }}>{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <button
                onClick={() => setGoldModalOpen(false)}
                className="w-full py-3 rounded-2xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
                style={{ background: "#C9A84C" }}
              >
                {lang === "ar" ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
