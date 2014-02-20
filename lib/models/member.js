'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    
/**
 * Thing Schema
 */
var MemberSchema = new Schema({
	_id: Number,
  name: String,
  province: String,
  phone: String,
  email: String,
  party: String
}, {collection : 'members'});

/**
 * Validations
 */
/*
MemberSchema.path('somefield').validate(function (num) {
  return num >= 1 && num <= 10;
}, 'Awesomeness must be between 1 and 10');
*/

mongoose.model('Member', MemberSchema);
