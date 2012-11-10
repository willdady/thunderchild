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
				model.on("error", this._uploadErrorHandler, this);
				this.uploadQueue.push(model);
				this.trigger("fileUploadQueued", model);
			}, this);
			this.uploadQueue[0].upload();			
		},
		
		_dequeueFileUploadModel : function(model) {
			if (this.uploadQueue == undefined) return;
			if (this.uploadQueue.length == 0) return;
			var i = this.uploadQueue.indexOf(model);
			if (i !== -1) {
				this.uploadQueue.splice(i, 1);
				model.off("complete", this._uploadCompleteHandler, this);
				model.off("error", this._uploadCompleteHandler, this);
			}
		},
		
		_uploadCompleteHandler : function(model) {
			this._dequeueFileUploadModel(model);
			if (this.uploadQueue.length > 0) {
				this.uploadQueue[0].upload();
			} else {
				window.location = window.location.href.split("?")[0];
			}
		},
		
		_uploadErrorHandler : function(model) {
			this._dequeueFileUploadModel(model);
			if (this.uploadQueue.length > 0) {
				this.uploadQueue[0].upload();
			} else {
				window.location = window.location.href.split("?")[0];
			}
		},
		
		cancelAllUploads : function() {
			if (this.uploadQueue) {
				for (var i=0; i < this.uploadQueue.length; i++) {
				  this.uploadQueue[i].abort();
				};
			}
			window.location = window.location.href.split("?")[0];
		}
		
	});

	return new AppModel();

}); 