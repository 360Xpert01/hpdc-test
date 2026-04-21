import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const certificatesTable = pgTable("certificates", {
  id: serial("id").primaryKey(),
  certificateId: text("certificate_id").notNull().unique(),
  status: text("status").notNull().$type<"valid" | "expired" | "suspended">(),
  companyName: text("company_name").notNull(),
  siteName: text("site_name").notNull(),
  location: text("location").notNull(),
  issueDate: text("issue_date").notNull(),
  expiryDate: text("expiry_date").notNull(),
  certificationBody: text("certification_body").notNull(),
  schemeOwner: text("scheme_owner").notNull().default("HPDC"),
  scopeStatement: text("scope_statement").notNull(),
  verificationMessage: text("verification_message").notNull(),
  companyClerkId: text("company_clerk_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCertificateSchema = createInsertSchema(certificatesTable).omit({ id: true, createdAt: true });
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificatesTable.$inferSelect;
