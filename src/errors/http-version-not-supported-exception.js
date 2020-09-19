const HttpException = require('./http-exception');

/**
 * @class HttpVersionNotSupportedException
 */
module.exports = class HttpVersionNotSupportedException extends HttpException {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 505);
	}
};
