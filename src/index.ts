import NetworkUnavailable from './Exception/NetworkUnavailable'
import ConfigException from "./Exception/ConfigException";
import LocalStorageCacheHandler from "./CacheHandlers/LocalStorage";
import en_US from "./lang/en_US"

import {SuccessObject, CacheInterfaceConstructable, langDictionary, langInterface} from "./common/types"


export default class SilverRequest {

    private runOnSuccessMethod : (jsonResponse : object) => null;
    private success : ((jsonResponse : object) => null) | SuccessObject;
    private error : ((e : Error) => null) | null;
    private logger : ((a : any) => null) | null;
    private needLoading : boolean = false;
    private additionalHeader : object = {};
    private method : string = 'GET';
    private isHardRefreshValue : boolean = false;
    private response : Response = null;
    private request : Request = null;
    private cacheTime : number = 0;
    private url : string = '';
    private isCachable : boolean = false;
    private data : {[k: string]: any} = {};
    private event : string 

    public static cacheTime : number = 30*60*1000;
    public static ajaxInstanceRun : number = 0;
    public static additionalHeader : {[k: string]: string} = {};
    public static lang : string = 'en_US';
    public static methods : {[k: string]: string} = {
        GET : 'GET',
        POST : 'POST',
        DELETE : 'DELETE',
        PULL : 'PULL',
        PATCH : 'PATCH',
        PUSH : 'PUSH'
    };

    public static cacheHandlers : {[k: string]: CacheInterfaceConstructable} = {
        localStorage : LocalStorageCacheHandler,
    }

    public static cacheHandler : CacheInterfaceConstructable = SilverRequest.cacheHandlers.localStorage; 
    public static globalOnSuccess : ((e : object) => any) | null = null;
    public static globalOnError : ((e : Error) => any) | null = null;

    // TODO type declarration
    public static languageData : langDictionary = {
        'en_US' : en_US
    };


    constructor(private store) {
    
        this.cacheTime = SilverRequest.cacheTime;
    }

    translate(message){
        return SilverRequest.languageData[SilverRequest.lang][message];
    }
    setLogger(func){

        if(typeof func != 'function'){
            throw new ConfigException(this.translate());
        }

        this.logger = func;
        return this
    }
    setRunOnSuccess(func){
        if(typeof func != 'function'){
            throw new ConfigException(this.translate('run_on_success_is_not_a_function'));
        }
        this.runOnSuccessMethod = func;
        return this;
    }
    setOnSuccess(func) {

        if (!func || typeof func != 'function' && typeof func != 'object') {
            throw new ConfigException(this.translate('success_must_be_function_or_object'));
        } else if(typeof func == 'object' && typeof func.run != 'function')
            throw new ConfigException(this.translate('success_must_have_a_method_with_name_run'));

        this.success = func;
        return this;
    }
    setOnError(func){

        if(typeof func != 'function'){
            throw new ConfigException(this.translate('error_handler_is_not_a_function'));
        }

        this.error = func;
        return this;
    }
    setMethod(method) {

        if(SilverRequest.methods[method] === undefined)
            throw new ConfigException(this.translate('method_must_be_one_of').replace('%s', method));

        this.method = method;
        if(method != 'GET')
            this.setIsCachable(false);
        return this;
    }

    setIsCachable(boolVal) {
        this.isCachable = boolVal;
        return this;
    }
    setUrl(url) {
        this.url = url;

        return this;
    }
    getUrl(){
        return this.url;
    }
    setEvent(event) {
        this.event = event;
        return this;
    }
    setData(data) {
        this.data = data;
        return this;
    }
    setNeedLoading(boolVal){
        this.needLoading = boolVal;
        return this;
    }

    addAdditionalHeader(key , val){
        SilverRequest.additionalHeader[key] = val;
        return this;
    }

    setAdditionalHeader(object){

        SilverRequest.additionalHeader = object;
        return this;
    }

    setCacheTime(time){
        this.cacheTime = time;
    }

    /**
     *
     * @returns {CacheInterface}
     */
    getCacheObject(){
        return new SilverRequest.cacheHandler();
    }
    _checkCacheExist(){

        return this.getCacheObject().exist(this._getCacheFileName(), this.cacheTime);

    }
    _getCacheFileName(){
        if(this.url)
            return btoa(unescape(encodeURIComponent(this.url)));
        else
            return null;
    }
    _saveCache(data){
        return this.getCacheObject().store(this._getCacheFileName(), data, this.response, this.request);
    }
    setIsHardRefresh(bool){
        this.isHardRefreshValue = bool;
        return this;
    }
    _readFromCache(){
        return this.getCacheObject().get(this._getCacheFileName());
    }

