"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const UserManager_1 = require("./UserManager");
const getUser_1 = require("./utils/getUser");
const app = (0, express_1.default)();
const http = app.listen(8080, () => { console.log("Server avtive at port 8080!"); });
const wss = new ws_1.WebSocketServer({ server: http });
wss.on('connection', (ws, req) => {
    var _a;
    const BufferedMessages = [];
    let initialised = false;
    const id = (_a = req.url) === null || _a === void 0 ? void 0 : _a.split('?id=')[1];
    if (id) {
        (0, getUser_1.getUser)(id).then((data) => {
            initialised = true;
            UserManager_1.UserManager.getInstance().addUser(ws, data);
            BufferedMessages.forEach((msg) => {
                var _a;
                (_a = UserManager_1.UserManager.getInstance().getUser(id)) === null || _a === void 0 ? void 0 : _a.handleMessage(msg);
            });
            BufferedMessages.splice(0, BufferedMessages.length);
        });
    }
    if (!initialised) {
        ws.on('message', (msg) => {
            BufferedMessages.push(msg);
        });
    }
});
