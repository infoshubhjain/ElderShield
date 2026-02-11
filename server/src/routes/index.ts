import { Express } from "express";
import authRouter from "./auth";
import userRouter from "./user";
import activityRouter from "./activity";
import matchRouter from "./match";
import messageRouter from "./message";
import orderRouter from "./order";
import adminRouter from "./admin";
import helpRouter from "./help";

export function registerRoutes(app: Express) {
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/activities", activityRouter);
  app.use("/api/matches", matchRouter);
  app.use("/api/messages", messageRouter);
  app.use("/api/orders", orderRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/help", helpRouter);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
}
