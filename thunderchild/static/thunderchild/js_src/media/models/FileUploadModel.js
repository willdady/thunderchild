define(['jquery', 'lib/utilities', 'lib/backbone'], function($, Utilities) {
	
	var FileUploadModel = Backbone.Model.extend({
		
		initialize : function(file) {
			this.file = file;
			this.set('name', file.name);
			this.xhr = new XMLHttpRequest();
		},
		
		upload : function() {
			var fd = new FormData();
			fd.append("file", this.file);
			this.xhr.open("POST", thunderchild.uploadURL, true); // thunderchild is defined globally in the html template

			this.xhr.upload.onprogress = _.bind(function(e) {
				var percentage = Math.round((e.position / e.total) * 100)
				this.trigger("progress", percentage);
			}, this);
			
			this.xhr.onload = _.bind(function(e) {
				if (e.currentTarget.status == 200) {
					this.trigger("complete", this);
				} else {
					this.trigger("error", this, e);
				}
			}, this);
			
			this.xhr.onerror = _.bind(function(e) {
				this.trigger("error", this, e);
			}, this);

			this.xhr.setRequestHeader("X-CSRFToken", Utilities.getCookie('csrftoken'));
			this.xhr.send(fd);
		},
		
		abort : function() {
			this.xhr.abort();
		}
		
	});
	
	return FileUploadModel;
	
});
