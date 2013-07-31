var mongoose = require('mongoose'),
    everyauth = require('everyauth'),
    mongooseAuth = require('mongoose-auth'),
    config = require('../config'),
    i18n = require('i18n'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

/**
 * User schema
 */
var UserSchema = new Schema({
      fb: {
        username: String,
        link: String
      },

      roles: [{ type: String, lowercase: true }]
    }),
    User;

UserSchema.plugin(mongooseAuth, {
  // Here, we attach your User model to every module
  everymodule: {
    everyauth: {
      User: function () {
        return User;
      },
      findUserById: function (userId, fn) {
        User.findById(userId, fn);
      }
    }
  },
  facebook: {
    everyauth: {
      scope: /\bemail\b/.test(config.auth.facebook.scope)? config.auth.facebook.scope : ((config.auth.facebook.scope || '') + ' email'),
      myHostname: config.server.getHomeUrl(),
      appId: config.auth.facebook.appId,
      appSecret: config.auth.facebook.appSecret,
      redirectPath: config.auth.afterLogin,
      findOrCreateUser: function (session, accessTok, accessTokExtra, fbUser) {
        var promise = this.Promise(),
            User = this.User()();
        //Try looking for User in current session
        var sessUserId = session.auth? session.auth.userId : null;
        User.findById(sessUserId, function (err, user) {
          if (err) return promise.fail(err);
          if (!user) {
            //Try looking for User with the same fb ID
            User.findOne({'fb.id': fbUser.id}, function (err, user) {
              if (err) return promise.fail(err);
              if (!user) {
                //Try looking for User with the same email
                User.where('email', fbUser.email).findOne( function (err, user) {
                  if (!user) {
                    //Ok, no potential matches, so create a new user
                    User.createWithFB(fbUser, accessTok, accessTokExtra.expires, function (err, createdUser) {
                      if (err) return promise.fail(err);
                      return promise.fulfill(createdUser);
                    });
                  } else {
                    user.assignFbDataToUser(accessTok, accessTokExtra, fbUser, function (err, user) {
                      if (err) return promise.fail(err);
                      return promise.fulfill(user);
                    });
                  }
                });
              } else {
                user.assignFbDataToUser(accessTok, accessTokExtra, fbUser, function (err, user) {
                  if (err) return promise.fail(err);
                  return promise.fulfill(user);
                });
              }
            });
          } else {
            user.assignFbDataToUser(accessTok, accessTokExtra, fbUser, function (err, user) {
              if (err) return promise.fail(err);
              return promise.fulfill(user);
            });
          }
        });
        
        return promise;
      }
    }
  },
  twitter: {
    everyauth: {
      myHostname: config.server.getHomeUrl(),
      consumerKey: config.auth.twitter.consumerKey,
      consumerSecret: config.auth.twitter.consumerSecret,
      redirectPath: config.auth.afterLogin,
      findOrCreateUser: function (session, accessTok, accessTokSecret, twitterUser) {
        var promise = this.Promise(),
            User = this.User()();
        //Try looking for User in current session
        var sessUserId = session.auth? session.auth.userId : null;
        User.findById(sessUserId, function (err, user) {
          if (err) return promise.fail(err);
          if (!user) {
            //Try looking for User with the same twit ID
            User.findOne({'twit.id': twitterUser.id}, function (err, user) {
              if (err) return promise.fail(err);
              if (!user) {
                //Ok, no potential matches, so create a new user
                User.createWithTwitter(twitterUser, accessTok, accessTokSecret, function (err, createdUser) {
                  if (err) return promise.fail(err);
                  return promise.fulfill(createdUser);
                });
              } else {
                user.assignTwDataToUser(accessTok, accessTokSecret, twitterUser, function (err, user) {
                  if (err) return promise.fail(err);
                  return promise.fulfill(user);
                });
              }
            });
          } else {
            user.assignTwDataToUser(accessTok, accessTokSecret, twitterUser, function (err, user) {
              if (err) return promise.fail(err);
              return promise.fulfill(user);
            });
          }
        });
        return promise;
      }
    }
  },
  password: {
    extraParams: config.auth.password.extraParams,
    everyauth: {
      getLoginPath: config.auth.password.getLoginPath,
      postLoginPath: config.auth.password.postLoginPath,
      loginView: config.auth.password.loginView,
      getRegisterPath: config.auth.password.getRegisterPath,
      postRegisterPath: config.auth.password.postRegisterPath,
      registerView: config.auth.password.registerView,
      loginSuccessRedirect: config.auth.afterLogin,
      registerSuccessRedirect: config.auth.afterSignup,
      loginLocals: config.auth.password.loginLocals,
      registerLocals: config.auth.password.registerLocals,
      validateRegistration: function (newUserAttributes, baseErrors) {
        var promise = this.Promise(),
            User = this.User()(),
            user = new User(newUserAttributes),
            moreErrors = [];
        
        if(!newUserAttributes.name || !newUserAttributes.name.first || !newUserAttributes.name.first.length)
          moreErrors.push(i18n.__("You should enter your first name."));
        if(!newUserAttributes.name || !newUserAttributes.name.last || !newUserAttributes.name.last.length)
          moreErrors.push(i18n.__("You should enter your last name."));
        if(!newUserAttributes.email || !newUserAttributes.email.length)
          moreErrors.push(i18n.__("You should enter your email."));
        
        user.validate( function (err) {
          if (err) {
            moreErrors.push(err.message || err);
          }
        });

        if (moreErrors.length) baseErrors.push.apply(baseErrors, moreErrors);

        if (baseErrors.length)
          promise.fulfill(baseErrors);
        else
          promise.fulfill(null);

        return promise;
      },
      registerUser: function (newUserAttrs) {
        var promise = this.Promise(),
            User = this.User()();
        
        //Try looking for User with the same fb email
        User.findOne({'fb.email': newUserAttrs.email}, function (err, user) {
          if (err) return promise.fail(err);
          if (!user) {
            //Ok, no potential matches, so create a new user
            User.create(newUserAttrs, function (err, createdUser) {
              if (err) {
                console.log(err); // TODO Make depend on debug flag
                if (/duplicate key/.test(err)) {
                  return promise.fulfill([i18n.__('Someone already has claimed that login.')]);
                }
                return promise.fail(err);
              }
              return promise.fulfill(createdUser);
            });
          } else {
            return promise.fulfill([i18n.__('Seems like you have signed up with your Facebook account already. Try logging in with your facebook account instead.')]);
          }
        });
        
        return promise;
      },
    }
  }
});

UserSchema.virtual('name.full').get(function () {
  return this.name.first + ' ' + this.name.last;
})

UserSchema.methods.assignFbDataToUser = function(accessTok, accessTokExtra, fbUser, callback) {
  this.fb = {
    id: fbUser.id,
    accessToken: accessTok,
    expires: accessTokExtra.expires,
    name: {
      full: fbUser.name,
      first: fbUser.first_name,
      last: fbUser.last_name
    },
    link: fbUser.link,
    username: fbUser.username || fbUser.link.match(/^http:\/\/www.facebook\.com\/(.+)/)[1],
    gender: fbUser.gender,
    email: fbUser.email,
    timezone: fbUser.timezone,
    locale: fbUser.locale,
    verified: fbUser.verified,
    updatedTime: fbUser.updated_time
  };

  //If the user doesn't have a first or last name, use fb info
  this.name = {
    first: this.name.first || fbUser.first_name,
    last: this.name.last || fbUser.last_name,
  };
  
  
  //If the user doesn't have an email, use fb info
  if(!this.email) {
    this.email = fbUser.email;
  }

  this.save(callback);
};

//Overriding this so we can save the link too and the username
UserSchema.statics.createWithFB = function(fbUserMeta, accessToken, expires, callback) {
  var expiresDate = new Date;
  expiresDate.setSeconds(expiresDate.getSeconds() + expires);

  var params =  {
    fb: {
      id: fbUserMeta.id,
      accessToken: accessToken,
      expires: expiresDate,
      name: {
        full: fbUserMeta.name,
        first: fbUserMeta.first_name,
        last: fbUserMeta.last_name
      },
      link: fbUserMeta.link,
      username: fbUserMeta.username || fbUserMeta.link.match(/^http:\/\/www.facebook\.com\/(.+)/)[1],
      gender: fbUserMeta.gender,
      email: fbUserMeta.email,
      timezone: fbUserMeta.timezone,
      locale: fbUserMeta.locale,
      verified: fbUserMeta.verified,
      updatedTime: fbUserMeta.updated_time,
    },
    name: {
      first: fbUserMeta.first_name,
      last: fbUserMeta.last_name
    },
    email: fbUserMeta.email
  };

  // TODO Only do this if password module is enabled
  //      Currently, this is not a valid way to check for enabled
  if (everyauth.password)
    params[everyauth.password.loginKey()] = "fb:" + fbUserMeta.id; // Hack because of way mongodb treate unique indexes

  this.create(params, callback);
}

UserSchema.methods.assignTwDataToUser = function(accessTok, accessTokSecret, twitterUser, callback) {
  this.twit = {
    accessToken: accessTok,
    accessTokenSecret: accessTokSecret,
    id: twitterUser.id,
    name: twitterUser.name,
    screenName: twitterUser.screen_name,
    location: twitterUser.location,
    description: twitterUser.description,
    profileImageUrl: twitterUser.profile_image_url,
    url: twitterUser.url,
    protected: twitterUser.protected,
    followersCount: twitterUser.followers_count,
    profileBackgroundColor: twitterUser.profile_background_color,
    profileTextColor: twitterUser.profile_text_color,
    profileLinkColor: twitterUser.profile_link_color,
    profileSidebarFillColor: twitterUser.profile_sidebar_fill_color,
    profileSiderbarBorderColor: twitterUser.profile_sidebar_border_color,
    friendsCount: twitterUser.friends_count,
    createdAt: twitterUser.created_at,
    favouritesCount: twitterUser.favourites_count,
    utcOffset: twitterUser.utc_offset,
    timeZone: twitterUser.time_zone,
    profileBackgroundImageUrl: twitterUser.profile_background_image_url,
    profileBackgroundTile: twitterUser.profile_background_tile,
    profileUseBackgroundImage: twitterUser.profile_use_background_image,
    geoEnabled: twitterUser.geo_enabled,
    verified: twitterUser.verified,
    statusesCount: twitterUser.statuses_count,
    lang: twitterUser.lang,
    contributorsEnabled: twitterUser.contributors_enabled
  };

  //If the user doesn't have a first name, use tw info
  if(this.twit.name) {
    var first, last;
    var nameParts;
    switch((nameParts=this.twit.name.split(" ")).length) {
      case 1:
        first = this.name.first || nameParts[0];
        break;
      case 2:
        first = this.name.first || nameParts[0];
        last = this.name.last || nameParts[1];
        break;
      default:
        first = this.name.first || nameParts[0];
        last = this.name.last || nameParts[2];
    }

    this.name = {
      first: first,
      last: last,
    };
  }

  this.save(callback);
};

//Overriding this so we can set the name along with the twitter info
UserSchema.statics.createWithTwitter = function(twitUserMeta, accessToken, accessTokenSecret, callback) {
  var params = {
    twit: {
      accessToken: accessToken,
      accessTokenSecret: accessTokenSecret,
      id: twitUserMeta.id,
      name: twitUserMeta.name,
      screenName: twitUserMeta.screen_name,
      location: twitUserMeta.location,
      description: twitUserMeta.description,
      profileImageUrl: twitUserMeta.profile_image_url,
      url: twitUserMeta.url,
      protected: twitUserMeta.protected,
      followersCount: twitUserMeta.followers_count,
      profileBackgroundColor: twitUserMeta.profile_background_color,
      profileTextColor: twitUserMeta.profile_text_color,
      profileLinkColor: twitUserMeta.profile_link_color,
      profileSidebarFillColor: twitUserMeta.profile_sidebar_fill_color,
      profileSiderbarBorderColor: twitUserMeta.profile_sidebar_border_color,
      friendsCount: twitUserMeta.friends_count,
      createdAt: twitUserMeta.created_at,
      favouritesCount: twitUserMeta.favourites_count,
      utcOffset: twitUserMeta.utc_offset,
      timeZone: twitUserMeta.time_zone,
      profileBackgroundImageUrl: twitUserMeta.profile_background_image_url,
      profileBackgroundTile: twitUserMeta.profile_background_tile,
      profileUseBackgroundImage: twitUserMeta.profile_use_background_image,
      geoEnabled: twitUserMeta.geo_enabled,
      verified: twitUserMeta.verified,
      statusesCount: twitUserMeta.statuses_count,
      lang: twitUserMeta.lang,
      contributorsEnabled: twitUserMeta.contributors_enabled
    }
  };

  if(params.twit.name) {
    var nameParts;
    switch((nameParts=params.twit.name.split(" ")).length) {
      case 1:
        params.name = {first: nameParts[0]};
        break;
      case 2:
        params.name = {first: nameParts[0], last: nameParts[1]};
        break;
      default:
        params.name = {first: nameParts[0], last: nameParts[2]};
    }
  }

  // TODO Only do this if password module is enabled
  //      Currently, this is not a valid way to check for enabled
  if (everyauth.password)
    params[everyauth.password.loginKey()] = "twit:" + twitUserMeta.id; // Hack because of way mongodb treate unique indexes

  this.create(params, callback);
};

/**
 * Generates a random password for the User
 * @return {String} Random password
 */
UserSchema.statics.generatePassword = function(maxLength) {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz!@";
  var result = '';
  maxLength = maxLength || 10;
  for (var i=0; i<maxLength; i++) {
    result += chars.substr(Math.floor(Math.random() * chars.length),1);
  }
  return result;
}

/**
 * Returns a Query with filters for selecting only politicians
 * @return {Query}
 */
UserSchema.statics.getPoliticiansQuery = function() {
  return User.find().$where('this.roles.indexOf(\'' + config.user.politician_role + '\') >= 0');
}

/**
 * Returns an Array of politicians
 * @param  {Function} callback Callback for the query execution
 * @return {Array} Array of politicians
 */
UserSchema.statics.getAllPoliticians = function(callback) {
  User.getPoliticiansQuery().exec(callback);
}

/**
 * Checks if the User has the given role.
 * @param  {String}  roles A role to check the User against.
 * @return {Boolean} True, if the User has the role; false, otherwise.
 */
UserSchema.methods.hasRole = function(role) {
  if (typeof role == "undefined" || role == null)
    return true;

  return (this.roles.indexOf(role) >= 0);
}

/**
 * Checks if the User has the given set of roles.
 * @param  {Array}  roles An array of roles to check the User against.
 * @return {Boolean} True, if the User has all the roles; false, otherwise.
 */
UserSchema.methods.hasRoles = function(roles) {
  if (typeof roles == "undefined" || roles == null)
    return true;

  if (Array.isArray(this.roles)) {
    for (i=0,l=roles.length; i<l; i++)
      if (!this.hasRole(roles[i]))
        return false;

    return true;
  } else {
    return false;
  }
}

/**
 * Checks if the User has at least one of the roles.
 * @param  {String|Array}  roles An array of roles to check the User against.
 * @return {Boolean} True, if the User has at least one of the roles; false, otherwise.
 */
UserSchema.methods.hasAnyRole = function(roles) {
  if (typeof roles == "undefined" || roles == null)
    return true;

  if (Array.isArray(this.roles)) {
    for (i=0,l=roles.length; i<l; i++) {
      if (this.hasRole(roles[i]))
        return true;
    }

    return false;
  } else {
    return false;
  }
}

/**
 * Checks if the User is an administrator
 * @return {Boolean} True, if the User is an administrator; false, otherwise.
 */
UserSchema.methods.isAdmin = function() {
  return this.hasRole(config.user.admin_role);
}

/**
 * Checks if the User is a politician
 * @return {Boolean} True, if the User is a politician; false, otherwise.
 */
UserSchema.methods.isPolitician = function() {
  return this.hasRole(config.user.politician_role);
}


mongoose.model('User', UserSchema);
User = mongoose.model('User');