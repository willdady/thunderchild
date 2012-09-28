define(['jquery', 'lib/backbone'], function($) {

	TextAreaModalView = Backbone.View.extend({

		initialize : function() {
			this.$el.modal().modal('hide');
			this.textarea = $("#textarea-modal-textarea");

			this.model.on("showTextAreaModal", this.show, this);
		},

		events : {
			'click #textarea-modal-done-button' : 'doneClickHandler'
		},

		show : function(text) {
			this.$el.modal('show');
			this.textarea.val(text);
		},

		doneClickHandler : function() {
			this.model.textAreaModalClosed(this.textarea.val());
		}
	});

	return TextAreaModalView;

}); 