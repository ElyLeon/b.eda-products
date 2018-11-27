'use strict';

var async = require('async');
var db = require('../db').db;
var errors = require('../utils/errors');
var validate = require('../utils/validate').validate;


var idScheme = {
	type: 'object',
	properties: {
		_id: {
			type: 'string'
		}
	},
	required: ['_id'],
	additionalProperties: false
};

var placesScheme = {
	"type": "object",
	"places":{
             "_id":{
                     "type": "number",
                     "minimum": 1
                   },
              "name": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 1000
                      },
               
               "address": {
                           "type": "object",
                           "properties": {
                                           "country": {
                                                        "type": "object",
                                                        "properties": {
                                                                        "title": {
                                                                                   "type": "string",
                                                                                   "minLength": 1,
                                                                                   "maxLength": 1000
                                                                                 },
                                                                        "fiasId": {
                                                                                    "type": "string",
                                                                                    "minLength": 1,
                                                                                    "maxLength": 1000
                                                                                  }
                                                                       },
                                                        "required": ["title", "fiasId"]
                                                       },
                                           "region": {
                                                        "type": "object",
                                                        "properties": {
                                                                        "title": {
                                                                                   "type": "string",
                                                                                   "minLength": 1,
                                                                                   "maxLength": 1000
                                                                                 },
                                                                        "fiasId": {
                                                                                    "type": "string",
                                                                                    "minLength": 1,
                                                                                    "maxLength": 1000
                                                                                  },
                                                                        "type": {
                                                                                  "type": "string",
                                                                                  "minLength": 1,
                                                                                  "maxLength": 1000
                                                                                 }
                                                                        },
                                                        "required": ["title", "fiasId", "type"]
                                                        },
                                            "city": {
                                                      "type": "object",
                                                      "properties": {
                                                                      "title": {
                                                                                 "type": "string",
                                                                                 "minLength": 1,
                                                                                 "maxLength": 1000
                                                                                },
                                                                      "fiasId": {
                                                                                  "type": "string",
                                                                                  "minLength": 1,
                                                                                  "maxLength": 1000
                                                                                },
                                                                      "type": {
                                                                                "type": "string",
                                                                                "minLength": 1,
                                                                                "maxLength": 1000
                                                                               }
                                                                    },
                                                      "required": ["title", "fiasId", "type"]
                                                    },
                                            "street": {
                                                        "type": "object",
                                                        "properties": {
                                                                        "title": {
                                                                                   "type": "string",
                                                                                   "minLength": 1,
                                                                                   "maxLength": 1000
                                                                                 },
                                                                        "fiasId": {
                                                                                    "type": "string",
                                                                                    "minLength": 1,
                                                                                    "maxLength": 1000
                                                                                   },
                                                                        "type": {
                                                                                  "type": "string",
                                                                                  "minLength": 1,
                                                                                  "maxLength": 1000
                                                                                 }
                                                                       },
                                                          "required": [ "title", "fiasId", "type"]
                                                       },
                                            "house": {
                                                       "type": "object",
                                                       "properties": {
                                                                       "number": {
                                                                                   "type": "string",
                                                                                   "minLength": 1,
                                                                                   "maxLength": 1000
                                                                                  },
                                                                        "type": {
                                                                                  "type": "string",
                                                                                  "minLength": 1,
                                                                                  "maxLength": 1000
                                                                                 }
                                                                      },
                                                        "required": [ "number", "type"]
                                                       },
                                            "block": {
                                                        "type": "string",
                                                        "minLength": 1,
                                                        "maxLength": 1000
                                                      },
                                            "flat": {
                                                      "type": "number",
                                                      "minimum": 1
                                                     }
                                          },
                           "required": ["country","region","city","street","house"],
                          "additional properties": false
                       },
                   },
    "reguired": ["_id", "name", "productId", "address"],
    "additionalProperties": false
};

module.exports = function(app) {
	app.get('/api/places/:_id', function(req, res, next) {
		var params = req.params;

		async.waterfall([
			function(callback) {
				validate(idScheme, params, callback);
			},
			function(validatedParams, callback) {
				params = validatedParams;
				db.findOne({_id: params._id}, callback);
			},
			function(places, callback) {
				if (!places) {
					return callback(new errors.NotFoundError(
						'Places not found: _id = ' + params._id
					));
				}

				res.json({
					data: places
				});
			}
		], next);
	});

	app.get('/api/places', function(req, res, next) {
		async.waterfall([
			function(callback) {
				var query = req.query || {};

				validate({
					type: 'object',
					properties: {
						offset: {
							type: 'integer',
							minimum: 0
						},
						limit: {
							type: 'integer',
							minimum: 0,
							maximum: 100,
							default: 20
						},
						title: {
							type: 'string'
						}
					},
					additionalProperties: false
				}, query, callback);
			},
			function(query, callback) {
				var condition = {};
				if (query.title) {
					condition.title = {
						$regex: new RegExp(query.title)
					};
				}

				var cursor = db.find(condition)
					.skip(query.offset)
					.limit(query.limit);

				cursor.exec(callback);
			},
			function(places, callback) {
				res.json({
					data: places
				});
			}
		], next);
	});

	app.post('/api/places', function(req, res, next) {
		async.waterfall([
			function(callback) {
				var data = req.body;
				validate(placesScheme, data, callback);
			},
			function(data, callback) {
				db.insert(data, callback);
			},
			function(places, callback) {
				res.json({
					data: places
				});
			}
		], next);
	});

	app.put('/api/places/:_id', function(req, res, next) {
		var params = req.params;
		var data = req.body;
		console.log(params, data)

		async.waterfall([
			function(callback) {
				validate(idScheme, params, callback);
			},
			function(validatedParams, callback) {
				params = validatedParams;
				validate(placesScheme, data, callback);
			},
			function(validatedData, callback) {
				data = validatedData;
				db.findOne({_id: params._id}, callback);
			},
			function(places, callback) {
				if (!places) {
					return callback(new errors.NotFoundError(
						'Places not found: _id = ' + params._id
					));
				}

				db.update(
					{_id: params._id},
					data,
					{returnUpdatedDocs: true},
					callback
				);
			},
			function(places, callback) {
				res.json({
					data: series
				});
			}
		], next);
	});

	app['delete']('/api/places/:_id', function(req, res, next) {
		var params = req.params;

		async.waterfall([
			function(callback) {
				validate(idScheme, params, callback);
			},
			function(validatedParams, callback) {
				params = validatedParams;
				db.findOne({_id: params._id}, callback);
			},
			function(places, callback) {
				if (!places) {
					return callback(new errors.NotFoundError(
						'Places not found: _id = ' + params._id
					));
				}

				db.remove({_id: params.id}, {}, callback);
			},
			function(places) {
				res.json({
					data: places
				})
			}
		], next);
	});
};
