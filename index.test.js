import SilverRequest from "./src";
window.alert = jest.fn();
const fetchMock = require('fetch-mock');

let obj;
beforeEach(() => {
    obj = new SilverRequest({
        dispatch : jest.fn()
    })

})


beforeAll(() => {
    fetchMock.mock('/success', { foo: 'bar' });
    fetchMock.mock('/bad', 500);

})
test('Test Translate', () => {
    expect(obj.translate('test')).toBe('Test', 'English test');
    SilverRequest.lang = 'fa_IR';
    expect(obj.translate('test')).toBe('تست', 'Foreign Language test');
    SilverRequest.lang = 'en_US';
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

test('test setOnSuccess', () => {
    let runOnSuccess = jest.fn();
    expect(obj.setOnSuccess(runOnSuccess)).toBeInstanceOf(SilverRequest);

    obj.setUrl('/success');
    obj.send();

    setTimeout(() => {
        expect(setOnSuccess).toHaveBeenCalled();
    }, 200)

    expect(obj.setOnSuccess.bind(obj, null)).toThrow();
});

test('test setOnError', () => {
    let setOnError = jest.fn();
    expect(obj.setOnError(setOnError)).toBeInstanceOf(SilverRequest);
    //
    obj.setUrl('/error');
    obj.send();
    setTimeout(() => {

        expect(setOnError).toHaveBeenCalled();

    }, 200);

    expect(obj.setOnError.bind(obj, null)).toThrow();
})
