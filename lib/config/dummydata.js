'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Thing = mongoose.model('Thing'),
    Member = mongoose.model('Member'),
    Law = mongoose.model('Law'),
    Period = mongoose.model('Period'),
    fs = require('fs'),
    async = require('async');

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
          var splitName, firstName, middleName, lastName, lastName2, q;

          splitName = law.author.split(' ');

          switch(splitName.length) {
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

          q = Member.find().limit(1);

          if (firstName) {
            q = q.where('name.first', firstName);
          }

          if (middleName) {
            q = q.where('name.middle', middleName);
          }

          if (lastName) {
            q = q.where('name.last', lastName);
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

            // Parse the date
            splitDate = law.date.split(' ');
            switch(splitDate[1]) {
              case "Ene":
                law.date = new Date(splitDate[2], 0, splitDate[0]);
                break;
              case "Feb":
                law.date = new Date(splitDate[2], 1, splitDate[0]);
                break;
              case "Mar":
                law.date = new Date(splitDate[2], 2, splitDate[0]);
                break;
              case "Abr":
                law.date = new Date(splitDate[2], 3, splitDate[0]);
                break;
              case "May":
                law.date = new Date(splitDate[2], 4, splitDate[0]);
                break;
              case "Jun":
                law.date = new Date(splitDate[2], 5, splitDate[0]);
                break;
              case "Jul":
                law.date = new Date(splitDate[2], 6, splitDate[0]);
                break;
              case "Ago":
                law.date = new Date(splitDate[2], 7, splitDate[0]);
                break;
              case "Sep":
                law.date = new Date(splitDate[2], 8, splitDate[0]);
                break;
              case "Oct":
                law.date = new Date(splitDate[2], 9, splitDate[0]);
                break;
              case "Nov":
                law.date = new Date(splitDate[2], 10, splitDate[0]);
                break;
              case "Dic":
                law.date = new Date(splitDate[2], 11, splitDate[0]);
            }


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
        });
      });
    });
  });
});

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
