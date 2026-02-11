"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ioInstance = void 0;
exports.attachSocketHandlers = attachSocketHandlers;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.ioInstance = null;
function attachSocketHandlers(io) {
    exports.ioInstance = io;
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token)
            return next(new Error("unauthorized"));
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "dev-secret");
            socket.userId = decoded.sub;
            next();
        }
        catch {
            next(new Error("unauthorized"));
        }
    });
    io.on("connection", (socket) => {
        const userId = socket.userId;
        socket.join(`user:${userId}`);
        socket.on("disconnect", () => {
            // placeholder for future presence tracking
        });
    });
}
