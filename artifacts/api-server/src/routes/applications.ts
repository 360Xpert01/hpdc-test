import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, applicationsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  req.clerkUserId = userId;
  next();
};

const requireAdmin = async (req: any, res: any, next: any) => {
  const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, req.clerkUserId)).limit(1);
  if (users.length === 0 || users[0].role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  req.dbUser = users[0];
  next();
};

const VALID_STAGES = ["submitted", "under_review", "assessment_scheduled", "assessment_done", "approved", "certificate_issued", "rejected"] as const;

function formatApp(a: any) {
  return {
    id: String(a.id),
    applicationNumber: a.applicationNumber,
    clerkId: a.clerkId,
    companyName: a.companyName,
    contactName: a.contactName,
    email: a.email,
    phone: a.phone,
    sector: a.sector,
    siteName: a.siteName,
    siteLocation: a.siteLocation,
    notes: a.notes ?? null,
    stage: a.stage,
    stageNotes: a.stageNotes ?? null,
    createdAt: a.createdAt?.toISOString() ?? null,
    updatedAt: a.updatedAt?.toISOString() ?? null,
  };
}

// POST /applications — submit new application (company)
router.post("/", requireAuth, async (req: any, res) => {
  try {
    const { companyName, contactName, email, phone, sector, siteName, siteLocation, notes } = req.body;
    if (!companyName || !contactName || !email || !phone || !sector || !siteName || !siteLocation) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
    const existing = await db.select().from(applicationsTable).where(eq(applicationsTable.clerkId, req.clerkUserId));
    const year = new Date().getFullYear();
    const num = `APP-${year}-${String(existing.length + 1).padStart(3, "0")}`;
    const [inserted] = await db.insert(applicationsTable).values({
      applicationNumber: num,
      clerkId: req.clerkUserId,
      companyName,
      contactName,
      email,
      phone,
      sector,
      siteName,
      siteLocation,
      notes: notes ?? null,
      stage: "submitted",
    }).returning();
    res.status(201).json(formatApp(inserted));
  } catch (err) {
    req.log.error({ err }, "Failed to create application");
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /applications/my — get my applications (company)
router.get("/my", requireAuth, async (req: any, res) => {
  try {
    const apps = await db.select().from(applicationsTable)
      .where(eq(applicationsTable.clerkId, req.clerkUserId))
      .orderBy(desc(applicationsTable.createdAt));
    res.json(apps.map(formatApp));
  } catch (err) {
    req.log.error({ err }, "Failed to get applications");
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /applications — list all (admin)
router.get("/", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const apps = await db.select().from(applicationsTable).orderBy(desc(applicationsTable.createdAt));
    res.json(apps.map(formatApp));
  } catch (err) {
    req.log.error({ err }, "Failed to list applications");
    res.status(500).json({ message: "Internal server error" });
  }
});

// PATCH /applications/:id/stage — update stage (admin)
router.patch("/:id/stage", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { stage, stageNotes } = req.body;
    if (!stage || !VALID_STAGES.includes(stage)) {
      res.status(400).json({ message: "Invalid stage" });
      return;
    }
    const [updated] = await db.update(applicationsTable)
      .set({ stage, stageNotes: stageNotes ?? null, updatedAt: new Date() })
      .where(eq(applicationsTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ message: "Application not found" });
      return;
    }
    res.json(formatApp(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update application stage");
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
