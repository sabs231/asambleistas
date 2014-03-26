'use strict';

var mongoose = require('mongoose'),
    Thing = mongoose.model('Thing'),
    Member = mongoose.model('Member'),
    Law = mongoose.model('Law'),
		UserVote = mongoose.model('UserVote');

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
* Controller for the projects
*/
exports.projects = function(req, res) {
	var q, reTitle, f, l, m, l2,
			title = req.query.title, // Get the Querystring parameters
			author = req.query.author,
			filteredProjects = []; // Array of filtered Projects

	if (title) // if there is the title parameter we look with regex for it
	{
		reTitle = new RegExp(title, 'i');
		q = Law.find({title : {$regex : reTitle}});
	}
	else
		q = Law.find();
  q.populate('author').exec(function(err, projects) {
		if (author) // After the first query is done we have to filter them by name
		{
			for (var i = 0; i < projects.length; i++)
			{
				f = projects[i].author.name.first;
				l = projects[i].author.name.last;
				m = projects[i].author.name.middle;
				l2 = projects[i].author.name.last2;
				if (f === author || l === author || m === author || l2 === author)
					filteredProjects.push(projects[i]);
			}
			if (!err)
				return (res.json(filteredProjects));
			else
				return (res.send(err));
		}
    if (!err)
      return (res.json(projects));
    else
      return (res.send(err));
  });
};

/*
 * Controller for getting the project by id
 */
exports.projectById = function(req, res) {
	var id = req.params.id;

	Law.findById(id).exec(function(err, project) {
		if (!err)
			return (res.json(project));
		else
			return (res.send(err));
	});
};

/*
 * Controller for registering a vote in the law
 */
exports.projectVote = function(req, res) {
	var userId = req.param('userid', null);
	var vote = req.param('vote', null);
	var lawId = req.param('lawid', null);

	UserVote.create({
		vote: vote,
		user: userId,
		law: lawId
	}, function(err) {
		if (!err)
			return (res.send('vote registered'));
		else
			return (res.send(err));
	});
};

/*
 * Controller to show all the votes
 */
exports.userVotes = function(req, res) {
	UserVote.find().exec(function(err, uservotes) {
		if (!err)
			return (res.json(uservotes));
		else
			return (res.send(err));
	});
};
