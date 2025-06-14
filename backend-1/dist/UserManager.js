"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const User_1 = require("./User");
class UserManager {
    constructor() {
        this.users = new Map();
    }
    static getInstance() {
        if (!this.instance) {
            return this.instance = new UserManager();
        }
        return this.instance;
    }
    addUser(userId, ws, name) {
        const user = new User_1.User(userId, ws, name);
        this.users.set(userId, user);
    }
    deleteUser(userId) {
        this.users.delete(userId);
    }
    getUser(userId) {
        return this.users.get(userId);
    }
}
exports.UserManager = UserManager;
