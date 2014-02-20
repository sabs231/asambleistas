'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    
/**
 * Thing Schema
 */
var LawSchema = new Schema({
  _id: Number,
  date: String,
  title: String,
  author: { type: Number, ref: 'Member' },
  CAL: Boolean,
  FirstDebate: Boolean,
  SecondDebate: Boolean,
  PlenoApproval: Boolean,
  ParcialOBJ: Boolean,
  TotalOBJ: Boolean,
  DefinitiveText: Boolean,
  OfficialRegistry: Boolean
}, {collection: 'laws'});

/**
 * Validations
 */
/*
LawSchema.path('somefield').validate(function (num) {
  return num >= 1 && num <= 10;
}, 'Awesomeness must be between 1 and 10');
*/

mongoose.model('Law', LawSchema);
