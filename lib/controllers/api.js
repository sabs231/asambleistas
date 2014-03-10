'use strict';

var mongoose = require('mongoose'),
    Thing = mongoose.model('Thing'),
    Member = mongoose.model('Member'),
    Law = mongoose.model('Law');

/**
 * Controller for the assembly members
 */
exports.members = function(req, res) {
	var q,
			region = req.query.region, // Get the querystring parameters
			name = req.query.name;

	q = Member.find();
	if (region) // if there is the region parameter
	{
		q.where('province', region);
	}
	if (name) // if there is the name parameter, could be first, last, middle, etc.
	{
		q.or([{'name.first' : name},
				{'name.last' : name},
				{'name.middle': name},
				{'name.last2' : name}]);
	}
	q.populate('periods').populate('publishedProjects').exec(function(err, members) {
		if (!err)
			return (res.json(members));
		else
			return (res.send(err));
	});
};

/**
* Returns all the projects
*/
exports.projects = function(req, res) {
  Law.find().populate('author').exec(function(err, projects) {
    if (!err)
      return (res.json(projects));
    else
      return (res.send(err));
  });
};

/**
* Returns the project by name
*/
exports.projectsByName = function(req, res) {
  var reName = new RegExp(req.params.name, 'i');

  Law.find({title : {$regex : reName}}, function(err, projects){
		if (!err)
    	return (res.json(projects));
		else
			return (res.send(err));
  });
};
