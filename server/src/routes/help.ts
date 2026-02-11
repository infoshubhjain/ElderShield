import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

const checkInSchema = z.object({
  kind: z.enum(["EMERGENCY", "SUPPORT", "CAREGIVER"]),
  note: z.string().max(240).optional()
});

router.post("/check-in", requireAuth, async (req: AuthRequest, res) => {
  const parsed = checkInSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  return res.json({
    success: true,
    userId: req.userId,
    kind: parsed.data.kind,
    note: parsed.data.note || null,
    createdAt: new Date().toISOString(),
    message: "We recorded your request and will prioritize follow-up."
  });
});

export default router;
