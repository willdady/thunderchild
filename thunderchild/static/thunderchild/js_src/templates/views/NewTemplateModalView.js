define([
	'jquery', 
	'templates/models/AppModel', 
	'templates/models/TemplateModel', 
	'templates/models/TemplateCollection', 
	'lib/backbone',
	'lib/jquery.serialize-object'
	], 
	function($, appModel, TemplateModel, templateCollection) {

	var NewTemplateModalView = Backbone.View.extend({
		
		el:"#create-template-modal",

		initialize : function() {
			appModel.on("openNewTemplateModal", this.open, this);
		},

		events : {
			"click #create-template-button" : "createTemplateButtonClickHandler",
			"keypress input" : "inputKeyPressHandler"
		},

		inputKeyPressHandler : function(e) {
			if (e.which == 13) {
				this.createTemplateButtonClickHandler();
				e.preventDefault();
			}
		},

		open : function(templateGroupModel) {
			this.templateGroupModel = templateGroupModel;
			$("#id2_templategroup").val(templateGroupModel.id);
			// We clean up the modal by removing any previously entered values and error alerts
			this.removeErrors();
			this.$el.find("form").each(function() {
				this.reset()
			});
			// Explicitly set 'Is Private?' radio back to 'No'.
			$("#id2_template_is_private_0").prop("checked", true);
			// Show the modal
			this.$el.modal("show");
			// Give the first input focus
			$("#id2_template_short_name").focus();
		},

		removeErrors : function() {
			this.$el.find(".alert").remove();
			this.$el.find(".error").removeClass("error");
		},

		close : function() {
			this.$el.modal("hide");
		},

		createTemplateButtonClickHandler : function(e) {
			var formData = this.$el.find("form").serializeObject();
			// This value is not part of the form but is required so we set it here.
			formData.template_cache_timeout = 0;
			this.temp_model = new TemplateModel(formData);
			this.temp_model.save({}, {
				success : _.bind(function(model, response) {
					model.templateGroupModel(this.templateGroupModel);
					templateCollection.add(model);
					this.close();
				}, this),
				error : _.bind(function(model, response) {
					this.removeErrors();
					if (response.status == 400) {
						var resp = $.parseJSON(response.responseText);
						var errors_html = ''
						// Loop over each field in the errors object. The errors object contains fields in the format {<field name>:["error", "error", ...], ...}
						_.each(resp.errors, function(value, key) {
							// As there can be multiple errors for a field we loop over the errors too.
							_.each(value, function(el, i) {
								errors_html += _.template("<li><%= error %></li>", {
									error : el
								});
							});
							$("#id2_" + key).before(_.template($("#form-error-template").text(), {
								errors : errors_html
							}));
							$("#id2_" + key).parent().addClass("error");
						})
					}
				}, this)
			});
			if (e) {
				e.preventDefault();
			}
		}
	})

	return NewTemplateModalView;

}); 