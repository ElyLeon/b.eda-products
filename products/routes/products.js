'use strict';

var async = require('async');
var _ = require('underscore');
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

var productsScheme = 
	{
	"type": "object",
	"products": {
                  "_id":{
                          "type": "number",
                          "minimum": 1
                        },
                   "title":{
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 1000
                           },
                   "price": {
                             "type": "number",
                             "minimum": 1
                             },
                   "weight": {
                              "type": "number",
                              "minimum": 1
                             },
                   "calarific":{
                                "type": "number",
                                "minimum": 1
                                },
                   "foodTypes":{
                                 "type": "array",
                                 "items": {
                                           "type": "string"
                                           },
                                            "minItems": 1,
                                            "maxItems": 100
                               },
                    "placeIds":{
                                "type": "array",
                                "items": {
                                           "type":"number"
                                         },
                                         "minItems":1,
                                         "maxItems":1000
                               },

	"required": ["_id", "title", "price", "weight", "foodTypes", "placeIds"],
	"additionalProperties": false
	 }
};

module.exports = function(app) {
	app.get('/api/products/:_id', function(req, res, next) {
		var params = req.params;

		async.waterfall([
			function(callback) {
				validate(idScheme, params, callback);
			},
			function(validatedParams, callback) {
				params = validatedParams;
				db.findOne({_id: params._id}, callback);
			},
			function(products, callback) {
				if (!products) {
					return callback(new errors.NotFoundError(
						'Product not found: _id = ' + params._id
					));
				}

				var fill = accumulateCallback(2, callback);
				fill()(null, product);

				if (products.series && products.series.length) {
					serviceRequest({
						service: 'series',
						path: '/api/series',
						data: {
							_ids: _(products.series).pluck('_id')
						}
					}, fill());
				} else {
					fill()(null, []);
				}
			},
			function(products, series) {
				var seriesIndex = _(series).indexBy('_id');

				products.series = _(products.series || []).map(function(series) {
					return seriesIndex[series._id];
				});

				res.json({
					data: products
				});
			}
		], next);
	});

	app.get('/api/products', function(req, res, next) {
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
			function(products, callback) {
				res.json({
					data: users
				});
			}
		], next);
	});

	app.post('/api/products', function(req, res, next) {
		async.waterfall([
			function(callback) {
				var data = req.body;
				validate(userScheme, data, callback);
			},
			function(data, callback) {
				db.insert(data, callback);
			},
			function(products, callback) {
				res.json({
					data: products
				});
			}
		], next);
	});

	app.put('/api/products/:_id', function(req, res, next) {
		var params = req.params;
		var data = req.body;

		async.waterfall([
			function(callback) {
				validate(idScheme, params, callback);
			},
			function(validatedParams, callback) {
				params = validatedParams;
				validate(productsScheme, data, callback);
			},
			function(validatedData, callback) {
				data = validatedData;
				db.findOne({_id: params._id}, callback);
			},
			function(products, callback) {
				if (!products) {
					return callback(new errors.NotFoundError(
						'Products not found: _id = ' + params._id
					));
				}

				db.update(
					{_id: params._id},
					data,
					{returnUpdatedDocs: true},
					callback
				);
			},
			function(products, callback) {
				res.json({
					data: user
				});
			}
		], next);
	});

	app['delete']('/api/products/:_id', function(req, res, next) {
		var params = req.params;

		async.waterfall([
			function(callback) {
				validate(idScheme, params, callback);
			},
			function(validatedParams, callback) {
				params = validatedParams;
				db.findOne({_id: params._id}, callback);
			},
			function(products, callback) {
				if (!products) {
					return callback(new errors.NotFoundError(
						'Products not found: _id = ' + params._id
					));
				}

				db.remove({_id: params.id}, {}, callback);
			},
			function(products) {
				res.json({
					data: user
				});
			}
		], next);
	});
};
