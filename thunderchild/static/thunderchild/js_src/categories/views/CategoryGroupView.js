define(['jquery', 'categories/models/CategoryCollection', 'categories/models/AppModel', 'categories/views/CategoryView', 'lib/backbone'], function($, categories, appModel, CategoryView) {

	var CategoryGroupView = Backbone.View.extend({

		template : _.template($("#categorygroup-template").html()),

		className : "row-fluid accordion-group",

		initialize : function() {
			categories.on("add", this.categoryAddHandler, this);
			categories.on("reset", this.render, this);
			categories.on("destroy", this.categoryDestroyHandler, this);
			this.model.on("change", this.render, this);
			this.model.on("destroy", this.destroyHandler, this);
			this.render();
		},

		events : {
			"click .edit-group-button" : "editGroupClickHandler",
			"click .delete-group-button" : "deleteClickHandler",
			"click .create-category-button" : "createCategoryClickHandler",
			"show .group-content":"collapseShowHandler",
			"hide .group-content":"collapseHideHandler"
		},

		render : function() {
			this.$el.html(this.template( this.model.toJSON() ));
			categories.forEach( _.bind(this.categoryAddHandler, this) );
			if (this.model.getCategories().length == 0) {
				this.$(".no-categories-msg").removeClass('hide');
				this.$("table.table").addClass('hide');
			} else {
				this.$(".no-categories-msg").addClass('hide');
				this.$("table.table").removeClass('hide');
			}
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
		
		createCategoryClickHandler: function(e) {
			appModel.openCreateCategoryModal(this.model);
			e.preventDefault();
			e.stopPropagation();
		},

		categoryAddHandler : function(categoryModel) {
			if (categoryModel.get("categorygroup") == this.model.id) {
				var categoryView = new CategoryView({
					model : categoryModel
				});
				this.$(".table").append( categoryView.$el );
				// Make sure the category table is visible
				this.$(".no-categories-msg").addClass('hide');
				this.$("table.table").removeClass('hide');
			}
		},
		
		categoryDestroyHandler : function(categoryModel) {
			// Whenever any category is destroyed we check to see if this group is empty and show a message if true.
			if (this.model.getCategories().length == 0) {
				this.$(".no-categories-msg").removeClass('hide');
				this.$("table.table").addClass('hide');
			} else {
				this.$(".no-categories-msg").addClass('hide');
				this.$("table.table").removeClass('hide');
			}
		},
		
		collapseShowHandler : function() {
			this.$(".controls").fadeIn();
		},
		
		collapseHideHandler : function() {
			this.$(".controls").fadeOut();
		}
	});

	return CategoryGroupView;

});
