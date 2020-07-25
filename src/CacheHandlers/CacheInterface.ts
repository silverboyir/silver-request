export default interface CacheInterface {
    exist : (key : string, validTime : number) => Boolean;
    store : (key : string, data : {[k: string]: any}, response : Response, request : Request) => boolean;
    get : (key : string) => {[k: string]: any} | boolean;
}