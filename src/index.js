import NetworkUnavailable from './Exception/NetworkUnavailable'
import ConfigException from "./Exception/ConfigException";
import {lang} from "./lang";
import LocalStorageCacheHandler from "./CacheHandlers/LocalStorage";




export default class SilverRequest {
    constructor(store) {
        if(typeof store == 'function')
            this.store = {
                dispatch : store
            }
        else
            this.store = store;
        this.runOnSuccessMethod = undefined;
        this.error = undefined;
        this.success = undefined;
        this.logger = undefined;
        this.needLoading = false;
        this.additionalHeader = {};
        this.sendCalled = false;
        this.method = 'GET';
        this.isHardRefreshValue = false;
        this.response = null;
        this.request = null;
        this.cacheTime = SilverRequest.cacheTime;
    }

    translate(message){
        return SilverRequest.languageFile[SilverRequest.lang][message];
    }
    setLogger(func){

        if(typeof func != 'function'){
            throw new ConfigException(this.translate('logger_is_not_a_function'));
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
            return false;
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
            if (typeof this.success == 'function') {
                this.success(responseJson);
            } else
                this.success.run(responseJson);
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

        this.sendCalled = true;

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


        var options = {
            method: this.method,
            headers: {
                // 'content-type': 'application/x-www-form-urlencoded'
                'Accept': 'application/json'
            },
        };



        if(this.method != 'GET'){
            if(this.method === 'DELETE') {
                options['Content-Type'] = 'application/x-www-form-urlencoded';
                var formBody = [];
                for (var property in this.data) {
                    var encodedKey = encodeURIComponent(property);
                    var encodedValue = encodeURIComponent(this.data[property]);
                    formBody.push(encodedKey + "=" + encodedValue);
                }
                options.body = formBody.join("&");
                options.headers['Content-Type'] =  'application/x-www-form-urlencoded;charset=UTF-8';
            }
            else {
                this.formData  = new FormData();
                for(var name in this.data) {
                    var val = this.data[name];
                    if(val == undefined)
                        val = '';
                    this.formData.append(name , val);
                }

                options.body = this.formData;

            }



        }
        else {
            //
            options['Content-Type'] =  'application/json';
        }
        options.headers = Object.assign(options.headers,this.additionalHeader, SilverRequest.additionalHeader);

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
        fetch(this.url, options)
            .then((response) => {
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

                return response.json()
            })
            .then((responseJson) => {

                this.successMethod(responseJson);
                if(this.isCachable || this.isHardRefreshValue)
                    this._saveCache(responseJson);
            })
            .catch((error) => {
                this.errorMethod(error);

            })
            .finally(() => {
                if(this.needLoading){
                    SilverRequest.ajaxInstanceRun--;
                    if (SilverRequest.ajaxInstanceRun == 0) {
                        this.dispatch({
                            type: 'SILVER_REQUEST_HIDE_LOADING'
                        });
                    }
                }
            })
        ;




    }
}
SilverRequest.additionalHeader = {};
SilverRequest.lang = 'en_US';
SilverRequest.methods = {
    GET : 'GET',
    POST : 'POST',
    DELETE : 'DELETE',
    PULL : 'PULL',
    PATCH : 'PATCH',
    PUSH : 'PUSH'
};
SilverRequest.cacheHandlers = {
    localStorage : LocalStorageCacheHandler,
    custom : 'custom'
}
SilverRequest.cacheHandler = SilverRequest.cacheHandlers.localStorage;
SilverRequest.cacheTime = 30*60*1000;
SilverRequest.globalOnSuccess = null;
SilverRequest.globalOnError = null;
SilverRequest.languageFile = lang;
