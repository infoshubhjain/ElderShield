import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/client";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { ensureActivityCatalog } from "../services/bootstrap";

const router = Router();

const createMatchSchema = z.object({
  activityId: z.string()
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createMatchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const { activityId } = parsed.data;
  const requesterId = req.userId as string;

  await ensureActivityCatalog(prisma);

  const existing = await prisma.match.findFirst({
    where: {
      activityId,
      status: "PENDING",
      receiverId: requesterId
    },
    include: {
      activity: true,
      initiator: { select: { id: true, name: true } }
    }
  });
  if (existing) return res.json(existing);

  const candidate = await prisma.user.findFirst({
    where: { id: { not: requesterId } },
    orderBy: { createdAt: "asc" }
  });

  if (!candidate) {
    return res.json({
      status: "searching",
      message: "No nearby matches yet. We'll keep looking and notify you."
    });
  }

  const match = await prisma.match.create({
    data: {
      initiatorId: requesterId,
      receiverId: candidate.id,
      activityId,
      approximateDistanceKm: 1.0,
      status: "PENDING"
    },
    include: {
      activity: true,
      receiver: { select: { id: true, name: true } },
      initiator: { select: { id: true, name: true } }
    }
  });

  return res.json(match);
});

router.post("/:id/respond", requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { decision } = req.body as { decision: "ACCEPTED" | "REJECTED" };

  if (!["ACCEPTED", "REJECTED"].includes(decision)) {
    return res.status(400).json({ error: "Invalid decision" });
  }

  const match = await prisma.match.findUnique({ where: { id } });
  if (!match || match.receiverId !== req.userId) {
    return res.status(404).json({ error: "Not found" });
  }

  const updated = await prisma.match.update({
    where: { id },
    data: { status: decision }
  });

  return res.json(updated);
});

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId as string;
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ initiatorId: userId }, { receiverId: userId }]
    },
    include: {
      activity: true,
      initiator: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
      messages: {
        where: { recipientId: userId, read: false },
        select: { id: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return res.json(
    matches.map((match) => {
      const otherUser = match.initiatorId === userId ? match.receiver : match.initiator;
      return {
        id: match.id,
        status: match.status,
        activity: {
          id: match.activity.id,
          name: match.activity.name
        },
        otherUser,
        scheduledFor: match.scheduledFor,
        unreadCount: match.messages.length,
        createdAt: match.createdAt
      };
    })
  );
});

router.post("/:id/schedule", requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { scheduledFor } = req.body as { scheduledFor: string };

  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) return res.status(404).json({ error: "Not found" });
  if (match.initiatorId !== req.userId && match.receiverId !== req.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const updated = await prisma.match.update({
    where: { id },
    data: { scheduledFor: new Date(scheduledFor) }
  });

  return res.json(updated);
});

export default router;
