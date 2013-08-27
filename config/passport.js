var mongoose = require('mongoose')
  , passport = require('passport')
  , routes = require('express-routes')
  , debug = require('debug')('mypassport')
  , LocalStrategy = require('passport-local').Strategy
  , FacebookStrategy = require('passport-facebook').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy
  , User = mongoose.model('User')
  , config = require('./');

/* Local Strategy */
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({username: username}, function(err, user) {
      if (err) return done(err);
      
      if (!user)
        return done(null, false, { message: 'Incorrect username.' });
      
      if (!user.validPassword(password))
        return done(null, false, { message: 'Incorrect password.' });

      return done(null, user);
    });
  }
));

/* Facebook Strategy */
passport.use(new FacebookStrategy({
    clientID: config.auth.facebook.appId,
    clientSecret: config.auth.facebook.appSecret,
    callbackURL: routes.generateUrl("auth.facebook", true)
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({'facebook.id': profile.id}, function(err, user) {
      if (err) return done(err);

      if (!user) {
        // Create the user
        user = new User({
          name: {
            first: profile.name.givenName,
            last: profile.name.familyName,
          },
          email: profile.emails[0].value,
          facebook: {
            id: profile.id,
            accessToken: accessToken,
            refreshToken: refreshToken
          }
        });

        user.save(function (err) {
          if (err) return done(err);
          
          // saved!
          done(null, user);
        });
      } else {
        done(null, user);
      }
    });
  }
));

/* Twitter Strategy */
passport.use(new TwitterStrategy({
    consumerKey: config.auth.twitter.consumerKey,
    consumerSecret: config.auth.twitter.consumerSecret,
    callbackURL: routes.generateUrl("auth.twitter", true)
  },
  function(token, tokenSecret, profile, done) {
    User.findOne({'twitter.id': profile.id}, function(err, user) {
      if (err) return done(err);

      if (!user) {
        // Create the user
        user = new User({
          name: {
            first: profile.displayName
          },
          // email: profile.emails[0].value, //Twitter does not give us the email address
          twitter: {
            id: profile.id,
            token: token,
            tokenSecret: tokenSecret
          }
        });

        user.save(function (err) {
          if (err) return done(err);
          
          // saved!
          done(null, user);
        });
      } else {
        done(null, user);
      }
    });
  }
));