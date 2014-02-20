var mongoose = require('mongoose');
var lawList = mongoose.model('LawList');

// Displays all the projects
exports.projectslist = function(req, res) {
	lawList.find(function(err, projects) {
		res.json(projects);
	});
}

// Displays the projects by name
exports.projectsname = function(req, res) {
	var reName = new RegExp(req.params.name, 'i');
	lawList.find({title : {$regex : reName}}, function(err, projects){
		res.json(projects);
	});
}
