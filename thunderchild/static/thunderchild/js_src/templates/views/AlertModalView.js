define(['jquery', 'templates/models/AppModel', 'lib/backbone'], function($, appModel) {
	
	var AlertModalView = Backbone.View.extend({
		
		el : "#alert-modal",
		
		initialize : function() {
			appModel.on("openAlertModal", this.open, this);
		},
		
		open : function(message) {
			this.$(".modal-body p").text(message);
			this.$el.modal("show");
		}
		
	});
	
	return AlertModalView;
	
});
