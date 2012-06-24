(function() {
  var AppModel, AppView, AssetCollection, AssetItemView, AssetItemsView, AssetModel, DeleteSelectedModalView, PreviewModalView, UploadModalView;
  AssetModel = Backbone.Model.extend({
    selected: false
  });
  AssetCollection = Backbone.Collection.extend({
    model: AssetModel,
    url: '/backend/media/assets'
  });
  AppModel = Backbone.Model.extend({
    showUploadModal: function() {
      return this.trigger('showUploadModal');
    },
    showDeleteSelectedModal: function() {
      return this.trigger('showDeleteSelectedModal');
    },
    showPreviewModal: function(model) {
      return this.trigger('showPreviewModal', model);
    }
  });
  PreviewModalView = Backbone.View.extend({
    el: "#preview_modal",
    initialize: function() {
      this.$el.modal({
        backdrop: "static"
      }).modal("hide");
      this.model.on("showPreviewModal", this.show, this);
      return this.imageTemplate = _.template($("#preview_modal_template").html());
    },
    show: function(assetModel) {
      var modal_body;
      modal_body = this.$el.find(".modal-body");
      modal_body.html(this.imageTemplate(assetModel.toJSON()));
      return this.$el.modal("show");
    }
  });
  DeleteSelectedModalView = Backbone.View.extend({
    el: "#delete_selected_modal",
    initialize: function() {
      this.$el.modal({
        backdrop: "static"
      }).modal("hide");
      return this.model.on("showDeleteSelectedModal", this.show, this);
    },
    events: {
      'click #modal_confirm_delete_button': 'confirmDeleteButtonHandler'
    },
    confirmDeleteButtonHandler: function(e) {
      var assetCollection, model, models_to_delete, _i, _len, _ref;
      assetCollection = this.model.get("assetCollection");
      models_to_delete = [];
      _ref = assetCollection.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        model = _ref[_i];
        if (model.get("selected")) {
          models_to_delete.push(model);
        }
      }
      _.each(models_to_delete, function(model) {
        return model.destroy();
      });
      this.$el.modal("hide");
      this.model.set("numCheckedAssets", 0);
      return e.preventDefault();
    },
    show: function() {
      return this.$el.modal("show");
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
      return this.model.on("showUploadModal", this.show, this);
    },
    events: {
      'click #modal_upload_button': 'uploadClickHandler',
      'change #modal_file_field': 'fileFieldChangeHandler'
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
        this.uploadFile(file);
      }
      return e.preventDefault();
    },
    onProgressHandler: function(e) {
      var percentage;
      percentage = Math.round((e.position / e.total) * 100);
      this.progressBar.width(percentage + "%");
      return console.log("percentage: ", percentage, e);
    },
    onLoadHandler: function(e) {
      var response;
      if (e.currentTarget.status === 200) {
        response = $.parseJSON(e.currentTarget.response);
        if (response.name_conflict) {
          return this.showState(this.NAME_CONFLICT_STATE);
        } else {
          this.$el.modal("hide");
          return window.location.replace(window.location.href);
        }
      }
    },
    uploadFile: function(file, onprogress, onload) {
      var fd, xhr;
      fd = new FormData();
      fd.append("file", file);
      xhr = new XMLHttpRequest();
      xhr.open("POST", "/backend/media/upload", true);
      xhr.upload.onprogress = _.bind(this.onProgressHandler, this);
      xhr.onload = _.bind(this.onLoadHandler, this);
      xhr.setRequestHeader("X-CSRFToken", Utilities.getCookie('csrftoken'));
      return xhr.send(fd);
    },
    show: function() {
      this.uploadButton.addClass("disabled");
      $("#modal_upload_form")[0].reset();
      this.showState(this.CHOOSE_FILE_STATE);
      return this.$el.modal("show");
    },
    fileFieldChangeHandler: function() {
      return this.uploadButton.removeClass("disabled");
    }
  });
  AssetItemView = Backbone.View.extend({
    initialize: function() {
      return this.model.on("destroy", this.destroyHandler, this);
    },
    events: {
      'click': 'clickHandler',
      'click .thumbnail input[type="checkbox"]': 'thumbnailCheckboxClickHandler',
      'change .thumbnail input[type="checkbox"]': 'thumbnailCheckboxChangeHandler'
    },
    clickHandler: function(e) {
      if (this.model.get('is_image')) {
        this.options.appModel.showPreviewModal(this.model);
        return e.preventDefault();
      }
    },
    thumbnailCheckboxClickHandler: function(e) {
      return e.stopPropagation();
    },
    thumbnailCheckboxChangeHandler: function(e) {
      var id;
      id = $(e.currentTarget).attr('data-id');
      if ($(e.currentTarget).is(':checked')) {
        this.model.set("selected", true);
        return this.trigger("selection_change", true);
      } else {
        this.model.set("selected", false);
        return this.trigger("selection_change", false);
      }
    },
    destroyHandler: function() {
      this.$el.remove();
      return this.off();
    }
  });
  AssetItemsView = Backbone.View.extend({
    el: "#thumbnails_list",
    initialize: function() {
      this.collection.on("reset", this.collectionResetHandler, this);
      return this.thumbnail_template = _.template($("#thumbnail_template").html());
    },
    collectionResetHandler: function() {
      var asset, model, modelJSON, _i, _len, _ref, _results;
      this.$el.empty();
      _ref = this.collection.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        model = _ref[_i];
        modelJSON = model.toJSON();
        asset = new AssetItemView({
          el: this.thumbnail_template(modelJSON),
          model: model,
          appModel: this.model
        });
        asset.on("selection_change", this.assetSelectionChangeHandler, this);
        _results.push(this.$el.append(asset.el));
      }
      return _results;
    },
    assetSelectionChangeHandler: function(isSelected) {
      var numCheckedAssets;
      numCheckedAssets = $(".thumbnail input[type='checkbox']:checked").length;
      return this.model.set("numCheckedAssets", numCheckedAssets);
    }
  });
  AppView = Backbone.View.extend({
    el: window,
    initialize: function() {
      this.thumbnailsForm = $("#thumbnails_form");
      return this.model.on("change:numCheckedAssets", this.numCheckedAssetsChangeHandler, this);
    },
    events: {
      'click #upload_button': 'uploadButtonClickHandler',
      'click #deselect_button': 'deselectButtonClickHandler',
      'click #delete_button': 'deleteButtonClickHandler'
    },
    uploadButtonClickHandler: function(e) {
      this.model.showUploadModal();
      return e.preventDefault();
    },
    deselectButtonClickHandler: function(e) {
      var button;
      button = $(e.currentTarget);
      if (!button.hasClass('disabled')) {
        this.thumbnailsForm[0].reset();
        this.model.set("numCheckedAssets", 0);
      }
      return e.preventDefault();
    },
    deleteButtonClickHandler: function(e) {
      var button;
      button = $(e.currentTarget);
      if (!button.hasClass('disabled')) {
        this.model.showDeleteSelectedModal();
      }
      return e.preventDefault();
    },
    numCheckedAssetsChangeHandler: function(e, num) {
      if (num > 0) {
        $("#deselect_button").removeClass("disabled");
        return $("#delete_button").removeClass("disabled");
      } else {
        $("#deselect_button").addClass("disabled");
        return $("#delete_button").addClass("disabled");
      }
    }
  });
  $(function() {
    var appView, assetCollection, assetItemsView, deleteSelectedModal, model, previewModal, uploadModal;
    assetCollection = new AssetCollection();
    model = new AppModel({
      assetCollection: assetCollection
    });
    uploadModal = new UploadModalView({
      model: model
    });
    deleteSelectedModal = new DeleteSelectedModalView({
      model: model
    });
    previewModal = new PreviewModalView({
      model: model
    });
    appView = new AppView({
      model: model
    });
    assetItemsView = new AssetItemsView({
      collection: assetCollection,
      model: model
    });
    return assetCollection.reset($.parseJSON(initial_data));
  });
}).call(this);
