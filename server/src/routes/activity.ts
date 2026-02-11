import { Router } from "express";
import { prisma } from "../db/client";
import { requireAuth } from "../middleware/auth";
import { ensureActivityCatalog } from "../services/bootstrap";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  await ensureActivityCatalog(prisma);
  const activities = await prisma.activity.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  });

  return res.json(
    activities.map((activity) => ({
      id: activity.id,
      name: activity.name,
      category: activity.category,
      description: activity.description
    }))
  );
});

export default router;
