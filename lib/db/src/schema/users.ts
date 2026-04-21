import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  role: text("role").notNull().$type<"admin" | "company">().default("company"),
  companyName: text("company_name"),
  createdAt: timestamp("created_at").defaultNow(),

  accountType: text("account_type").$type<"individual" | "company">().default("company"),
  onboardingCompleted: boolean("onboarding_completed").default(false),

  phone: text("phone"),
  country: text("country"),
  sector: text("sector"),
  jobTitle: text("job_title"),
  reasonForEsg: text("reason_for_esg"),

  companyRegistrationNumber: text("company_registration_number"),
  numberOfEmployees: text("number_of_employees"),
  website: text("website"),
  contactPersonName: text("contact_person_name"),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
