define(['jquery', 'templates/models/AppModel', 'lib/backbone'], function($, appModel) {
	
	var TemplateSettingsModalView = Backbone.View.extend({
		
		el : "#template-settings-modal",
		
		initialize : function() {
			appModel.on("openTemplateSettingsModal", this.open, this);
		},
		
		events : {
			"change input[type=radio][name=template_is_private]" : "isPrivateChangeHander",
			"click #confirm-template-settings-button" : "saveClickHandler",
			"change #id_template_redirect_type" : "redirectTypeChangeHandler"
		},

		isPrivateChangeHander : function() {
			this.$(".field-holder.template_redirect_type, .field-holder.template_cache_timeout, .field-holder.template_redirect_url").toggle(this.$("input[type=radio][name=template_is_private][value='False']").prop("checked"));
		},
		
		open : function(model) {
			this.model = model;
			this.removeErrors();
			this.$el.modal("show");
				
			$.each(this.model.toJSON(), _.bind(function(key, value) {
				this.$(":input[name='"+key+"']").not("[type=radio]").val(value);
			}, this));
			
			if (this.model.get("template_is_private")) {
				this.$("input[type=radio][name=template_is_private][value='True']").prop("checked", true);
				this.$("input[type=radio][name=template_is_private][value='False']").prop("checked", false);
				this.$(".field-holder.template_redirect_type, .field-holder.template_cache_timeout, .field-holder.template_redirect_url").hide();
			} else {
				this.$("input[type=radio][name=template_is_private][value='True']").prop("checked", false);
				this.$("input[type=radio][name=template_is_private][value='False']").prop("checked", true);
				this.$(".field-holder.template_redirect_type, .field-holder.template_cache_timeout, .field-holder.template_redirect_url").show();
			}

			// As index templates are forbidden from being renamed we hide the input
			$(".field-holder.template_short_name").toggle( this.model.get("template_short_name") != 'index' );
			// Show/Hide the redirect url field based on the value of template_redirect_type
			var redirectType = this.model.get("template_redirect_type");
			$(".field-holder.template_redirect_url").toggle(redirectType == "301" || redirectType == "302");
		},

		close : function() {
			this.$el.modal("hide");
		},
		
		removeErrors : function() {
			this.$(".alert").remove();
			this.$(".error").removeClass("error");
		},
		
		saveClickHandler : function(e) {
			if($(e.currentTarget).hasClass('disabled')) return;
			
			$(e.currentTarget).addClass('disabled');
			
			var formData = this.$("form").serializeObject();
			this.removeErrors();
			this.model.save(formData, {
				wait : true,
				success : _.bind(function(model, reponse, options) {
					$(e.currentTarget).removeClass('disabled');
					this.model.requiresSave(false);
					this.close();
				}, this),
				error : _.bind(function(model, response) {
					$(e.currentTarget).removeClass('disabled');
					if (response.status == 400) {
						var resp = $.parseJSON(response.responseText);
						var errors_html = ''
						// Loop over each field in the errors object. The errors object contains fields in the format {<field name>:["error", "error", ...], ...}
						_.each(resp.errors, function(value, key) {
							_.each(value, function(el, i) {
								errors_html += _.template("<li><%= error %></li>", {
									error : el
								});
							});
							$(".field-holder." + key).before(_.template($("#form-error-template").text(), {
								errors : errors_html
							})).addClass("error");
						})
					}
				}, this)
			});
		},
		
		redirectTypeChangeHandler : function(e){
			var redirectType = $(e.currentTarget).val();
			$(".field-holder.template_redirect_url").toggle(redirectType === "301" || redirectType === "302");
		}
		
	});
	
	return TemplateSettingsModalView;
	
});
