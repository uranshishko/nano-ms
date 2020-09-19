const HttpException = require('./http-exception');

/**
 * @class BadRequestException
 */
module.exports = class BadRequestException extends HttpException {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 400);
	}
};
