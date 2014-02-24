'use strict';

var mongoose = require('mongoose'),
    Thing = mongoose.model('Thing'),
    Member = mongoose.model('Member'),
    Law = mongoose.model('Law');

/**
 * Get awesome things
 */
exports.awesomeThings = function(req, res) {
  return Thing.find(function (err, things) {
    if (!err) {
      return res.json(things);
    } else {
      return res.send(err);
    }
  });
};


/**
 * Returns all the asembly members
 */
exports.members = function(req, res) {
  Member.find(function(err, members) {
    res.json(members);
  });
};

/**
 * Returns the asembly members by region
 */
exports.membersByRegion = function(req, res) {
  var re = new RegExp(req.params.region, 'i');

  Member.find({ province : {$regex : re}}, function(err, members) {
    res.json(members);
  });
};

/**
 * Returns an asembly member by region and name
 */
exports.membersByName = function(req, res) {
  var reName = new RegExp(req.params.name, 'i');
  var reProvince = new RegExp(req.params.region, 'i');

  Member.find({ name : {$regex : reName}, province : { $regex : reProvince}}, function(err, members) {
    res.json(members);
  });
};

/**
* Returns all the projects
*/
exports.projects = function(req, res) {
  Law.find().populate('author').exec(function(err, projects) {
    if (!err)
      return res.json(projects);
    else
      return res.send(err);
  });
};

/**
* Returns the project by name
*/
exports.projectsByName = function(req, res) {
  var reName = new RegExp(req.params.name, 'i');

  Law.find({title : {$regex : reName}}, function(err, projects){
    res.json(projects);
  });
};
