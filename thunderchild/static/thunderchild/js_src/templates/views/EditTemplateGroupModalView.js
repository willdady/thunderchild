define(['jquery', 'templates/models/AppModel', 'lib/backbone'], function($, appModel) {

	var EditTemplateGroupModalView = Backbone.View.extend({
		
		el:"#edit-templategroup-modal",

		initialize : function() {
			appModel.on("openEditTemplateGroupModal", this.open, this);
		},

		events : {
			"click #save-templategroup-button" : "saveTemplateGroupButtonClickHandler",
			"click #delete-templategroup-button" : "deleteTemplateGroupButtonClickHandler",
			"keypress input" : "inputKeyPressHandler"
		},

		inputKeyPressHandler : function(e) {
			if (e.which == 13) {
				this.saveTemplateGroupButtonClickHandler();
				e.preventDefault();
			}
		},

		open : function(templateGroupModel) {
			this.templateGroupModel = templateGroupModel;
			// We clean up the modal by removing any previously entered values and error alerts
			this.removeErrors();
			this.$("form").each(function() {
				this.reset()
			});
			// Show the modal
			this.$el.modal("show");
			// Give the first input focus
			$("#id2_templategroup_short_name").val(this.templateGroupModel.get("templategroup_short_name")).focus();
		},

		removeErrors : function() {
			this.$(".alert").remove();
			this.$(".error").removeClass("error");
		},

		close : function() {
			this.$el.modal("hide");
		},

		saveTemplateGroupButtonClickHandler : function(e) {
			var formData = this.$("form").serializeObject();
			// If the form data is the same as the model we don't need to save
			if (formData.templategroup_short_name == this.templateGroupModel.get("templategroup_short_name")) {
				this.close()
				return
			}
			this.templateGroupModel.save(formData, {
				wait : true,
				success : _.bind(function() {
					this.close();
				}, this),
				error : _.bind(function(model, response) {
					this.removeErrors();
					if (response.status == 400) {
						var resp = $.parseJSON(response.responseText);
						var errors_html = '';
						// Loop over each field in the errors object. The errors object contains fields in the format {<field name>:["error", "error", ...], ...}
						_.each(resp.errors, function(value, key) {
							// As there can be multiple errors for a field we loop over the errors too.
							_.each(value, function(el, i) {
								errors_html += _.template("<li><%= error %></li>", {
									error : el
								});
							})
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
		},

		deleteTemplateGroupButtonClickHandler : function(e) {
			this.close();
			appModel.openConfirmDeleteTemplateGroupModal(this.templateGroupModel);
			e.preventDefault();
		}
	})
	
	return EditTemplateGroupModalView;

}); 