'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

/**
 * UserVote Schema
 */

var UserVoteSchema = new Schema({
	votes: [{
		vote : Number,
		user : {type: Schema.Types.ObjectId, ref: 'User'},
		law : {type: Schema.Types.ObjectId, ref: 'Law'}
	}]
}, {collection : 'uservote'});

mongoose.model('UserVote', UserVoteSchema);
