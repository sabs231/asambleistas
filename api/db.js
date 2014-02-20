// Database
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var asemblyList = new Schema({
		name : String,
		province : String,
		phone: String,
		email: String,
		party: String
}, { collection : 'asemblyList'});

var lawList = new Schema({
		code : String,
		date : String,
		title : String,
		author : String,
		CAL : String,
		FirstDebate : String,
		SecondDebate : String,
		PlenoApproval : String,
		ParcialOBJ : String,
		TotalOBJ : String,
		DefinitiveText : String,
		OfficialRegistry : String
}, {collection : 'lawList'});

mongoose.model('AsemblyList', asemblyList);
mongoose.model('LawList', lawList);
mongoose.connect('mongodb://localhost/asemblydb');

