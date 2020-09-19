const HttpException = require('./http-exception');

/**
 * @class UnauthorizedException
 */
module.exports = class UnauthorizedException extends HttpException {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 401);
	}
};
