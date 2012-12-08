requirejs(
	['jquery', 
	'create_edit_entries/models/AppModel',
	'create_edit_entries/views/AppView', 
	'lib/backbone',
	'lib/bootstrap',
	'lib/log'
	],
	function($, appModel, AppView) 
	{
		
		$(function(){
			// appModel must be exposed on the window object so it can be accessed from the media chooser modal.
			window.appModel = appModel;
			var appView = new AppView({el : $(window)});
		});
		
	}
);