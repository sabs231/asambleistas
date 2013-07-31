var fs = require('fs'),
    path = require('path'),
    debug = require('debug')('models');

var directories = [__dirname];

directories.forEach(function(directory) {
  fs.readdirSync(directory).forEach(function(file) {
    if(!file || file == 'index.js') return;
    if(path.extname(file) != '.js') return;
    var model = path.join(directory, file);
    debug('Adding model file: %s', file);
    require(model);
  });
});