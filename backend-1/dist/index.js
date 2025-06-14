"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const UserManager_1 = require("./UserManager");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app = (0, express_1.default)();
const http = app.listen(8080);
const wss = new ws_1.WebSocketServer({ server: http });
wss.on('connection', (ws, req) => {
    var _a, _b;
    const token = (_a = req.url) === null || _a === void 0 ? void 0 : _a.split('?token=')[1];
    try {
        console.log(token);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        //@ts-ignore
        const userId = decoded.id;
        //@ts-ignore
        const name = decoded.name;
        if (userId && name) {
            if (userId && UserManager_1.UserManager.getInstance().getUser(userId) == null) {
                console.log("Creating user : " + userId + "  " + name);
                UserManager_1.UserManager.getInstance().addUser(userId, ws, name);
            }
            else if (userId && UserManager_1.UserManager.getInstance().getUser(userId) != null) {
                console.log("Reconnecting the user : " + userId + "  " + name);
                (_b = UserManager_1.UserManager.getInstance().getUser(userId)) === null || _b === void 0 ? void 0 : _b.reconnectUser(ws);
            }
        }
    }
    catch (error) {
        console.log(error);
    }
});
