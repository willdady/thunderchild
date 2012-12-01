define(['jquery', 'templates/models/AppModel', 'lib/backbone'], function($, appModel) {
	
	var TemplateSettingsModal = Backbone.View.extend({
		
		el : "#template-settings-modal",
		
		initialize : function() {
			appModel.on("showTemplateSettingsModal", this.open, this);
		},
		
		events : {
			"change input[type=radio][name=template_is_private]" : "isPrivateChangeHander"
		},

		isPrivateChangeHander : function() {
			this.$(".field-holder.template_redirect_type, .field-holder.template_cache_timeout, .field-holder.template_redirect_url").toggle(this.$("input[type=radio][name=template_is_private][value='False']").prop("checked"));
		},
		
		open : function(model) {
			this.model = model;
			this.$el.modal("show");
				
			$.each(this.model.toJSON(), function(key, value) {
				$("#settings-form- input[name='"+key+"']").not("[type=radio]").val(value);
			});
			
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
			
		},

		close : function() {
			this.$el.modal("hide");
		},
		
		saveClickHandler : function() {
			if (this.model) {
				var formData = this.$("form").serializeObject();
				console.log(formData);
				this.model.set(formData, {
					silent : true
				});
				this.model.requiresSave(true);
			}
		}
		
		
	});
	
	return TemplateSettingsModal;
	
});
