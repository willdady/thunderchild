define(['jquery', 'templates/models/AppModel', 'lib/backbone'], function($, appModel) {

	var TemplateListItemView = Backbone.View.extend({

		initialize : function() {
			appModel.on("change:selectedTemplate", this.selectedTemplateChangeHandler, this);
			this.model.on("destroy", this.modelDestroyHandler, this);
			this.model.on("change requiresSave", this.render, this);
		},

		events : {
			'click a' : 'clickHandler'
		},

		clickHandler : function(e) {
			appModel.selectedTemplate(this.model);
			e.preventDefault();
		},

		selectedTemplateChangeHandler : function() {
			var model = appModel.get("selectedTemplate");
			if (model == this.model) {
				if (!this.model.has("template_content")) {
					this.model.initialFetch();
				}
				this.$el.addClass("active");
			} else {
				this.$el.removeClass("active");
			}
		},

		modelDestroyHandler : function() {
			this.$el.remove();
		},

		render : function() {
			if (this.model.templateGroupModel().indexTemplateModel() == this.model) {
				this.$el.find("a em").text(this.model.get("template_short_name"));
			} else {
				this.$el.find("a").text(this.model.get("template_short_name"));
			}
			if (this.model.requiresSave()) {
				this.$el.addClass("unsaved");
			} else {
				this.$el.removeClass("unsaved");
			}
		}
	})
	
	return TemplateListItemView;

}); 