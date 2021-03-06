'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    

/**
 * Stage definition
 */
var Stage = {
  date: Date,
  url: String
};

/**
 * Law Schema
 */
var LawSchema = new Schema({
  date: Date,
  title: String,
  author: { type: Schema.Types.ObjectId, ref: 'Member' },
	project: Stage,
  CAL: Stage,
  FirstDebate: Stage,
  SecondDebate: Stage,
  HouseApproval: Stage,
  ParcialOBJ: Stage,
  TotalOBJ: Stage,
  DefinitiveText: Stage,
  OfficialRegistry: Stage
}, {collection: 'laws'});

/*
 * Add reference votes for law with votes
 */
LawSchema.add({
	votes: [{
		type: Schema.Types.ObjectId,
		ref: 'UserVote'
	}]
});

/*
 * Validations
 */
/* LawSchema.path('somefield').validate(function (num) { return num >= 1 && num <= 10;
}, 'Awesomeness must be between 1 and 10');
*/

mongoose.model('Law', LawSchema);
