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
    addUser(ws, user) {
        console.log("creating user : " + user.id);
        const newUser = new User_1.User(user, ws);
        this.users.set(user.id, newUser);
    }
    deleteUser(userId) {
        console.log("deleting user " + userId);
        this.users.delete(userId);
    }
    getUser(userId) {
        if (userId) {
            return this.users.get(userId);
        }
    }
}
exports.UserManager = UserManager;
