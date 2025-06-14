"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const GameManager_1 = require("./GameManager");
const UserManager_1 = require("./UserManager");
class User {
    constructor(id, ws, name) {
        this.handleMessage = (message) => {
            const parsedMessage = JSON.parse(message);
            console.log(parsedMessage);
            switch (parsedMessage.type) {
                case 'INITIALISE_GAME':
                    GameManager_1.GameManager.getInstance().addGame(this);
                    break;
                case "SEND_MESSAGE":
                    const CurrGame = GameManager_1.GameManager.getInstance().findGame(parsedMessage.data.gameId);
                    //1. Store the msg in game's message state.
                    //2. Send the Other PLayer message.
                    if (CurrGame) {
                        const players = CurrGame.getAllPlayer();
                        CurrGame.addMessage(this.name, parsedMessage.data.message, parsedMessage.data.time);
                        players.forEach((playerId) => {
                            var _a;
                            if (playerId != this.id) {
                                (_a = UserManager_1.UserManager.getInstance().getUser(playerId)) === null || _a === void 0 ? void 0 : _a.emit(JSON.stringify({
                                    type: 'MESSAGE',
                                    data: {
                                        from: this.name,
                                        message: parsedMessage.data.message,
                                        time: parsedMessage.data.time
                                    }
                                }));
                            }
                        });
                    }
                    break;
                case "MESSAGE_SYNC":
                    const gameData = GameManager_1.GameManager.getInstance().findGame(parsedMessage.data.gameId);
                    if (gameData) {
                        const allMessages = gameData.getMessages();
                        this.emit(JSON.stringify({
                            type: "MESSAGE_SYNCED",
                            data: {
                                messages: allMessages
                            }
                        }));
                        return;
                    }
                    break;
                case "JOIN_GAME":
                    const CurrentGame = GameManager_1.GameManager.getInstance().findGame(parsedMessage.data.gameId);
                    if (CurrentGame) {
                        const gameData = CurrentGame.getCurrentState(this.id);
                        const message = {
                            type: "SYNCED_POSITION",
                            data: {
                                fen: gameData.board,
                                color: gameData.color,
                                history: gameData.history
                            }
                        };
                        this.emit(JSON.stringify(message));
                        return;
                    }
                    else {
                        const errorMessage = {
                            type: 'GAME_NOT_FOUND',
                            data: {
                                error: "Game not found!"
                            }
                        };
                        this.emit(JSON.stringify(errorMessage));
                    }
                    break;
                case 'ADD_MOVE':
                    const game = GameManager_1.GameManager.getInstance().findGame(parsedMessage.data.gameId);
                    if (game) {
                        try {
                            const response = game.addMove(this.id, parsedMessage.data.from, parsedMessage.data.to);
                            const PlayersPlusSpectator = game.getAllPlayerPlusSpectator();
                            if (response.isDraw && response.winner == null) {
                                const message = {
                                    type: "GAME_OVER",
                                    data: {
                                        isDraw: true,
                                        winner: null
                                    }
                                };
                                PlayersPlusSpectator.forEach((id) => {
                                    var _a;
                                    (_a = UserManager_1.UserManager.getInstance().getUser(id)) === null || _a === void 0 ? void 0 : _a.emit(JSON.stringify(message));
                                });
                                return;
                            }
                            else if (!response.isDraw && response.winner != null) {
                                const message = {
                                    type: "GAME_OVER",
                                    data: {
                                        isDraw: false,
                                        winner: response.winner
                                    }
                                };
                                PlayersPlusSpectator.forEach((id) => {
                                    var _a;
                                    (_a = UserManager_1.UserManager.getInstance().getUser(id)) === null || _a === void 0 ? void 0 : _a.emit(JSON.stringify(message));
                                });
                                return;
                            }
                            else {
                                const message = {
                                    type: "PIECE_MOVE",
                                    data: {
                                        from: parsedMessage.data.from,
                                        to: parsedMessage.data.to
                                    }
                                };
                                PlayersPlusSpectator.forEach((id) => {
                                    var _a;
                                    if (this.id != id) {
                                        (_a = UserManager_1.UserManager.getInstance().getUser(id)) === null || _a === void 0 ? void 0 : _a.emit(JSON.stringify(message));
                                    }
                                });
                            }
                        }
                        catch (error) {
                            console.log(error);
                            const errorMessage = {
                                type: 'INVALID_MOVE',
                                data: {
                                    error: "Invalid Move !"
                                }
                            };
                            this.emit(JSON.stringify(errorMessage));
                        }
                    }
                    else {
                        const errorMessage = {
                            type: 'GAME_NOT_FOUND',
                            data: {
                                error: "Game not found!"
                            }
                        };
                        this.emit(JSON.stringify(errorMessage));
                    }
            }
        };
        this.handleClose = () => {
            console.log("User : " + this.id + " got Disconnected!");
        };
        this.id = id;
        this.ws = ws;
        this.name = name;
        this.messageListener();
        this.closeListener();
    }
    getId() {
        return this.id;
    }
    getSocket() {
        return this.ws;
    }
    getName() {
        return this.name;
    }
    emit(message) {
        this.ws.send(message);
    }
    reconnectUser(newWs) {
        //replace the old websocket with this new websocket.
        this.ws.removeAllListeners();
        this.ws.close();
        this.ws = newWs;
        //attach Event listeners to new Websocket.
        this.messageListener();
        this.closeListener();
    }
    messageListener() {
        this.ws.on('message', this.handleMessage);
    }
    closeListener() {
        this.ws.on('close', this.handleClose);
    }
}
exports.User = User;
