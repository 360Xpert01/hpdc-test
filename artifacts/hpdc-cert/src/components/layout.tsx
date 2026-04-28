import { Link, useLocation } from "wouter";
import { Show, useUser, useClerk } from "@clerk/react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { LogOut, User, LayoutDashboard, Shield, Globe, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { t } from "@/lib/translations";

const BASE = import.meta.env.BASE_URL;

export function Header() {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, dir } = useLanguage();
  const { data: me } = useGetMe({
    query: { queryKey: getGetMeQueryKey(), enabled: !!user },
  });

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      onClick={() => setMobileOpen(false)}
      className={`text-sm font-semibold transition-colors pb-0.5 ${
        location === href
          ? "text-[#1A4D2E] border-b-2 border-[#C9A84C]"
          : "text-gray-600 hover:text-[#1A$4D2E]"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      {/* Main header */}
      {/*
        Layout rule:
          Arabic  → logo LEFT  (order-1), nav RIGHT (order-2)
          English → logo RIGHT (order-2), nav LEFT  (order-1)
        We force dir="ltr" on the flex row so the flex axis is always
        left→right and CSS `order` alone controls the visual position.
        Individual elements keep their own dir for text rendering.
      */}
      <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm no-print">
        <div className="container mx-auto px-4 h-20 flex items-center justify-center gap-16" dir="ltr">
          {/* ── Logo ── */}
          <div className={`flex items-center gap-3 ${lang === "ar" ? "order-1" : "order-2"}`}>
            <img src={`${BASE}hpdc-logo-transparent.png`} alt="HALAL DEVCO." className="h-14 w-auto" />
          </div>

          {/* Desktop nav */}
          <nav className={`hidden md:flex items-center gap-6 ${lang === "ar" ? "order-2" : "order-1"}`} dir={dir}>
            {navLink("/", t(lang, "nav.home"))}
            {navLink("/registry", t(lang, "nav.registry"))}
            {navLink("/about", t(lang, "nav.about"))}

            <Show when="signed-in">
              {me?.role === "admin" && (
                <Link
                  href="/admin"
                  className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                    location === "/admin" ? "text-[#1A4D2E]" : "text-gray-600 hover:text-[#1A4D2E]"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  {t(lang, "nav.admin")}
                </Link>
              )}
              <Link
                href="/dashboard"
                className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                  location === "/dashboard" ? "text-[#1A4D2E]" : "text-gray-600 hover:text-[#1A4D2E]"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {t(lang, "nav.mycerts")}
              </Link>
              <div className={`flex items-center gap-3 ${lang === "ar" ? "pl-4 border-l" : "pr-4 border-r"} border-gray-200`}>
                <span className="text-sm font-semibold text-[#1A4D2E] flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span dir="ltr">{user?.firstName || user?.primaryEmailAddress?.emailAddress}</span>
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-sm font-semibold text-gray-400 hover:text-red-600 flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t(lang, "nav.signout")}
                </button>
              </div>
            </Show>

            <Show when="signed-out">
              <Link href="/sign-in" className="text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors text-white" style={{ background: "#1A4D2E" }}>
                {t(lang, "nav.signin")}
              </Link>
            </Show>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors"
              style={{ borderColor: "#1A4D2E", color: "#1A4D2E" }}
              title={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
            >
              {lang === "ar" ? "EN" : "عربي"}
            </button>
          </nav>

          {/* Mobile controls */}
          <div className={`md:hidden flex items-center gap-3 ${lang === "ar" ? "order-2" : "order-1"}`}>
            {/* Language toggle mobile */}
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="flex items-center text-xs font-bold px-3 py-1.5 rounded-full border"
              style={{ borderColor: "#1A4D2E", color: "#1A4D2E" }}
            >
              {lang === "ar" ? "EN" : "عربي"}
            </button>
            <button className="p-2 rounded-lg text-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white" dir={dir}>
            <nav className="flex flex-col px-4 py-2">

              {/* Main nav links — each a full-width row */}
              {[
                { href: "/", label: t(lang, "nav.home") },
                { href: "/registry", label: t(lang, "nav.registry") },
                { href: "/about", label: t(lang, "nav.about") },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center py-4 text-sm font-semibold border-b border-gray-50 transition-colors ${
                    location === item.href
                      ? "text-[#1A4D2E]"
                      : "text-gray-600 hover:text-[#1A4D2E]"
                  }`}
                >
                  {location === item.href && (
                    <span className="inline-block w-1 h-5 rounded-full me-3 shrink-0" style={{ background: "#C9A84C" }} />
                  )}
                  {item.label}
                </Link>
              ))}

              {/* Signed-in extra links */}
              <Show when="signed-in">
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 py-4 text-sm font-semibold text-gray-600 hover:text-[#1A4D2E] border-b border-gray-50 transition-colors">
                  <LayoutDashboard className="w-4 h-4 shrink-0" style={{ color: "#1A4D2E" }} />
                  {t(lang, "nav.mycerts")}
                </Link>
                <button onClick={() => signOut()}
                  className="flex items-center gap-3 py-4 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors w-full">
                  <LogOut className="w-4 h-4 shrink-0" />
                  {t(lang, "nav.signout")}
                </button>
              </Show>

              {/* Sign-in button */}
              <Show when="signed-out">
                <div className="pt-4 pb-2">
                  <Link href="/sign-in" onClick={() => setMobileOpen(false)}
                    className="block text-sm font-semibold text-white text-center py-3 rounded-xl transition-opacity hover:opacity-90"
                    style={{ background: "#1A4D2E" }}>
                    {t(lang, "nav.signin")}
                  </Link>
                </div>
              </Show>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

export function Footer() {
  const { lang, isAr, dir } = useLanguage();

  return (
    <footer className="w-full mt-auto no-print" dir={dir}>
      {/* ── Main footer body ── */}
      <div style={{ background: "#EAF5E4" }} className="pt-14 pb-10">
        <div className="container mx-auto px-6">

          {/*
            Top grid — 5 columns.
            DOM order: [QuickLinks, Services, Location, Contact, Logo]
            RTL (Arabic) renders right→left so:
              DOM-first (QuickLinks) → physically RIGHT
              DOM-last  (Logo)       → physically LEFT  ✓
            LTR (English) renders left→right so:
              DOM-first (QuickLinks) → physically LEFT
              DOM-last  (Logo)       → physically RIGHT ✓
          */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 mb-12">

            {/* Col 1 — الروابط السريعة / Quick Links (rightmost in Arabic, leftmost in English) */}
            <div>
              <h4 className="font-bold text-base mb-4" style={{ color: "#1A4D2E" }}>
                {isAr ? "الروابط السريعة" : "Quick Links"}
              </h4>
              <ul className="space-y-2 text-sm" style={{ color: "#2a5a36" }}>
                {[
                  { href: "https://www.hpdc.sa/ar/management", label_ar: "فريق الإدارة", label_en: "Management Team" },
                  { href: "https://www.hpdc.sa/ar/media", label_ar: "الأخبار والإعلام", label_en: "News & Media" },
                  { href: "/verify", label_ar: "التحقق من الشهادة", label_en: "Verify Certificate" },
                  { href: "/about", label_ar: "نبذة عنا", label_en: "About Us" },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:underline">
                      {isAr ? l.label_ar : l.label_en}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 2 — الخدمات / Services */}
            <div>
              <h4 className="font-bold text-base mb-4" style={{ color: "#1A4D2E" }}>
                {isAr ? "الخدمات" : "Services"}
              </h4>
              <ul className="space-y-2 text-sm" style={{ color: "#2a5a36" }}>
                <li><a href="https://www.hpdc.sa/ar" target="_blank" rel="noopener noreferrer" className="hover:underline">{isAr ? "الاستشارات" : "Consultancy"}</a></li>
                <li><a href="https://www.hpdc.sa/ar" target="_blank" rel="noopener noreferrer" className="hover:underline">{isAr ? "الاستثمارات" : "Investments"}</a></li>
              </ul>
            </div>

            {/* Col 3 — موقعنا / Our Location */}
            <div>
              <h4 className="font-bold text-base mb-4" style={{ color: "#1A4D2E" }}>
                {isAr ? "موقعنا" : "Our Location"}
              </h4>
              <div className="text-sm leading-loose" style={{ color: "#2a5a36" }}>
                {isAr ? (
                  <>
                    <p>حي الملقا</p>
                    <p>الرياض : طريق الأمير تركي بن عبد العزيز الأول</p>
                    <p>المملكة العربية السعودية</p>
                  </>
                ) : (
                  <>
                    <p>Al Malqa District</p>
                    <p>Riyadh, Prince Turki bin Abdul Aziz Al-Awwal Road</p>
                    <p>Saudi Arabia</p>
                  </>
                )}
              </div>
            </div>

            {/* Col 4 — مركز الاتصال / Contact Center */}
            <div>
              <h4 className="font-bold text-base mb-4" style={{ color: "#1A4D2E" }}>
                {isAr ? "مركز الاتصال" : "Contact Center"}
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: "#2a5a36" }} dir="ltr">
                +966509939838
              </p>
            </div>

            {/* Col 5 — Logo (leftmost in Arabic, rightmost in English) */}
            <div className="flex flex-col items-start gap-4">
              <img src={`${BASE}hpdc-logo-transparent.png`} alt="HALAL DEVCO." className="h-16 w-auto" />
            </div>

          </div>

          {/* Divider */}
          <div className="border-t mb-10" style={{ borderColor: "#c5dfc0" }} />

          {/* Bottom grid: 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center md:text-start">

            {/* Right: PIF badge */}
            <div className="flex items-center justify-center md:justify-start">
              <img
                src={`${BASE}pif-logo.png`}
                alt={isAr ? "إحدى شركات صندوق الاستثمارات العامة" : "A PIF Company"}
                className="h-12 w-auto object-contain"
              />
            </div>

            {/* Center: Social media */}
            <div className="flex flex-col items-center gap-4">
              <h4 className="font-bold text-sm" style={{ color: "#1A4D2E" }}>
                {isAr ? "شبكات التواصل الاجتماعي" : "Social Media"}
              </h4>
              <div className="flex items-center gap-4" dir="ltr">
                {[
                  {
                    href: "https://www.instagram.com/hpdc_sa",
                    label: "Instagram",
                    icon: (
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="2" y="2" width="20" height="20" rx="5" />
                        <circle cx="12" cy="12" r="4.5" />
                        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                      </svg>
                    ),
                  },
                  {
                    href: "https://www.linkedin.com/company/hpdc-sa",
                    label: "LinkedIn",
                    icon: (
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="2" y="2" width="20" height="20" rx="4" />
                        <line x1="8" y1="11" x2="8" y2="17" />
                        <line x1="8" y1="7" x2="8" y2="8" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M12 11v6M12 14c0-1.657 1.343-3 3-3s3 1.343 3 3v3" />
                      </svg>
                    ),
                  },
                  {
                    href: "https://www.facebook.com/hpdc.sa",
                    label: "Facebook",
                    icon: (
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="2" y="2" width="20" height="20" rx="4" />
                        <path d="M15 8h-2a1 1 0 0 0-1 1v2h3l-.5 3H12v7" />
                      </svg>
                    ),
                  },
                  {
                    href: "https://twitter.com/hpdc_sa",
                    label: "X (Twitter)",
                    icon: (
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="2" y="2" width="20" height="20" rx="4" />
                        <path d="M7 17L17 7M7 7h4l3 4.5L17 7M14 17l-3-4.5" strokeLinejoin="round" />
                      </svg>
                    ),
                  },
                ].map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    style={{ color: "#1A4D2E" }}
                    className="hover:opacity-70 transition-opacity"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Left: Email */}
            <div className="flex flex-col gap-2 md:items-end">
              <h4 className="font-bold text-sm" style={{ color: "#1A4D2E" }}>
                {isAr ? "البريد الإلكتروني" : "Email"}
              </h4>
              <a href="mailto:info@hpdc.sa" dir="ltr" className="text-sm hover:underline" style={{ color: "#2a5a36" }}>
                info@hpdc.sa
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ background: "#d6ecd0" }} className="py-3">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs" style={{ color: "#2a5a36" }} dir={dir}>
          <p>
            {isAr
              ? `شركة تطوير منتجات الحلال، ${new Date().getFullYear()} جميع الحقوق محفوظة.`
              : `Halal Products Development Company. © ${new Date().getFullYear()} All rights reserved.`}
          </p>
          <div className="flex items-center gap-4">
            <a href="https://www.hpdc.sa/ar/management-policy" target="_blank" rel="noopener noreferrer" className="hover:underline">
              {isAr ? "سياسة الإدارة المتكاملة" : "Management Policy"}
            </a>
            <span style={{ color: "#a0c8a0" }}>|</span>
            <a href="https://www.hpdc.sa/ar/PrivacyPolicy" target="_blank" rel="noopener noreferrer" className="hover:underline">
              {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background font-sans">
      <Header />
      <main className="flex-1 flex flex-col w-full">{children}</main>
      <Footer />
    </div>
  );
}
