require.config({
    paths: {
        "jquery" : "lib/jquery"
    },
    shim: {
    	"lib/backbone": {
    		deps:["lib/underscore", "jquery"],
    		exports:"Backbone"
    	},
    	"lib/underscore": {
    		exports:"_"
    	},
    	"lib/bootstrap":["jquery"],
    	"lib/log":[],
    	"lib/django-ajax":["jquery"],
    	"lib/jquery.serialize-object":["jquery"],
    	"lib/jquery.tinysort":["jquery"],
    	"lib/farbtastic":["jquery"],
    	"lib/jquery-ui-1.8.21.custom.min":["jquery"],
    	"lib/jquery-ui-timepicker-addon":["jquery", "lib/jquery-ui-1.8.21.custom.min"]
    }
});

require(['jquery', 
		'lib/backbone',
		'lib/bootstrap',
		'lib/django-ajax', 
		'lib/utilities', 
		'lib/log',
		'lib/jquery.serialize-object'
		]);
