const HttpException = require('./http-exception');

/**
 * @class UnprocessableEntityException
 */
module.exports = class UnprocessableEntityException extends HttpException {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 422);
	}
};
