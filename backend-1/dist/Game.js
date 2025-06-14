"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const UserManager_1 = require("./UserManager");
class Game {
    constructor(whitePlayerId, blackPlayerId, whiteName, blackName, gameId) {
        this.whitePlayer = whitePlayerId;
        this.blackPlayer = blackPlayerId;
        this.startTime = new Date();
        this.gameId = gameId;
        this.chess = new chess_js_1.Chess();
        this.whiteName = whiteName;
        this.blackName = blackName;
        this.emitInitialisedGameMessage();
        this.messages = [];
    }
    getGameId() {
        return this.gameId;
    }
    emitInitialisedGameMessage() {
        var _a, _b;
        const message = {
            type: 'GAME_INITIALISED',
            data: {
                gameId: this.gameId
            }
        };
        (_a = UserManager_1.UserManager.getInstance().getUser(this.whitePlayer)) === null || _a === void 0 ? void 0 : _a.emit(JSON.stringify(message));
        (_b = UserManager_1.UserManager.getInstance().getUser(this.blackPlayer)) === null || _b === void 0 ? void 0 : _b.emit(JSON.stringify(message));
    }
    addMove(playerId, from, to) {
        const turn = this.chess.turn();
        if (turn == 'w' && playerId == this.blackPlayer) {
            throw new Error("Invalid Move !");
        }
        if (turn == 'b' && playerId == this.whitePlayer) {
            throw new Error("Invalid Move !");
        }
        this.chess.move({ from: from, to: to });
        console.log(this.chess.ascii());
        const draw = this.chess.isDraw() || this.chess.isDrawByFiftyMoves();
        const gameOver = this.chess.isGameOver();
        return {
            isDraw: draw,
            winner: gameOver ? turn : null
        };
    }
    getAllPlayerPlusSpectator() {
        const EveryPeople = [this.whitePlayer, this.blackPlayer];
        return EveryPeople;
    }
    getAllPlayer() {
        const EveryPeople = [this.whitePlayer, this.blackPlayer];
        return EveryPeople;
    }
    getCurrentState(playerId) {
        const board = this.chess.fen();
        const color = this.whitePlayer === playerId ? 'w' : 'b';
        const history = this.chess.history();
        return {
            board: board,
            color: color,
            history
        };
    }
    addMessage(from, message, time) {
        this.messages.push({
            from: from,
            message: message,
            time: time
        });
    }
    getMessages() {
        return this.messages;
    }
}
exports.Game = Game;
