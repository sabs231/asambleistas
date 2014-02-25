'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Thing = mongoose.model('Thing'),
  Member = mongoose.model('Member'),
  Law = mongoose.model('Law'),
	Period = mongoose.model('Period'),
	fs = require('fs'),
	util = require('util');

/**
 * Populate database with sample application data
 */

// Clear old periods, then add periods in
Period.find({}).remove(function() {
	Period.create({
		startDate: new Date('Jul 31, 2009'),
		endDate: new Date('May 14, 2013')
	}, {
		startDate: new Date('May 14, 2013'),
		endDate: new Date('May 14, 2017')
	}, function(err, firstPeriod, secondPeriod) {
		if (err)
		{
			console.log('Error: ' + err);
			throw (err);
		}
		console.log('Finished populating the Period Model');

		// Remove all members and add them again
		Member.find({}).remove(function(err) {
			var path, text, content, obj, members;

			if (err)
			{
				console.log('Error: ' + err);
				throw (err);
			}
			members = new Array();
			/* Get the current members */
			path = './lib/resources/data/members2017.json';
			text = fs.readFileSync(path, 'utf-8');
			content = text.split('\n');
			for (var i = 0; i < content.length; i++)
			{
				obj = JSON.parse(content[i]);
				obj.periods = new Array(secondPeriod._id); // Set the period for the member
				members.push(obj); // Add the member to the array of members
			}
			/* Get the past members */
			path = './lib/resources/data/members2013.json';
			text = fs.readFileSync(path, 'utf-8');
			content = text.split('\n');
			for (i = 0; i < content.length; i++)
			{
				obj = JSON.parse(content[i]);
				obj.periods = new Array(firstPeriod._id); // Set the period for the member
				members.push(obj); // Add the member to the array of members
			}
			members.push(function(err) { // We have to add the callback to the members array
				if (err)
				{
					console.log('Error: ' + err);
					return ;
				}
			// Here populate the law model
			});
			Member.create.apply(Member, members);
			console.log('Finished populating the members table');
		});
	});
});

//Clear old laws, then add laws in
/*
Law.find({}).remove(function() {
  Law.create({
  });
});
*/


//Clear old things, then add things in
Thing.find({}).remove(function() {
  Thing.create({
    name : 'HTML5 Boilerplate',
    info : 'HTML5 Boilerplate is a professional front-end template for building fast, robust, and adaptable web apps or sites.',
    awesomeness: 10
  }, {
    name : 'AngularJS',
    info : 'AngularJS is a toolset for building the framework most suited to your application development.',
    awesomeness: 10
  }, {
    name : 'Karma',
    info : 'Spectacular Test Runner for JavaScript.',
    awesomeness: 10
  }, {
    name : 'Express',
    info : 'Flexible and minimalist web application framework for node.js.',
    awesomeness: 10
  }, {
    name : 'MongoDB + Mongoose',
    info : 'An excellent document database. Combined with Mongoose to simplify adding validation and business logic.',
    awesomeness: 10
  }, function() {
      console.log('finished populating things');
    }
  );
});

// Clear old users, then add a default user
User.find({}).remove(function() {
  User.create({
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test'
  }, function() {
      console.log('finished populating users');
    }
  );
});
