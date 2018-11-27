'use strict';

var os = require('os');
var _ = require('underscore');

var getExternalIP = function() {
	return _(os.networkInterfaces()).chain().find(function(ni, name) {
		return name !== 'lo';
	}).find(function(ni) {
		return !ni.internal && ni.family === 'IPv4';
	}).value().address;
};

exports.config = {
	env: 'production',
	name: 'products',
	serviceRegistry: {
		host: '192.168.68.142',
		port: '8500'
	},
	listen: {
		host: getExternalIP(),
		port: '8002'
	},
	db: {
		path: './data/products.nedb'
	}
};