define(['jquery', 'entries/models/AppModel', 'lib/backbone'], function($, appModel) {
	
	var ConfirmDeleteModalView = Backbone.View.extend({
		
		el : "#confirm-delete-modal",
		
		initialize : function() {
			appModel.on("openConfirmDeleteModal", this.open, this);	
		},
		
		open : function() {
			this.$el.modal("show");
		},
		
		close : function() {
			this.$el.modal("hide");	
		}
		
	});
	
	return ConfirmDeleteModalView;
	
});
