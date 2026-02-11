import { Router } from "express";
import { prisma } from "../db/client";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { ioInstance } from "../realtime/socket";

const router = Router();

router.get("/:matchId", requireAuth, async (req: AuthRequest, res) => {
  const { matchId } = req.params;
  const userId = req.userId as string;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return res.status(404).json({ error: "Not found" });
  if (match.initiatorId !== userId && match.receiverId !== userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const messages = await prisma.message.findMany({
    where: { matchId },
    orderBy: { createdAt: "asc" }
  });

  await prisma.message.updateMany({
    where: {
      matchId,
      recipientId: userId,
      read: false
    },
    data: { read: true }
  });

  return res.json(messages);
});

router.post("/:matchId", requireAuth, async (req: AuthRequest, res) => {
  const { matchId } = req.params;
  const { content, voiceUrl } = req.body as { content?: string; voiceUrl?: string };
  const userId = req.userId as string;

  if (!content?.trim() && !voiceUrl) {
    return res.status(400).json({ error: "Message content is required" });
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return res.status(404).json({ error: "Not found" });
  if (match.status !== "ACCEPTED") {
    return res.status(400).json({ error: "Match not confirmed" });
  }
  if (match.initiatorId !== userId && match.receiverId !== userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const recipientId = match.initiatorId === userId ? match.receiverId : match.initiatorId;

  const msg = await prisma.message.create({
    data: {
      matchId,
      senderId: userId,
      recipientId,
      content: content?.trim() || null,
      voiceUrl
    }
  });

  if (ioInstance) {
    ioInstance.to(`user:${recipientId}`).emit("message:new", msg);
  }

  return res.status(201).json(msg);
});

export default router;
