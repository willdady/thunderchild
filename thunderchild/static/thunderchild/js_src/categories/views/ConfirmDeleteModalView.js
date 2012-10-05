define(['jquery', 'categories/models/AppModel', 'lib/backbone'], function($, appModel) {
	var ConfirmDeleteModalView = Backbone.View.extend({

		el:"#confirm-delete-modal",

		initialize : function() {
			appModel.on("openConfirmDeleteCategoryGroupModal", this.openConfirmDeleteCategoryGroupModal, this);
			appModel.on("openConfirmDeleteCategoryModal", this.openConfirmDeleteCategoryModal, this);
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
			$("#confirm-delete-message").html("Are you sure you want to <b>permanently</b> delete this category group including all of it's categories?");
		},

		openConfirmDeleteCategoryGroupModal : function(model) {
			this.model = model;
			this.setMessage("Are you sure you want to <b>permanently</b> delete this category group including all of it's categories?");
			this.open();
		},

		openConfirmDeleteCategoryModal : function(model) {
			this.model = model;
			this.setMessage.html("Are you sure you want to <b>permanently</b> delete this category?");
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
