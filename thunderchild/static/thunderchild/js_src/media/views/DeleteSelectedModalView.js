define(['jquery', 'media/models/AppModel', 'lib/backbone', 'lib/bootstrap'], function($, appModel) {

	var DeleteSelectedModalView = Backbone.View.extend({

		el : "#delete_selected_modal",

		initialize : function() {
			this.$el.modal().modal("hide");
			appModel.on("showDeleteSelectedModal", this.show, this);
		},

		events : {
			'click #modal_confirm_delete_button' : 'confirmDeleteButtonHandler'
		},

		confirmDeleteButtonHandler : function(e) {
			$("#thumbnails-form").submit();
			e.preventDefault()
		},

		show : function() {
			this.$el.modal("show");
		}
	})

	return DeleteSelectedModalView;

}); 