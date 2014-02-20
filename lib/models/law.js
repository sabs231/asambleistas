'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    
/**
 * Thing Schema
 */
var LawSchema = new Schema({
  code: String,
  date: String,
  title: String,
  author: String,
  CAL: String,
  FirstDebate: String,
  SecondDebate: String,
  PlenoApproval: String,
  ParcialOBJ: String,
  TotalOBJ: String,
  DefinitiveText: String,
  OfficialRegistry: String
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
