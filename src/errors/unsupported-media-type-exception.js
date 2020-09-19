const HttpException = require('./http-exception');

/**
 * @class UnsupportedMediaTypeException
 */
module.exports = class UnsupportedMediaTypeException extends HttpException {
	/**
	 *
	 * @param {string} message
	 */
	constructor(message) {
		super(message, 415);
	}
};
