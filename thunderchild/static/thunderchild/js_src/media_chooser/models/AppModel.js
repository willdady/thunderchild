define(['jquery', 'lib/utilities', 'lib/backbone'], function($, Utilities) {

	var AppModel = Backbone.Model.extend({
	
		showUploadModal : function() {
			this.trigger('showUploadModal');
		},
	
		assetSelectionCallback : function(obj) {
			if (parent !== window) {
				parent.appModel.assetSelectionCallback(obj);
			}
		},
		
		uploadFile : function(file) {
			var fd = new FormData();
			fd.append("file", file);
			var xhr = new XMLHttpRequest();
			xhr.open("POST", uploadURL, true);

			xhr.upload.onprogress = _.bind(function(e) {
				var percentage = Math.round((e.position / e.total) * 100)
				this.trigger("progress", percentage);
			}, this);

			xhr.onload = _.bind(function(e) {
				if (e.currentTarget.status == 200) {
					this.trigger("complete");
				}
			}, this);

			xhr.setRequestHeader("X-CSRFToken", Utilities.getCookie('csrftoken'));
			xhr.send(fd);
		}
		
	}) 

	return new AppModel();

});