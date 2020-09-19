const HttpException = require('./http-exception');

/**
 * @class ForbiddenException
 */
module.exports = class ForbiddenException extends HttpException {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 403);
	}
};
