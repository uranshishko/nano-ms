const HttpException = require('./http-exception');

/**
 * @class ServiceUnavailableException
 */
module.exports = class ServiceUnavailableException extends HttpException {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 503);
	}
};
