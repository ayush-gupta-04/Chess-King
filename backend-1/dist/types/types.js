"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_TYPE = exports.MatchType = exports.ERROR_CODE = exports.GameCategory = exports.GAME_OVER_REASON = void 0;
var GAME_OVER_REASON;
(function (GAME_OVER_REASON) {
    GAME_OVER_REASON["TIMEOUT"] = "timeout";
    GAME_OVER_REASON["DRAW"] = "draw";
    GAME_OVER_REASON["CHECKMATE"] = "checkmate";
})(GAME_OVER_REASON || (exports.GAME_OVER_REASON = GAME_OVER_REASON = {}));
var GameCategory;
(function (GameCategory) {
    GameCategory["BLITZ"] = "blitz";
    GameCategory["BUTTETZ"] = "bulletz";
    GameCategory["RAPID"] = "rapid";
})(GameCategory || (exports.GameCategory = GameCategory = {}));
var ERROR_CODE;
(function (ERROR_CODE) {
    ERROR_CODE["GAME_NOT_FOUND"] = "game_not_found";
    ERROR_CODE["GAME_NOT_STARTED"] = "game_not_started";
    ERROR_CODE["GAME_CODE_WRONG"] = "game_code_wrong";
    ERROR_CODE["GAME_ALREADY_STARTED"] = "game_already_started";
})(ERROR_CODE || (exports.ERROR_CODE = ERROR_CODE = {}));
var MatchType;
(function (MatchType) {
    MatchType["ONLINE"] = "online";
    MatchType["BOT"] = "bot";
    MatchType["FRIEND"] = "friend";
})(MatchType || (exports.MatchType = MatchType = {}));
var USER_TYPE;
(function (USER_TYPE) {
    USER_TYPE["PLAYER"] = "player";
    USER_TYPE["SPECTATOR"] = "spectator";
})(USER_TYPE || (exports.USER_TYPE = USER_TYPE = {}));
