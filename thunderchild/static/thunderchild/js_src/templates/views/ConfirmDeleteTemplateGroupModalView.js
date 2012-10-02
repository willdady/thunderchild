define(['jquery', 'templates/models/AppModel', 'lib/backbone'], function($, appModel) {

	var ConfirmDeleteTemplateGroupModalView = Backbone.View.extend({
		
		el:"#delete-templategroup-modal",

		initialize : function() {
			appModel.on("openConfirmDeleteTemplateGroupModal", this.open, this);
		},

		events : {
			"click #confirm-delete-templategroup-button" : "confirmDeleteHandler"
		},

		open : function(templateGroupModel) {
			this.templateGroupModel = templateGroupModel;
			this.$el.modal("show");
		},

		close : function() {
			this.$el.modal("hide");
		},

		confirmDeleteHandler : function(e) {
			this.templateGroupModel.destroy();
			this.close();
			// Select the root/index template
			appModel.selectedTemplate(appModel.rootTemplateGroup().indexTemplateModel());
			e.preventDefault();
		}
	})
	
	return ConfirmDeleteTemplateGroupModalView;

}); 