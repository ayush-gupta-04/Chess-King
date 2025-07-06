"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCode = getCode;
function getCode() {
    let code = '';
    for (let i = 0; i < 4; i++) {
        const a = Math.floor(Math.random() * 10);
        code = code + a;
    }
    return code;
}
