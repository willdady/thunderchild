define(['jquery', 'templates/models/AppModel', 'lib/backbone'], function($, appModel) {

	var ActionBarView = Backbone.View.extend({
		
		el:'.action-bar',

		events : {
			"click #delete-template-button" : "deleteTemplateClickHandler",
			"click #save-template-button" : "saveTemplateClickHandler"
		},

		deleteTemplateClickHandler : function(e) {
			if (!$("#delete-template-button").hasClass("disabled")) {
				var selectedTemplate = appModel.selectedTemplate();
				var selectedTemplateGroup = selectedTemplate.templateGroupModel();
				console.log(selectedTemplateGroup.get("templategroup_short_name"));
				if (selectedTemplate.get("template_short_name") == "index" && selectedTemplateGroup.get("templategroup_short_name") == "root") {
					appModel.openDisallowedRootIndexDeleteAlertModal();
				} else {
					appModel.openConfirmDeleteTemplateModal(selectedTemplate);					
				}
			}
			e.preventDefault()
		},

		saveTemplateClickHandler : function(e) {
			if ($("#save-template-button").hasClass("disabled"))
				return;
			$("#save-template-button").addClass("disabled");
			templateModel = appModel.selectedTemplate();
			// Clear any existing errors
			templateModel.errors({});
			templateModel.save({}, {
				wait : true,
				success : function(model, response) {
					model.requiresSave(false);
					$("#save-template-button").removeClass("disabled");
				},
				error : function(model, response) {
					var resp = $.parseJSON(response.responseText);
					templateModel.errors(resp.errors);
					$("#save-template-button").removeClass("disabled");
				}
			});
			e.preventDefault()
		}
	})

	return ActionBarView;

}); 