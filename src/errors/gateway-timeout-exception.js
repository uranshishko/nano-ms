const HttpException = require('./http-exception');

/**
 * @class GatewayTimeoutException
 */
module.exports = class GatewayTimeoutException extends HttpException {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 504);
	}
};
