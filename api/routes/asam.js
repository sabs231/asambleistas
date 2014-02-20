
/*
 * GET asembly members list page.
 */
var mongoose = require('mongoose');
var asemblyList = mongoose.model('AsemblyList');

// Displays all the asembly members
exports.asamlist = function(req, res) {
	asemblyList.find(function(err, members) {
		res.json(members);
	});
};

// Displays the asembly member by province
exports.provincelist = function(req, res) {
	var re = new RegExp(req.params.province, 'i');
	asemblyList.find({ province : {$regex : re}}, function(err, members) {
		res.json(members);
	});
};

// Displays the asembly by province and name
exports.membername = function(req, res) {
	var reName = new RegExp(req.params.name, 'i');
	var reProvince = new RegExp(req.params.province, 'i');
	asemblyList.find({ name : {$regex : reName}, province : { $regex : reProvince}}, function(err, members) {
		res.json(members);
	});
};
