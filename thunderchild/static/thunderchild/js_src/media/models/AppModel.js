define(['jquery', 'media/models/FileUploadModel', 'lib/utilities', 'lib/backbone'], function($, FileUploadModel, Utilities) {

	var AppModel = Backbone.Model.extend({

		showUploadModal : function() {
			this.trigger('showUploadModal');
		},

		showDeleteSelectedModal : function() {
			this.trigger('showDeleteSelectedModal');
		},

		showPreviewModal : function(model) {
			this.trigger('showPreviewModal', model);
		},
		
		uploadFiles : function(files) {
			this.uploadQueue = [];
			
			_.each(files, function(file, i) {
				var model = new FileUploadModel(file);
				model.on("complete", this._uploadCompleteHandler, this);
				this.uploadQueue.push(model);
				this.trigger("fileUploadQueued", model);
			}, this);
			
			// Start the first item in the queue downloading.
			this.uploadQueue[0].upload();			
		},
		
		_uploadCompleteHandler : function(model) {
			// Remove the completed FileUploadModel from the queue.
			var i = this.uploadQueue.indexOf(model);
			if (i !== -1) {
				this.uploadQueue.splice(i, 1);
				model.off("complete", this._uploadCompleteHandler, this);
			}
			// And start uploading the next FileUploadModel if the queue is not empty.
			if (this.uploadQueue.length > 0) {
				this.uploadQueue[0].upload();
			} else {
				this.trigger("uploadQueueComplete");
			}
		}
		
		/*
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
						// TODO: Should probably trigger an error here :\
					}, this);
		
					xhr.setRequestHeader("X-CSRFToken", Utilities.getCookie('csrftoken'));
					xhr.send(fd);
				}*/
		
		
	});

	return new AppModel();

}); 