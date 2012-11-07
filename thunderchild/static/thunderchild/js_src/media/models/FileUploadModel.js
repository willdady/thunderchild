define(['jquery', 'lib/utilities', 'lib/backbone'], function($, Utilities) {
	
	var FileUploadModel = Backbone.Model.extend({
		
		initialize : function(file) {
			this.file = file;
			this.set('name', file.name);
		},
		
		upload : function() {
			var fd = new FormData();
			fd.append("file", this.file);
			var xhr = new XMLHttpRequest();
			xhr.open("POST", uploadURL, true);

			xhr.upload.onprogress = _.bind(function(e) {
				var percentage = Math.round((e.position / e.total) * 100)
				this.trigger("progress", percentage);
			}, this);

			xhr.onload = _.bind(function(e) {
				if (e.currentTarget.status == 200) {
					this.trigger("complete", this);
				} else {
					this.trigger("error", this);
				}
			}, this);

			xhr.setRequestHeader("X-CSRFToken", Utilities.getCookie('csrftoken'));
			xhr.send(fd);
		}
		
	});
	
	return FileUploadModel;
	
});
