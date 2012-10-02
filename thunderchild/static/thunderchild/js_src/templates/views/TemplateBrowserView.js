define(['jquery', 'templates/models/AppModel', 'templates/models/TemplateGroupModel', 'templates/views/TemplateGroupView', 'templates/models/TemplateGroupCollection', 'lib/backbone', 'lib/jquery.tinysort'], function($, appModel, TemplateGroupModel, TemplateGroupView, templateGroupCollection) {

	var TemplateBrowserView = Backbone.View.extend({
		
		el:"#template-browser",

		initialize : function() {
			this.$el.find("> ul > li").each(_.bind(function(i, el) {
				var model = new TemplateGroupModel({
					id : parseInt($(el).attr("data-id")),
					templategroup_short_name : $(el).find(".group-header h3").text()
				})
				var templategroup = new TemplateGroupView({
					el : el,
					model : model,
					collection : this.options.templateCollection
				});
				// Store a reference to the root template group in our AppModel and select it's index template by default
				if (model.get("templategroup_short_name") == 'root') {
					var indexModel = templategroup.getIndexModel();
					appModel.selectedTemplate(indexModel);
					appModel.rootTemplateGroup(model);
				}
				templateGroupCollection.add(model, {
					silent : true
				});
			}, this));
			templateGroupCollection.on("add", this.templateGroupAddHandler, this);
		},

		sort : function() {
			// Sort all template groups alphabetically
			this.$el.find("> ul > li").tsort(".group-header h3");
			// Make the root template group always first in the list
			this.$el.find("> ul").prepend(this.$el.find("ul > li .group-header h3:contains(root)").closest("li"));
		},

		templateGroupAddHandler : function(model) {
			var templategroup_element = $(_.template($("#templategroup-list-item-template").text(), model.toJSON()));
			this.$el.find("> ul").prepend(templategroup_element);
			var templategroup = new TemplateGroupView({
				el : templategroup_element,
				model : model,
				collection : this.options.templateCollection,
			});
			this.sort();
		}
	})

	return TemplateBrowserView;

});
