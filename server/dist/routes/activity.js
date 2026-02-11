"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../db/client");
const auth_1 = require("../middleware/auth");
const bootstrap_1 = require("../services/bootstrap");
const router = (0, express_1.Router)();
router.get("/", auth_1.requireAuth, async (_req, res) => {
    await (0, bootstrap_1.ensureActivityCatalog)(client_1.prisma);
    const activities = await client_1.prisma.activity.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" }
    });
    return res.json(activities.map((activity) => ({
        id: activity.id,
        name: activity.name,
        category: activity.category,
        description: activity.description
    })));
});
exports.default = router;
