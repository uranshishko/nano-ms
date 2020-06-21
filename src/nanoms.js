const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { promisify } = require('util');

const mime = require('mime-types');

const readFileAsync = promisify(fs.readFile);

const requestHandler = require('./utils/request-handler');
const createHttpShorthandFunctions = require('./utils/http-shorthand-functions.js');

class /** @class */ NanoMS {
    /**
     * @constructor creates a new instance of NanoMS
     * @param {number} port
     */
    constructor(port) {
        //* Creating shorthand functions for HTTP requests and responses
        createHttpShorthandFunctions();

        //* Initializing server
        this.server = http.createServer((req, res) => {
            //* Pass on this instance of the created object to req
            Object.defineProperty(req, 'app', {
                value: this,
                writable: false,
            });

            Object.defineProperty(res, 'app', {
                value: this,
                writable: false,
            });

            requestHandler(req, res, this.services, this.middleware);
        });

        if (typeof port !== number) {
            try {
                port = Number(port);
            } catch (e) {
                port = 3000;
            }
        }

        this.server.listen(port, console.log(`\x1b[35mNanoMS\x1b[33m: Listening on port ${port}\x1b[0m`));

        /**
         * * Array where all services are stored
         * @type Function[]
         */
        this.services = [];
        /**
         * * Array where all global middleware are stored
         * @type Function[]
         */
        this.middleware = [];
    }

    /**
     * * createService creates a service object that is pushed into service array
     * @param {{ path: string, method: string, middleware: {[key: string]: Function}, func: Function}} service
     */
    createService(service) {
        if (typeof service !== 'object') {
            throw new Error('Supplied options must be of type "object"');
        }

        const allowedOptions = ['method', 'path', 'func', 'middleware'];
        const options = Object.keys({ ...service });

        const hasAllowedOoptions = options.every((option) => allowedOptions.includes(option));

        if (!hasAllowedOoptions) {
            throw new Error('Supplied options are not allowed');
        }

        if (typeof service.method !== 'string') {
            throw new Error('method property must be of type "string"');
        }

        if (typeof service.path !== 'string') {
            throw new Error('path property must be of type "string"');
        }

        if (service.method === 'GET' || service.method === 'POST' || service.method === 'PATCH' || service.method === 'DELETE') {
        } else {
            throw new Error(`Invalid HTTP Method: ${service.method}`);
        }

        if (typeof service.func !== 'function') {
            throw new Error('func property must be of type "function"');
        }

        if (service.middleware) {
            if (typeof service.middleware !== 'object') {
                throw new Error('middleware property must be of type "object"');
            }

            for (const mw in service.middleware) {
                if (typeof service.middleware[mw] !== 'function') {
                    throw new Error('middleware must be of type "function"');
                }
            }
        }

        this.services.push({ ...service });
    }

    /**
     * * Pushes middleware to global middleware array
     * @param {function middleware(http.IncomingMessage, http.ServerResponse) {}} middleware
     */
    use(middleware) {
        this.middleware.push(middleware);
    }

    /**
     * * Define path to folder for serving static files
     * @param {string} path
     */
    setStatic(path) {
        if (typeof path !== 'string') {
            throw new Error('path must be of type string');
        }

        this.staticPath = path;
    }

    /**
     * * Built-in middleware for serving static files
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse} res
     * @returns {void} void
     */
    async static(req, res) {
        let filePath = url.parse(req.url).pathname;

        const fileExtentionRegex = /\.[a-zA-Z0-9]+$/i;

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

    /**
     * * Built in middleware for parsing incoming data to JSON format
     * @param {http.IncomingMessage} req
     */
    static json(req) {
        if (req.method === 'GET') {
            return;
        }

        try {
            req.body = JSON.parse(req.body);
        } catch (e) {
            console.log(`\x1b[35mNanoMS: \x1b[31merror: Error parsing JSON\x1b[0m: "${req.body === undefined ? req.body : req.body.toString()}"`);
        }
    }

    /**
     * * Built in middleware for parsing incoming data to url-encoded format
     * @param {http.IncomingMessage} req
     */
    static urlEncoded(req) {
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
