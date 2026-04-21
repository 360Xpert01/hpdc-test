export type Lang = "ar" | "en";

export const t = (lang: Lang, key: string): string => {
  const val = (translations as any)[key]?.[lang];
  return typeof val === "string" ? val : key;
};

export const tArr = (lang: Lang, key: string): string[] => {
  const val = (translations as any)[key]?.[lang];
  return Array.isArray(val) ? val : [];
};

const translations: Record<string, Record<Lang, string | string[]>> = {
  // ─── HEADER / NAV ───────────────────────────────────────────────
  "nav.home":   { ar: "الصفحة الرئيسية", en: "Home" },
  "nav.verify": { ar: "التحقق من الشهادة", en: "Verify Certificate" },
  "nav.about": { ar: "عن الشهادة", en: "About the Certificate" },
  "nav.admin": { ar: "الإدارة", en: "Admin" },
  "nav.mycerts": { ar: "شهاداتي", en: "My Certificates" },
  "nav.signin": { ar: "تسجيل الدخول", en: "Sign In" },
  "nav.signup": { ar: "حساب جديد", en: "Sign Up" },
  "nav.signout": { ar: "خروج", en: "Sign Out" },
  "topbar.company": { ar: "شركة تطوير منتجات الحلال", en: "Halal Products Development Company" },
  "topbar.platform": { ar: "منصة شهادات ESG الرسمية", en: "Official ESG Certification Platform" },

  // ─── FOOTER ─────────────────────────────────────────────────────
  "footer.desc": {
    ar: "المركز الرائد في تقييم واعتماد المنشآت الممتثلة بممارسات الاستدامة والحوكمة المؤسسية وفق معايير ESG — ضمن منظومة رؤية المملكة 2030.",
    en: "The leading center for assessing and certifying organizations committed to ESG practices — aligned with Saudi Vision 2030."
  },
  "footer.affiliatedWith": { ar: "تابع لـ", en: "Affiliated with" },
  "footer.pif": { ar: "صندوق الاستثمارات العامة", en: "Public Investment Fund" },
  "footer.quickLinks": { ar: "روابط سريعة", en: "Quick Links" },
  "footer.home": { ar: "الرئيسية", en: "Home" },
  "footer.verifyCerts": { ar: "التحقق من الشهادات", en: "Verify Certificates" },
  "footer.about": { ar: "عن الشهادة", en: "About the Certificate" },
  "footer.apply": { ar: "تقديم طلب اعتماد", en: "Apply for Certification" },
  "footer.contact": { ar: "تواصل معنا", en: "Contact Us" },
  "footer.address": { ar: "حي الملقا، الرياض، المملكة العربية السعودية", en: "Al Malqa District, Riyadh, Saudi Arabia" },
  "footer.mgmtPolicy": { ar: "سياسة الإدارة", en: "Management Policy" },
  "footer.privacy": { ar: "سياسة الخصوصية", en: "Privacy Policy" },
  "footer.copyright": { ar: "شركة تطوير منتجات الحلال (HPDC). جميع الحقوق محفوظة.", en: "Halal Products Development Company (HPDC). All rights reserved." },
  "footer.vision": { ar: "متوافق مع رؤية 2030", en: "Aligned with Vision 2030" },
  "footer.esgCert": { ar: "شهادة ESG الرسمية", en: "Official ESG Certificate" },

  // ─── HOME — HERO ─────────────────────────────────────────────────
  "hero.badge": { ar: "الإعتماد للإستدامة", en: "Sustainability Accreditation" },
  "hero.title1": { ar: "شهادة الامتثال للمعايير", en: "Compliance Certificate for" },
  "hero.title2": { ar: "البيئية والاجتماعية", en: "Environmental, Social &" },
  "hero.title3": { ar: "والحوكمة", en: "Governance Standards" },
  "hero.desc": {
    ar: "شهادة متخصصة لتقييم المنشآت الممتثلة بممارسات الاستدامة والمسؤولية والحوكمة المؤسسية — صادرة من شركة HPDC التابعة لصندوق الاستثمارات العامة.",
    en: "A specialized certificate to assess organizations committed to sustainability, responsibility and corporate governance — issued by HPDC, a PIF-owned company."
  },
  "hero.cta.apply": { ar: "قدّم طلبك الآن", en: "Apply Now" },
  "hero.cta.verify": { ar: "تحقق من الشهادة", en: "Verify Certificate" },
  "hero.badge.trusted": { ar: "شهادة موثوقة", en: "Trusted Certificate" },
  "hero.badge.platform": { ar: "منصة التحقق الرسمية", en: "Official Verification Platform" },

  // ─── HOME — TRUST BAR ─────────────────────────────────────────────
  "trust.pillars.num": { ar: "3", en: "3" },
  "trust.pillars.label": { ar: "محاور رئيسية", en: "Core Pillars" },
  "trust.pillars.sub": { ar: "البيئة · المجتمع · الحوكمة", en: "Environment · Social · Governance" },
  "trust.stages.num": { ar: "3", en: "3" },
  "trust.stages.label": { ar: "مراحل الاعتماد", en: "Certification Stages" },
  "trust.stages.sub": { ar: "التقديم · المراجعة · الإصدار", en: "Submission · Review · Issuance" },
  "trust.pif.label": { ar: "صندوق الاستثمارات العامة", en: "Public Investment Fund" },
  "trust.pif.sub": { ar: "المساهم الرئيسي", en: "Principal shareholder" },
  "trust.vision.label": { ar: "رؤية المملكة", en: "Saudi Vision" },
  "trust.vision.sub": { ar: "متوافق مع أهداف الاستدامة", en: "Aligned with sustainability goals" },

  // ─── HOME — ABOUT ─────────────────────────────────────────────────
  "about.tag": { ar: "نبذة عن الشهادة", en: "About the Certificate" },
  "about.title": { ar: "إطار شامل لقياس الأداء المؤسسي المستدام", en: "A Comprehensive Framework for Sustainable Performance" },
  "about.p1": {
    ar: "تُعد شهادة ESG من HPDC إطارًا متخصصًا يركز على تقييم واعتماد المنشآت وفق أفضل الممارسات المرتبطة بالاستدامة البيئية، والمسؤولية الاجتماعية، والحوكمة.",
    en: "HPDC's ESG certificate is a specialized framework focused on assessing and accrediting organizations according to best practices in environmental sustainability, social responsibility, and governance."
  },
  "about.p2": {
    ar: "تهدف الشهادة إلى مساعدة المنشآت على تطوير أنظمتها الداخلية الخاصة بالاستدامة، ورفع مستوى الشفافية، وإبراز التزامها تجاه البيئة والمجتمع وأصحاب المصلحة. كما تُخوّل الشهادة المنشآت الحاصلة على اعتماد الحلال من «مركز الحلال» الحصول على علامة الحلال العالمية من خلال تطبيق معايير الاستدامة.",
    en: "The certificate aims to help organizations develop their internal sustainability systems, raise transparency levels, and demonstrate their commitment to the environment, society, and stakeholders. It also enables organizations holding Halal accreditation from the Halal Center to obtain the Global Halal Mark through the application of sustainability standards."
  },
  "about.floatTitle": { ar: "اعتماد امتثال", en: "Compliance Accreditation" },
  "about.floatSub": { ar: "معتمد من HPDC", en: "Accredited by HPDC" },
  "tag.env": { ar: "الاستدامة البيئية", en: "Environmental Sustainability" },
  "tag.gov": { ar: "الحوكمة الرشيدة", en: "Good Governance" },
  "tag.social": { ar: "المسؤولية الاجتماعية", en: "Social Responsibility" },
  "tag.halal": { ar: "حلال طيّب", en: "Halal Tayyib" },

  // ─── HOME — ESG PILLARS ─────────────────────────────────────────
  "pillars.tag": { ar: "نطاق التقييم", en: "Assessment Scope" },
  "pillars.title": { ar: "ثلاثة محاور رئيسية للشهادة", en: "Three Core Pillars of the Certificate" },

  "pillar.e.title": { ar: "البيئة", en: "Environment" },
  "pillar.e.i1": { ar: "الحد من البصمة الكربونية", en: "Reducing the carbon footprint" },
  "pillar.e.i2": { ar: "إدارة المياه والنفايات", en: "Water and waste management" },
  "pillar.e.i3": { ar: "كفاءة الطاقة والعمل المناخي", en: "Energy efficiency and climate action" },

  "pillar.s.title": { ar: "المسؤولية الاجتماعية", en: "Social Responsibility" },
  "pillar.s.i1": { ar: "حقوق العمال والممارسات العادلة", en: "Workers' rights and fair practices" },
  "pillar.s.i2": { ar: "معايير الصحة والسلامة", en: "Health and safety standards" },
  "pillar.s.i3": { ar: "التنوع والإنصاف والشمول", en: "Diversity, equity and inclusion" },

  "pillar.g.title": { ar: "حوكمة الشركات", en: "Corporate Governance" },
  "pillar.g.i1": { ar: "الأخلاقيات والشفافية", en: "Ethics and transparency" },
  "pillar.g.i2": { ar: "مساءلة مجلس الإدارة وإشرافه", en: "Board accountability and oversight" },
  "pillar.g.i3": { ar: "إدارة المخاطر والامتثال", en: "Risk management and compliance" },

  "pillar.e.sub": { ar: "البيئي", en: "Environmental" },
  "pillar.s.sub": { ar: "الاجتماعي", en: "Social" },
  "pillar.g.sub": { ar: "الحوكمة", en: "Governance" },

  // ─── HOME — WHY ─────────────────────────────────────────────────
  "why.tag": { ar: "الفائدة والقيمة", en: "Value & Benefits" },
  "why.title": { ar: "لماذا تحصل منشأتك على شهادة ESG؟", en: "Why Should Your Organization Get an ESG Certificate?" },
  "why.i1": { ar: "إظهار الالتزام المؤسسي بالاستدامة والحوكمة", en: "Demonstrate institutional commitment to sustainability and governance" },
  "why.i2": { ar: "تعزيز السمعة والصورة الذهنية لدى الشركاء والعملاء", en: "Enhance reputation and image among partners and clients" },
  "why.i3": { ar: "دعم فرص التوسع والشراكات الاستراتيجية", en: "Support expansion and strategic partnership opportunities" },
  "why.i4": { ar: "رفع الجاهزية تجاه متطلبات السوق والمستثمرين", en: "Increase readiness for market and investor requirements" },
  "why.i5": { ar: "المساهمة في بناء أثر إيجابي طويل المدى", en: "Contribute to building long-term positive impact" },

  "who.tag": { ar: "الفئات المستهدفة", en: "Target Sectors" },
  "who.title": { ar: "من يستفيد من الشهادة؟", en: "Who Benefits from the Certificate?" },
  "who.c1.title": { ar: "الشركات والمؤسسات", en: "Companies & Organizations" },
  "who.c1.desc": { ar: "بمختلف الأحجام والقطاعات: الغذاء، مستحضرات التجميل، الأدوية", en: "Across all sizes and sectors: food, cosmetics, and pharmaceuticals" },
  "who.c2.title": { ar: "المصانع والمنشآت", en: "Factories & Facilities" },
  "who.c2.desc": { ar: "المهتمة بتحسين الأداء ورفع الكفاءة التشغيلية عبر تطبيق معايير ESG", en: "Aiming to improve performance and operational efficiency through ESG standards" },
  "who.c3.title": { ar: "الشركات المُصدِّرة والتوسعية", en: "Exporting & Expanding Companies" },
  "who.c3.desc": { ar: "الراغبة في التصدير والتوسع في الأسواق العالمية", en: "Seeking to export and expand into global markets" },
  "who.c4.title": { ar: "الشركات الاستثمارية", en: "Investment-Driven Companies" },
  "who.c4.desc": { ar: "الساعية إلى تعزيز استثماراتها وتوسيع محافظها الاستثمارية", en: "Looking to strengthen their investments and expand their portfolios" },

  // ─── HOME — STEPS ─────────────────────────────────────────────────
  "steps.tag": { ar: "مسار الاعتماد", en: "Certification Path" },
  "steps.title": { ar: "خطوات الحصول على الشهادة", en: "Steps to Obtain the Certificate" },
  "steps.s1.title": { ar: "تقديم الطلب", en: "Submit Application" },
  "steps.s1.desc": { ar: "إنشاء حساب للمنشأة وتعبئة نموذج الطلب بالبيانات المطلوبة.", en: "Create an organization account and fill in the application form with the required data." },
  "steps.s2.title": { ar: "التقييم والتدقيق", en: "Assessment & Audit" },
  "steps.s2.desc": { ar: "يقوم فريق HPDC بمراجعة الطلب والتحقق من استيفاء متطلبات التقييم، ثم إجراء التقييم الشامل وفق المعايير المعتمدة.", en: "The HPDC team reviews the application, verifies that assessment requirements are met, and then conducts a comprehensive assessment according to the approved standards." },
  "steps.s3.title": { ar: "منح الشهادة الرسمية", en: "Grant Official Certificate" },
  "steps.s3.desc": { ar: "إصدار النتيجة النهائية والحصول على الشهادة في حال الامتثال للمتطلبات، وتسجيلها في منصة التحقق الرقمية للمنشآت المستوفية.", en: "Issue the final result, grant the certificate upon meeting the requirements, and register it on the digital verification platform for qualifying organizations." },

  // ─── HOME — VERIFY ─────────────────────────────────────────────────
  "verify.tag": { ar: "التحقق الرقمي", en: "Digital Verification" },
  "verify.title": { ar: "تحقق من صحة الشهادة", en: "Verify Certificate Authenticity" },
  "verify.desc": { ar: "أدخل رقم الشهادة أو امسح رمز QR للتحقق الفوري من صحتها وحالتها", en: "Enter the certificate number or scan the QR code to instantly verify its authenticity and status" },
  "verify.placeholder": { ar: "رقم الشهادة (مثال: HPDC-ESG-2024-001)", en: "Certificate number (e.g. HPDC-ESG-2024-001)" },
  "verify.btn": { ar: "تحقق", en: "Verify" },
  "verify.loading": { ar: "جاري التحقق من الشهادة...", en: "Verifying certificate..." },
  "verify.notFound.title": { ar: "شهادة غير موجودة", en: "Certificate Not Found" },
  "verify.notFound.desc": { ar: "لم نتمكن من العثور على الشهادة رقم", en: "We could not find certificate number" },
  "verify.notFound.hint": { ar: "تحقق من الرقم أو تواصل معنا.", en: "Please check the number or contact us." },
  "verify.official": { ar: "هذه الشهادة معتمدة وموثقة رسمياً من قبل HPDC.", en: "This certificate is officially accredited and documented by HPDC." },
  "verify.details.company": { ar: "تفاصيل المنشأة", en: "Organization Details" },
  "verify.details.validity": { ar: "تفاصيل الصلاحية", en: "Validity Details" },
  "verify.details.scope": { ar: "نطاق الشهادة", en: "Certificate Scope" },
  "verify.field.company": { ar: "اسم الشركة", en: "Company Name" },
  "verify.field.site": { ar: "الموقع", en: "Site" },
  "verify.field.address": { ar: "العنوان", en: "Address" },
  "verify.field.issued": { ar: "تاريخ الإصدار", en: "Issue Date" },
  "verify.field.expiry": { ar: "تاريخ الانتهاء", en: "Expiry Date" },
  "verify.field.accreditor": { ar: "جهة الاعتماد", en: "Accreditation Body" },

  // ─── HOME — CTA ─────────────────────────────────────────────────
  "cta.title": { ar: "ابدأ رحلة منشأتك نحو الاستدامة والحوكمة الفعالة", en: "Start Your Organization's Journey Towards Sustainability and Effective Governance" },
  "cta.desc": {
    ar: "تقدّم الآن للحصول على شهادة ESG وعزّز مكانة منشأتك بمصداقية ومسؤولية — ضمن منظومة رؤية المملكة 2030.",
    en: "Apply now to obtain the ESG certificate and strengthen your organization's standing with credibility and responsibility — within the framework of Saudi Vision 2030."
  },
  "cta.apply": { ar: "قدّم الآن", en: "Apply Now" },
  "cta.verify": { ar: "تحقق من الشهادة", en: "Verify Certificate" },

  // ─── CERTIFICATE PAGE ────────────────────────────────────────────
  "cert.noId":        { ar: "رقم الشهادة مفقود", en: "Certificate ID missing" },
  "cert.backVerify":  { ar: "العودة للتحقق", en: "Back to Verify" },
  "cert.loading":     { ar: "جاري تحميل الشهادة...", en: "Loading certificate..." },
  "cert.notFound":    { ar: "الشهادة غير موجودة", en: "Certificate not found" },
  "cert.notFoundDesc":{ ar: "لم يتم العثور على الشهادة المطلوبة.", en: "The requested certificate could not be found." },
  "cert.back":        { ar: "العودة", en: "Back" },
  "cert.share":       { ar: "مشاركة", en: "Share" },
  "cert.print":       { ar: "طباعة", en: "Print" },
  "cert.viewFull":    { ar: "عرض الشهادة الكاملة", en: "View Full Certificate" },

  // ─── ABOUT PAGE ─────────────────────────────────────────────────
  "aboutPage.hero.title": { ar: "شهادة الامتثال للمعايير البيئية والاجتماعية والحوكمة", en: "Compliance Certificate for Environmental, Social & Governance Standards" },
  "aboutPage.hero.sub":   { ar: "عن شهادة الاستدامة (ESG)", en: "About the Sustainability (ESG) Certificate" },

  // Intro paragraphs
  "aboutPage.intro.p1": {
    ar: "شهادة الاستدامة (ESG) هي شهادة الامتثال للمعايير البيئية والمسؤولية الاجتماعية والحوكمة، صُمِّمت لتقييم المنشآت والتحقق منها والاعتراف بتلك التي تُثبت ممارسات أعمال مسؤولة وأخلاقية ومستدامة، تتوافق مع المبادئ والمعايير واللوائح المعترف بها دولياً في مجال ESG.",
    en: "The Sustainability (ESG) Certificate is a compliance certificate for environmental, social, and governance standards, designed to assess, verify, and recognize organizations that demonstrate responsible, ethical, and sustainable business practices aligned with internationally recognized ESG principles, standards, and regulations."
  },
  "aboutPage.intro.p2": {
    ar: "توفر الشهادة إطاراً شاملاً لتقييم كيفية إدارة المنشآت لآثارها البيئية، وأدائها لمسؤولياتها الاجتماعية، وصون أنظمة الحوكمة الفعّالة. وتضمن أن المنشآت تعمل بشفافية ومساءلة ومسؤولية، مع السعي المستمر لتحسين الأداء في الاستدامة والامتثال وإدارة المخاطر.",
    en: "The certification provides a comprehensive framework for evaluating how organizations manage environmental impacts, fulfill social responsibilities, and maintain effective governance systems. It ensures that organizations operate in a transparent, accountable, and responsible manner while continuously improving their performance in sustainability, compliance, and risk management."
  },
  "aboutPage.intro.p3": {
    ar: "أصبحت مبادئ الاستدامة (ESG) مكوّناً أساسياً في عمليات الأعمال الحديثة ونجاح المنشآت على المدى البعيد. وتُولي الحكومات والمستثمرون والجهات التنظيمية والمستهلكون أهمية متزايدة للالتزامات القابلة للقياس في مجالات الاستدامة والإدارة المسؤولة للموارد والمخاطر.",
    en: "Sustainability (ESG) principles have become essential components of modern business operations and long-term organizational success. Governments, investors, regulators, and consumers increasingly value measurable commitments in the areas of sustainability and the responsible management of resources and risks."
  },
  "aboutPage.intro.p4": {
    ar: "تُثبت شهادة الاستدامة (ESG) أن المنشآت قد وضعت أنظمة إدارة منهجية وضوابط تشغيلية تتوافق مع أُطر ESG الدولية وأفضل الممارسات المعترف بها.",
    en: "The Sustainability (ESG) Certificate confirms that organizations have established structured management systems and operational controls aligned with international ESG frameworks and recognized best practices."
  },

  // Pillars section header
  "aboutPage.pillars.title": { ar: "المحاور الثلاثة الأساسية", en: "The Three Core Pillars" },
  "aboutPage.pillars.sub": {
    ar: "تُركّز الشهادة على ثلاثة محاور جوهرية تُحدّد الأداء المؤسسي المسؤول والمستدام:",
    en: "The certification focuses on three core pillars that define responsible and sustainable organizational performance:"
  },

  // Environmental
  "aboutPage.pillar.e.title": { ar: "المسؤولية البيئية", en: "Environmental Responsibility" },
  "aboutPage.pillar.e.intro": {
    ar: "يقيّم المحور البيئي كيفية إدارة المنشآت لبصمتها البيئية والحد من التأثيرات السلبية على الموارد الطبيعية والنظم البيئية، من خلال تطبيق سياسات وممارسات تشمل:",
    en: "The environmental component evaluates how organizations manage their environmental footprint and minimize negative impacts on natural resources and ecosystems. This includes the implementation of policies and practices related to:"
  },
  "aboutPage.pillar.e.items": {
    ar: [
      "تقليل البصمة الكربونية والحد من الانبعاثات",
      "إدارة المياه والنفايات بشكل مستدام",
      "تعزيز كفاءة الطاقة ودعم العمل المناخي",
      "حماية البيئة وإدارة الموارد الطبيعية",
      "مكافحة التلوث والامتثال للأنظمة البيئية المعمول بها",
      "الرصد المستمر وتحسين الأداء البيئي"
    ],
    en: [
      "Reducing the carbon footprint and curbing emissions",
      "Sustainable water and waste management",
      "Enhancing energy efficiency and supporting climate action",
      "Environmental protection and natural resource management",
      "Pollution control and compliance with applicable environmental regulations",
      "Continuous monitoring and improvement of environmental performance"
    ]
  },
  "aboutPage.pillar.e.closing": {
    ar: "تُثبت المنشآت التي تستوفي المتطلبات البيئية التزامها بحماية البيئة وتقليل المخاطر التشغيلية ودعم أهداف الاستدامة الوطنية والعالمية.",
    en: "Organizations that meet environmental requirements demonstrate their commitment to protecting the environment, reducing operational risks, and supporting national and global sustainability objectives."
  },

  // Social
  "aboutPage.pillar.s.title": { ar: "المسؤولية الاجتماعية", en: "Social Responsibility" },
  "aboutPage.pillar.s.intro": {
    ar: "يقيّم المحور الاجتماعي كيفية إدارة المنشآت لعلاقاتها مع الموظفين والعملاء والمجتمعات وسائر أصحاب المصلحة، مع ضمان بيئات عمل آمنة وعادلة ومسؤولة، من خلال تطبيق سياسات وممارسات تشمل:",
    en: "The social component evaluates how organizations manage relationships with employees, customers, communities, and other stakeholders while ensuring safe, fair, and responsible working environments. This includes the implementation of policies and practices related to:"
  },
  "aboutPage.pillar.s.items": {
    ar: [
      "تعزيز حقوق العمال والممارسات العادلة ورفاههم",
      "تطبيق معايير الصحة والسلامة المهنية",
      "تعزيز التنوع والإنصاف والشمول وتكافؤ الفرص",
      "المشاركة المجتمعية والأثر الاجتماعي الإيجابي",
      "رضا العملاء وحماية المستهلك",
      "الإدارة المسؤولة لسلسلة التوريد"
    ],
    en: [
      "Promoting workers' rights, fair practices, and employee welfare",
      "Applying occupational health and safety standards",
      "Advancing diversity, equity, inclusion, and equal opportunity",
      "Community engagement and positive social impact",
      "Customer satisfaction and consumer protection",
      "Ethical supply chain management"
    ]
  },
  "aboutPage.pillar.s.closing": {
    ar: "تُثبت المنشآت التي تستوفي متطلبات المسؤولية الاجتماعية التزامها برفاه الإنسان وتطوير القوى العاملة والتعامل المسؤول مع المجتمع.",
    en: "Organizations that meet social responsibility requirements demonstrate their commitment to human well-being, workforce development, and responsible engagement with society."
  },

  // Governance
  "aboutPage.pillar.g.title": { ar: "حوكمة الشركات", en: "Corporate Governance" },
  "aboutPage.pillar.g.intro": {
    ar: "يقيّم محور الحوكمة كيفية وضع المنشآت لهياكل القيادة وعمليات اتخاذ القرار والضوابط الداخلية التي تضمن المساءلة والشفافية والسلوك الأخلاقي في الأعمال، من خلال تطبيق سياسات وممارسات تشمل:",
    en: "The governance component evaluates how organizations establish leadership structures, decision-making processes, and internal controls that ensure accountability, transparency, and ethical business conduct. This includes the implementation of policies and practices related to:"
  },
  "aboutPage.pillar.g.items": {
    ar: [
      "تعزيز الأخلاقيات والشفافية المؤسسية",
      "تعزيز مساءلة مجلس الإدارة والإشراف القيادي",
      "تعزيز إدارة الامتثال التنظيمي والالتزامات القانونية",
      "تعزيز النزاهة ومكافحة الفساد في ممارسات الأعمال",
      "إدارة المخاطر وأنظمة الرقابة الداخلية",
      "حماية البيانات وأمن المعلومات"
    ],
    en: [
      "Strengthening corporate ethics and transparency",
      "Strengthening board accountability and leadership oversight",
      "Strengthening regulatory compliance management and legal obligations",
      "Promoting integrity and anti-corruption in business practices",
      "Risk management and internal control systems",
      "Data protection and information security"
    ]
  },
  "aboutPage.pillar.g.closing": {
    ar: "تُثبت المنشآت التي تستوفي متطلبات الحوكمة قوة قيادتها واتخاذها للقرارات المسؤولة وقدرتها على إدارة المخاطر بفاعلية مع الحفاظ على ثقة أصحاب المصلحة.",
    en: "Organizations that meet governance requirements demonstrate strong leadership, responsible decision-making, and the ability to manage risks effectively while maintaining stakeholder trust."
  },

  // Certification Objectives
  "aboutPage.objectives.title": { ar: "أهداف الاعتماد", en: "Certification Objectives" },
  "aboutPage.objectives.intro": {
    ar: "تدل شهادة الاستدامة (ESG) على أن المنشآت قد وضعت أنظمة قابلة للقياس في أداء الاستدامة وفاعلية الحوكمة. وتهدف الشهادة إلى:",
    en: "The Sustainability (ESG) Certificate indicates that organizations have established measurable systems for sustainability performance and governance effectiveness. The certification aims to:"
  },
  "aboutPage.objectives.items": {
    ar: [
      "تعزيز ممارسات الأعمال المسؤولة والمستدامة",
      "تقوية الامتثال التنظيمي وإدارة المخاطر",
      "تعزيز الشفافية والمساءلة",
      "تعزيز سمعة المنشأة وثقة أصحاب المصلحة",
      "دعم القدرة على الصمود والتنافسية على المدى البعيد",
      "توافق معايير المنشأة مع المعايير والأهداف الوطنية للاستدامة",
      "الحصول على علامة الحلال العالمية الممتثلة للمعايير البيئية والاجتماعية والحوكمة",
      "المساهمة في تحقيق أهداف رؤية المملكة العربية السعودية 2030"
    ],
    en: [
      "Promote responsible and sustainable business practices",
      "Strengthen regulatory compliance and risk management",
      "Enhance transparency and accountability",
      "Strengthen organizational reputation and stakeholder confidence",
      "Support long-term resilience and competitiveness",
      "Align the organization's standards with national sustainability standards and goals",
      "Qualify for the Global Halal Mark in compliance with environmental, social, and governance standards",
      "Contribute to achieving the Kingdom of Saudi Arabia's Vision 2030 goals"
    ]
  },

  // Value & Recognition
  "aboutPage.value.title": { ar: "قيمة الاعتماد والاعتراف به", en: "Certification Value and Recognition" },
  "aboutPage.value.p1": {
    ar: "يمنح الحصول على شهادة ESG اعترافاً رسمياً بأن المنشأة نجحت في تطبيق سياسات وأنظمة وممارسات ESG منهجية تستوفي متطلبات الاعتماد المحددة.",
    en: "Obtaining the ESG Certification provides formal recognition that an organization has successfully implemented structured ESG policies, systems, and practices that meet defined certification requirements."
  },
  "aboutPage.value.p2": {
    ar: "تُسهم الشهادة في تعزيز السمعة والصورة الذهنية لدى الشركاء والعملاء، من خلال إبراز التزام المنشأة بالممارسات المسؤولة والشفافة. كما تدعم فرص التوسع وبناء الشراكات الاستراتيجية عبر زيادة الثقة والموثوقية في السوق.",
    en: "The certification helps strengthen the organization's reputation and image among partners and customers by highlighting its commitment to responsible and transparent practices. It also supports expansion opportunities and strategic partnerships by increasing trust and credibility in the market."
  },
  "aboutPage.value.p3": {
    ar: "وتساعد الشهادة المنشآت على رفع جاهزيتها لمتطلبات السوق والمستثمرين، وتحسين كفاءتها التشغيلية، مع دعم قدرتها على الامتثال للمتطلبات التنظيمية الحالية والمستقبلية.",
    en: "The certification helps organizations enhance their readiness for market and investor requirements, improve operational efficiency, and strengthen their ability to comply with current and future regulatory requirements."
  },
  "aboutPage.value.p4": {
    ar: "كما تُسهم في تحقيق أثر إيجابي مستدام على المدى الطويل من خلال تبنّي ممارسات تُعزّز الاستدامة والتحسين المستمر.",
    en: "It also contributes to achieving a sustainable, positive long-term impact by adopting practices that strengthen sustainability and continuous improvement."
  },

  // Continuous Improvement
  "aboutPage.continuous.title": { ar: "التحسين الدائم", en: "Continuous Improvement" },
  "aboutPage.continuous.p1": {
    ar: "تُعدّ شهادة الاستدامة (ESG) التزاماً مستمراً بممارسات الأعمال المسؤولة والتحسين الدائم. ويُلزَم الحاصلون على الشهادة بالاستمرار في استيفاء متطلباتها، ورصد مؤشرات الأداء، والخضوع لتقييمات دورية؛ لضمان التوافق المستدام مع مبادئ الاستدامة ESG.",
    en: "The Sustainability (ESG) Certificate represents an ongoing commitment to responsible business practices and continuous improvement. Certificate holders are required to keep meeting its requirements, monitor performance indicators, and undergo periodic assessments to ensure sustained alignment with ESG sustainability principles."
  },
  "aboutPage.continuous.p2": {
    ar: "يضمن هذا النهج بقاء المنشآت المعتمدة مع إسهامها في التنمية الاقتصادية والمجتمعية المستدامة.",
    en: "This approach ensures the continuity of certified organizations while contributing to sustainable economic and societal development."
  },

  // ─── CERTIFIED ORGS / REGISTRY ──────────────────────────────────
  "nav.registry":      { ar: "سجل الاعتماد", en: "Registry" },
  "certified.tag":     { ar: "سجل الشهادات المعتمدة", en: "Accredited Certificates Registry" },
  "certified.title":   { ar: "جهات الاعتماد", en: "Certified Organizations" },
  "certified.sub":     { ar: "الشركات الحاصلة على شهادة ESG من شركة تطوير منتجات الحلال (HPDC)", en: "Organizations certified under the HPDC ESG Certification Scheme" },
  "certified.id":      { ar: "رقم الشهادة", en: "Certificate No." },
  "certified.issued":  { ar: "تاريخ الإصدار", en: "Issued" },
  "certified.expiry":  { ar: "تاريخ الانتهاء", en: "Expiry" },
  "certified.view":    { ar: "عرض الشهادة", en: "View Certificate" },
  "certified.valid":    { ar: "سارية", en: "Valid" },
  "certified.expired":  { ar: "منتهية", en: "Expired" },
  "certified.suspended":{ ar: "موقوفة", en: "Suspended" },
  "certified.all":      { ar: "جميع الحالات", en: "All Statuses" },
  "certified.allRegions":{ ar: "جميع المناطق", en: "All Regions" },
  "certified.search":   { ar: "ابحث عن جهة اعتماد...", en: "Search organization..." },
  "certified.filterStatus": { ar: "حالة الشهادة", en: "Certificate Status" },
  "certified.filterRegion":  { ar: "دولة الشركة", en: "Country" },
  "certified.filterCountry": { ar: "دولة الشركة", en: "Country" },
  "certified.allCountries":  { ar: "جميع الدول", en: "All Countries" },
  "certified.issuedBy":      { ar: "جهة الإصدار", en: "Issued By" },
  "certified.results":  { ar: "نتيجة", en: "result(s)" },
  "certified.noResults":{ ar: "لا توجد نتائج مطابقة", en: "No matching results" },
  "certified.noResultsSub": { ar: "جرّب تغيير معايير البحث أو الفلتر", en: "Try adjusting your search or filter criteria" },
  "certified.scope":    { ar: "النطاق", en: "Scope" },
  "certified.site":     { ar: "الموقع", en: "Site" },
  "certified.viewAll":  { ar: "عرض سجل الاعتماد الكامل", en: "View Full Registry" },
  "certified.homeTeaser": { ar: "جهات حاصلة على شهادة ESG", en: "ESG Certified Organizations" },

  // ─── STATUS ─────────────────────────────────────────────────────
  "status.valid": { ar: "Valid / صالح", en: "Valid" },
  "status.expired": { ar: "Expired / منتهي", en: "Expired" },
  "status.suspended": { ar: "Suspended / معلق", en: "Suspended" },
  "status.unknown": { ar: "Unknown / غير معروف", en: "Unknown" },
};
