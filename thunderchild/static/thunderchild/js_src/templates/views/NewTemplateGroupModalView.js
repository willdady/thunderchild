define(
	['jquery', 
	'templates/models/AppModel', 
	'templates/models/TemplateGroupModel', 
	'templates/models/TemplateModel',
	'templates/models/TemplateCollection', 
	'templates/models/TemplateGroupCollection', 
	'lib/backbone'], 
	function($, appModel, TemplateGroupModel, TemplateModel, templateCollection, templateGroupCollection) {

	var NewTemplateGroupModalView = Backbone.View.extend({
		
		el:"#create-templategroup-modal",

		initialize : function() {
			appModel.on("openNewTemplateGroupModal", this.open, this);
		},

		events : {
			"click #create-templategroup-button" : "createTemplateGroupButtonClickHandler",
			"keypress input" : "inputKeyPressHandler"
		},

		inputKeyPressHandler : function(e) {
			if (e.which == 13) {
				this.createTemplateGroupButtonClickHandler();
				e.preventDefault();
			}
		},

		open : function() {
			// We clean up the modal by removing any previously entered values and error alerts
			this.removeErrors();
			this.$("form").each(function() {
				this.reset();
			});
			// Show the modal
			this.$el.modal("show");
			// Give the first input focus
			$("#id_templategroup_short_name").focus();
		},

		removeErrors : function() {
			this.$(".alert").remove();
			this.$(".error").removeClass("error");
		},

		close : function() {
			this.$el.modal("hide");
		},

		createTemplateGroupButtonClickHandler : function(e) {
			var formData = this.$("form").serializeObject();
			$.post(templateGroupRoot, JSON.stringify(formData), _.bind(function(data, textStatus, jqXHR) {
				if (jqXHR.status == 200) {
					var templategroup_model = new TemplateGroupModel(data.templategroup);
					var template_model = new TemplateModel(data.template);
					template_model.templateGroupModel(templategroup_model);
					templategroup_model.indexTemplateModel(template_model);
					templateGroupCollection.add(templategroup_model);
					templateCollection.add(template_model);
					appModel.selectedTemplate(template_model);
					this.close()
				}
			}, this), "json").error(_.bind(function(jqXHR) {
				this.removeErrors();
				if (jqXHR.status == 400) {
					resp = $.parseJSON(jqXHR.responseText)
					errors_html = ''
					// Loop over each field in the errors object. The errors object contains fields in the format {<field name>:["error", "error", ...], ...}
					_.each(resp.errors, function(value, key) {
						// As there can be multiple errors for a field we loop over the errors too.
						_.each(value, function(el, i) {
							errors_html += _.template("<li><%= error %></li>", {
								error : el
							});
						});
						$("#id_" + key).before(_.template($("#form-error-template").text(), {
							errors : errors_html
						}));
						$("#id_" + key).parent().addClass("error");
					})
				}
			}, this));
			if (e) {
				e.preventDefault();
			}
		}
	})
	
	return NewTemplateGroupModalView;

}); 