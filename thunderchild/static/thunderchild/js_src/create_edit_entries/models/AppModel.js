define(['jquery', 'lib/backbone'], function($) {

	var AppModel = Backbone.Model.extend({

		hideMediaChooser : function() {
			this.trigger("hideMediaChooser");
		},

		showMediaChooser : function(uid, backdrop) {
			backdrop = typeof backdrop == 'undefined' ? true : backdrop;
			this.set("uid", uid);
			this.trigger("showMediaChooser", backdrop);
		},

		assetSelectionCallback : function(obj) {
			this.trigger("assetSelected", obj);
		},

		showTextAreaModal : function(uid, text) {
			this.set("fullscreen_source_uid", uid)
			this.trigger("showTextAreaModal", text);
		},

		textAreaModalClosed : function(text) {
			this.trigger("textAreaModalChange", text);
		}
		
	});
	return new AppModel();
});
