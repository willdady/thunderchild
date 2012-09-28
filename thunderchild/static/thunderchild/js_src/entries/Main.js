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
			var appView = new AppView({el : $(window)});
		});
		
	}
);