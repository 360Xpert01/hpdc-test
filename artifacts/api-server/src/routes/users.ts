import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SyncUserBody, UpdateUserRoleBody, UpdateUserRoleParams } from "@workspace/api-zod";

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.clerkUserId = userId;
  next();
};

const requireAdmin = async (req: any, res: any, next: any) => {
  const clerkId = req.clerkUserId;
  const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
  if (users.length === 0 || users[0].role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  req.dbUser = users[0];
  next();
};

router.post("/sync", async (req, res) => {
  try {
    const parsed = SyncUserBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid request data" });
      return;
    }
    const { clerkId, email, companyName } = parsed.data;

    const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);

    if (existing.length > 0) {
      const [updated] = await db.update(usersTable)
        .set({ email, ...(companyName !== undefined ? { companyName } : {}) })
        .where(eq(usersTable.clerkId, clerkId))
        .returning();
      res.json({
        id: String(updated.id),
        clerkId: updated.clerkId,
        email: updated.email,
        role: updated.role,
        companyName: updated.companyName ?? null,
      });
    } else {
      const [inserted] = await db.insert(usersTable).values({
        clerkId,
        email,
        role: "company",
        companyName: companyName ?? null,
      }).returning();
      res.json({
        id: String(inserted.id),
        clerkId: inserted.clerkId,
        email: inserted.email,
        role: inserted.role,
        companyName: inserted.companyName ?? null,
      });
    }
  } catch (err) {
    req.log.error({ err }, "Failed to sync user");
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/me", requireAuth, async (req: any, res) => {
  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
    if (users.length === 0) {
      res.status(404).json({ message: "User profile not found. Please complete registration." });
      return;
    }
    const u = users[0];
    res.json({
      id: String(u.id),
      clerkId: u.clerkId,
      email: u.email,
      role: u.role,
      companyName: u.companyName ?? null,
      accountType: u.accountType ?? "company",
      onboardingCompleted: u.onboardingCompleted ?? false,
      phone: u.phone ?? null,
      country: u.country ?? null,
      sector: u.sector ?? null,
      jobTitle: u.jobTitle ?? null,
      reasonForEsg: u.reasonForEsg ?? null,
      companyRegistrationNumber: u.companyRegistrationNumber ?? null,
      numberOfEmployees: u.numberOfEmployees ?? null,
      website: u.website ?? null,
      contactPersonName: u.contactPersonName ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get user profile");
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/onboarding", requireAuth, async (req: any, res) => {
  try {
    const clerkId = req.clerkUserId;
    const body = req.body;

    const allowedFields = [
      "accountType", "companyName", "phone", "country", "sector",
      "jobTitle", "reasonForEsg", "companyRegistrationNumber",
      "numberOfEmployees", "website", "contactPersonName",
    ];
    const updateData: Record<string, any> = { onboardingCompleted: true };
    for (const f of allowedFields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
    if (existing.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const [updated] = await db.update(usersTable)
      .set(updateData)
      .where(eq(usersTable.clerkId, clerkId))
      .returning();

    res.json({
      id: String(updated.id),
      clerkId: updated.clerkId,
      email: updated.email,
      role: updated.role,
      companyName: updated.companyName ?? null,
      accountType: updated.accountType ?? "company",
      onboardingCompleted: updated.onboardingCompleted ?? true,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to complete onboarding");
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/me/certificates", requireAuth, async (req: any, res) => {
  try {
    const { certificatesTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
    const certs = await db.select().from(certificatesTable)
      .where(eq(certificatesTable.companyClerkId, req.clerkUserId));
    res.json(certs.map((c) => ({
      id: String(c.id),
      certificateId: c.certificateId,
      status: c.status,
      companyName: c.companyName,
      siteName: c.siteName,
      location: c.location,
      issueDate: c.issueDate,
      expiryDate: c.expiryDate,
      certificationBody: c.certificationBody,
      schemeOwner: c.schemeOwner,
      scopeStatement: c.scopeStatement,
      verificationMessage: c.verificationMessage,
      companyClerkId: c.companyClerkId ?? null,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get company certificates");
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const users = await db.select().from(usersTable);
    res.json(users.map((u) => ({
      id: String(u.id),
      clerkId: u.clerkId,
      email: u.email,
      role: u.role,
      companyName: u.companyName ?? null,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list users");
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:userId/role", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const parsedParams = UpdateUserRoleParams.safeParse(req.params);
    const parsedBody = UpdateUserRoleBody.safeParse(req.body);
    if (!parsedParams.success || !parsedBody.success) {
      res.status(400).json({ message: "Invalid request" });
      return;
    }

    const { userId } = parsedParams.data;
    const { role } = parsedBody.data;

    const [updated] = await db.update(usersTable)
      .set({ role: role as "admin" | "company" })
      .where(eq(usersTable.clerkId, userId))
      .returning();

    if (!updated) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      id: String(updated.id),
      clerkId: updated.clerkId,
      email: updated.email,
      role: updated.role,
      companyName: updated.companyName ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update user role");
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
