var mongoose = require('mongoose'),
    config = require('../config'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

/**
 * User schema
 */
var UserSchema = new Schema({
  name: {
    first: String,
    last: String
  },

  email: String,
  username: String,
  password: String,

  facebook: {
    id: String,
    accessToken: String,
    refreshToken: String
  },

  twitter: {
    id: String,
    token: String,
    tokenSecret: String
  },

  authTokens: [{
    token: String,
    secret: String,
    expires: Date
  }],

  roles: [{
    type: String,
    lowercase: true
  }]
}), User;

UserSchema.virtual('name.full').get(function () {
  return this.name.first + ' ' + this.name.last;
})

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
 * Checks if the given password is valid for this user.
 * @param  {String}  password A password to validate for the User.
 * @return {Boolean} True, if the password is valid for the User; false, otherwise.
 */
UserSchema.methods.validPassword = function(password) {
  if (typeof password == "undefined" || password == null)
    return false;

  return (this.password = password);
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