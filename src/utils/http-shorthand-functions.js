const fs = require('fs');
const http = require('http');
const { promisify } = require('util');
const url = require('url');

const readFileAsync = promisify(fs.readFile);

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

    /**
     * * Method for getting a request header. Returns undefined if non-existent.
     * @param {string} header
     */
    http.IncomingMessage.prototype.getHeader = function (header) {
        if (typeof header !== 'string') {
            throw new Error('Header must be of type string');
        }
        return this.headers[header] ? this.headers[header] : undefined;
    };

    /**
     * * Method for parsing and returning url query parameters as javascript Object
     * @param {*} query
     */
    http.IncomingMessage.prototype.query = function (query) {
        const URL = url.parse(this.url);
        if (!URL.query) {
            return undefined;
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

    /**
     * * Method for setting response code
     * * Can be chained with send method
     * @param {number} code
     */
    http.ServerResponse.prototype.status = function (code) {
        if (isNaN(code)) {
            throw new Error({ error: `${code} is not a number` });
        }

        this.statusCode = code;

        return this;
    };

    /**
     * * Method for sending back data and ending the response
     * * Supported types: primitive types, Buffer, Objects
     * @param {any} data
     */
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
        this.writeHead(this.statusCode, {
            'Content-Length': Buffer.byteLength(data),
            'Content-Type': 'application/json',
        });
        return this.end(data);
    };

    /**
     * * Defining method for serving static files. Will result in 404 if file is non-existent, or nms.static middleware isn't used
     * ! NOTE: Full file path within static folder must be used. e.g html/index.html
     * @param {string} fileName
     * @returns {void}
     */
    http.ServerResponse.prototype.render = async function (fileName) {
        const fileExtentionRegex = /\.[a-zA-Z0-9]+$/i;

        if (!fileExtentionRegex.test(fileName)) {
            fileName += '.html';
        }

        try {
            const html = await readFileAsync(this.app.staticPath + '/' + fileName);
            if (html) {
                this.writeHead(200, {
                    'Content-Type': 'text/html',
                    'Content-Length': Buffer.byteLength(html),
                });
                this.end(html);
            }
        } catch (e) {
            console.log(e);
        }
    };

    /**
     * * Method for redirecting. Status code defaults to 301
     * @param {string} url
     * @param {number} statusCode
     */
    http.ServerResponse.prototype.redirect = function (url, statusCode) {
        this.writeHead(statusCode || 301, {
            Location: url,
        });
        this.end();
    };
};
