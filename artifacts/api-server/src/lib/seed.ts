import { db } from "@workspace/db";
import { certificatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const SEED_CERTS = [
  { certificateId: "HPDC-ESG-2024-001", companyName: "Saudi Aramco", siteName: "Dhahran Headquarters", location: "Dhahran, Eastern Province, Saudi Arabia", issueDate: "2024-01-15", expiryDate: "2027-01-14", status: "valid" as const, scopeStatement: "Environmental management, social responsibility, and corporate governance practices across upstream oil and gas operations, including environmental impact assessments, community engagement programs, and board-level governance structures.", verificationMessage: "This certificate has been verified and is currently valid." },
  { certificateId: "HPDC-ESG-2024-002", companyName: "Saudi Electricity Company (SEC)", siteName: "Riyadh Power Plant No. 10", location: "Riyadh, Riyadh Province, Saudi Arabia", issueDate: "2024-03-01", expiryDate: "2027-02-28", status: "valid" as const, scopeStatement: "Sustainable energy generation and distribution operations, including renewable energy integration, emissions monitoring, and employee occupational health and safety programs.", verificationMessage: "This certificate has been verified and is currently valid." },
  { certificateId: "HPDC-ESG-2023-015", companyName: "SABIC", siteName: "Al Jubail Industrial City Plant", location: "Al Jubail, Eastern Province, Saudi Arabia", issueDate: "2021-06-10", expiryDate: "2024-06-09", status: "expired" as const, scopeStatement: "Petrochemical manufacturing operations covering environmental compliance, chemical waste management, and employee welfare programs across Al Jubail production facilities.", verificationMessage: "This certificate has expired." },
  { certificateId: "HPDC-ESG-2024-008", companyName: "Ma'aden (Saudi Arabian Mining Company)", siteName: "Wa'ad Al Shamal Phosphate Complex", location: "Northern Borders Province, Saudi Arabia", issueDate: "2023-09-01", expiryDate: "2026-08-31", status: "suspended" as const, scopeStatement: "Mining and minerals processing operations, land reclamation, environmental restoration, and occupational health management across phosphate extraction and processing facilities.", verificationMessage: "This certificate is currently suspended." },
  { certificateId: "HPDC-ESG-2024-011", companyName: "stc (Saudi Telecom Company)", siteName: "Riyadh HQ — Digital Infrastructure Division", location: "Riyadh, Riyadh Province, Saudi Arabia", issueDate: "2024-05-20", expiryDate: "2027-05-19", status: "valid" as const, scopeStatement: "Digital infrastructure operations, data center energy efficiency, employee diversity programs, and cybersecurity governance frameworks aligned with Vision 2030 digital economy objectives.", verificationMessage: "This certificate has been verified and is currently valid." },
  { certificateId: "HPDC-ESG-2024-020", companyName: "Emirates Global Aluminium (EGA)", siteName: "Jebel Ali Smelting Complex", location: "Jebel Ali, Dubai, United Arab Emirates", issueDate: "2024-02-10", expiryDate: "2027-02-09", status: "valid" as const, scopeStatement: "Primary aluminium smelting operations covering carbon footprint reduction, water recycling initiatives, community development programs, and supply chain transparency reporting.", verificationMessage: "This certificate has been verified and is currently valid." },
  { certificateId: "HPDC-ESG-2023-031", companyName: "ADNOC Logistics & Services", siteName: "Abu Dhabi Marine Terminal", location: "Abu Dhabi, United Arab Emirates", issueDate: "2022-11-01", expiryDate: "2025-10-31", status: "expired" as const, scopeStatement: "Marine logistics, port operations, and petroleum product distribution covering vessel emission monitoring, spill prevention protocols, and port community welfare programs.", verificationMessage: "This certificate has expired." },
  { certificateId: "HPDC-ESG-2024-035", companyName: "Kuwait Finance House (KFH)", siteName: "Shuwaikh Central Operations", location: "Shuwaikh, Kuwait City, Kuwait", issueDate: "2024-06-01", expiryDate: "2027-05-31", status: "valid" as const, scopeStatement: "Islamic banking and financial services operations including green financing products, ethical investment screening, financial inclusion programs, and Sharia-compliant ESG governance frameworks.", verificationMessage: "This certificate has been verified and is currently valid." },
  { certificateId: "HPDC-ESG-2024-042", companyName: "QatarEnergy", siteName: "Ras Laffan LNG Facility", location: "Ras Laffan Industrial City, Qatar", issueDate: "2024-04-15", expiryDate: "2027-04-14", status: "valid" as const, scopeStatement: "Liquefied natural gas production and export operations, including greenhouse gas reduction targets, flare minimization programs, worker welfare standards, and independent ESG audit frameworks.", verificationMessage: "This certificate has been verified and is currently valid." },
  { certificateId: "HPDC-ESG-2023-048", companyName: "Alba (Aluminium Bahrain)", siteName: "Bahrain Smelter — Line 6 Expansion", location: "Askar, Southern Governorate, Bahrain", issueDate: "2023-07-01", expiryDate: "2026-06-30", status: "valid" as const, scopeStatement: "Primary aluminium production with focus on energy efficiency upgrades, water desalination sustainability, occupational health management, and board diversity in line with GCC ESG standards.", verificationMessage: "This certificate has been verified and is currently valid." },
  { certificateId: "HPDC-ESG-2024-055", companyName: "Jordan Phosphate Mines Company", siteName: "Aqaba Phosphate Port Terminal", location: "Aqaba Special Economic Zone, Jordan", issueDate: "2024-01-20", expiryDate: "2027-01-19", status: "valid" as const, scopeStatement: "Phosphate mining, processing, and port export operations covering land rehabilitation, dust suppression programs, mine community development, and export-chain environmental compliance.", verificationMessage: "This certificate has been verified and is currently valid." },
  { certificateId: "HPDC-ESG-2023-060", companyName: "Egyptian Chemical Industries (KIMA)", siteName: "Aswan Fertiliser Plant", location: "Aswan, Upper Egypt, Egypt", issueDate: "2022-09-15", expiryDate: "2025-09-14", status: "suspended" as const, scopeStatement: "Nitrogen fertiliser production including ammonia synthesis, agricultural community programs, Nile water management compliance, and worker health and safety monitoring programs.", verificationMessage: "This certificate is currently suspended." },
  { certificateId: "HPDC-ESG-2024-067", companyName: "Petronas Dagangan Berhad", siteName: "Kuala Lumpur Retail Network HQ", location: "Kuala Lumpur, Federal Territory, Malaysia", issueDate: "2024-03-25", expiryDate: "2027-03-24", status: "valid" as const, scopeStatement: "Downstream petroleum retail operations including fuel station decarbonisation, EV charging rollout, vendor supply chain ESG audits, and community financial literacy programs.", verificationMessage: "This certificate has been verified and is currently valid." },
  { certificateId: "HPDC-ESG-2024-072", companyName: "PT Pertamina (Persero)", siteName: "Balikpapan Refinery Complex", location: "Balikpapan, East Kalimantan, Indonesia", issueDate: "2024-07-01", expiryDate: "2027-06-30", status: "valid" as const, scopeStatement: "Crude oil refining and distribution operations with biodiversity offset programs, mangrove restoration initiatives, refinery community health programs, and ISO 14001-aligned environmental management.", verificationMessage: "This certificate has been verified and is currently valid." },
  { certificateId: "HPDC-ESG-2023-078", companyName: "Türkiye Petrolleri (TPAO)", siteName: "Ankara Exploration & Production HQ", location: "Ankara, Central Anatolia, Turkey", issueDate: "2022-04-01", expiryDate: "2025-03-31", status: "expired" as const, scopeStatement: "Onshore and offshore petroleum exploration and production with seismic monitoring protocols, indigenous community engagement, petroleum infrastructure environmental impact reporting.", verificationMessage: "This certificate has expired." },
  { certificateId: "HPDC-ESG-2024-085", companyName: "Halal Food Authority (HFA)", siteName: "London Certification Centre", location: "London, England, United Kingdom", issueDate: "2024-08-01", expiryDate: "2027-07-31", status: "valid" as const, scopeStatement: "Halal food certification, inspection, and compliance auditing services with sustainable certification methodology, ethical auditing practices, and stakeholder transparency reporting.", verificationMessage: "This certificate has been verified and is currently valid." },
  { certificateId: "HPDC-ESG-2024-091", companyName: "BASF SE — Catalysts Division", siteName: "Ludwigshafen Chemical Complex", location: "Ludwigshafen, Rhineland-Palatinate, Germany", issueDate: "2024-05-05", expiryDate: "2027-05-04", status: "valid" as const, scopeStatement: "Chemical catalysts research, manufacturing, and supply operations with scope 1-3 emissions tracking, circular economy initiatives, chemical waste neutralisation, and EU taxonomy compliance.", verificationMessage: "This certificate has been verified and is currently valid." },
  { certificateId: "HPDC-ESG-2024-097", companyName: "Cargill Protein — Halal Division", siteName: "Wichita Processing Facility", location: "Wichita, Kansas, United States", issueDate: "2024-09-10", expiryDate: "2027-09-09", status: "valid" as const, scopeStatement: "Halal-certified meat processing and global protein supply chain operations with animal welfare auditing, antibiotic stewardship programs, water usage reduction targets, and living wage compliance.", verificationMessage: "This certificate has been verified and is currently valid." },
];

export async function seedCertificates() {
  try {
    const existing = await db.select({ id: certificatesTable.certificateId }).from(certificatesTable);
    const existingIds = new Set(existing.map((r) => r.id));
    const toInsert = SEED_CERTS.filter((c) => !existingIds.has(c.certificateId));
    if (toInsert.length === 0) {
      logger.info("Certificate seed: all records already present");
      return;
    }
    await db.insert(certificatesTable).values(
      toInsert.map((c) => ({
        certificateId: c.certificateId,
        status: c.status,
        companyName: c.companyName,
        siteName: c.siteName,
        location: c.location,
        issueDate: c.issueDate,
        expiryDate: c.expiryDate,
        certificationBody: "HPDC",
        schemeOwner: "HPDC",
        scopeStatement: c.scopeStatement,
        verificationMessage: c.verificationMessage,
        companyClerkId: null,
      }))
    );
    logger.info({ count: toInsert.length }, "Certificate seed: inserted missing records");
  } catch (err) {
    logger.error({ err }, "Certificate seed failed");
  }
}
