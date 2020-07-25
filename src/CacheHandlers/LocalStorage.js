"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CacheAbstract_1 = require("./CacheAbstract");
class LocalStorageCacheHandler extends CacheAbstract_1.default {
    get(key) {
        let jsonData = this.getDataFromStorage(key);
        if (jsonData) {
            return JSON.parse(jsonData.body);
        }
        return super.get(key);
    }
    store(key, data, response, request) {
        localStorage.setItem(key, JSON.stringify({
            time: Date.now(),
            body: JSON.stringify(data)
        }));
        return true;
    }
    getDataFromStorage(key) {
        let data = localStorage.getItem(key);
        if (data && data.length)
            return JSON.parse(data);
        return false;
    }
    exist(key, validTime) {
        let data = this.getDataFromStorage(key);
        if (data && data.time) {
            if (data.time > Date.now() - validTime)
                return true;
        }
        return super.exist(key, validTime);
    }
}
exports.default = LocalStorageCacheHandler;
