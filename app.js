#!/usr/bin/env node

process.env.DEBUG="routes,connect:dispatcher,app";

/**
 * Module dependencies.
 */

var express = require('express')
  , app = express()
  , http = require('http')
  , path = require('path')
  , debug = require('debug')('app')
  , config = require('./config')
  , moment = require('moment')
  , routes = require('express-routes')
  , models = require('./models')
  , mongoose = require('mongoose')
  , everyauth = require('everyauth')
  , mongooseAuth = require('mongoose-auth')
  , i18n = require('i18n')
  , port = 8080
  , url  = 'http://localhost:' + port + '/';

/**
 * Database Connection
 */
mongoose.connect('mongodb://'+config.db.server+'/'+config.db.name);

/**
 * Application Configuration
 */
app.configure(function(){
  app.set('port', process.env.PORT || port);
  
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: true });

  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.bodyParser());
  app.use(express.cookieParser(config.session.secret));
  app.use(express.session({secret: config.session.secret}));
  app.use(express.methodOverride());

  // everyauth middleware
  app.use(everyauth.middleware(app));

  // Internationalization - i18n Configuration
  i18n.configure(config.i18n);

  // Internationalization - Express middleware
  app.use(i18n.init);

  // Internationalization - moment Configuration
  app.use(function(req, res, next) {
    res.locals({
      moment: moment.lang(i18n.getLocale(req))
    });

    next();
  });

  // Setting locals
  app.use(function(req, res, next) {
    res.locals({
      __i: i18n.__,
      __n: i18n.__n,
      config: config,
      site: config.site,
      errors: [],
      warnings: [],
      messages: [],
      formValues: {},
      req: req
    });

    next();
  });

  // Use the router down here, otherwise the locals are not available in the templates
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dump: true, stack: true }));
});

/**
 * Routes Definition
 */
routes.configure({
  directory: path.join(__dirname, 'controllers'),
  basePath: config.server.getHomeUrl(),
  prefix: config.site.urlPrefix
});
routes(app);

/**
 * Application Initialization
 */
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
  console.log(url);
});