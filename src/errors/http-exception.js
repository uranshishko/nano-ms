/**
 * @class HttpException
 */
module.exports = class HttpExeption extends Error {
	/**
	 *
	 * @param {string} message
	 * @param {number} statusCode
	 */
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode;
		this.type = 'HttpException';
	}
};
