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
					var response = $.parseJSON(e.currentTarget.response);
					if (response.name_conflict) {
						this.trigger("nameConflict", response);
					} else {
						this.trigger("complete");
					}
				}
			}, this);

			xhr.setRequestHeader("X-CSRFToken", Utilities.getCookie('csrftoken'));
			xhr.send(fd);
		},

		replaceAsset : function(existing_asset_id, new_asset_id) {
			$.post(replaceURL, {
				existing_asset_id : existing_asset_id,
				new_asset_id : new_asset_id
			}, _.bind(function(response) {
				if (response.response == 'OK') {
					this.trigger("replaceComplete");
				} else {
					this.trigger("replaceError");
				}
			}, this));
		}
	}) 

	return new AppModel();

});