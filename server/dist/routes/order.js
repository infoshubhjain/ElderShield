"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../db/client");
const auth_1 = require("../middleware/auth");
const deliveryMock_1 = require("../services/deliveryMock");
const bootstrap_1 = require("../services/bootstrap");
const router = (0, express_1.Router)();
router.post("/", auth_1.requireAuth, async (req, res) => {
    const { category, items } = req.body;
    if (!category || !items || !items.length) {
        return res.status(400).json({ error: "Invalid payload" });
    }
    const userId = req.userId;
    await (0, bootstrap_1.ensureDefaultPaymentMethod)(client_1.prisma, userId);
    const order = await client_1.prisma.order.create({
        data: {
            userId,
            category,
            items: items.join(", "),
            totalAmount: Number((items.length * 4.75).toFixed(2))
        }
    });
    const delivery = await (0, deliveryMock_1.placeDeliveryOrder)({ userId, category, items });
    return res.status(201).json({
        order,
        delivery
    });
});
router.get("/", auth_1.requireAuth, async (req, res) => {
    const orders = await client_1.prisma.order.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: "desc" },
        take: 20
    });
    return res.json(orders);
});
exports.default = router;
