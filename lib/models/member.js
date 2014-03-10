'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Thing Schema
 */
var MemberSchema = new Schema({
  name: {
    first: String,
    last: String,
    middle: String,
    last2: String
  },
  province: String,
  phone: String,
  email: String,
  party: String,
	periods: [{ type: Schema.Types.ObjectId, ref: 'Period'}],
	fblink: String,
	twlink: String,
	slug: String
}, {collection : 'members'});

/*
 * Add reference Law for members with published laws
 */
MemberSchema.add({
	publishedProjects : [{
			type: Schema.Types.ObjectId,
			ref: 'Law'
	}]
});

/**
 * Validations
 */
/*
MemberSchema.path('somefield').validate(function (num) {
  return num >= 1 && num <= 10;
}, 'Awesomeness must be between 1 and 10');
*/

mongoose.model('Member', MemberSchema);
