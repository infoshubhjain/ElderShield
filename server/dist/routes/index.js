"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const auth_1 = __importDefault(require("./auth"));
const user_1 = __importDefault(require("./user"));
const activity_1 = __importDefault(require("./activity"));
const match_1 = __importDefault(require("./match"));
const message_1 = __importDefault(require("./message"));
const order_1 = __importDefault(require("./order"));
const admin_1 = __importDefault(require("./admin"));
const help_1 = __importDefault(require("./help"));
function registerRoutes(app) {
    app.use("/api/auth", auth_1.default);
    app.use("/api/users", user_1.default);
    app.use("/api/activities", activity_1.default);
    app.use("/api/matches", match_1.default);
    app.use("/api/messages", message_1.default);
    app.use("/api/orders", order_1.default);
    app.use("/api/admin", admin_1.default);
    app.use("/api/help", help_1.default);
    app.get("/api/health", (_req, res) => {
        res.json({ status: "ok" });
    });
}
