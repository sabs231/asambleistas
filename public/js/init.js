// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; args.callee = args.callee.caller; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};

// make it safe to use console.log always
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());


// place any jQuery/helper plugins in here, instead of separate, slower script files.

// Sets the require.js configuration for your application.
require.config({
	// 3rd party script alias names (Easier to type "jquery" than "libs/jquery-1.8.2.min")
	paths: {
	    // Core Libraries
	    "jquery": "//code.jquery.com/jquery-1.10.1",
	    "jquerymobile": "//code.jquery.com/mobile/1.3.2/jquery.mobile-1.3.2",
	    "underscore": "//cdnjs.cloudflare.com/ajax/libs/lodash.js/1.3.1/lodash",
	    "backbone": "libs/backbone"

	},

	// Sets the configuration for your third party scripts that are not AMD compatible
	shim: {
	    "backbone": {
			"deps": [ "underscore", "jquery" ],
			"exports": "Backbone"  //attaches "Backbone" to the window object
	    }
	} // end Shim Configuration
});

// Includes File Dependencies
require(["jquery", "backbone", "router/routes"], function($, Backbone, Mobile) {
	$(document).on( "mobileinit", function() {
		// Set up the "mobileinit" handler before requiring jQuery Mobile's module
		
		// Prevents all anchor click handling including the addition of active button state and alternate link bluring.
		$.mobile.linkBindingEnabled = false;

		// Disabling this will prevent jQuery Mobile from handling hash changes
		$.mobile.hashListeningEnabled = false;
	});

	require(["jquerymobile"], function() {
		// Instantiates a new Backbone.js Mobile Router
		this.router = new Mobile();
	});
});