const HttpException = require('./http-exception');

/**
 * @class ConflictException
 */
module.exports = class ConflictException extends HttpException {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 409);
	}
};
