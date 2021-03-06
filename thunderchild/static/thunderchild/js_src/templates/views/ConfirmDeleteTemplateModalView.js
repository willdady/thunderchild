define(['jquery', 'templates/models/AppModel', 'lib/backbone'], function($, appModel) {

	var ConfirmDeleteTemplateModalView = Backbone.View.extend({
		
		el:"#delete-template-modal",

		initialize : function() {
			appModel.on("openConfirmDeleteTemplateModal", this.open, this);
		},

		events : {
			"click #confirm-delete-template-button" : "confirmDeleteHandler"
		},

		open : function(model) {
			this.templateModel = model;
			this.$el.modal("show");
		},

		close : function() {
			this.$el.modal("hide");
		},

		confirmDeleteHandler : function(e) {
			this.templateModel.destroy();
			this.close();
			// Select the index template of the group the deleted template belonged to
			appModel.selectedTemplate(this.templateModel.templateGroupModel().indexTemplateModel());
			e.preventDefault();
		}
	})

	return ConfirmDeleteTemplateModalView;

}); 