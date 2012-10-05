require.config({
    paths: {
        "jquery": "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min"
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

require(['jquery', 'lib/django-ajax', 'lib/bootstrap']);
