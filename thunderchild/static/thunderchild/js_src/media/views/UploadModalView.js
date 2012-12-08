define(['jquery', 'media/models/AppModel', 'media/views/UploadItemView', 'lib/backbone'], function($, appModel, UploadItemView) {

	var UploadModalView = Backbone.View.extend({

		el : "#upload-modal",

		initialize : function() {
			this.CHOOSE_FILE_STATE = "choose-file";
			this.UPLOADING_STATE = "uploading";
			this.UPLOAD_ERRORS = "upload-errors";
			
			this.modalFileField = $("#modal_file_field");
			this.uploadButton = $("#modal_upload_button");
			this.progressBar = this.$(".progress .bar");

			appModel.on("showUploadModal", this.show, this);
			appModel.on("fileUploadQueued", this.fileUploadQueued, this);
			appModel.on("uploadsCompleteWithErrors", this.uploadsCompleteWithErrors, this);
		},

		events : {
			'click #modal_upload_button' : 'uploadClickHandler',
			'change #modal_file_field' : 'fileFieldChangeHandler',
			'click #cancel-uploads-button' : 'cancelUploadsClickHandler',
			'click #confirm-upload-errors-button' : 'confirmUploadErrorsHandler'
		},

		showState : function(state) {
			var stateElements = this.$('[data-state]');
			stateElements.filter("[data-state~='"+state+"']").show();
			stateElements.filter(":not([data-state~='"+state+"'])").hide();
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
			this.$(".modal-body div[data-state~=uploading] ul").append(view.el);
		},
		
		cancelUploadsClickHandler : function(e) {
			appModel.cancelAllUploads();
			e.preventDefault();
		},
		
		uploadsCompleteWithErrors : function() {
			this.showState(this.UPLOAD_ERRORS);
		},
		
		confirmUploadErrorsHandler : function(e) {
			appModel.reloadPage();
			e.preventDefault();
		}

	})

	return UploadModalView;

}); 