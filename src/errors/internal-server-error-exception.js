const HttpException = require('./http-exception');

/**
 * @class InternalServerErrorException
 */
module.exports = class InternalServerErrorException extends HttpException {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 500);
	}
};
