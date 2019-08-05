# SilverRequest

A Fetch Wrapper with cache support that works with Redux

## Getting Started

```
import SilverRequest from "silver-request";

    new SilverRequest(dispatch)
        .setUrl('http://github.com')
        .setEvent('Github Loaded')
        .send(); 
```


### Installing

using yarn

```
yarn add silver-request
```
npm
```
npm install silver-request
```
## Running the tests

simply run

```
yarn test
```

## Usage

| method | type | default | Description |
| --- | --- | --- | --- |
| `setLogger` | function | null | set a function for loggin eg console.log
| `setRunOnSuccess` | function | null | set a function to run on successful request and to call this method is useful when you want plugin call desire event on successful request
| `setOnSuccess` | function or object | function | set a function to be called after receiving respond , this will override calling event
| `setOnError` | function  | function | set a function to be called after error happen
| `setMethod` | string  | GET | set request type method
| `setIsCachable` | boolean  | false | is request is cachable or not
| `setUrl` | string  | null | 
| `setEvent` | string  | null | the event name (Redux Event) that will be fired after successful request
| `setData` | object  | null | the data that will be sent by POST request
| `setNeedLoading` | boolean  | false | 
| `addAdditionalHeader` | object  | null |  adding additional header to request
| `setAdditionalHeader` | object  | null |  set additional header to request
| `setCacheTime` | integer  | 30*60*1000 |  
| `setIsHardRefresh` | boolean  | false |  if true , it will ignore existing cache , but will cache the reponse
| `send` |   |  |  call this method to send the request


## Static Properties

this properties will be applied to all request , set them in initializing you application

| name | type | default | Description |
| --- | --- | --- | --- |
| `additionalHeader` | object | object | adding token for example
| `lang` | string | en_US | 
| `cacheHandler` | Object | LocalStorageCacheHandler |  
| `cacheTime` | Integer | 30*60*1000 |  
| `globalOnSuccess` | function | null |  
| `globalOnError` | function | null |  
| `languageFile` | Object | Object |  

## TODO
* writing more test
* writing more cache adapter
* adding canceling request ability



