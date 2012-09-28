requirejs(
	['jquery', 
	'fields/views/AppView',
	'lib/log'
	],
	function($, AppView) 
	{
		$(function(){
			console.log("INIT!");
			var appView = new AppView({el : $(window)});
		});
		
	}
);