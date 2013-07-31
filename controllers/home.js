var routes = require('express-routes');


module.exports = function(app) {
  routes.register([
    {
      name: 'index',
      pattern: '',
      all: function(req, res, next) {
        res.render('home/index');
      }
    }
  ]);
};