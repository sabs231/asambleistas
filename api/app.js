
/**
 * Module dependencies.
 */
require('./db');

var express = require('express');
var routes = require('./routes');
var asembly = require('./routes/asam');
var projects = require('./routes/projects');
var http = require('http');
var path = require('path');
var engine = require('ejs-locals');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/api/asambleistas', asembly.asamlist);
app.get('/api/asambleistas/:province', asembly.provincelist);
app.get('/api/asambleistas/:province/:name', asembly.membername);
app.get('/api/proyectos', projects.projectslist);
app.get('/api/proyectos/:name', projects.projectsname);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
