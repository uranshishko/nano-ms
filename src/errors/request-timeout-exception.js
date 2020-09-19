const HttpException = require('./http-exception');

/**
 * @class RequestTimeoutException
 */
module.exports = class RequestTimeoutException extends HttpException {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 408);
	}
};
