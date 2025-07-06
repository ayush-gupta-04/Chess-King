"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = getUser;
function getUser(id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (id == '1') {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve({
                        id: id,
                        name: "Ayush Gupta",
                        rating: 1400,
                    });
                }, 1000);
            });
        }
        if (id == '2') {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve({
                        id: id,
                        name: "Aman Kumar",
                        rating: 1350,
                    });
                }, 400);
            });
        }
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({
                    id: id,
                    name: "Unknown User " + id,
                    rating: 1200,
                });
            }, 1000);
        });
    });
}
