define(['jquery', 'fields/models/AppModel', 'lib/backbone'], function($, appModel) {

	var FieldView = Backbone.View.extend({

		template : _.template($("#field-template").html()),

		initialize : function() {
			this.setElement(this.template(this.model.toJSON()));
			this.model.on("change", this.render, this);
			this.model.on("destroy", this.destroyHandler, this);
		},

		events : {
			'click a.field-name' : 'clickHandler',
			'click a.delete-field-button' : 'deleteClickHandler'
		},

		clickHandler : function(e) {
			appModel.openEditFieldModal(this.model);
			e.preventDefault();
		},

		deleteClickHandler : function() {
			appModel.openConfirmDeleteFieldModal(this.model);
		},

		render : function() {
			var data = this.model.toJSON();
			this.$("tr[data-field-id]").attr("data-field-id", data.id);
			this.$(".field-name").text(data.field_name);
			this.$(".field-short-name").text("{ "+data.field_short_name+" }");
			this.$(".field-type").text(data.field_type);		},

		destroyHandler : function() {
			this.$el.remove();
		}
	});

	return FieldView;

});
