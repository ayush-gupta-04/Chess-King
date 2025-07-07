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
        this.turnTimeOut = null;
        this.lastMoveAt = null;
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
        if (this.hasStarted) {
            this.setTurnTimeout();
            this.lastMoveAt = Date.now();
        }
        //broadcast game initialised info to players according to the match type.
        this.broadcastInitialisedGameMessage();
    }
    setTurnTimeout() {
        const turn = this.chess.turn();
        const rem_time = turn == 'w' ? this.w_time : this.b_time;
        if (rem_time <= 0) {
            this.handleTimeout(turn);
            return;
        }
        //if white's turn .. then after rem_time just do the judgement.
        this.turnTimeOut = setTimeout(() => {
            this.handleTimeout(turn);
        }, rem_time * 1000);
    }
    handleTimeout(turn) {
        if (this.turnTimeOut) {
            clearInterval(this.turnTimeOut);
        }
        const looser = turn;
        const winner = turn == 'w' ? 'b' : 'w';
        //broadcast the winner looser message. 
        this.broadcastGameOver(types_1.GAME_OVER_REASON.TIMEOUT, winner, looser);
        //TODO : 
        // calculate the rating thing.
        // end the game.
        // remove the game from engine. DB m store rhega ye sb data.
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
        const turn = this.chess.turn();
        let w_e = 0;
        let b_e = 0;
        if (turn == 'w') {
            w_e = Math.floor((Date.now() - this.lastMoveAt) / 1000);
        }
        else {
            b_e = Math.floor((Date.now() - this.lastMoveAt) / 1000);
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
            w_time: this.w_time - w_e,
            b_time: this.b_time - b_e,
            turn: turn
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
        this.setTurnTimeout();
        this.lastMoveAt = Date.now();
    }
    addMove(id, from, to) {
        const turn = this.chess.turn();
        if (turn === 'w' && id === this.b_id) {
            throw new Error('Invalid Move !');
        }
        if (turn === 'b' && id === this.w_id) {
            throw new Error('Invalid Move !');
        }
        const now = Date.now();
        const elapsed = Math.floor((now - this.lastMoveAt) / 1000);
        this.chess.move({ from: from, to: to });
        //reduce the w-time and b-time and add increment..since a move is made.
        if (turn == 'w') {
            this.w_time = this.w_time - elapsed;
            this.w_time = this.w_time + this.increment;
        }
        else {
            this.b_time = this.b_time - elapsed;
            this.b_time = this.b_time + this.increment;
        }
        //if turn white ka tha and white move chl diya to .. white ka clock clear ho jana chahiye right.
        this.lastMoveAt = now;
        if (this.turnTimeOut) {
            clearInterval(this.turnTimeOut);
        }
        //if turn w ka tha and w move chl diya .. to abhi setTurnTimeout black ke lie chlna chanhiye.
        this.setTurnTimeout();
        //if move is successfull ... we have to let everyone know the move.
        //broadcast this move to everyone.
        this.broacastMoveAdded(from, to);
        console.log(this.w_time);
        console.log(this.b_time);
        //it maybe possible that the move leads to draw the match.
        if (this.chess.isDraw() || this.chess.isDrawByFiftyMoves() || this.chess.isStalemate()) {
            //if w moved and now it's b's turn next ... draw..
            this.broadcastGameOver(types_1.GAME_OVER_REASON.DRAW);
            //TODO : 
            // calculate the rating thing.
            // end the game.
            // remove the game from engine. DB m store rhega ye sb data.
        }
        if (this.chess.isCheckmate()) {
            //if w moved and now it's b's turn next ... winner w....therefore winner turn.
            const winner = turn;
            const looser = turn == 'w' ? 'b' : 'w';
            this.broadcastGameOver(types_1.GAME_OVER_REASON.CHECKMATE, winner, looser);
            //TODO : 
            // calculate the rating thing.
            // end the game.
            // remove the game from engine. DB m store rhega ye sb data.
        }
    }
    broadcastGameOver(reason, winner, looser) {
        const everyone = [...this.getPlayersId(), ...this.getSpectators()];
        console.log(everyone);
        everyone.forEach((id) => {
            var _a;
            (_a = UserManager_1.UserManager.getInstance().getUser(id || '')) === null || _a === void 0 ? void 0 : _a.emit({
                type: 'GAME_OVER',
                data: {
                    reason: reason,
                    w: winner,
                    l: looser,
                }
            });
        });
    }
    broacastMoveAdded(from, to) {
        const everyone = [...this.getPlayersId(), ...this.getSpectators()];
        console.log(everyone);
        everyone.forEach((id) => {
            var _a;
            (_a = UserManager_1.UserManager.getInstance().getUser(id || '')) === null || _a === void 0 ? void 0 : _a.emit({
                type: 'MOVE_ADDED',
                data: {
                    from: from,
                    to: to,
                    w_t: this.w_time,
                    b_t: this.b_time,
                    turn: this.chess.turn()
                }
            });
        });
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
