"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const Game_1 = require("./Game");
class GameManager {
    constructor() {
        this.games = [];
        this.pendingPlayer = null;
    }
    getLastGameId() {
        return GameManager.lastGameId;
    }
    static getInstance() {
        if (!this.instance) {
            return this.instance = new GameManager();
        }
        return this.instance;
    }
    addGame(user) {
        if (this.pendingPlayer == null) {
            console.log('No player available');
            console.log("Creating pending player : " + user.getId());
            this.pendingPlayer = user;
            return;
        }
        if (this.pendingPlayer.getId() === user.getId()) {
            return;
        }
        GameManager.lastGameId++;
        console.log("Creating a new Game");
        const gameId = GameManager.lastGameId;
        const game = new Game_1.Game(this.pendingPlayer.getId(), user.getId(), this.pendingPlayer.getName(), user.getName(), gameId);
        this.games.push(game);
        console.log("Created a game : " + gameId);
        console.log('white : ' + this.pendingPlayer.getName());
        console.log('black : ' + user.getName());
        this.pendingPlayer = null;
    }
    findGame(gameId) {
        const game = this.games.find(game => gameId === game.getGameId());
        return game;
    }
    removeGame() {
    }
}
exports.GameManager = GameManager;
GameManager.lastGameId = 0;
