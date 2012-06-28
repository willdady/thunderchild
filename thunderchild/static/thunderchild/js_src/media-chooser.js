(function() {
  var AppModel, AppView, AssetItemView, UploadModalView;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  AppModel = Backbone.Model.extend({
    showUploadModal: function() {
      return this.trigger('showUploadModal');
    },
    assetSelectionCallback: function(obj) {
      if (parent !== window) {
        return parent.appModel.assetSelectionCallback(obj);
      }
    }
  });
  UploadModalView = Backbone.View.extend({
    el: "#upload_modal",
    initialize: function() {
      this.CHOOSE_FILE_STATE = "choose_file";
      this.UPLOADING_STATE = "uploading";
      this.NAME_CONFLICT_STATE = "name_conflict";
      this.$el.modal({
        backdrop: "static"
      }).modal("hide");
      this.modalFileField = $("#modal_file_field");
      this.uploadButton = $("#modal_upload_button");
      this.progressBar = this.$el.find(".progress .bar");
      this.replaceAssetControlsDisabled = false;
      this.model.on("showUploadModal", this.show, this);
      this.options.uploadService.on("progress", this.uploadProgressHandler, this);
      this.options.uploadService.on("complete", this.uploadCompleteHandler, this);
      this.options.uploadService.on("nameConflict", this.uploadNameConflictHandler, this);
      return this.options.uploadService.on("replaceComplete", this.replaceCompleteHandler, this);
    },
    events: {
      'click #modal_upload_button': 'uploadClickHandler',
      'change #modal_file_field': 'fileFieldChangeHandler',
      'click #yes-replace-button': 'replaceFileClickHandler',
      'click #no-replace-button': 'dontReplaceFileClickHandler'
    },
    showState: function(state) {
      var stateElements;
      stateElements = this.$el.find('[data-state]');
      stateElements.filter("[data-state='" + state + "']").show();
      return stateElements.filter("[data-state!='" + state + "']").hide();
    },
    uploadClickHandler: function(e) {
      var file, file_list;
      file_list = this.modalFileField[0].files;
      if (file_list.length > 0) {
        file = file_list[0];
        this.showState(this.UPLOADING_STATE);
        this.options.uploadService.uploadFile(file);
      }
      return e.preventDefault();
    },
    uploadProgressHandler: function(percentage) {
      return this.progressBar.width(percentage + "%");
    },
    uploadCompleteHandler: function() {
      this.$el.modal("hide");
      return window.location.replace(window.location.href);
    },
    uploadNameConflictHandler: function(response) {
      this.model.set("uploadResponse", response);
      return this.showState(this.NAME_CONFLICT_STATE);
    },
    show: function() {
      this.uploadButton.addClass("disabled");
      $("#modal_upload_form")[0].reset();
      this.showState(this.CHOOSE_FILE_STATE);
      return this.$el.modal("show");
    },
    fileFieldChangeHandler: function() {
      return this.uploadButton.removeClass("disabled");
    },
    replaceFileClickHandler: function(e) {
      var uploadResponse;
      if (!this.replaceAssetControlsDisabled) {
        uploadResponse = this.model.get("uploadResponse");
        this.replaceAssetControlsDisabled = true;
        this.options.uploadService.replaceAsset(uploadResponse.name_conflict.id, uploadResponse.id);
      }
      return e.preventDefault();
    },
    replaceCompleteHandler: function() {
      this.$el.modal("hide");
      return window.location.replace(window.location.href);
    },
    dontReplaceFileClickHandler: function(e) {
      if (!this.replaceAssetControlsDisabled) {
        this.$el.modal("hide");
        window.location.replace(window.location.href);
      }
      return e.preventDefault();
    }
  });
  AssetItemView = Backbone.View.extend({
    initialize: function() {
      this.filename = this.$el.find("p").text();
      this.id = this.$el.attr("data-id");
      return this.url = this.$el.attr("data-url");
    },
    events: function() {
      return {
        'click': 'clickHandler'
      };
    },
    clickHandler: function(e) {
      this.model.assetSelectionCallback({
        id: this.id,
        filename: this.filename,
        thumbnail_url: this.$el.find("img")[0].src,
        url: this.url
      });
      return e.preventDefault();
    }
  });
  AppView = Backbone.View.extend({
    el: window,
    initialize: function() {
      return $(".thumbnail").each(__bind(function(i, val) {
        return new AssetItemView({
          el: val,
          model: this.model
        });
      }, this));
    },
    events: {
      'click #media_chooser_upload_button': 'uploadButtonClickHandler'
    },
    uploadButtonClickHandler: function(e) {
      this.model.showUploadModal();
      return e.preventDefault();
    }
  });
  $(function() {
    var appView, model, uploadModal, uploadService;
    model = new AppModel();
    uploadService = new window.MediaUploadService();
    uploadModal = new UploadModalView({
      model: model,
      uploadService: uploadService
    });
    return appView = new AppView({
      model: model
    });
  });
}).call(this);
