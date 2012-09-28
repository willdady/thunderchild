define(['jquery', 'categories/models/CategoryCollection', 'categories/models/AppModel', 'lib/backbone'], function($, categories, appModel) {

	var CategoryGroupView = Backbone.View.extend({

		template : _.template($("#categorygroup-template").html()),

		className : "row-fluid accordion-group",

		initialize : function() {
			categories.on("add", this.categoryAddHandler, this);
			this.model.on("change", this.render, this);
			this.model.on("destroy", this.destroyHandler, this);
			this.render();
		},

		events : {
			"click .edit-group-button" : "editGroupClickHandler",
			"click .delete-group-button" : "deleteClickHandler"
		},

		render : function() {
			this.$el.html(this.template(this.model.toJSON()));
		},

		destroyHandler : function() {
			this.$el.remove();
		},

		editGroupClickHandler : function(e) {
			appModel.openEditCategoryGroupModal(this.model);
			e.preventDefault();
			e.stopPropagation();
		},

		deleteClickHandler : function(e) {
			appModel.openConfirmDeleteCategoryGroupModal(this.model)
			e.preventDefault();
			e.stopPropagation();
		},

		categoryAddHandler : function(categoryModel) {
			if (categoryModel.get("categorygroup") == this.model.id) {
				categoryView = new CategoryView({
					model : categoryModel
				});
				// TODO: Add categoryView to this view
			}
		}
	});

	return CategoryGroupView;

});
