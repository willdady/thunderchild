requirejs(['jquery', 'templates/models/AppModel', 'templates/views/AppView', 'lib/log'], function($, appModel, AppView) {

	$(function() {
		window.appModel = appModel; // We must expose appModel on the window so we can access it from our iframe.
		var appView = new AppView();
	});

}); 