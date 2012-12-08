define(['jquery', 'templates/models/AppModel', 'templates/models/TemplateModel', 'templates/views/TemplateListItemView', 'templates/models/TemplateCollection', 'lib/backbone'], function($, appModel, TemplateModel, TemplateListItemView, templateCollection) {

	var TemplateGroupView = Backbone.View.extend({

		initialize : function() {
			// Instantiate a TemplateListItemView for each Template belonging to this group
			this.$("ul.collapse > li").each(_.bind(function(i, el) {
				var model = new TemplateModel({
					id : $(el).attr("data-id"),
					templategroup : this.model.id,
					template_short_name : $.trim($(el).text()),
					template_is_private : $(el).hasClass('is-fragment')
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
			appModel.on("change:selectedTemplate", this.selectedTemplateChangeHandler, this);
		},

		events : {
			"click .but-tmpl-grp-action" : "actionButtonClickHandler"
		},

		actionButtonClickHandler : function(e) {
			var coords = $(e.currentTarget).offset();
			var actions = [{
				'New Template' : _.bind(this.newTemplateAction, this)
			}, {
				'Delete' : _.bind(this.deleteAction, this)
			}, {
				'Settings' : _.bind(this.settingsAction, this)
			}];
			appModel.showActionDropDown(coords.left, coords.top + 15, actions);
			e.stopPropagation();
		},

		newTemplateAction : function(e) {
			appModel.openNewTemplateModal(this.model);
			e.preventDefault();
		},

		deleteAction : function(e) {
			appModel.openConfirmDeleteTemplateGroupModal(this.model);
			e.preventDefault();
		},

		settingsAction : function(e) {
			appModel.openEditTemplateGroupModal(this.model);
			e.preventDefault();
		},

		sort : function() {
			this.$("> ul > li").tsort("a");
			// Keep the index template always first
			this.$("> ul").prepend(this.$("[data-is-index=1]"));
		},

		templateAddedHandler : function(templateModel) {
			// If the newly created template belongs to this group instantiate it's view and add a new element to the DOM.
			if (templateModel.get("templategroup") == this.model.id) {
				var templateView = new TemplateListItemView({
					el : _.template($("#template-list-item-template").text(), templateModel.toJSON()),
					model : templateModel
				});
				this.$("ul.collapse").prepend(templateView.el);
				this.sort();
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
		
		selectedTemplateChangeHandler : function() {
			var templateModel = appModel.get("selectedTemplate");
			this.$el.toggleClass("active", templateModel.templateGroupModel() === this.model);
		},

		render : function() {
			this.$(".group-header h3").text(this.model.get("templategroup_short_name"));
		}
	})

	return TemplateGroupView;

});
