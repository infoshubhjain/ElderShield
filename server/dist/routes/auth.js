"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const client_1 = require("../db/client");
const bootstrap_1 = require("../services/bootstrap");
const router = (0, express_1.Router)();
const requestOtpSchema = zod_1.z.object({
    phoneNumber: zod_1.z.string().min(6)
});
const verifyOtpSchema = zod_1.z.object({
    phoneNumber: zod_1.z.string().min(6),
    otp: zod_1.z.string().min(4),
    name: zod_1.z.string().optional(),
    ageRange: zod_1.z.string().optional(),
    approximateLocation: zod_1.z.string().optional(),
    preferredLanguage: zod_1.z.string().optional(),
    accessibilityNeeds: zod_1.z.string().optional()
});
const otpStore = new Map();
router.post("/request-otp", async (req, res) => {
    const parsed = requestOtpSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid payload" });
    const { phoneNumber } = parsed.data;
    otpStore.set(phoneNumber, "123456");
    return res.json({ success: true });
});
router.post("/verify-otp", async (req, res) => {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid payload" });
    const { phoneNumber, otp, ...profileData } = parsed.data;
    const expectedOtp = otpStore.get(phoneNumber);
    if (!expectedOtp || expectedOtp !== otp || otp !== "123456") {
        return res.status(401).json({ error: "Invalid OTP" });
    }
    const user = await client_1.prisma.user.upsert({
        where: { phoneNumber },
        update: {
            name: profileData.name || undefined,
            ageRange: profileData.ageRange || undefined,
            approximateLocation: profileData.approximateLocation || undefined,
            preferredLanguage: profileData.preferredLanguage || undefined,
            accessibilityNeeds: profileData.accessibilityNeeds || undefined
        },
        create: {
            phoneNumber,
            name: profileData.name || "Friend",
            ageRange: profileData.ageRange || "65+",
            approximateLocation: profileData.approximateLocation || "Nearby",
            preferredLanguage: profileData.preferredLanguage || "English",
            accessibilityNeeds: profileData.accessibilityNeeds || null,
            preferredCommMode: "text"
        }
    });
    await (0, bootstrap_1.ensureDefaultPaymentMethod)(client_1.prisma, user.id);
    const token = jsonwebtoken_1.default.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || "dev-secret", { expiresIn: "30d" });
    return res.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            role: user.role,
            phoneNumber: user.phoneNumber
        }
    });
});
exports.default = router;
