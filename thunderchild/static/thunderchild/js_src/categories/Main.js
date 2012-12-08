requirejs(
	['jquery', 
	'categories/models/AppModel', 
	'categories/models/CategoryCollection', 
	'categories/models/CategoryGroupCollection',
	'categories/views/AppView',
	'categories/views/CategoryGroupModalView',
	'categories/views/ConfirmDeleteModalView',
	'categories/views/CategoryModalView', 
	'lib/log'],
	function($, 
			appModel, 
			categoryCollection, 
			categoryGroupCollection,
			AppView,
			CategoryGroupModalView, 
			ConfirmDeleteModalView,
			CategoryModalView) 
	{
		
		$(function(){
			var appView = new AppView();
			
			var categoryGroupModalView = new CategoryGroupModalView();
			var confirmDeleteModalView = new ConfirmDeleteModalView();
			var categoryModalView = new CategoryModalView();
			
			categoryGroupCollection.reset( categoryGroupData );
			categoryCollection.reset( categoryData );
		});
		
	}
);