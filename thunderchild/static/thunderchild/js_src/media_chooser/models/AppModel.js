define(['jquery', 'lib/backbone'], function($) {

	var AppModel = Backbone.Model.extend({
	
		showUploadModal : function() {
			this.trigger('showUploadModal');
		},
	
		assetSelectionCallback : function(obj) {
			if (parent !== window) {
				parent.appModel.assetSelectionCallback(obj);
			}
		}
	}) 

	return new AppModel();

});