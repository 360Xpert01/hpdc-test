import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  applicationNumber: text("application_number").notNull().unique(),
  clerkId: text("clerk_id").notNull(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  sector: text("sector").notNull(),
  siteName: text("site_name").notNull(),
  siteLocation: text("site_location").notNull(),
  notes: text("notes"),
  stage: text("stage")
    .notNull()
    .$type<"submitted" | "under_review" | "assessment_scheduled" | "assessment_done" | "approved" | "certificate_issued" | "rejected">()
    .default("submitted"),
  stageNotes: text("stage_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, createdAt: true, updatedAt: true, applicationNumber: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;
