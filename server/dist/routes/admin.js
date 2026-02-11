"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../db/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All admin routes require authenticated admin.
router.use(auth_1.requireAuth, auth_1.requireAdmin);
router.get("/users", async (_req, res) => {
    const users = await client_1.prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 100
    });
    return res.json(users);
});
router.get("/activities", async (_req, res) => {
    const activities = await client_1.prisma.activity.findMany();
    return res.json(activities);
});
router.post("/activities", async (req, res) => {
    const { name, description, category } = req.body;
    if (!name || !category) {
        return res.status(400).json({ error: "Invalid payload" });
    }
    const activity = await client_1.prisma.activity.create({
        data: { name, description, category }
    });
    return res.status(201).json(activity);
});
router.get("/reports", async (_req, res) => {
    const reports = await client_1.prisma.report.findMany({
        orderBy: { createdAt: "desc" },
        take: 100
    });
    return res.json(reports);
});
router.post("/reports/:id/resolve", async (req, res) => {
    const { id } = req.params;
    const report = await client_1.prisma.report.update({
        where: { id },
        data: { status: "RESOLVED" }
    });
    return res.json(report);
});
exports.default = router;
