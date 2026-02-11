"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const client_1 = require("../db/client");
const auth_1 = require("../middleware/auth");
const bootstrap_1 = require("../services/bootstrap");
const router = (0, express_1.Router)();
const createMatchSchema = zod_1.z.object({
    activityId: zod_1.z.string()
});
router.post("/", auth_1.requireAuth, async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid payload" });
    const { activityId } = parsed.data;
    const requesterId = req.userId;
    await (0, bootstrap_1.ensureActivityCatalog)(client_1.prisma);
    const existing = await client_1.prisma.match.findFirst({
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
    if (existing)
        return res.json(existing);
    const candidate = await client_1.prisma.user.findFirst({
        where: { id: { not: requesterId } },
        orderBy: { createdAt: "asc" }
    });
    if (!candidate) {
        return res.json({
            status: "searching",
            message: "No nearby matches yet. We'll keep looking and notify you."
        });
    }
    const match = await client_1.prisma.match.create({
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
router.post("/:id/respond", auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    const { decision } = req.body;
    if (!["ACCEPTED", "REJECTED"].includes(decision)) {
        return res.status(400).json({ error: "Invalid decision" });
    }
    const match = await client_1.prisma.match.findUnique({ where: { id } });
    if (!match || match.receiverId !== req.userId) {
        return res.status(404).json({ error: "Not found" });
    }
    const updated = await client_1.prisma.match.update({
        where: { id },
        data: { status: decision }
    });
    return res.json(updated);
});
router.get("/", auth_1.requireAuth, async (req, res) => {
    const userId = req.userId;
    const matches = await client_1.prisma.match.findMany({
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
    return res.json(matches.map((match) => {
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
    }));
});
router.post("/:id/schedule", auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    const { scheduledFor } = req.body;
    const match = await client_1.prisma.match.findUnique({ where: { id } });
    if (!match)
        return res.status(404).json({ error: "Not found" });
    if (match.initiatorId !== req.userId && match.receiverId !== req.userId) {
        return res.status(403).json({ error: "Forbidden" });
    }
    const updated = await client_1.prisma.match.update({
        where: { id },
        data: { scheduledFor: new Date(scheduledFor) }
    });
    return res.json(updated);
});
exports.default = router;
