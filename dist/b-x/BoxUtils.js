"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isString = exports.isNum = exports.exists = void 0;
function exists(x) {
    return x !== undefined && x !== null;
}
exports.exists = exists;
function isNum(x) {
    return exists(x) && typeof x === `number`;
}
exports.isNum = isNum;
function isString(x) {
    return exists(x) && typeof x === `string`;
}
exports.isString = isString;
