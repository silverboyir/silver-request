import CacheInterface from "./CacheInterface";

export default class LocalStorageCacheHandler extends CacheInterface{
    get(key) {
        let data = localStorage.getItem(key);
        if(data){
            return data.body;
        }
        return super.get(key);
    }
    store(key, data, response, request) {
        localStorage.setItem(key, {
            time : Date.now(),
            body : response
        })
    }
    exist(key, validTime) {

        let data = localStorage.getItem(key);
        if(data && data.time){
            if(data.time > Date.now() - validTime)
                return true;
        }

        return super.exist(key, validTime);
    }
}