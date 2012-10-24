requirejs(
	['jquery', 
	'fields/models/AppModel', 
	'fields/models/FieldCollection', 
	'fields/models/FieldGroupCollection',
	'fields/views/AppView',
	'fields/views/FieldGroupModalView',
	'fields/views/ConfirmDeleteModalView',
	'fields/views/FieldModalView', 
	'lib/log'],
	function($, 
			appModel, 
			fieldCollection, 
			fieldGroupCollection,
			AppView,
			FieldGroupModalView, 
			ConfirmDeleteModalView,
			FieldModalView) 
	{
	
	$(function() {
		console.log("INIT!");
		
		var appView = new AppView();
		
		var fieldGroupModalView = new FieldGroupModalView();
		var confirmDeleteModalView = new ConfirmDeleteModalView();
		var fieldModalView = new FieldModalView();
			
		fieldGroupCollection.reset( fieldGroupData );
		fieldCollection.reset( fieldData );
	});

}); 