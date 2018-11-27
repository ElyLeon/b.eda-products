'use strict';

var pathUtils = require('path');

exports.get = function() {
	var env = process.env.NODE_ENV;
	var configPath = pathUtils.join(__dirname, env);
	return require(configPath).config;
};
