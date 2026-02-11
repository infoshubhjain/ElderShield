"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.replace("Bearer ", "");
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "dev-secret");
        req.userId = decoded.sub;
        req.role = decoded.role;
        next();
    }
    catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}
function requireAdmin(req, res, next) {
    if (req.role !== "ADMIN") {
        return res.status(403).json({ error: "Forbidden" });
    }
    next();
}
