export default class CacheInterface {
    exist(key, validTime){
        return false;
    }
    store(key, data, response, request){

    }
    get(key){
        return null;
    }
}