export default class NetworkUnavailable extends Error {
    constructor(response) {
        super(response);
        this.name = 'Network Error';
    }
}