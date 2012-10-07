requirejs(
	['jquery', 
	'entries/views/AppView',
	'entries/views/ConfirmDeleteModalView',
	'lib/log'
	],
	
	function($, AppView, ConfirmDeleteModalView) {
		$(function() {
			console.log("INIT!");
			var appView = new AppView();
			var confirmDeleteModal = new ConfirmDeleteModalView();
		});
	}

);