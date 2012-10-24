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
			this.$el.replaceWith(this.template(this.model.toJSON()));
		},

		destroyHandler : function() {
			this.$el.remove();
		}
	});

	return FieldView;

});
