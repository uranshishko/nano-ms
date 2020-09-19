const HttpException = require('./http-exception');

/**
 * @class PayloadTooLargeException
 */
module.exports = class PayloadTooLargeException extends HttpException {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 413);
	}
};
