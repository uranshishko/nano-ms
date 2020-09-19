const HttpException = require('./http-exception');

/**
 * @class BadGatewayException
 */
module.exports = class BadGatewayException extends HttpException {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 502);
	}
};
