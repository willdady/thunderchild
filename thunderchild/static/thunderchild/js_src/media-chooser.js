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
      return this.progressBar.width(percentage + "%");
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
      this.filename = this.$el.find("p").text();
      return this.id = this.$el.attr("data-id");
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
        thumbnail_url: this.$el.find("img")[0].src
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
    var appView, model, uploadModal;
    model = new AppModel();
    uploadModal = new UploadModalView({
      model: model
    });
    return appView = new AppView({
      model: model
    });
  });
}).call(this);
