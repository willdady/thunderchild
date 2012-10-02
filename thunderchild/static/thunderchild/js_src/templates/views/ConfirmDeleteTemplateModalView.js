define(['jquery', 'templates/models/AppModel', 'lib/backbone'], function($, appModel) {

	var ConfirmDeleteTemplateModalView = Backbone.View.extend({
		
		el:"#delete-template-modal",

		initialize : function() {
			appModel.on("openConfirmDeleteTemplateModal", this.open, this);
		},

		events : {
			"click #confirm-delete-template-button" : "confirmDeleteHandler"
		},

		open : function() {
			this.$el.modal("show");
		},

		close : function() {
			this.$el.modal("hide");
		},

		confirmDeleteHandler : function(e) {
			var templateModel = appModel.get("selectedTemplate");
			templateModel.destroy();
			this.close();
			// Select the index template of the group the deleted template belonged to
			appModel.selectedTemplate(templateModel.templateGroupModel().indexTemplateModel());
			e.preventDefault();
		}
	})

	return ConfirmDeleteTemplateModalView;

}); 