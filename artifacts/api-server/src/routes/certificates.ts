import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { certificatesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetCertificateParams,
  CreateCertificateBody,
} from "@workspace/api-zod";

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
  next();
};

const mapCert = (c: any) => ({
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
});

router.get("/stats/summary", async (req, res) => {
  try {
    const all = await db.select().from(certificatesTable);
    const valid = all.filter((c) => c.status === "valid").length;
    const expired = all.filter((c) => c.status === "expired").length;
    const suspended = all.filter((c) => c.status === "suspended").length;
    res.json({ total: all.length, valid, expired, suspended });
  } catch (err) {
    req.log.error({ err }, "Failed to get certificate stats");
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const certs = await db.select().from(certificatesTable);
    res.json(certs.map(mapCert));
  } catch (err) {
    req.log.error({ err }, "Failed to list certificates");
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:certificateId", async (req, res) => {
  try {
    const parsed = GetCertificateParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid certificate ID" });
      return;
    }
    const { certificateId } = parsed.data;
    const certs = await db
      .select()
      .from(certificatesTable)
      .where(eq(certificatesTable.certificateId, certificateId))
      .limit(1);

    if (certs.length === 0) {
      res.status(404).json({ message: "Certificate not found" });
      return;
    }

    res.json(mapCert(certs[0]));
  } catch (err) {
    req.log.error({ err }, "Failed to get certificate");
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:certificateId", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const { certificateId } = req.params;
    const data = req.body;

    const existing = await db.select().from(certificatesTable).where(eq(certificatesTable.certificateId, certificateId)).limit(1);
    if (existing.length === 0) {
      res.status(404).json({ message: "Certificate not found" });
      return;
    }

    const updateFields: Record<string, unknown> = {};
    if (data.status !== undefined)             updateFields.status = data.status;
    if (data.companyName !== undefined)        updateFields.companyName = data.companyName;
    if (data.siteName !== undefined)           updateFields.siteName = data.siteName;
    if (data.location !== undefined)           updateFields.location = data.location;
    if (data.issueDate !== undefined)          updateFields.issueDate = data.issueDate;
    if (data.expiryDate !== undefined)         updateFields.expiryDate = data.expiryDate;
    if (data.certificationBody !== undefined)  updateFields.certificationBody = data.certificationBody;
    if (data.schemeOwner !== undefined)        updateFields.schemeOwner = data.schemeOwner;
    if (data.scopeStatement !== undefined)     updateFields.scopeStatement = data.scopeStatement;
    if (data.verificationMessage !== undefined) updateFields.verificationMessage = data.verificationMessage;
    if (data.companyClerkId !== undefined)     updateFields.companyClerkId = data.companyClerkId;
    updateFields.updatedAt = new Date();

    const [updated] = await db.update(certificatesTable).set(updateFields).where(eq(certificatesTable.certificateId, certificateId)).returning();

    res.json(mapCert(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update certificate");
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const parsed = CreateCertificateBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid certificate data" });
      return;
    }

    const data = parsed.data;
    const [inserted] = await db
      .insert(certificatesTable)
      .values({
        certificateId: data.certificateId,
        status: data.status as "valid" | "expired" | "suspended",
        companyName: data.companyName,
        siteName: data.siteName,
        location: data.location,
        issueDate: data.issueDate,
        expiryDate: data.expiryDate,
        certificationBody: data.certificationBody,
        schemeOwner: data.schemeOwner,
        scopeStatement: data.scopeStatement,
        verificationMessage: data.verificationMessage,
        companyClerkId: data.companyClerkId ?? null,
      })
      .returning();

    res.status(201).json(mapCert(inserted));
  } catch (err) {
    req.log.error({ err }, "Failed to create certificate");
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
