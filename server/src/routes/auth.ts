import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../db/client";
import { ensureDefaultPaymentMethod } from "../services/bootstrap";

const router = Router();

const requestOtpSchema = z.object({
  phoneNumber: z.string().min(6)
});

const verifyOtpSchema = z.object({
  phoneNumber: z.string().min(6),
  otp: z.string().min(4),
  name: z.string().optional(),
  ageRange: z.string().optional(),
  approximateLocation: z.string().optional(),
  preferredLanguage: z.string().optional(),
  accessibilityNeeds: z.string().optional()
});

const otpStore = new Map<string, string>();

router.post("/request-otp", async (req, res) => {
  const parsed = requestOtpSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const { phoneNumber } = parsed.data;
  otpStore.set(phoneNumber, "123456");

  return res.json({ success: true });
});

router.post("/verify-otp", async (req, res) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const { phoneNumber, otp, ...profileData } = parsed.data;
  const expectedOtp = otpStore.get(phoneNumber);
  if (!expectedOtp || expectedOtp !== otp || otp !== "123456") {
    return res.status(401).json({ error: "Invalid OTP" });
  }

  const user = await prisma.user.upsert({
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

  await ensureDefaultPaymentMethod(prisma, user.id);

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "30d" }
  );

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

export default router;
