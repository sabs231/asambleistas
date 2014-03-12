'use strict';

var mongoose = require('mongoose'),
    Thing = mongoose.model('Thing'),
    Member = mongoose.model('Member'),
    Law = mongoose.model('Law');

/**
 * Controller for the assembly members
 */
exports.members = function(req, res) {
	var q, reProject,
			region = req.query.region, // Get the querystring parameters
			name = req.query.name,
			project = req.query.project,
			isFiltered = false,
			filteredMembers = [], // Array of filtered Members
			filteredProjects = []; // Array of filtered Projects

	q = Member.find();
	if (region) // if there is the region parameter
		q.where('province', region);
	if (name) // if there is the name parameter, could be first, last, middle, etc.
	{
		q.or([{'name.first' : name},
				{'name.last' : name},
				{'name.middle': name},
				{'name.last2' : name}]);
	}
	q.populate('periods').populate('publishedProjects').exec(function(err, members) {
		if (project) // When the members are found we filter them by the project if that parameter exists
		{
			reProject = new RegExp(project, 'i');
			for (var i = 0; i < members.length; i++) // For every member
			{
				for (var j = 0; j < members[i].publishedProjects.length; j++) // For every project
				{
					if (members[i].publishedProjects[j].title.search(reProject) !== -1) // If the name exists 
					{
						isFiltered = true;
						filteredProjects.push(members[i].publishedProjects[j]); // Push to a new array
					}
				}
				if (isFiltered)
				{
					members[i].publishedProjects = filteredProjects; // set to the new array
					filteredMembers.push(members[i]); // push the filtered member to the other array of filtered(by presented projects) members
					isFiltered = false;
				}
				filteredProjects = [];
			}
			var options = { // Set the options for the Model population
				path : 'publishedProjects',
				model : 'Law'
			};
			/* Since we already made and execute a query and if there is a project
			 * we filtered we have to populate again this filtered document
			 * with the Model.populate (only Mongoose > 3.6) */
			Member.populate(filteredMembers, options, function(err, newMembers) {
				if (!err)
					return (res.json(newMembers));
				else
					return (res.send(err));
			});
		}
		else
		{
			if (!err)
				return (res.json(members));
			else
				return (res.send(err));
		}
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
