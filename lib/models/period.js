'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

/*
 * Assembly Perdio Schema
 */
var PeriodSchema = new Schema({
	startDate: Date,
	endDate: Date
}, {collection : 'periods'});

mongoose.model('Period', PeriodSchema);
