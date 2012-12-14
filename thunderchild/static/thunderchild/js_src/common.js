require.config({
    paths: {
        /*"lib/jquery": "http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min"*/
    },
    shim: {
    	"lib/backbone": {
    		deps:["lib/underscore", "lib/jquery"],
    		exports:"Backbone"
    	},
    	"lib/underscore": {
    		exports:"_"
    	},
    	"lib/bootstrap":["lib/jquery"],
    	"lib/log":[],
    	"lib/django-ajax":["lib/jquery"],
    	"lib/jquery.serialize-object":["lib/jquery"],
    	"lib/jquery.tinysort":["lib/jquery"],
    	"lib/farbtastic":["lib/jquery"],
    	"lib/jquery-ui-1.8.21.custom.min":["lib/jquery"],
    	"lib/jquery-ui-timepicker-addon":["lib/jquery", "lib/jquery-ui-1.8.21.custom.min"]
    }
});

require(['lib/jquery', 
		'lib/backbone',
		'lib/bootstrap',
		'lib/django-ajax', 
		'lib/utilities', 
		'lib/log',
		'lib/jquery.serialize-object'
		]);
