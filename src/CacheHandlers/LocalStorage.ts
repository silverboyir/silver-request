import CacheAbstract from "./CacheAbstract";

interface dataType {
    time : number,
    body : string
}

export default class LocalStorageCacheHandler extends CacheAbstract{
    get(key : string) : {[k: string]: any} | false {

        let jsonData = this.getDataFromStorage(key);
        if(jsonData){
            return JSON.parse(jsonData.body);
        }
        return super.get(key);
    }
    store(key : string, data :  {[k: string]: any}, response : Response, request : Request) {
        localStorage.setItem(key, JSON.stringify({
            time : Date.now(),
            body : JSON.stringify(data)
        }))
        return true;
    }
    getDataFromStorage(key : string) : dataType | false {
        let data  = localStorage.getItem(key);
        if(data && data.length)
           return JSON.parse(data);
        return false;
        
    }
    exist(key : string, validTime : number) {

        let data = this.getDataFromStorage(key);
        if(data && data.time){
            if(data.time > Date.now() - validTime)
                return true;
        }

        return super.exist(key, validTime);
    }
}