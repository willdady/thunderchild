requirejs(
	['jquery', 
	'categories/models/AppModel', 
	'categories/models/CategoryCollection', 
	'categories/models/CategoryGroupCollection',
	'categories/views/AppView',
	'categories/views/CategoryGroupModalView',
	'categories/views/ConfirmDeleteModalView', 
	'lib/backbone',
	'lib/bootstrap',
	'lib/log'],
	function($, 
			appModel, 
			categoryCollection, 
			categoryGroupCollection,
			AppView,
			CategoryGroupModalView,
			ConfirmDeleteModalView) 
	{
		
		$(function(){
			console.log("INIT!");
			
			var appView = new AppView({el : $(window)});
			
			var categoryGroupModalView = new CategoryGroupModalView({el : $("#categorygroup-modal")});
			var confirmDeleteModalView = new ConfirmDeleteModalView({el : $("#confirm-delete-modal")});
			
			categoryGroupCollection.reset( categoryGroupData );
			categoryCollection.reset( categoryData );
		});
		
	}
);