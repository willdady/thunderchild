define(['jquery', 'fields/models/AppModel', 'lib/backbone'], function($, appModel) {
	
	var ConfirmDeleteModalView = Backbone.View.extend({

		el : "#confirm-delete-modal",

		initialize : function() {
			appModel.on("openConfirmDeleteFieldGroupModal", this.openConfirmDeleteFieldGroupModal, this);
			appModel.on("openConfirmDeleteFieldModal", this.openConfirmDeleteFieldModal, this);
		},

		events : {
			"click #confirm-delete-button" : "confirmDeleteHandler"
		},

		confirmDeleteHandler : function(e) {
			this.model.destroy();
			this.close();
			e.preventDefault();
		},

		setMessage : function(msg) {
			$("#confirm-delete-message").html(msg);
		},

		openConfirmDeleteFieldGroupModal : function(model) {
			this.model = model;
			this.setMessage("Are you sure you want to <b>permanently</b> delete this field group including all of it's fields?");
			this.open();
		},

		openConfirmDeleteFieldModal : function(model) {
			this.model = model;
			this.setMessage("Are you sure you want to <b>permanently</b> delete this field?");
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
