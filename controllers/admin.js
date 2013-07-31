require('../models');

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    i18n = require('i18n'),
    routes = require('express-routes');


module.exports = function(app) {

  /**
   * Process request parameter userid
   * @param  {Object}   req         Express Request
   * @param  {Object}   res         Express Response
   * @param  {Function} next        Function to call next
   * @param  {String}   useridid    String containing a mongoose.ObjectId
   */
  app.param('userid', function(req, res, next, userid){
    User.findById(userid, function (err, user) {
      if (err) return next(err);
      if(!user)
        return next(new Error(i18n.__('The requested User was not found.')));

      req.cuser = user;

      next();
    });
  });

  /**
   * Register URLs
   */
  routes.register([
    /**
     * Authorization route for the admin submodule, executes before any other route.
     */
    {
      name: 'admin.auth',
      pattern: 'admin*',
      all: function(req, res, next) {
        if(app.settings.env != 'development' && (!req.loggedIn || !req.user.isAdmin()))
          return res.redirect(routes.generateUrl('index'));

        return next();
      }
    },

    /**
     * Admin main route
     */
    {
      name: 'admin',
      pattern: 'admin',
      get: function (req, res){
        res.render('admin/index', {title: i18n.__('Administration')});
      }
    },

    /**
     * Users routes
     */
    {
      name: 'admin.users',
      pattern: 'admin/users',
      get: function (req, res){
        var limit = (req.query.limit || app.config.db.defaults.limit) - 0,
            offset = (req.query.offset || 0) - 0;
            page = Math.ceil((offset + 1) / limit),
            type = req.query.type || 'all',
            totalUsers = 0,
            totalPages = 1,
            userQuery = null,
            totalUsersQuery = null;

        switch(type) {
          case 'politician':
            userQuery = User.getPoliticiansQuery();
            totalUsersQuery = User.getPoliticiansQuery();
            break;
          case 'admin':
            break;
          default:
            userQuery = User.find();
            totalUsersQuery = User.find();
            break;
        }

        totalUsersQuery.count(function (err2, count) {
          var errors = [];
          if (err2) errors.push(i18n.__('Error retrieving total user count: %s', err2));
          else
            totalUsers = count;

          totalPages = Math.ceil(totalUsers / limit);

          userQuery.skip(offset).limit(limit).exec(function(err, users){
            if(err) errors.push(i18n.__('Error retrieving users: %s', err));

            users = users || [];
            
            res.render(app.config.site.viewsPrefix + 'admin/users', {title: i18n.__('Users'), users: users, errors: errors, totalUsers: totalUsers, limit: limit, page: page, totalPages: totalPages});
          });
        });
      },
      post: function (req, res){
        var user = new User({
          name:         {
                          first: req.body['name.first'],
                          last:  req.body['name.last'],
                        },
          email:        req.body.email
        });
        user[everyauth.password.loginKey()] = req.body.username;
        user.password = User.generatePassword();

        user.save(function(err) {
          var errors = [],
              messages = [];

          if(err) {
            if (new RegExp("duplicate key(.*)\\$"+everyauth.password.loginKey(),"ig").test(err)) {
              errors.push(i18n.__('Someone already has claimed that login.'));
            } else if (new RegExp("duplicate key(.*)\\$email","ig").test(err)) {
              errors.push(i18n.__('Someone already has registered with that email.'));
              warnings.pop();
            } else {
              errors.push(i18n.__('Error saving user: %s', err));
            }
            
            return res.render(app.config.site.viewsPrefix + 'admin/users', {title: i18n.__('Users'), users: [], errors: errors, totalUsers: 0, formValues: req.body});
          }

          messages.push(i18n.__('User saved successfully.'));
            
          res.redirect(routes.generateUrl('admin.user', {userid: user._id}));
        });
      }
    },

    {
      name: 'admin.user',
      pattern: 'admin/users/:userid',
      get: function (req, res){
        res.render(app.config.site.viewsPrefix + 'admin/user', {title: i18n.__('User: %s', req.cuser.name.full), cuser: req.cuser});
      },
      post: function (req, res){
        var username = req.cuser.login,
            errors = [],
            warnings = [],
            messages = [];

        //Update First Name
        if(req.body.name && req.body.name.first)
          req.cuser.name.first = req.body.name.first;
        //Update Last Name
        if(req.body.name && req.body.name.last)
          req.cuser.name.last = req.body.name.last;
        //Update Email
        if(req.body.email) {
          if(req.cuser.email != req.body.email) {
            //Send email to confirm email

            warnings.push(i18n.__("The new email will be set after you click on the confirmation link sent to that address."));
          }
        }
        //Update Username
        if(req.body.username) {
          req.cuser[everyauth.password.loginKey()] = req.body.username;
        }
        //Reset Password
        if(req.body.password) {
          req.cuser.password = User.generatePassword();
        }

        req.cuser.save(function (err, user) {
          if (err) {
            if (new RegExp("duplicate key(.*)\\$"+everyauth.password.loginKey(),"ig").test(err)) {
              errors.push(i18n.__('Someone already has claimed that login.'));
            } else if (new RegExp("duplicate key(.*)\\$email","ig").test(err)) {
              errors.push(i18n.__('Someone already has registered with that email.'));
              warnings.pop();
            } else {
              errors.push(i18n.__('Error saving user: %s', err));
            }

            req.cuser[everyauth.password.loginKey()] = username;

            res.render(app.config.site.viewsPrefix + 'admin/user', {title: i18n.__('User: %s', req.cuser.name.full), cuser: req.cuser, errors: errors});
          } else {
            messages.push(i18n.__('User saved successfully.'));
            res.render(app.config.site.viewsPrefix + 'admin/user', {title: i18n.__('User: %s', req.cuser.name.full), cuser: req.cuser, warnings: warnings, messages: messages});
          }
        });
      }
    }
  ]);
};