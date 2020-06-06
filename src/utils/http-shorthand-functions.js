const http = require('http');
const url = require('url');

//TODO Add more shorthand functions

module.exports = function () {
    //* Defining writable body property on request (http.IncomingMessage)
    Object.defineProperty(http.IncomingMessage, 'body', {
        writable: true,
    });

    Object.defineProperty(http.ServerResponse, 'done', {
        writable: true,
    });

    //* Defining method for parsing and returning url query parameters as javascript Object
    http.IncomingMessage.prototype.params = function () {
        const URL = url.parse(this.url);
        if (!URL.query) {
            return {};
        }
        const queryStrings = URL.query.split('&');
        const queries = {};
        queryStrings.forEach((query) => {
            query = query.split('=');
            queries[query[0]] = query[1];
        });
        return queries;
    };

    //* Defining method for setting response code
    //* Can be chained with send method
    http.ServerResponse.prototype.status = function (code) {
        if (isNaN(code)) {
            throw new Error({ error: `${code} is not a number` });
        }

        this.statusCode = code;

        return this;
    };

    //* Defining method for sending back data and ending the response
    //* Supported types: String, Buffer, Object
    http.ServerResponse.prototype.send = function (data) {
        if (!data) {
            return this.end();
        }

        const dataType = typeof data;

        if (dataType === 'string' || dataType === 'number' || dataType === 'boolean' || dataType === 'bigint') {
            data = Buffer.from(data.toString());
            this.done = true;
            this.write(data);
            return this.end();
        }

        if (Buffer.isBuffer(data)) {
            this.write(data);
            return this.end();
        }

        data = JSON.stringify(data);
        data = Buffer.from(data);
        this.done = true;
        this.write(data);
        return this.end();
    };
};
