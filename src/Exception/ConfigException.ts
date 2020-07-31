export default class ConfigException extends Error {
    constructor(response) {
        super(response);
        this.name = 'SilverRequest Configuration Error';
    }
}