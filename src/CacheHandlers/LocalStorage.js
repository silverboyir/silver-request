import CacheInterface from "./CacheInterface";

export default class LocalStorageCacheHandler extends CacheInterface{
    get(key) {

        let data = localStorage.getItem(key);
        if(data && data.length)
            data = JSON.parse(data);
        if(data){
            return JSON.parse(data.body);
        }
        return super.get(key);
    }
    store(key, data, response, request) {
        localStorage.setItem(key, JSON.stringify({
            time : Date.now(),
            body : JSON.stringify(data)
        }))
    }
    exist(key, validTime) {

        let data = localStorage.getItem(key);
        if(data && data.length)
            data = JSON.parse(data);
        if(data && data.time){
            return true;
            if(data.time > Date.now() - validTime)
                return true;
        }

        return super.exist(key, validTime);
    }
}