const http = require('http');
const url = require('url');

//TODO Add more shorthand functions

module.exports = function () {
    Object.defineProperties(http.IncomingMessage, {
        body: {
            //* Defining writable body property on request (http.IncomingMessage)
            value: undefined,
            writable: true,
        },
        cookies: {
            //* Defining writable cookies property on request (http.IncomingMessage)
            value: undefined,
            writable: true,
        },
    });

    //* Defining method for getting a header. Returns undefined if non-existent.
    http.IncomingMessage.prototype.getHeader = function (header) {
        if (typeof header !== 'string') {
            throw new Error('Header must be of type string');
        }
        return this.headers[header] ? this.headers[header] : undefined;
    };

    //* Defining method for parsing and returning url query parameters as javascript Object
    http.IncomingMessage.prototype.query = function (query) {
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
        if (query) {
            if (typeof query !== 'string') {
                throw new Error('Query argument must be of type "string"');
            } else {
                if (queries[query]) {
                    return queries[query];
                } else {
                    return undefined;
                }
            }
        }

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
    //* Supported types: primitive types, Buffer, Object
    http.ServerResponse.prototype.send = function (data) {
        if (!data) {
            return this.end();
        }

        const dataType = typeof data;

        if (dataType === 'string' || dataType === 'number' || dataType === 'boolean' || dataType === 'bigint') {
            data = Buffer.from(data + '');
            this.write(data);
            return this.end();
        }

        if (Buffer.isBuffer(data)) {
            this.write(data);
            return this.end();
        }

        data = JSON.stringify(data);
        data = Buffer.from(data);
        this.write(data);
        return this.end();
    };
};
