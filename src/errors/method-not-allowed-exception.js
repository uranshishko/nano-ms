const HttpException = require('./http-exception');

/**
 * @class MethodNotAllowedException
 */
module.exports = class MethodNotAllowedException extends HttpException {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 405);
	}
};
