"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const GameManager_1 = require("./GameManager");
const types_1 = require("./types/types");
const UserManager_1 = require("./UserManager");
class User {
    constructor(user, ws) {
        this.handleClose = () => {
            console.log("User : " + this.id + " got Disconnected!");
            this.ws.removeAllListeners();
            this.ws.close();
            UserManager_1.UserManager.getInstance().deleteUser(this.id);
        };
        this.handleMessage = (message) => {
            const parsedMessage = JSON.parse(message);
            console.log(parsedMessage);
            switch (parsedMessage.type) {
                case "INITIALISE_GAME":
                    const matchType = parsedMessage.data.matchType;
                    switch (matchType) {
                        case types_1.MatchType.ONLINE:
                            GameManager_1.GameManager.getInstance().addGameViaMatchingEngine(this, parsedMessage.data);
                            break;
                        case types_1.MatchType.FRIEND:
                            GameManager_1.GameManager.getInstance().addGame(this, parsedMessage.data);
                            break;
                        //for bot let's keep it aside now.
                    }
                    break;
                case "SYNC_BOARD":
                    //either this request is coming from the player or the spectator.
                    //if player --> only find the game if he is really player...because this request can also be send by a spectator from page /game/:id
                    //id spectator --> find the game simply...iff game is public.
                    const game_id = parsedMessage.data.gameId;
                    const user = parsedMessage.data.user;
                    const game = GameManager_1.GameManager.getInstance().findGameByUserType(game_id, user, this.id);
                    if (game != undefined) {
                        //if the game was initialised but not started..
                        //we will throw an error ... that game not started. 
                        //if player -> send the fen + color.
                        //if spectator -> send the fen bs.
                        //             -> add the spwctator to the spectator[] in game.
                        try {
                            const { fen, color, w_name, w_rating, b_name, b_rating, w_time, b_time } = game.getCurrentState(this.id);
                            switch (user) {
                                case types_1.USER_TYPE.PLAYER:
                                    this.emit({
                                        type: 'BOARD_SYNCED',
                                        data: {
                                            fen: fen,
                                            color: color,
                                            w_name,
                                            w_rating,
                                            b_name,
                                            b_rating,
                                            w_time,
                                            b_time
                                        }
                                    });
                                    break;
                                case types_1.USER_TYPE.SPECTATOR:
                                    console.log('spectator come');
                                    if (!game.getSpectators().includes(this.id)) {
                                        game.addSpectator(this.id);
                                    }
                                    this.emit({
                                        type: 'BOARD_SYNCED',
                                        data: {
                                            fen: fen,
                                            w_name,
                                            w_rating,
                                            b_name,
                                            b_rating,
                                            w_time,
                                            b_time
                                        }
                                    });
                                    break;
                            }
                        }
                        catch (error) {
                            console.log(error);
                            if (error instanceof Error) {
                                //this error has occured because the game has not been started.
                                this.emit({
                                    type: "ERROR",
                                    data: {
                                        code: error.message
                                    }
                                });
                                return;
                            }
                        }
                    }
                    else {
                        console.log("game not found");
                        //game is not found.
                        //send the error message.
                        this.emit({
                            type: 'ERROR',
                            data: {
                                code: types_1.ERROR_CODE.GAME_NOT_FOUND,
                            }
                        });
                        return;
                    }
                    break;
                case 'SYNC_MESSAGE':
                    //get all the messages and emit them.
                    const game1 = GameManager_1.GameManager.getInstance().findGame(parsedMessage.data.gameId);
                    if (game1 != undefined) {
                        try {
                            const allMessages = game1.getAllMessages();
                            this.emit({
                                type: 'MESSAGE_SYNCED',
                                data: {
                                    messages: allMessages
                                }
                            });
                            return;
                        }
                        catch (error) {
                            console.log(error);
                            if (error instanceof Error) {
                                //this error has occured because the game has not been started.
                                this.emit({
                                    type: "ERROR",
                                    data: {
                                        code: error.message
                                    }
                                });
                                return;
                            }
                        }
                    }
                    else {
                        //game is not found.
                        //send the error message.
                        this.emit({
                            type: 'ERROR',
                            data: {
                                code: types_1.ERROR_CODE.GAME_NOT_FOUND,
                            }
                        });
                        return;
                    }
                    break;
                case "SEND_MESSAGE":
                    //will broadcast the message to all players.
                    const currGame = GameManager_1.GameManager.getInstance().findGame(parsedMessage.data.gameId);
                    if (currGame != undefined) {
                        currGame.addNewMessage({
                            from: this.name,
                            message: parsedMessage.data.message
                        });
                        return;
                    }
                    else {
                        //game is not found.
                        //send the error message.
                        this.emit({
                            type: 'ERROR',
                            data: {
                                code: types_1.ERROR_CODE.GAME_NOT_FOUND,
                            }
                        });
                        return;
                    }
                    break;
                case "SYNC_MOVES":
                    //send the history of the move to the user.
                    const game2 = GameManager_1.GameManager.getInstance().findGame(parsedMessage.data.gameId);
                    if (game2 != undefined) {
                        try {
                            const history = game2.getMovesHistory();
                            this.emit({
                                type: 'MOVES_SYNCED',
                                data: {
                                    history: history
                                }
                            });
                            return;
                        }
                        catch (error) {
                            console.log(error);
                            if (error instanceof Error) {
                                //this error has occured because the game has not been started.
                                this.emit({
                                    type: "ERROR",
                                    data: {
                                        code: error.message
                                    }
                                });
                                return;
                            }
                        }
                    }
                    else {
                        //game is not found.
                        //send the error message.
                        this.emit({
                            type: 'ERROR',
                            data: {
                                code: types_1.ERROR_CODE.GAME_NOT_FOUND,
                            }
                        });
                        return;
                    }
                    break;
                case 'ADD_MOVE':
                    const game3 = GameManager_1.GameManager.getInstance().findGame(parsedMessage.data.gameId);
                    if (game3 != undefined) {
                        try {
                            game3.addMove(this.id, parsedMessage.data.from, parsedMessage.data.to);
                        }
                        catch (error) {
                            console.log(error);
                            //TODO : should i emit this or not ?
                        }
                    }
                    else {
                        //game is not found.
                        //send the error message.
                        this.emit({
                            type: 'ERROR',
                            data: {
                                code: types_1.ERROR_CODE.GAME_NOT_FOUND,
                            }
                        });
                        return;
                    }
                    break;
                case "ADD_OTHER_PLAYER":
                    const game4 = GameManager_1.GameManager.getInstance().findGame(parsedMessage.data.gameId);
                    if (game4 != undefined) {
                        // add the other player to the game only if code matches.
                        try {
                            game4.addOtherPlayer(this.id, this.name, this.rating, parsedMessage.data.code);
                        }
                        catch (error) {
                            console.log(error);
                            if (error instanceof Error) {
                                //this error has occured because the game code was wrong.
                                this.emit({
                                    type: "ERROR",
                                    data: {
                                        code: error.message
                                    }
                                });
                                return;
                            }
                        }
                    }
                    else {
                        //game is not found.
                        //send the error message.
                        this.emit({
                            type: 'ERROR',
                            data: {
                                code: types_1.ERROR_CODE.GAME_NOT_FOUND,
                            }
                        });
                        return;
                    }
                    break;
            }
        };
        this.id = user.id;
        this.ws = ws;
        this.name = user.name;
        this.rating = user.rating;
        this.messageListener();
        this.closeListener();
    }
    getAllInfo() {
        return {
            id: this.id,
            name: this.name,
            rating: this.rating
        };
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
        this.ws.send(JSON.stringify(message));
    }
    messageListener() {
        this.ws.on('message', this.handleMessage);
    }
    closeListener() {
        this.ws.on('close', this.handleClose);
    }
}
exports.User = User;
