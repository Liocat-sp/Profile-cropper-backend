class HttpError extends Error {
    constructor(message, errorCode){
        this.message = message;
        this.code = errorCode;
    }
}

module.exports = HttpError;