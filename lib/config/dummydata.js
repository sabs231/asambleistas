'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Thing = mongoose.model('Thing'),
    Member = mongoose.model('Member'),
    Law = mongoose.model('Law'),
    Period = mongoose.model('Period'),
    fs = require('fs'),
    async = require('async'),
		members = [];

/* Function for parsing the date */
var parseDate = function(dateString) {
	var splitDate, returnDate;

	if (!dateString) // Validate date
		return (null);
	splitDate = dateString.split(' ');
	switch(splitDate[1]) {
		case "Ene":
			returnDate = new Date(splitDate[2], 0, splitDate[0]);
			break;
		case "Feb":
			returnDate = new Date(splitDate[2], 1, splitDate[0]);
			break;
		case "Mar":
			returnDate = new Date(splitDate[2], 2, splitDate[0]);
			break;
		case "Abr":
			returnDate = new Date(splitDate[2], 3, splitDate[0]);
			break;
		case "May":
			returnDate = new Date(splitDate[2], 4, splitDate[0]);
			break;
		case "Jun":
			returnDate = new Date(splitDate[2], 5, splitDate[0]);
			break;
		case "Jul":
			returnDate = new Date(splitDate[2], 6, splitDate[0]);
			break;
		case "Ago":
			returnDate = new Date(splitDate[2], 7, splitDate[0]);
			break;
		case "Sep":
			returnDate = new Date(splitDate[2], 8, splitDate[0]);
			break;
		case "Oct":
			returnDate = new Date(splitDate[2], 9, splitDate[0]);
			break;
		case "Nov":
			returnDate = new Date(splitDate[2], 10, splitDate[0]);
			break;
		case "Dic":
			returnDate = new Date(splitDate[2], 11, splitDate[0]);
	}
	return (returnDate);
};

/**
* Populate database with sample application data
*/

