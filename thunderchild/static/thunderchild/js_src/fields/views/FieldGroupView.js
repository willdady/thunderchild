define(['jquery', 'fields/models/FieldCollection', 'fields/models/AppModel', 'fields/views/FieldView', 'lib/backbone'], function($, fields, appModel, FieldView) {

	var FieldGroupView = Backbone.View.extend({

		template : _.template($("#fieldgroup-template").html()),

		className : "row-fluid accordion-group",

		initialize : function() {
			fields.on("add", this.fieldAddHandler, this);
			fields.on("reset", this.render, this);
			fields.on("destroy", this.fieldDestroyHandler, this);
			this.model.on("change", this.render, this);
			this.model.on("destroy", this.destroyHandler, this);
			this.render();
		},

		events : {
			"click .edit-group-button" : "editGroupClickHandler",
			"click .delete-group-button" : "deleteClickHandler",
			"click .create-field-button" : "createFieldClickHandler",
			"show .group-content" : "collapseShowHandler",
			"hide .group-content" : "collapseHideHandler"
		},

		render : function() {
			this.$el.html(this.template(this.model.toJSON()));
			fields.forEach(_.bind(this.fieldAddHandler, this));
			if (this.model.getFields().length == 0) {
				this.$(".no-fields-msg").removeClass('hide');
				this.$("table.table").addClass('hide');
			} else {
				this.$(".no-fields-msg").addClass('hide');
				this.$("table.table").removeClass('hide');
			}
		},

		destroyHandler : function() {
			this.$el.remove();
		},

		editGroupClickHandler : function(e) {
			appModel.openEditFieldGroupModal(this.model);
			e.preventDefault();
			e.stopPropagation();
		},

		deleteClickHandler : function(e) {
			appModel.openConfirmDeleteFieldGroupModal(this.model)
			e.preventDefault();
			e.stopPropagation();
		},

		createFieldClickHandler : function(e) {
			appModel.openCreateFieldModal(this.model);
			e.preventDefault();
			e.stopPropagation();
		},

		fieldAddHandler : function(fieldModel) {
			if (fieldModel.get("fieldgroup") == this.model.id) {
				var fieldView = new FieldView({
					model : fieldModel
				});
				this.$(".table").append(fieldView.$el);
				// Make sure the field table is visible
				this.$(".no-fields-msg").addClass('hide');
				this.$("table.table").removeClass('hide');
			}
		},

		fieldDestroyHandler : function(fieldModel) {
			// Whenever any field is destroyed we check to see if this group is empty and show a message if true.
			if (this.model.getFields().length == 0) {
				this.$(".no-fields-msg").removeClass('hide');
				this.$("table.table").addClass('hide');
			} else {
				this.$(".no-fields-msg").addClass('hide');
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

	return FieldGroupView;

});
