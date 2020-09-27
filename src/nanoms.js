/**
 * @typedef {(req: http.IncomingMessage, res: http.ServerResponse) => http.ServerResponse | void} HandlerFunction
 * @typedef {{path: string, method: string, middleware: {[key: string]: HandlerFunction}, func: HandlerFunction}} Service
 */

const fs = require('fs');
const http = require('http');
const path = require('path');
const { promisify } = require('util');
const url = require('url');

const mime = require('mime-types');

const createHttpShorthandFunctions = require('./utils/http-shorthand-functions.js');
const { BadRequestException } = require('./errors');
const requestHandler = require('./utils/request-handler');

const readFileAsync = promisify(fs.readFile);

let instance;

class /** @class */ NanoMS {
    /**
     * @constructor creates a new instance of NanoMS
     * @param {number} port
     * @param {{ key: string, cert: string, ca: string[]}} options
     */
    constructor(port, options = {}) {
        //* Creating shorthand functions for HTTP requests and responses
        createHttpShorthandFunctions();

        //* Initializing server
        this.server = http.createServer(
            options,
            /**@param {Request} req *@param {Response} res */ (req, res) => {
                //* Pass on this instance of the created object to req and res
                Object.defineProperty(req, 'app', {
                    value: this,
                    writable: false,
                });

                Object.defineProperty(res, 'app', {
                    value: this,
                    writable: false,
                });

                requestHandler(req, res, [this.services, this.namedRouteServices], this.middleware);
            }
        );

        if (typeof port !== 'number') {
            try {
                port = Number(port);
            } catch (e) {
                port = 3000;
            }
        }

        this.server.listen(port, console.log(`\x1b[35mNanoMS\x1b[33m: Listening on port ${port}\x1b[0m`));

        /**
         * * Array where all services are stored
         * @type Service[]
         */
        this.services = [];
        /**
         * * Array where all named route services are stored
         * @type Service[]
         */
        this.namedRouteServices = [];
        /**
         * * Array where all global middleware are stored
         * @type HandlerFunction[]
         */
        this.middleware = [];

        instance = this;
    }

    /**
     *
     * @param {Service[]} services
     * @param {string} route
     * @param {boolean} createService
     */
    route(services) {
        let route = '';
        let isCreateService = false;

        for (let i = 1; i < 3; i++) {
            if (typeof arguments[i] === 'boolean') {
                isCreateService = arguments[i];
            } else if (typeof arguments[i] === 'string') {
                route = arguments[i];
            } else {
                continue;
            }
        }

        const pathRegex = /(^\/)(([a-zA-Z0-9\:\.\-\_]+(\/?))?)+[a-zA-Z0-9]|^\//g;

        if (route === '/') {
            route = '';
        }

        for (const service of services) {
            if (route) {
                let modifiedRoute = route + service.path;
                let newPath = modifiedRoute.split('/');

                newPath = newPath.filter((el) => el !== '');
                modifiedRoute = '/' + newPath.join('/');

                service.path = modifiedRoute.match(pathRegex)[0];
            }

            if (isCreateService) {
                this.createService(service);
            }
        }

        return services;
    }

    /**
     * * createService creates a service object that is pushed into service array
     * @param {Service} service
     */
    createService(service) {
        if (typeof service !== 'object') {
            throw new Error('Supplied options must be of type "object"');
        }

        const allowedOptions = ['method', 'path', 'func', 'middleware'];
        const options = Object.keys({ ...service });

        const hasAllowedOptions = options.every((option) => allowedOptions.includes(option));

        if (!hasAllowedOptions) {
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

        if (service.path.match(/:[a-zA-Z0-9].+/g)) {
            this.namedRouteServices.push(service);
        } else {
            this.services.push({ ...service });
        }

        console.log(`\x1b[35mNanoMS\x1b[33m: \x1b[36m${service.method} ${service.path}\x1b[0m`);
    }

    /**
     * * Pushes middleware to global middleware array
     * @param {HandlerFunction} middleware
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
     * Return an instance of NanoMS
     */
    static getInstance() {
        return instance;
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
            throw new BadRequestException(`Error parsing JSON: ${req.body === undefined ? req.body : req.body.toString()}`);
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
            throw new BadRequestException(`Error parsing Buffer: ${req.body === undefined ? req.body : req.body.toString()}`);
        }
    }
}

module.exports = NanoMS;
