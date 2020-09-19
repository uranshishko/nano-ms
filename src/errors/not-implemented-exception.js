const HttpException = require('./http-exception');

/**
 * @class NotImplementedException
 */
module.exports = class NotImplementedException extends HttpException {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 501);
	}
};
