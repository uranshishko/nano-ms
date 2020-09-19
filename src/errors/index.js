/**
 * @module Exception
 */
module.exports = {
	HttpExeption: require('./http-exception'),
	NotFoundException: require('./not-found-exception'),
	BadRequestException: require('./bad-request-exception'),
	InternalServerErrorException: require('./internal-server-error-exception'),
	UnauthorizedException: require('./unauthorized-exception'),
	ForbiddenException: require('./forbidden-exception'),
	NotAcceptableException: require('./not-acceptable-exception'),
	RequestTimeoutException: require('./request-timeout-exception'),
	ConflictException: require('./conflict-exception'),
	GoneException: require('./gone-exception'),
	HttpVersionNotSupportedException: require('./http-version-not-supported-exception'),
	PayloadTooLargeException: require('./payload-too-large-exception'),
	UnsupportedMediaTypeException: require('./unsupported-media-type-exception'),
	UnprocessableEntityException: require('./unprocessable-entity-exception'),
	NotImplementedException: require('./not-implemented-exception'),
	ImATeapotException: require('./im-a-teapot-exception'),
	MethodNotAllowedException: require('./method-not-allowed-exception'),
	BadGatewayException: require('./bad-gateway-exception'),
	ServiceUnavailableException: require('./service-unavailable-exception'),
	GatewayTimeoutException: require('./gateway-timeout-exception'),
};
