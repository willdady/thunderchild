define(['jquery', 'templates/models/AppModel', 'lib/backbone'], function($, appModel) {

	var SettingsView = Backbone.View.extend({
		
		el:"#settings-pane",

		initialize : function() {
			appModel.on("change:selectedTemplate", this.selectedTemplateChangeHandler, this);
			this.selectedTemplateChangeHandler();
		},

		events : {
			"change :input" : "inputChangeHander"
		},

		inputChangeHander : function() {
			if (this.templateModel) {
				var formData = this.$el.find("form").serializeObject();
				this.templateModel.set(formData, {
					silent : true
				});
				this.templateModel.requiresSave(true);
			}
			// If the template is marked as private we hide the irrelevant fields.
			if ($("input:radio[name=template_is_private][value='True']").prop("checked")) {
				$("#cache-timeout-group, #redirect-group, #redirect-url-group").hide();
			} else {
				$("#cache-timeout-group, #redirect-group, #redirect-url-group").show();
			}
		},

		selectedTemplateChangeHandler : function() {
			// If we have a reference to an existing template remove event callback
			if (this.templateModel) {
				this.templateModel.off("change", this.populateFromModel, this);
				this.templateModel.off("errors", this.renderErrors, this);
			}
			// Add event callback to newly selected template
			this.templateModel = appModel.get("selectedTemplate");
			if (this.templateModel) {
				this.templateModel.on("change", this.populateFromModel, this);
				this.templateModel.on("errors", this.renderErrors, this);
				this.populateFromModel();
			}
			// Remove any previously rendered errors
			this.removeErrors();
			// If this template has errors render them
			var errors = this.templateModel.errors();
			if (errors) {
				this.renderErrors(errors)
			}
		},

		removeErrors : function() {
			this.$el.find(".alert").remove();
			this.$el.find(".error").removeClass("error");
		},

		renderErrors : function(errors) {
			this.removeErrors();
			var errors_html = '';
			// Loop over each field in the errors object. The errors object contains fields in the format {<field name>:["error", "error", ...], ...}
			_.each(errors, function(value, key) {
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
			});
		},

		populateFromModel : function() {
			if (this.templateModel.get("template_short_name")) {
				$("#id_template_short_name").val(this.templateModel.get("template_short_name"));
				$("#id_template_content_type").val(this.templateModel.get("template_content_type"));
				$("#id_template_cache_timeout").val(this.templateModel.get("template_cache_timeout"));
				$("#id_template_redirect_type").val(this.templateModel.get("template_redirect_type"));
				$("#id_template_redirect_url").val(this.templateModel.get("template_redirect_url"));
				$("#id_templategroup").val(this.templateModel.get("templategroup"));

				if (this.templateModel.get("template_is_private")) {
					$("input:radio[name=template_is_private][value='True']").prop("checked", true);
					$("input:radio[name=template_is_private][value='False']").prop("checked", false);
					$("#cache-timeout-group, #redirect-group, #redirect-url-group").hide();
				} else {
					$("input:radio[name=template_is_private][value='True']").prop("checked", false);
					$("input:radio[name=template_is_private][value='False']").prop("checked", true);
					$("#cache-timeout-group, #redirect-group, #redirect-url-group").show();
				}

				// As index templates are forbidden from being renamed we hide the input
				if (this.templateModel.get("template_short_name") == 'index') {
					$("#id_template_short_name").parent().parent().hide();
				} else {
					$("#id_template_short_name").parent().parent().show();
				}
			}
		}
	})

	return SettingsView;

}); 