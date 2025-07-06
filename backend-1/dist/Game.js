"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const UserManager_1 = require("./UserManager");
const types_1 = require("./types/types");
const getCode_1 = require("./utils/getCode");
class Game {
    constructor(data) {
        var _a, _b, _c, _d, _e, _f;
        this.startedAt = null;
        this.spectators = []; // by default the game will be public.
        this.isPublic = true;
        this.hasStarted = false;
        this.messages = [];
        //will initialise everything.
        this.id = data.gameData.id;
        this.w_id = (_a = data.white) === null || _a === void 0 ? void 0 : _a.id;
        this.b_id = (_b = data.black) === null || _b === void 0 ? void 0 : _b.id;
        this.w_name = (_c = data.white) === null || _c === void 0 ? void 0 : _c.name;
        this.b_name = (_d = data.black) === null || _d === void 0 ? void 0 : _d.name;
        this.w_rating = (_e = data.white) === null || _e === void 0 ? void 0 : _e.rating;
        this.b_rating = (_f = data.black) === null || _f === void 0 ? void 0 : _f.rating;
        this.chess = new chess_js_1.Chess();
        this.category = data.gameData.category;
        this.isPublic = data.gameData.isPublic;
        this.code = (0, getCode_1.getCode)();
        this.matchType = data.gameData.matchType;
        this.hasStarted = (data.gameData.matchType == types_1.MatchType.ONLINE) || (data.gameData.matchType == types_1.MatchType.BOT) ? true : false;
        this.startedAt = this.hasStarted ? Date.now() : null;
        //setting the time thingy.
        const time = data.gameData.timeControl.split('+');
        const baseTime = parseInt(time[0]) * 60; // in sec
        const inc = parseInt(time[1]); // in sec.
        this.w_time = baseTime;
        this.b_time = baseTime;
        this.increment = inc;
        //broadcast game initialised info to players according to the match type.
        this.broadcastInitialisedGameMessage();
        console.log(this);
    }
    getSpectators() {
        return this.spectators;
    }
    addNewMessage(msg) {
        //push the msg to the messages.
        //broadcast it to white and black.
        this.messages.push(msg);
        this.broadcastMessage(msg);
    }
    getAllMessages() {
        if (!this.hasStarted) {
            throw new Error(types_1.ERROR_CODE.GAME_NOT_STARTED);
        }
        return this.messages;
    }
    getCurrentState(id) {
        if (!this.hasStarted) {
            throw new Error(types_1.ERROR_CODE.GAME_NOT_STARTED);
        }
        const fen = this.chess.fen();
        const color = id === this.w_id ? 'w' : id === this.b_id ? 'b' : undefined;
        return {
            fen,
            color,
            w_name: this.w_name,
            w_rating: this.w_rating,
            b_name: this.b_name,
            b_rating: this.b_rating,
            w_time: this.w_time,
            b_time: this.b_time
        };
    }
    getMovesHistory() {
        if (!this.hasStarted) {
            throw new Error(types_1.ERROR_CODE.GAME_NOT_STARTED);
        }
        const history = this.chess.history();
        return history;
    }
    addSpectator(id) {
        this.spectators.push(id);
        return;
    }
    getGameId() {
        return this.id;
    }
    getPlayersId() {
        return [this.w_id, this.b_id];
    }
    addOtherPlayer(id, name, rating, code) {
        //add the user as other player .. if the game is not started.
        //broadcast the gamestarted msg to everyone.
        if (this.hasStarted) {
            throw new Error(types_1.ERROR_CODE.GAME_ALREADY_STARTED);
        }
        if (code != this.code) {
            throw new Error(types_1.ERROR_CODE.GAME_CODE_WRONG);
        }
        this.b_id = id;
        this.b_name = name;
        this.b_rating = rating;
        this.hasStarted = true;
        this.startedAt = Date.now();
        this.broadcastStartingGameMessage();
    }
    addMove(id, from, to) {
        const turn = this.chess.turn();
        if (turn === 'w' && id === this.b_id) {
            throw new Error('Invalid Move !');
        }
        if (turn === 'b' && id === this.w_id) {
            throw new Error('Invalid Move !');
        }
        this.chess.move({ from: from, to: to });
        console.log(this.chess.ascii());
        //if move is successfull ... we have to let everyone know the move.
        //broadcast this move to everyone.
        const everyone = [...this.getPlayersId(), ...this.getSpectators()];
        console.log(everyone);
        everyone.forEach((id) => {
            var _a;
            (_a = UserManager_1.UserManager.getInstance().getUser(id || '')) === null || _a === void 0 ? void 0 : _a.emit({
                type: 'MOVE_ADDED',
                data: {
                    from: from,
                    to: to
                }
            });
        });
        //it maybe possible that the move leads to draw the match.
        //TODO : match is draw.
    }
    broadcastMessage(msg) {
        //broad cast the msg to every player.
        const players = this.getPlayersId();
        players.forEach(p => {
            var _a;
            (_a = UserManager_1.UserManager.getInstance().getUser(p || '')) === null || _a === void 0 ? void 0 : _a.emit({
                type: 'MESSAGE',
                data: {
                    message: msg
                }
            });
        });
    }
    broadcastStartingGameMessage() {
        const players = this.getPlayersId();
        players.forEach((id) => {
            var _a;
            (_a = UserManager_1.UserManager.getInstance().getUser(id || '')) === null || _a === void 0 ? void 0 : _a.emit({
                type: "GAME_STARTED",
                data: {
                    success: true,
                    message: "Game Started !",
                    w_name: this.w_name || '',
                    w_rating: this.w_rating || 0,
                    b_name: this.b_name || '',
                    b_rating: this.b_rating || 0
                }
            });
        });
    }
    broadcastInitialisedGameMessage() {
        var _a, _b, _c;
        const matchType = this.matchType;
        switch (matchType) {
            case types_1.MatchType.ONLINE:
                const onlineBroadcast = {
                    type: 'GAME_INITIALISED',
                    data: {
                        gameId: this.id,
                        success: true,
                        message: "Game Initialised Successfully !",
                        w_name: this.w_name || '',
                        w_rating: this.w_rating || 0,
                        b_name: this.b_name || '',
                        b_rating: this.b_rating || 0
                    }
                };
                (_a = UserManager_1.UserManager.getInstance().getUser(this.w_id || '')) === null || _a === void 0 ? void 0 : _a.emit(onlineBroadcast);
                (_b = UserManager_1.UserManager.getInstance().getUser(this.b_id || '')) === null || _b === void 0 ? void 0 : _b.emit(onlineBroadcast);
                break;
            case types_1.MatchType.FRIEND:
                //since white has started this game . . . we only have white data.
                //but since no match has started yet .. we will not pass any player data to the user.
                //we will send the code and gameId bs.
                const friendBroadcast = {
                    type: 'GAME_INITIALISED',
                    data: {
                        gameId: this.id,
                        code: this.code,
                        success: true,
                        message: "Game Initialised Successfully !",
                    }
                };
                (_c = UserManager_1.UserManager.getInstance().getUser(this.w_id || '')) === null || _c === void 0 ? void 0 : _c.emit(friendBroadcast);
                break;
        }
    }
}
exports.Game = Game;
