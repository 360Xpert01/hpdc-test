import { Router } from "express";

const router = Router();

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY ?? "";

const DEMO_USERS: Record<string, string> = {
  company: "user_3CfvXqQ8Rrk8FUG4ZpiOmREJfK1", // Valid ID for zahidrahimoon22@gmail.com
  admin: "user_3CwLcbI7uf8mL9LBy8QTyl1RvZx", // Valid ID for admin@hpdc.sa
};

/**
 * POST /api/auth/demo-token
 * Body: { type: "company" }
 * Returns a Clerk sign-in token for the demo company account.
 * Tokens expire in 5 minutes. Only available in development.
 */
router.post("/demo-token", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ message: "Not found" });
  }

  const type = req.body?.type as string;
  const userId = DEMO_USERS[type];
  if (!userId) {
    return res.status(400).json({ message: "Invalid demo type" });
  }

  if (!CLERK_SECRET_KEY) {
    return res.status(500).json({ message: "Clerk secret key not configured" });
  }

  const response = await fetch("https://api.clerk.com/v1/sign_in_tokens", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId, expires_in_seconds: 300 }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Clerk API Error:", err);
    return res.status(502).json({ message: "Failed to create token", detail: err });
  }

  const data = await response.json() as { token: string };
  return res.json({ token: data.token });
});

export default router;
