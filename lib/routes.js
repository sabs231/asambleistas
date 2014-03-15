'use strict';

var api = require('./controllers/api'),
    index = require('./controllers'),
    users = require('./controllers/users'),
    session = require('./controllers/session');

var middleware = require('./middleware');

/**
 * Application routes
 */
module.exports = function(app) {

	/**********************API**********************/
  // Members
  app.get('/api/asambleistas', api.members);

  // Projects
  app.get('/api/proyectos', api.projects);
	app.get('/api/proyectos/:id', api.projectById);
	app.post('/api/proyectos/:id/votar', api.projectVote);

	// Votes
	app.get('/api/votos', api.userVotes);

  // Users
  
	app.get('/api/users', users.showAll) // Test of showing all the users
  app.post('/api/users', users.create);
  app.put('/api/users', users.changePassword);
  app.get('/api/users/me', users.me);
  app.get('/api/users/:id', users.show);

  app.post('/api/session', session.login);
  app.del('/api/session', session.logout);

  // All undefined api routes should return a 404
  app.get('/api/*', function(req, res) {
    res.send(404);
  });
  
  // All other routes to use Angular routing in app/scripts/app.js
  app.get('/partials/*', index.partials);
  app.get('/*', middleware.setUserCookie, index.index);
};
