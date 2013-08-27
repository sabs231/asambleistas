require('../models');

var mongoose = require('mongoose')
  , passport = require('passport')
  , debug = require('debug')('mypassport')
  , User = mongoose.model('User')
  , routes = require('express-routes');

module.exports = function(app) {
	routes.register([
    {
      name: 'auth.login',
      pattern: 'login',
      get: function(req, res, next) {
      	// Perform authentication
        passport.authenticate('local', {session: false}, function(err, user, info) {
        	authenticate(req, res, err, user, info)
        })(req, res, next);
      }
    },
    {
      name: 'test.facebook',
      pattern: 'test/facebook',
      get: function(req, res, next) {
      	// Perform authentication
        passport.authenticate('facebook', {scope: ['email', 'publish_actions']})(req, res, next);
      }
    },
    {
      name: 'auth.facebook',
      pattern: 'auth/facebook',
      get: function(req, res, next) {
      	// Perform authentication
        passport.authenticate('facebook', function(err, user, info) {
        	authenticate(req, res, err, user, info);
        })(req, res, next);
      }
    },
    {
      name: 'test.twitter',
      pattern: 'test/twitter',
      get: function(req, res, next) {
      	// Perform authentication
        passport.authenticate('twitter', {})(req, res, next);
      }
    },
    {
      name: 'auth.twitter',
      pattern: 'auth/twitter',
      get: function(req, res, next) {
      	// Perform authentication
        passport.authenticate('twitter', function(err, user, info) {
        	authenticate(req, res, err, user, info);
        })(req, res, next);
      }
    }]);
}

function errorAuth(res, message) {
	return res.json(401, {error: message});
}

function passAuth(res, data) {
	return res.json(data);
}

function authenticate(req, res, err, user, info) {
	if (err) return errorAuth(res, err);

	if (!user) {
	  return errorAuth(res, info.message);
	}

	req.logIn(user, {session: false}, function(err) {
	  if (err) return errorAuth(res, err);

	  // Create auth token
	  return passAuth(res, {user: user, authToken: 'someTemporalToken'});
	});
}