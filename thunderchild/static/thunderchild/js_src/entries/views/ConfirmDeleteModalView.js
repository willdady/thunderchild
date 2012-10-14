define(['jquery', 'entries/models/AppModel', 'entries/models/EntryModelCollection', 'lib/backbone'], function($, appModel, entryModelCollection) {
	
	var ConfirmDeleteModalView = Backbone.View.extend({
		
		el : "#confirm-delete-modal",
		
		initialize : function() {
			appModel.on("openConfirmDeleteModal", this.open, this);	
		},
		
		events: {
			"click #confirm-delete-button" : "confirmDeleteClickHandler"
		},
		
		open : function() {
			this.$el.modal("show");
		},
		
		close : function() {
			this.$el.modal("hide");	
		},
		
		confirmDeleteClickHandler : function() {
			if (!$("#confirm-delete-button").hasClass('disabled')) {
				$("#confirm-delete-button").addClass('disabled');
				entryModelCollection.deleteSelected();	
			}
		}
		
	});
	
	return ConfirmDeleteModalView;
	
});
