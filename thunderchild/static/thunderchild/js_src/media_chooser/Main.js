requirejs(
	['jquery', 
	'media_chooser/views/AppView',
	'media/views/UploadModalView',
	'lib/log'
	],
	function($, AppView, UploadModalView) 
	{
		$(function() {
			
			var appView = new AppView();
			var uploadModalView = new UploadModalView();
			
		});
	}
);