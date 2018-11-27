'use strict';

var Datastore = require('nedb');
var pathUtils = require('path');
var MongoClient = require('mongodb').MongoClient;

exports.db;




var initLocalDb = function (params, callback){
	var dbPath = params.path;
	if (!absolutePathRegexp.test(dbPath)) {
		dbPath = pathUtils.join(__dirname, dbPath);
	}

	var db = new Datastore({filename: dbPath});
	db.loadDatabase(function(err) {
		if (err) {
			return callback(err);
		}

		exports.db = db;
		callback();
		});
};

var initMongoDb = function (params, callback){
// Use connect method to connect to the server
	MongoClient.connect(params.url, function(err, client) {
	 
	  if (err) {
				return callback(err);
			}
	   const db = client.db(params.dbName);
	   exports.db = db;
	   callback(); 
	});
};



var absolutePathRegexp = /^\//;
exports.init = function(params, callback) {
	if (params.type == 'local')
	{
         initLocalDb(params, callback);
     }
     else if (params.type == 'mongodb')
     {
     	initMongoDb(params, callback);
     }
	
};
