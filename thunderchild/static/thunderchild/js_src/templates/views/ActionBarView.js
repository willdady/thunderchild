define(['jquery', 'templates/models/AppModel', 'lib/backbone'], function($, appModel) {

	var ActionBarView = Backbone.View.extend({
		
		el:'.action-bar',

		initialize : function() {
			appModel.on("change:selectedTemplate", this.selectedTemplateChangeHandler, this);
		},

		events : {
			"click #create-templategroup-button" : "createTemplateGroupClickHandler",
			"click #delete-template-button" : "deleteTemplateClickHandler",
			"click #save-template-button" : "saveTemplateClickHandler"
		},

		selectedTemplateChangeHandler : function() {
			// Disable the delete button if an index template becomes selected. Index templates cannot be deleted.
			var selectedTemplate = appModel.get("selectedTemplate");
			if (selectedTemplate.get("template_short_name") == "index") {
				$("#delete-template-button").addClass("disabled");
			} else {
				$("#delete-template-button").removeClass("disabled");
			}
		},

		createTemplateGroupClickHandler : function(e) {
			appModel.openNewTemplateGroupModal();
			e.preventDefault();
		},

		deleteTemplateClickHandler : function(e) {
			if (!$("#delete-template-button").hasClass("disabled")) {
				appModel.openConfirmDeleteTemplateModal();
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