define(['jquery', 'media/models/AppModel', 'media/views/UploadItemView', 'lib/backbone'], function($, appModel, UploadItemView) {

	var UploadModalView = Backbone.View.extend({

		el : "#upload-modal",

		initialize : function() {
			this.CHOOSE_FILE_STATE = "choose_file";
			this.UPLOADING_STATE = "uploading";
			
			this.modalFileField = $("#modal_file_field");
			this.uploadButton = $("#modal_upload_button");
			this.progressBar = this.$el.find(".progress .bar");

			appModel.on("showUploadModal", this.show, this);
			appModel.on("fileUploadQueued", this.fileUploadQueued, this);
		},

		events : {
			'click #modal_upload_button' : 'uploadClickHandler',
			'change #modal_file_field' : 'fileFieldChangeHandler',
			'click #cancel-uploads-button' : 'cancelUploadsClickHandler'
		},

		showState : function(state) {
			var stateElements = this.$el.find('[data-state]');
			stateElements.filter("[data-state='"+state+"']").show();
			stateElements.filter("[data-state!='"+state+"']").hide();
		},

		uploadClickHandler : function(e) {
			var file_list = this.modalFileField[0].files;
			if (file_list.length > 0) {
				this.showState(this.UPLOADING_STATE);
				appModel.uploadFiles(file_list);
			}
			e.preventDefault();
		},

		show : function() {
			this.uploadButton.addClass("disabled"); // We disable the upload button and reset the form when displaying the modal
			$("#modal_upload_form")[0].reset();
			this.showState(this.CHOOSE_FILE_STATE);
			this.$el.modal("show");
		},

		fileFieldChangeHandler : function() {
			this.uploadButton.removeClass("disabled"); // When the input changes we enable the upload button
		},
		
		fileUploadQueued : function(model) {
			var view = new UploadItemView({model : model});
			this.$(".modal-body div[data-state=uploading] ul").append(view.el);
		},
		
		cancelUploadsClickHandler : function(e) {
			appModel.cancelAllUploads();
			e.preventDefault();
		}

	})

	return UploadModalView;

}); 