/**
 * @typedef {(req: http.IncomingMessage, res: http.ServerResponse) => http.ServerResponse | void} HandlerFunction
 * @typedef {{path: string, method: string, middleware: {[key: string]: HandlerFunction}, func: HandlerFunction}} Service
 */

const url = require('url');

const cookieParser = require('./cookie-parser');
const { NotFoundException } = require('../errors');

/**
 *
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {Service[][]} services
 * @param {HandlerFunction[]} middleware
 */
async function requestHandler(req, res, services, middleware) {
    const method = req.method;
    const URL = url.parse(req.url);
    let modifiedURL;

    //* Parse cookies
    cookieParser(req, res);

    let body = [];

    //* Initialize url params object on http.IncomingMessage
    req.params = {};

    //* If data is sent along with request, NanoMS stores it as a Buffer in req.body
    req.on('data', (chunk) => body.push(chunk));

    req.on('end', async () => {
        body = Buffer.concat(body);
        req.body = body;

        //* Running globally defined middleware functions
        for await (mw of middleware) {
            try {
                await mw(req, res);

                const hasEnded = res.writableEnded === undefined ? res.finished : res.writableEnded;
                if (hasEnded) {
                    return;
                }
            } catch (e) {
                //* catch eventual errors and exeptions
                errorHandler(e);
            }
        }

        //* Searching for exact route
        let foundService = services[0].find((service) => service.path === URL.pathname && service.method === method);

        //* Searching for named routes
        if (!foundService) {
            foundService = services[1].find(findNamedRoute);
        }

        //* If neither is found, return 404
        if (!foundService) {
            return res.status(404).send({ statusCode: 404, message: 'Not Found' });
        } //* Else

        //* Go through locally assigned middleware
        for (const mw in foundService.middleware) {
            try {
                await foundService.middleware[mw](req, res);

                const hasEnded = res.writableEnded === undefined ? res.finished : res.writableEnded;
                if (hasEnded) {
                    return;
                }
            } catch (e) {
                //* catch eventual errors and exeptions
                errorHandler(e);
            }
        }

        //* If no response was sent through middleware, process continues to service controller
        try {
            return await foundService.func(req, res);
        } catch (e) {
            //* catch eventual errors and exeptions
            errorHandler(e);
        }
    });

    function errorHandler(e) {
        if (e.type && e.type === 'HttpException') {
            return res.status(e.statusCode).send({
                message: e.message,
                statusCode: e.statusCode,
            });
        } else {
            console.log(e);
        }
    }

    function findNamedRoute(service) {
        //* Check if a service path accepts url parameters
        const paramsRegex = /:[a-zA-Z0-9].+/g;

        let parsedServicePath;

        if (service.path.match(paramsRegex)) {
            parsedServicePath = service.path.split('/');
            let url = URL.pathname.split('/');

            if (url[url.length - 1] === '') {
                url.pop();
            }

            for (let i = 0; i < parsedServicePath.length; i++) {
                if (parsedServicePath[i].match(paramsRegex)) {
                    //* Populate params object on http.IncomingMessage
                    req.params[parsedServicePath[i].replace(':', '')] = url[i];
                    parsedServicePath[i] = url[i];
                }
            }

            parsedServicePath = parsedServicePath.join('/');
            modifiedURL = url.join('/');
        }

        if (!(parsedServicePath === modifiedURL && service.method === method)) {
            req.params = {};
        }

        return parsedServicePath === modifiedURL && service.method === method;
    }
}

module.exports = requestHandler;