// Clear old periods, then add periods in
Period.find({}).remove(function(err) {
  Period.create({
    startDate: new Date('Jul 31, 2009'),
    endDate: new Date('May 14, 2013')
  }, {
    startDate: new Date('May 14, 2013'),
    endDate: new Date('May 14, 2017')
  }, function(err, firstPeriod, secondPeriod) {
    if (err) {
      console.log('Error: ' + err);
      throw (err);
    }

    console.log('Finished populating the Period Model');

    //Clear old members, then add members in
    Member.find({}).remove(function(err) {
      var path, text, content, obj, members;

      if (err) {
        console.log('Error: ' + err);
        throw (err);
      }

      members = [];

      /* Get the current members */
      path = './lib/resources/data/members2017.json';
      text = fs.readFileSync(path, 'utf-8');
      content = text.split('\n');
      
      for (var i = 0; i < content.length; i++) {
        obj = JSON.parse(content[i]);
        obj.periods = new Array(secondPeriod._id); // Set the period for the member
        members.push(obj); // Add the member to the array of members
      }

      /* Get the past members */
      path = './lib/resources/data/members2013.json';
      text = fs.readFileSync(path, 'utf-8');
      content = text.split('\n');

      for (i = 0; i < content.length; i++) {
        obj = JSON.parse(content[i]);
        obj.periods = new Array(firstPeriod._id); // Set the period for the member
        members.push(obj); // Add the member to the array of members
      }

			/* Get the special Cases */
			path = './lib/resources/data/specialCases.json';
			text = fs.readFileSync(path, 'utf-8');
			content = text.split('\n');

			for (i = 0; i < content.length; i++) {
				obj = JSON.parse(content[i]);
				members.push(obj); // add the special cases to the array of members
			}
      members.push(function(err) { // We have to add the callback to the members array
        if (err) {
          console.log('Error: ' + err);
          return;
        }
      });

      Member.create.apply(Member, members);
      console.log('Finished populating the members table');

      //Clear old laws, then add laws in
      Law.find({}).remove(function(err) {
        var path, text, content, obj, laws;

        laws = [];
        path = './lib/resources/data/laws.json';
        text = fs. readFileSync(path, 'utf-8');
        content = text.split('\n');

        for (var i = 0; i < content.length; i++) {
          obj = JSON.parse(content[i]);
          laws.push(obj);
        }

        async.map(laws, function(law, callback) {
          var splitName, firstName, middleName, lastName, lastName2, specialCase, q, reLast;
					var specialCases = ['Función Judicial', 'Función de Transparencia y Control Social', 'Defensoría del Pueblo', 'Función Electoral', 'Fiscalía General del Estado', 'Procuraduría General del Estado', 'Ciudadanía', 'Presidente de la República']; // Array of Special Cases

					specialCase = false;
					for (var i = 0; i < specialCases.length; i++)
					{
						if (law.author === specialCases[i]) // Check if there is a special Case
						specialCase = true; // there is one
					}
					if (specialCase) // Handle of the special Case
					{
						if (law.author === 'Presidente de la República') // if it is the president
							{
								firstName = 'Rafael';
								lastName = 'Correa';
								middleName = 'Vicente';
								lastName2 = 'Delgado';
							}
						else
							firstName = law.author; // other way whe just care for the first name of the special Case 
					}
					else
					{
						splitName = law.author.split(' ');
						switch(splitName.length) 
						{
							case 2:
								firstName = splitName[0];
								lastName = splitName[1];
								break;
							case 3:
								firstName = splitName[0];
								middleName = splitName[1];
								lastName = splitName[2];
								break;
							case 4:
								firstName = splitName[0];
								middleName = splitName[1];
								lastName = splitName[2];
								lastName2 = splitName[2];
								break;
							default:
								firstName = null;
								middleName = null;
								lastName = null;
								lastName2 = null;
						}
					}

          q = Member.find().limit(1);
					reLast = new RegExp(lastName, 'i'); // We use this because some last names are complex ex: 'de la Cruz'
          if (firstName) {
            q = q.where('name.first', firstName);
          }

          if (middleName) {
            q = q.where('name.middle', middleName);
          }

          if (lastName) {
            q = q.where('name.last', {$regex : reLast});
          }

          if (lastName2) {
            q = q.where('name.last2', lastName2);
          }
          
          q.exec(function(err, member) {
            var theLaw, splitDate;
            if (err) {
              console.log('Did not find the member for a law:', err);
              callback(err, null);
              return ;
            }

            // CLean the old author value
            law.author = null;

            // Parse the dates
						law.date = parseDate(law.date);
						law.project.date = parseDate(law.project.date);
						law.CAL.date = parseDate(law.CAL.date);
						law.FirstDebate.date = parseDate(law.FirstDebate.date);
						law.SecondDebate.date = parseDate(law.SecondDebate.date);
						law.HouseApproval.date = parseDate(law.HouseApproval.date);
						law.ParcialOBJ.date = parseDate(law.ParcialOBJ.date);
						law.TotalOBJ.date = parseDate(law.TotalOBJ.date);
						law.DefinitiveText.date = parseDate(law.DefinitiveText.date);
						law.OfficialRegistry.date = parseDate(law.OfficialRegistry.date);

            // Instantiate the new Law
            theLaw = new Law(law);

            // If the author was found, then set it
            if (member && member.length === 1) {
              theLaw.author = member[0]._id;
            } else {
              theLaw.author = null;
            }

            theLaw.save(function(err, finalLaw) {
              if (err) {
                console.log('Could not save a law:', err);
                callback(err, null);
                return;
              }

              callback(null, finalLaw);
            });
          });
        }, function(err, results) {
          if (err) {
            console.log('Error async: ' + err);
            return; // At least one law could not be insterted
          }

          console.log('Finished populating the laws table');

					/*
					 * Update the members model to add the publishedProjects of each of them
					 */
					Member.find({}, function(err, members) {
						if (err)
						{
							console.log('Error on finding the members: ' + err);
							return ;
						}
						async.map(members, function(member, callback) {
							Law.find().where('author', member._id).exec(function(err, projects) {
								if (err)
									return (callback(err));
								Member.update({'_id' : member._id}, {publishedProjects : projects}, function(err, finalMember) {
									if (err)
									{
										console.log('Could not update Member: ' + err);
										callback(err);
										return ;
									}
								callback(null, finalMember);
								});
							});
						}, function(err, results) {
							if (err)
							{
								console.log('Error async: ' + err);
								return ;
							}
							console.log('Finished updating the members table');
						});
					});
        });
      });
    });
  });
});

/* Clear old users, then add default users */
User.find({}).remove(function() {
	User.create({
		provider : 'local',
		name : 'Test User',
		email : 'test@test.com',
		password : 'test'
	}, function() {
		console.log('Finished populated test user');
	});
});
