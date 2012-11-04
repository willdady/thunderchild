define(['jquery', 'entry_types/models/AppModel', 'lib/backbone'], function($, appModel) {
	
	var ConfirmDeleteModalView = Backbone.View.extend({

		el : "#confirm-delete-modal",

		initialize : function() {
			appModel.on("openConfirmDeleteModal", this.openConfirmDeleteModal, this);
		},

		events : {
			"click #confirm-delete-button" : "confirmDeleteHandler"
		},

		confirmDeleteHandler : function(e) {
			this.model.destroy();
			this.close();
			e.preventDefault();
		},
		
		openConfirmDeleteModal : function(model) {
			this.model = model;
			this.open();
		},

		close : function() {
			this.$el.modal("hide");
		},

		open : function() {
			this.$el.modal("show");
		}
	});
	
	return ConfirmDeleteModalView;
	
});
