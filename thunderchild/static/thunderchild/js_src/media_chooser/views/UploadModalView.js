define(['jquery', 'media_chooser/models/AppModel', 'lib/jquery-ui-timepicker-addon', 'lib/backbone'], function($, appModel) {

	var UploadModalView = Backbone.View.extend({

		el : "#upload-modal",

		initialize : function() {
			this.CHOOSE_FILE_STATE = "choose_file";
			this.UPLOADING_STATE = "uploading";

			this.$el.modal({
				backdrop : "static"
			}).modal("hide");
			this.modalFileField = $("#modal_file_field");
			this.uploadButton = $("#modal_upload_button");
			this.progressBar = this.$el.find(".progress .bar");

			appModel.on("showUploadModal", this.show, this);
			appModel.on("progress", this.uploadProgressHandler, this);
			appModel.on("complete", this.uploadCompleteHandler, this);
		},

		events : {
			'click #modal_upload_button' : 'uploadClickHandler',
			'change #modal_file_field' : 'fileFieldChangeHandler',
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
		}

	})

	return UploadModalView;

}); 