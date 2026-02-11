"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../db/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get current user profile
router.get("/me", auth_1.requireAuth, async (req, res) => {
    const user = await client_1.prisma.user.findUnique({
        where: { id: req.userId },
        include: { profile: true }
    });
    if (!user)
        return res.status(404).json({ error: "Not found" });
    return res.json(user);
});
exports.default = router;
