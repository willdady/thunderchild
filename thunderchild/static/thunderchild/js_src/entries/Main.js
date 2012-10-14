requirejs(
	['jquery', 
	'entries/views/AppView',
	'entries/views/ConfirmDeleteModalView',
	'entries/views/ControlsView',
	'lib/log'
	],
	
	function($, AppView, ConfirmDeleteModalView, ControlsView) {
		$(function() {
			console.log("INIT!");
			var appView = new AppView();
			var confirmDeleteModal = new ConfirmDeleteModalView();
			var controlsView = new ControlsView();
		});
	}

);