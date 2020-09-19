const HttpException = require('./http-exception');

/**
 * @class NotFoundException
 */
module.exports = class NotFoundException extends HttpException {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 404);
	}
};
