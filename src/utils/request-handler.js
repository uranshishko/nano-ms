const url = require('url');

const cookieParser = require('./cookie-parser');

async function requestHandler(req, res, services, middleware) {
	const method = req.method;
	const URL = url.parse(req.url);

	cookieParser(req, res);

	let body = [];

	//* Initialize url params object on http.IncomingMessage
	req.params = {};

	//* If data is sent along with request, NanoMS stores it as a Buffer in req.body
	//! NOTE: body-parsing middleware is required in order to read the data from req.body
	//! Use built in JSON or url-encoded parsers (NanoMS.json OR NanoMS.urlEncoded)
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

		//* When request is finished NanoMS loops through services and matches path and method
		for (service of services) {
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
				URL.pathname = url.join('/');
			}

			if ((parsedServicePath ? parsedServicePath : service.path) === URL.pathname) {
				if (service.method === method) {
					//* And then through locally assigned middleware
					for (const mw in service.middleware) {
						try {
							await service.middleware[mw](req, res);

							const hasEnded = res.writableEnded === undefined ? res.finished : res.writableEnded;
							if (hasEnded) {
								return;
							}
						} catch (e) {
							//* catch eventual errors and exeptions
							errorHandler(e);
						}
					}

					//* If no response was sent through middleware, process continues
					try {
						return await service.func(req, res);
					} catch (e) {
						//* catch eventual errors and exeptions
						errorHandler(e);
					}
				}
			}

			continue;
		}

		//* If path is not found OR method type doesn't match NanoMS responds with a 404 Not found
		res.status(404).send({ statusCode: 404, message: 'Not Found' });
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
}

module.exports = requestHandler;
