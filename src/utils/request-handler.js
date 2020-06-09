const url = require('url');

const cookieParser = require('./cookie-parser');

async function requestHandler(req, res, services, middleware) {
    const method = req.method;
    const URL = url.parse(req.url);

    cookieParser(req, res);

    let body = [];

    //* If data is sent along with request, NanoMS stores it as a Buffer in req.body
    //! NOTE: body-parsing middleware is required in order to read the data from req.body
    //! Use built in JSON or url-encoded parsers (NanoMS.json OR NanoMS.urlEncoded)
    req.on('data', (chunk) => body.push(chunk));

    req.on('end', async () => {
        body = Buffer.concat(body);
        req.body = body;

        //* When request is finished NanoMS loops through services and matches path and method
        for (service of services) {
            if (service.path === URL.pathname) {
                if (service.method === method) {
                    //* If service querying is successful NanoMS runs all global middleware
                    for await (mw of middleware) {
                        try {
                            await mw(req, res);

                            const hasEnded = res.writableEnded === undefined ? res.finished : res.writableEnded;
                            if (hasEnded) {
                                return;
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }

                    //* And then through locally assigned middleware
                    for (const mw in service.middleware) {
                        try {
                            await service.middleware[mw](req, res);

                            const hasEnded = res.writableEnded === undefined ? res.finished : res.writableEnded;
                            if (hasEnded) {
                                return;
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }

                    //* If no response was sent through middleware, process continues
                    return service.func(req, res);
                }
            }

            continue;
        }

        //* If path is not found OR method type doesn't match NanoMS responds with a 404 Not found
        res.status(404).send({ code: 404, error: 'Not Found' });
    });
}

module.exports = requestHandler;
