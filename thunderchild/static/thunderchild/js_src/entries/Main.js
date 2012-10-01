requirejs(
	['jquery', 
	'entries/models/AppModel',
	'entries/views/AppView', 
	'lib/backbone',
	'lib/bootstrap',
	'lib/log'
	],
	function($, appModel, AppView) 
	{
		
		$(function(){
			console.log("INIT!");
			// appModel must be exposed on the window object so it can be accessed from the media chooser modal.
			window.appModel = appModel;
			var appView = new AppView({el : $(window)});
		});
		
	}
);