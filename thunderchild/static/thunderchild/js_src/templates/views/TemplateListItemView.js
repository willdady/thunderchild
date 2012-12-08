define(['jquery', 'templates/models/AppModel', 'lib/backbone'], function($, appModel) {

	var TemplateListItemView = Backbone.View.extend({

		initialize : function() {
			appModel.on("change:selectedTemplate", this.selectedTemplateChangeHandler, this);
			this.model.on("destroy", this.modelDestroyHandler, this);
			this.model.on("change, requiresSave", this.render, this);
			this.model.on("save", this.saveHandler, this);
			this.model.on("saveSuccess", this.saveSuccessHandler, this);
			this.render();
		},

		events : {
			'click' : 'clickHandler',
			'click a' : 'clickHandler',
			'click .but-tmpl-action' : 'actionButtonClickHandler'
		},

		clickHandler : function(e) {
			appModel.selectedTemplate(this.model);
			e.preventDefault();
		},
		
		actionButtonClickHandler : function(e) {
			appModel.selectedTemplate(this.model);
			var coords = $(e.currentTarget).offset();
			var actions = [
				{'Delete' : _.bind(this.deleteAction, this)},
				{'Settings' : _.bind(this.settingsAction, this)}
			];
			appModel.showActionDropDown(coords.left, coords.top+15, actions);
			e.stopPropagation();
		},
		
		deleteAction : function(e) {
			appModel.openConfirmDeleteTemplateModal(this.model);
			e.preventDefault();
		},
		
		settingsAction : function(e) {
			appModel.showTemplateSettingsModal(this.model);
			e.preventDefault();
		},

		selectedTemplateChangeHandler : function() {
			var model = appModel.get("selectedTemplate");
			if (model == this.model) {
				if (!this.model.has("template_content")) {
					this.$(".loading-anim").removeClass("hide");
					this.model.fetch({success : _.bind(function(){
						this.$(".loading-anim").addClass("hide");
					},this)});
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
			this.$("a").text(this.model.get("template_short_name"));
			this.$el.toggleClass("unsaved", this.model.requiresSave() === true);
			this.$el.toggleClass("is-fragment", this.model.get("template_is_private") === true);
		},
		
		saveHandler : function() {
			this.$(".loading-anim").removeClass("hide");
		},
		
		saveSuccessHandler : function() {
			this.$(".loading-anim").addClass("hide");
		}
	})
	
	return TemplateListItemView;

}); 