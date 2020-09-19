const HttpException = require('./http-exception');

/**
 * @class NotAcceptableException
 */
module.exports = class NotAcceptableException extends HttpException {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 406);
	}
};
