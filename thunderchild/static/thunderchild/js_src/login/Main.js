requirejs(
	['jquery', 
	'login/views/AppView',
	'lib/log' 
	],
	function($, AppView) 
	{
		
		$(function(){
			var appView = new AppView();
		});
		
	}
);