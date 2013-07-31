require('../models');

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    i18n = require('i18n'),
    routes = require('express-routes');

module.exports = function(app) {
  routes.register([
    {
      name: 'user.auth',
      pattern: 'user*',
      all: function(req, res, next) {
        if(!req.loggedIn || !req.user)
          return res.redirect(routes.generateUrl('index'));

        return next();
      }
    },
    {
      name: 'user',
      pattern: 'user',
      get: function (req, res){
        res.render(app.config.site.viewsPrefix + 'user/profile', {title: i18n.__('User %s profile', req.user.login)});
      }
    },
    {
      name: 'user.edit',
      pattern: 'user/edit',
      post: function (req, res){
        var username = req.user.login,
            messages = [],
            errors = [],
            warnings = [];

        //Update First Name
        if(req.body.name && req.body.name.first)
          req.user.name.first = req.body.name.first;
        //Update Last Name
        if(req.body.name && req.body.name.last)
          req.user.name.last = req.body.name.last;
        //Update Email
        if(req.body.email) {
          if(req.user.email != req.body.email) {
            //Send email to confirm email

            warnings.push(i18n.__("The new email will be set after you click on the confirmation link sent to that address."));
          }
        }
        //Update Username
        if(req.body.username) {
          req.user.login = req.body.username;
        }

        var saveUser = function(user) {
          if(!errors.length) {
            user.save(function (err, user) {
              if (err) {
                if (new RegExp("duplicate key(.*)\\$"+everyauth.password.loginKey(),"ig").test(err)) {
                  errors.push(i18n.__('Someone already has claimed that login.'));
                } else if (new RegExp("duplicate key(.*)\\$email","ig").test(err)) {
                  errors.push(i18n.__('Someone already has registered with that email.'));
                } else {
                  errors.push(i18n.__('Error saving user: %s', err));
                }

                req.user.login = username;

                res.render(app.config.site.viewsPrefix + 'user/profile', {title: i18n.__('User %s profile', req.user.login), errors: errors});
              } else {
                messages.push(i18n.__('Profile saved successfully.'));

                res.render(app.config.site.viewsPrefix + 'user/profile', {title: i18n.__('User %s profile', req.user.login), messages: messages, warnings: warnings});
                //res.redirect(routes.generateUrl('user'))
              }
            });
          } else {
            req.user.login = username;

            res.render(app.config.site.viewsPrefix + 'user/profile', {title: i18n.__('User %s profile', req.user.login), errors: errors});
          }
        };

        //Update Password
        if((req.body.password || !req.user.password) && req.body.newpassword && req.body.newpassword2) {
          if(!req.user.password) {
            if(req.body.newpassword != req.body.newpassword2)
              errors.push(i18n.__('The new password and the confirmation password don\'t match.'));
            else
              req.user.password = req.body.newpassword;

            saveUser(req.user);
          } else {
            User.authenticate(req.user.login, req.body.password, function (err, user) {
              if (err) {
                errors.push(i18n.__('Error confirming your current password: %s', err.message || err));
              } else {
                if (!user) {
                  errors.push(i18n.__('Your current password is incorrect.'));
                } else {
                  if(req.body.newpassword != req.body.newpassword2)
                    errors.push(i18n.__('The new password and the confirmation password don\'t match.'));
                  else
                    req.user.password = req.body.newpassword;
                }
              }
              saveUser(req.user);
            });
          }
        } else {
          saveUser(req.user);
        }
      }
    }
  ]);
};