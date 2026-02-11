import { Router } from "express";
import { prisma } from "../db/client";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { placeDeliveryOrder } from "../services/deliveryMock";
import { ensureDefaultPaymentMethod } from "../services/bootstrap";

const router = Router();

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { category, items } = req.body as {
    category: "GROCERIES" | "MEDICINES" | "MEALS";
    items: string[];
  };

  if (!category || !items || !items.length) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const userId = req.userId as string;

  await ensureDefaultPaymentMethod(prisma, userId);

  const order = await prisma.order.create({
    data: {
      userId,
      category,
      items: items.join(", "),
      totalAmount: Number((items.length * 4.75).toFixed(2))
    }
  });

  const delivery = await placeDeliveryOrder({ userId, category, items });

  return res.status(201).json({
    order,
    delivery
  });
});

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    take: 20
  });
  return res.json(orders);
});

export default router;
