define(['jquery', 'lib/backbone'], function($) {
	
	var AppModel = Backbone.Model.extend({
		
		openConfirmDeleteModal : function(model) {
			this.trigger("openConfirmDeleteModal", model);
		},
		
		openEditEntryTypeModal : function(model) {
			this.trigger("openEditEntryTypeModal", model);
		},
		
		openCreateEntryTypeModal : function() {
			this.trigger("openCreateEntryTypeModal");
		}
		
	});
	
	return new AppModel();
	
});
