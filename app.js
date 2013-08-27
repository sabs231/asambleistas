#!/usr/bin/env node

process.env.DEBUG="app,mypassport";

/**
 * Module dependencies.
 */

var express = require('express')
  , app = express()
  , http = require('http')
  , path = require('path')
  , debug = require('debug')('app')
  , config = require('./config')
  , routes = require('express-routes')
  , models = require('./models')
  , mongoose = require('mongoose')
  , passport = require('passport')
  , port = config.server.port
  , url  = config.server.getHomeUrl();

/**
 * Database Connection
 */
mongoose.connect('mongodb://'+config.db.server+'/'+config.db.name);

/**
 * Application Configuration
 */
app.configure(function(){
  app.set('port', process.env.PORT || port);
  
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser(config.session.secret));
  app.use(express.session({secret: config.session.secret}));
  app.use(express.methodOverride());

  // Passport middleware
  app.use(passport.initialize());

  // Use the router down here, otherwise the locals are not available in the templates
  app.use(app.router);

  // Routes Definition
  routes(app, {
    directory: path.join(__dirname, 'controllers'),
    basePath: config.server.getHomeUrl(),
    prefix: config.site.urlPrefix
  });

  // Now that routes are defined, configure Passport
  require('./config/passport');
});

app.configure('development', function(){
  app.use(express.errorHandler({ dump: true, stack: true }));

  app.set('view options', { debug: true, pretty: true, compileDebug: true });
  app.locals.debug = true;
  app.locals.pretty = true;
  app.locals.compileDebug = true;
});

/**
 * Application Initialization
 */
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
  console.log(url);
});