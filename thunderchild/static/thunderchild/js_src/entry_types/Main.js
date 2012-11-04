requirejs(
	['jquery', 
	'entry_types/models/AppModel',
	'entry_types/models/EntryTypeCollection', 
	'entry_types/views/AppView',
	'entry_types/views/ConfirmDeleteModalView',
	'entry_types/views/EntryTypeModalView',
	'lib/log'],
	function($, 
			appModel,
			entryTypeCollection, 
			AppView,
			ConfirmDeleteModalView,
			EntryTypeModalView) 
	{
		
		$(function(){
			console.log("INIT!");
			
			var appView = new AppView();
			
			var confirmDeleteModalView = new ConfirmDeleteModalView();
			var entryTypeModalView = new EntryTypeModalView();
			
			entryTypeCollection.reset( entryTypeData );
		});
		
	}
);