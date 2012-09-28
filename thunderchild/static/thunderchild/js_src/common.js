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
    	"lib/jquery.tinysort":["jquery"]
    }
});

define(['jquery', 'lib/django-ajax'], function() {
	
});
