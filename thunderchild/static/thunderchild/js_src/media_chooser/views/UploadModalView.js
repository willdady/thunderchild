define(['jquery', 'media_chooser/models/AppModel', 'lib/jquery-ui-timepicker-addon', 'lib/backbone'], function($, appModel) {

	var UploadModalView = Backbone.View.extend({

		el : "#upload_modal",

		initialize : function() {
			this.CHOOSE_FILE_STATE = "choose_file";
			this.UPLOADING_STATE = "uploading";
			this.NAME_CONFLICT_STATE = "name_conflict";

			this.$el.modal({
				backdrop : "static"
			}).modal("hide");
			this.modalFileField = $("#modal_file_field");
			this.uploadButton = $("#modal_upload_button");
			this.progressBar = this.$el.find(".progress .bar");

			this.replaceAssetControlsDisabled = false;

			appModel.on("showUploadModal", this.show, this);
			appModel.on("progress", this.uploadProgressHandler, this);
			appModel.on("complete", this.uploadCompleteHandler, this);
			appModel.on("nameConflict", this.uploadNameConflictHandler, this);
			appModel.on("replaceComplete", this.replaceCompleteHandler, this);
		},

		events : {
			'click #modal_upload_button' : 'uploadClickHandler',
			'change #modal_file_field' : 'fileFieldChangeHandler',
			'click #yes-replace-button' : 'replaceFileClickHandler',
			'click #no-replace-button' : 'dontReplaceFileClickHandler'
		},

		showState : function(state) {
			var stateElements = this.$el.find('[data-state]');
			stateElements.filter("[data-state='" + state + "']").show();
			stateElements.filter("[data-state!='" + state + "']").hide();
		},

		uploadClickHandler : function(e) {
			var file_list = this.modalFileField[0].files;
			if (file_list.length > 0) {
				file = file_list[0];
				this.showState(this.UPLOADING_STATE);
				appModel.uploadFile(file);
			}
			e.preventDefault();
		},

		uploadProgressHandler : function(percentage) {
			this.progressBar.width(percentage + "%");
		},

		uploadCompleteHandler : function() {
			this.$el.modal("hide");
			// We navigate to the default media chooser url taking us back to page 1.
			window.location.replace(mediaChooserURL);
		},

		uploadNameConflictHandler : function(response) {
			// Store the response in the app model so we can retrieve it later.
			appModel.set("uploadResponse", response);
			this.showState(this.NAME_CONFLICT_STATE);
		},

		show : function() {
			// We disable the upload button and reset the form when displaying the modal
			this.uploadButton.addClass("disabled");
			$("#modal_upload_form")[0].reset();
			this.showState(this.CHOOSE_FILE_STATE);
			this.$el.modal("show");
		},

		fileFieldChangeHandler : function() {
			// When the input changes we enable the upload button
			this.uploadButton.removeClass("disabled");
		},

		replaceFileClickHandler : function(e) {
			if (!this.replaceAssetControlsDisabled) {
				var uploadResponse = appModel.get("uploadResponse");
				this.replaceAssetControlsDisabled = true;
				appModel.replaceAsset(uploadResponse.name_conflict.id, uploadResponse.id);
			}
			e.preventDefault();
		},

		replaceCompleteHandler : function() {
			// We reload the page (without url parameters, taking us to the first page)
			this.$el.modal("hide");
			window.location.replace(window.location.href);
		},

		dontReplaceFileClickHandler : function(e) {
			if (!this.replaceAssetControlsDisabled) {
				this.$el.modal("hide");
				// We reload the page (without url parameters, taking us to the first page)
				window.location.replace(window.location.href);
			}
			e.preventDefault();
		}
	})

	return UploadModalView;

}); 