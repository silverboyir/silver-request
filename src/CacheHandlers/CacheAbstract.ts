import CacheInterface from "./CacheInterface";

export default class CacheAbstract implements CacheInterface {
    exist(key : string, validTime : number){
        return false;
    }
    store(key : string, data : {[k: string]: any}, response : Response, request : Request)
    {
        return false;
    }
    get(key : string){
        return false;
    }
}