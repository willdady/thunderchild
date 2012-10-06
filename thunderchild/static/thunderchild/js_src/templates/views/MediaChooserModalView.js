define(['jquery', 'templates/models/AppModel', 'lib/backbone'], function($, appModel) {

	var MediaChooserModalView = Backbone.View.extend({
		
		el:"#media-chooser-modal",

		initialize : function() {
			appModel.on("openMediaChooserModal", this.open, this);
			appModel.on("closeMediaChooserModal", this.close, this);
		},

		open : function() {
			this.$el.modal("show");
		},

		close : function() {
			this.$el.modal("hide");
		}
	})
	
	return MediaChooserModalView;

}); 