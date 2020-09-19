const HttpException = require('./http-exception');

/**
 * @class GoneException
 */
module.exports = class GoneException extends HttpException {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 410);
	}
};
