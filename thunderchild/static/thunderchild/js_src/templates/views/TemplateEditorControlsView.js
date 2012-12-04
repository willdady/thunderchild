define(['jquery', 'templates/models/AppModel', 'lib/backbone'], function($, appModel) {

	var TemplatePreviewControlsView = Backbone.View.extend({
		
		el : "#template-editor-controls",

		initialize : function() {
			appModel.on("change:selectedTemplate", this.selectedTemplateChangeHandler, this);
		},

		events : {
			"change #preview-template-control .preview-url-parameters" : "resetPreviewButtonHref",
			"click #media_chooser_button" : "mediaChooserClickHandler"
		},
		
		mediaChooserClickHandler : function() {
			appModel.openMediaChooserModal();
		},

		resetPreviewButtonHref : function() {
			var url = $(".preview-url").text() + $(".preview-url-parameters").val();
			$("#preview-template-button").attr("href", url);
		},

		selectedTemplateChangeHandler : function(model, templateModel) {
			var templateName = templateModel.get("template_short_name");
			templateGroupName = templateModel.templateGroupModel().get("templategroup_short_name");
			if (templateGroupName == 'root' && templateName == 'index') {
				var templateUID = '';
			} else if (templateGroupName == 'root' && templateName !== 'index') {
				var templateUID = templateName;
			} else if (templateName == 'index') {
				var templateUID = templateGroupName + "/";
			} else {
				var templateUID = templateGroupName + "/" + templateName;
			}
			this.$(".template-uid").text(templateUID);
			this.resetPreviewButtonHref()
		}
	})

	return TemplatePreviewControlsView;
	
}); 