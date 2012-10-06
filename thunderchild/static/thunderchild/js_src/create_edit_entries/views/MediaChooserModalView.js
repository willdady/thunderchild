define(['jquery', 'lib/backbone'], function() {

	var MediaChooserModalView = Backbone.View.extend({

		initialize : function() {
			this.$el.modal().modal("hide");
			this.model.on("showMediaChooser", this.show, this);
			this.model.on("hideMediaChooser", this.hide, this);
		},

		show : function(backdrop) {
			this.$el.modal("show");
			if (!backdrop) {
				$(".modal-backdrop:last").remove() // We immediately remove the modal backdrop from the dom of backdrop == false
			}
		},

		hide : function() {
			this.$el.modal("hide");
		}
	});
	
	return MediaChooserModalView;

}); 