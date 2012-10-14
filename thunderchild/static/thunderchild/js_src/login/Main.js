requirejs(
	['jquery', 
	'login/views/AppView',
	'lib/log' 
	],
	function($, AppView) 
	{
		
		$(function(){
			console.log("INIT!");
			var appView = new AppView();
		});
		
	}
);