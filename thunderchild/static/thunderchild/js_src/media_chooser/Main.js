requirejs(
	['jquery', 
	'media_chooser/models/AppModel',
	'media_chooser/views/AppView', 
	'lib/log'
	],
	function($, appModel, AppView) 
	{
		
		$(function(){
			console.log("INIT!");
			var appView = new AppView();
		});
		
	}
);