const HttpException = require('./http-exception');

/**
 * @class ImATeapotException
 */
module.exports = class ImATeapotException extends HttpException {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 418);
	}
};
