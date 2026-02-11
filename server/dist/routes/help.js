"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const checkInSchema = zod_1.z.object({
    kind: zod_1.z.enum(["EMERGENCY", "SUPPORT", "CAREGIVER"]),
    note: zod_1.z.string().max(240).optional()
});
router.post("/check-in", auth_1.requireAuth, async (req, res) => {
    const parsed = checkInSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid payload" });
    return res.json({
        success: true,
        userId: req.userId,
        kind: parsed.data.kind,
        note: parsed.data.note || null,
        createdAt: new Date().toISOString(),
        message: "We recorded your request and will prioritize follow-up."
    });
});
exports.default = router;