    dispatch(obj){

        // TODO use global and options
        this.store.dispatch(obj)
    }

    successMethod(responseJson){
        if (this.logger) {
            this.logger(responseJson);
        }


        if (this.runOnSuccessMethod)
            this.runOnSuccessMethod(responseJson);
        if (this.success) {
            if("run" in this.success)
                this.success.run(responseJson);
            else 
                this.success(responseJson);
        } else if (this.event && this.event !== '') {
            if(SilverRequest.globalOnSuccess != null)
                SilverRequest.globalOnSuccess(responseJson);

            this.dispatch({type: this.event, success: true, data: responseJson});

        }
        else {
            if(SilverRequest.globalOnSuccess != null)
                SilverRequest.globalOnSuccess(responseJson);
        }
    }
    errorMethod(error){
        if(this.logger){
            this.logger(error);
        }

        if (this.error)
            this.error(error);
        else if(SilverRequest.globalOnError != null){
            SilverRequest.globalOnError(error);
        }
        else if(error.name) {
            alert(error.name);
        }
    }

    send(){


        if(this.isCachable){

            try {

                if(this._checkCacheExist()){
                    let res = this._readFromCache();
                    if(res){
                        this.successMethod(res);
                        return;
                    }

                }
            }
            catch (e) {
                console.log('Cache Error', e);
            }

        }

        let isConnected = false;
        if(window.navigator && window.navigator.onLine){
            isConnected = true;
        }

        if(!isConnected)
        {
            if(this.logger)
                this.logger('Network Is Unavailable');

            this.errorMethod(new NetworkUnavailable(this.translate('network_unavailable')));
            return false;
        }


        let options : {[k: string]: any} = {
            method: this.method,
        };

        let headers : Headers = new Headers();
        headers.append('Accept', 'application/json'); 

     
        if(this.method != 'GET'){
            if(this.method === 'DELETE') {
                var formBody = [];
                for (var property in this.data) {
                    var encodedKey = encodeURIComponent(property);
                    var encodedValue = encodeURIComponent(this.data[property]);
                    formBody.push(encodedKey + "=" + encodedValue);
                }
                options.body = formBody.join("&");
                headers.append['Content-Type'] =  'application/x-www-form-urlencoded;charset=UTF-8';
            }
            else {
                let formData  = new FormData();
                for(var name in this.data) {
                    var val = this.data[name];
                    if(val == undefined)
                        val = '';
                        formData.append(name , val);
                }

                options.body = formData;

            }



        }
        else {
            //
            headers.append['Content-Type'] =  'application/x-www-form-urlencoded;charset=UTF-8';
        }
        let allAdditionalHeaders = Object.assign(options.headers,this.additionalHeader, SilverRequest.additionalHeader);

        for(let i in allAdditionalHeaders){
            headers.append(i, allAdditionalHeaders[i]);
        }

        options.headers = headers;

        this.request = new Request(this.getUrl(), options);
        



        if(this.needLoading){
            this.dispatch({
                type : 'SILVER_REQUEST_SHOW_LOADING'
            });

            if(SilverRequest.ajaxInstanceRun == undefined || SilverRequest.ajaxInstanceRun < 0)
                SilverRequest.ajaxInstanceRun = 0;
            SilverRequest.ajaxInstanceRun++;
        }

        

        if(this.logger)
            this.logger(options);
        let isError = false;
        // fetch(this.url, options)
        fetch(this.request)
            .then((response : Response) => {
                if(this.needLoading){
                    SilverRequest.ajaxInstanceRun--;
                    if (SilverRequest.ajaxInstanceRun == 0) {
                        this.dispatch({
                            type: 'SILVER_REQUEST_HIDE_LOADING'
                        });
                    }
                }
                if(this.logger){
                    this.logger(response);
                }

                if(response.status != 200){
                    isError = true;
                    // console.log(response.json());

                    response.json().then((res) => {
                        try {
                            if(res.message && res.message != '')
                                throw new Error(res.message);
                            else
                                throw new Error(this.translate('unknown_error'));
                        }
                        catch (e) {
                            this.errorMethod(e);
                        }



                    });

                    throw new Error('');

                    //
                }

                this.response = response;
                return response.json()
            })
            .then((responseJson) => {

                this.successMethod(responseJson);
                if(this.isCachable || this.isHardRefreshValue)
                    this._saveCache(responseJson);
            })
            .catch((error) => {
                if(this.needLoading){
                    SilverRequest.ajaxInstanceRun--;
                    if (SilverRequest.ajaxInstanceRun == 0) {
                        this.dispatch({
                            type: 'SILVER_REQUEST_HIDE_LOADING'
                        });
                    }
                }
                this.errorMethod(error);

            })
        ;




    }
    
}

