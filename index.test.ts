const fetch = require('node-fetch');
global.Headers = fetch.Headers;
global.Request = fetch.Request;
import SilverRequest from "./src/index";

window.alert = jest.fn();
const fetchMock = require('fetch-mock');

let obj : SilverRequest;
beforeEach(() => {
    obj = new SilverRequest(jest.fn())

})


beforeAll(() => {

   

    fetchMock.mock('/success', { foo: 'bar' });
    fetchMock.mock('/bad', 500);

})


test('Test logger', () => {
    let logger = jest.fn();
    expect(obj.setLogger(logger)).toBeInstanceOf(SilverRequest);


    obj.setUrl('/success');
    obj.send();
    expect(logger).toHaveBeenCalled();

    expect(obj.setLogger.bind(obj, null)).toThrow();


})

test('test setRunOnSuccess', () => {
        let runOnSuccess = jest.fn();
        expect(obj.setRunOnSuccess(runOnSuccess)).toBeInstanceOf(SilverRequest);

        obj.setUrl('/success');
        obj.send();

        setTimeout(() => {
            expect(runOnSuccess).toHaveBeenCalled();
        }, 200);

        expect(obj.setRunOnSuccess.bind(obj, null)).toThrow();
})

test('test setOnSuccess', async () => {
    let runOnSuccess = jest.fn();
    expect(obj.setOnSuccess(runOnSuccess)).toBeInstanceOf(SilverRequest);

    obj.setUrl('/success');
    await obj.send();

    expect(runOnSuccess).toHaveBeenCalled();

    expect(obj.setOnSuccess.bind(obj, null)).toThrow();
});

test('test setOnError', async () => {
    
    let setOnError = jest.fn();
    expect(obj.setOnError(setOnError)).toBeInstanceOf(SilverRequest);
    //
    obj.setUrl('/bad');
    try {
        let pr : Promise<any> = await obj.send();
        
    }
    catch(e){

    }

    expect(setOnError).toHaveBeenCalled();

    expect(obj.setOnError.bind(obj, null)).toThrow();
  
})
