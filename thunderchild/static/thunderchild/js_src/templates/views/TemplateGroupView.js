define(['jquery', 'templates/models/AppModel', 'templates/models/TemplateModel', 'templates/views/TemplateListItemView', 'templates/models/TemplateCollection','lib/backbone'], function($, appModel, TemplateModel, TemplateListItemView, templateCollection) {

	var TemplateGroupView = Backbone.View.extend({

		initialize : function() {
			// Instantiate a TemplateListItemView for each Template belonging to this group
			this.$el.find("ul.collapse > li").each(_.bind(function(i, el) {
				var model = new TemplateModel({
					id : $(el).attr("data-id"),
					templategroup : this.model.id,
					template_short_name : $.trim($(el).text())
				});
				model.templateGroupModel(this.model);
				templateListItemView = new TemplateListItemView({
					el : el,
					model : model,
				});
				// Add the model to the global template collection
				templateCollection.add(model, {
					silent : true
				});
				if (model.get("template_short_name") == "index") {
					this.model.indexTemplateModel(model);
				}
			}, this));
			templateCollection.on("add", this.templateAddedHandler, this);
			this.model.on("destroy", this.destroyHandler, this);
			this.model.on("change", this.render, this);
		},

		events : {
			"click .new-template-button" : "newTemplateButtonClickHandler",
			"click .edit-templategroup-button" : "editTemplateGroupButtonClickHandler"
		},

		newTemplateButtonClickHandler : function(e) {
			appModel.openNewTemplateModal(this.model);
			e.stopPropagation();
			e.preventDefault();
		},

		editTemplateGroupButtonClickHandler : function(e) {
			appModel.openEditTemplateGroupModal(this.model);
			e.preventDefault();
			e.stopPropagation();
		},

		sort : function() {
			this.$el.find("> ul > li").tsort();
			// Keep the index template always first
			this.$el.find("> ul").prepend(this.$el.find("[data-is-index=1]"));
		},

		templateAddedHandler : function(templateModel) {
			// If the newly created template belongs to this group instantiate it's view and add a new element to the DOM.
			if (templateModel.get("templategroup") == this.model.id) {
				var el = $(_.template($("#template-list-item-template").text(), templateModel.toJSON()));
				this.$el.find("ul.collapse").prepend(el);
				this.sort();
				var templateView = new TemplateListItemView({
					el : el,
					model : templateModel
				});
				// Since we have a complete model returned from the server we set this flag true so we don't do another request for the data on selection.
				templateView.modelPopulated = true;
				appModel.selectedTemplate(templateModel);
			}
		},

		getIndexModel : function() {
			var templates = templateCollection.where({
				templategroup : this.model.id
			});
			return _.find(templates, function(model) {
				return model.get("template_short_name") == 'index'
			});
		},

		destroyHandler : function() {
			this.$el.remove()
		},

		render : function() {
			this.$el.find(".group-header h3").text(this.model.get("templategroup_short_name"));
		}
	})

	return TemplateGroupView;

}); 