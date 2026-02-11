"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../db/client");
const auth_1 = require("../middleware/auth");
const socket_1 = require("../realtime/socket");
const router = (0, express_1.Router)();
router.get("/:matchId", auth_1.requireAuth, async (req, res) => {
    const { matchId } = req.params;
    const userId = req.userId;
    const match = await client_1.prisma.match.findUnique({ where: { id: matchId } });
    if (!match)
        return res.status(404).json({ error: "Not found" });
    if (match.initiatorId !== userId && match.receiverId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
    }
    const messages = await client_1.prisma.message.findMany({
        where: { matchId },
        orderBy: { createdAt: "asc" }
    });
    await client_1.prisma.message.updateMany({
        where: {
            matchId,
            recipientId: userId,
            read: false
        },
        data: { read: true }
    });
    return res.json(messages);
});
router.post("/:matchId", auth_1.requireAuth, async (req, res) => {
    const { matchId } = req.params;
    const { content, voiceUrl } = req.body;
    const userId = req.userId;
    if (!content?.trim() && !voiceUrl) {
        return res.status(400).json({ error: "Message content is required" });
    }
    const match = await client_1.prisma.match.findUnique({ where: { id: matchId } });
    if (!match)
        return res.status(404).json({ error: "Not found" });
    if (match.status !== "ACCEPTED") {
        return res.status(400).json({ error: "Match not confirmed" });
    }
    if (match.initiatorId !== userId && match.receiverId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
    }
    const recipientId = match.initiatorId === userId ? match.receiverId : match.initiatorId;
    const msg = await client_1.prisma.message.create({
        data: {
            matchId,
            senderId: userId,
            recipientId,
            content: content?.trim() || null,
            voiceUrl
        }
    });
    if (socket_1.ioInstance) {
        socket_1.ioInstance.to(`user:${recipientId}`).emit("message:new", msg);
    }
    return res.status(201).json(msg);
});
exports.default = router;
