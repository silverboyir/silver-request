"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CacheAbstract {
    exist(key, validTime) {
        return false;
    }
    store(key, data, response, request) {
        return false;
    }
    get(key) {
        return false;
    }
}
exports.default = CacheAbstract;
