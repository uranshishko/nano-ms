const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { promisify } = require('util');

const mime = require('mime-types');

const readFileAsync = promisify(fs.readFile);

const requestHandler = require('./utils/request-handler');
const createHttpShorthandFunctions = require('./utils/http-shorthand-functions.js');

class NanoMS {
    constructor(host) {
        //* Creating shorthand functions for HTTP requests and responses
        createHttpShorthandFunctions();

        //* Initializing server
        this.server = http.createServer((req, res) => {
            //* Pass on this instance of the created object to req
            Object.defineProperty(req, 'app', {
                value: this,
                writable: false,
            });

            requestHandler(req, res, this.services, this.middleware);
        });

        var message;

        if (String(host).includes(':')) {
            host = {
                host: host.split(':')[0],
                port: host.split(':')[1],
            };

            message = host;
        } else {
            message = `port ${host}`;
        }

        this.server.listen(host, console.log(`\x1b[35mNanoMS\x1b[33m: Listening on ${message}\x1b[0m`));

        //* creating service array
        this.services = [];
        //* creating middleware array
        this.middleware = [];
    }

    //* createService creates a service object that is pushed into service array
    //* Takes an object as a single argument
    createService(obj) {
        if (typeof obj !== 'object') {
            throw new Error('Supplied options must be of type "object"');
        }

        const allowedOptions = ['method', 'path', 'func', 'middleware'];
        const options = Object.keys({ ...obj });

        const hasAllowedOoptions = options.every((option) => allowedOptions.includes(option));

        if (!hasAllowedOoptions) {
            throw new Error('Supplied options are not allowed');
        }

        if (typeof obj.method !== 'string') {
            throw new Error('method property must be of type "string"');
        }

        if (typeof obj.path !== 'string') {
            throw new Error('path property must be of type "string"');
        }

        if (obj.method === 'GET' || obj.method === 'POST' || obj.method === 'PATCH' || obj.method === 'DELETE') {
        } else {
            throw new Error(`Invalid HTTP Method: ${obj.method}`);
        }

        if (typeof obj.func !== 'function') {
            throw new Error('func property must be of type "function"');
        }

        if (obj.middleware) {
            if (typeof obj.middleware !== 'object') {
                throw new Error('middleware property must be of type "object"');
            }

            for (const mw in obj.middleware) {
                if (typeof obj.middleware[mw] !== 'function') {
                    throw new Error('middleware must be of type "function"');
                }
            }
        }

        this.services.push({ ...obj });
    }

    //* Pushes middleware to global middleware array
    use(middleware) {
        this.middleware.push(middleware);
    }

    //* Define property and assign path to folder for serving static files
    setStatic(path) {
        if (typeof path !== 'string') {
            throw new Error('path must be of type string');
        }

        this.staticPath = path;
    }

    //* Built-in middleware for serving static files
    async static(req, res) {
        let filePath = url.parse(req.url).pathname;

        const fileExtentionRegex = /([a-zA-Z0-9\s_\\.\-\(\):])+(.*)$/i;

        if (!fileExtentionRegex.test(filePath)) {
            return;
        }

        const publicPath = path.join(req.app.staticPath, filePath);

        const contentType = mime.lookup(filePath);

        try {
            const file = await readFileAsync(publicPath);
            if (file) {
                res.writeHead(200, {
                    'Content-Length': Buffer.byteLength(file),
                    'Content-Type': contentType,
                });
                return res.end(file);
            }
        } catch (e) {
            return;
        }
    }

    //* Built in middleware for parsing incoming data to JSON format
    json(req, res) {
        if (req.method === 'GET') {
            return;
        }

        try {
            req.body = JSON.parse(req.body);
        } catch (e) {
            console.log(`\x1b[35mNanoMS: \x1b[31merror: Error parsing JSON\x1b[0m: "${req.body === undefined ? req.body : req.body.toString()}"`);
        }
    }

    //* Built in middleware for parsing incoming data to url-encoded format
    urlEncoded(req, res) {
        if (req.method === 'GET') {
            return;
        }

        try {
            req.body = req.body.toString();
        } catch (e) {
            console.log(`\x1b[35mNanoMS: \x1b[31merror: Error parsing Buffer\x1b[0m: "${req.body === undefined ? req.body : req.body.toString()}"`);
        }
    }
}

module.exports = NanoMS;
