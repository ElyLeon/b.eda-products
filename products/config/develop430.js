'use strict';

exports.config = {
	env: 'development',
	name: 'products',
	serviceRegistry: {
		host: '127.0.0.1',
		port: '8500'
	},
	listen: {
		host: '192.168.68.142',
		port: '8002'
	},
    db: {
		type: 'mongodb',
		url: 'mongodb://172.17.0.2:27017',
		dbName: 'products'
	}
};
