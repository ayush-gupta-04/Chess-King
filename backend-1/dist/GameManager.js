"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const Game_1 = require("./Game");
const types_1 = require("./types/types");
class GameManager {
    constructor() {
        this.games = [];
        this.pendingPlayer = [];
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
    addGame(user, data) {
        const { id, name, rating } = user.getAllInfo();
        const { category, matchType, isPublic, timeControl } = data;
        //just create a game with the details.
        //don't give the black details yet. It will be filled when the person with code joins.
        GameManager.lastGameId++;
        const newGame = new Game_1.Game({
            white: {
                id: id,
                name: name,
                rating: rating
            },
            gameData: {
                id: GameManager.lastGameId,
                category: category,
                timeControl: timeControl,
                matchType: matchType,
                isPublic: isPublic || true
            }
        });
        this.games.push(newGame);
    }
    addGameViaMatchingEngine(user, data) {
        //matchType will be online always.
        //extract the user data to initialise the game;
        const { category, timeControl } = data;
        const { id, name, rating } = user.getAllInfo();
        //we have to find a user with same category , timeControl , +-100 rating.
        //finding the user to make a match.
        if (this.pendingPlayer.length == 0) {
            console.log(this.pendingPlayer);
            console.log("No pending player ... making this player pending");
            //make this user a pending player.
            this.pendingPlayer.push({
                id: id,
                name: name,
                rating: rating,
                gameCategory: category,
                timeControl: timeControl
            });
            console.log(this.pendingPlayer);
            return;
            //don't notify the user yet about this pending situation.
        }
        //make a match.
        let index;
        const OtherPlayer = this.pendingPlayer.find((p, i) => {
            if (p.gameCategory === category && p.timeControl === timeControl && (p.rating >= rating - 100 && p.rating <= rating + 100)) {
                index = i;
                return p;
            }
        });
        if (OtherPlayer == undefined || index == undefined) {
            //no match found...simple return.
            return;
        }
        //we found a match.
        //remove the other player from the game if game is initialised successfully.
        //initiate a game.
        //push the game to the Game array.
        //game should be public ok...no privacy here because it is online.
        GameManager.lastGameId++;
        const newGame = new Game_1.Game({
            white: {
                id: OtherPlayer.id,
                name: OtherPlayer.name,
                rating: OtherPlayer.rating
            },
            black: {
                id: id,
                name: name,
                rating: rating
            },
            gameData: {
                id: GameManager.lastGameId,
                category,
                timeControl,
                isPublic: true,
                matchType: types_1.MatchType.ONLINE
            }
        });
        //push the game.
        //remove the otherPLayer from the pending player list.
        this.games.push(newGame);
        this.pendingPlayer.splice(index, 1);
        console.log("game intiated !");
        console.log(this.pendingPlayer);
    }
    findGame(id) {
        const game = this.games.find(g => {
            if (id === g.getGameId()) {
                return g;
            }
        });
        return game;
    }
    findGameByUserType(id, user, user_id) {
        const game = this.games.find(g => {
            if (id === g.getGameId()) {
                return g;
            }
        });
        if (game) {
            if (user === types_1.USER_TYPE.PLAYER) {
                //it's id must be as w_id or b_id.
                console.log(game.getPlayersId());
                if (game.getPlayersId().some((id) => { return user_id === id; })) {
                    return game;
                }
                else {
                    return undefined;
                }
            }
            if (user === types_1.USER_TYPE.SPECTATOR) {
                //only return the game if its public.
                if (game.isPublic) {
                    return game;
                }
                return undefined;
            }
        }
        return undefined;
    }
    removeGame() {
    }
}
exports.GameManager = GameManager;
GameManager.lastGameId = 0;
