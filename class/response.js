class Response {
    constructor(httpCode, success, error, data) {
        this.httpCode = httpCode;
        this.success = success;
        this.error = error;
        this.data = data;
    }

    

}

module.exports = Response;