(function() {
  var counter;
  counter = 0;
  window.AppModel = Backbone.Model.extend({
    hideMediaChooser: function() {
      this.unset("uid");
      return this.trigger("hideMediaChooser");
    },
    showMediaChooser: function(uid, backdrop) {
      if (backdrop == null) {
        backdrop = true;
      }
      this.set("uid", uid);
      return this.trigger("showMediaChooser", backdrop);
    },
    assetSelectionCallback: function(obj) {
      return this.trigger("assetSelected", obj);
    },
    showTextAreaModal: function(uid, text) {
      this.set("uid", uid);
      return this.trigger("showTextAreaModal", text);
    },
    textAreaModalClosed: function(text) {
      return this.trigger("textAreaModalChange", text);
    }
  });
  window.MediaChooserWidgetView = Backbone.View.extend({
    initialize: function() {
      this.chooseFileButton = $('<a href="#" class="btn choose-file-button">Choose file</a>').click(_.bind(this.chooseFileButtonClickHandler, this));
      this.$el.parent().prepend(this.chooseFileButton);
      this.$el.hide();
      this.uid = counter;
      counter++;
      return this.model.on("assetSelected", this.assetSelectedHandler, this);
    },
    chooseFileButtonClickHandler: function(e) {
      this.model.showMediaChooser(this.uid);
      return e.preventDefault();
    },
    assetSelectedHandler: function(obj) {
      var content, thumbnailTemplate;
      if (this.model.get("uid") !== this.uid) {
        return;
      }
      this.$el.val(obj.id);
      thumbnailTemplate = _.template($("#mediaAssetThumbnailTemplate").text());
      content = thumbnailTemplate({
        thumbnail_url: obj.thumbnail_url,
        filename: obj.filename
      });
      this.existingThumbnail = this.$el.parent().find(".media-asset-thumbnail");
      if (this.existingThumbnail.length > 0) {
        this.existingThumbnail.replaceWith(content);
      } else {
        this.$el.parent().prepend(content);
      }
      return this.model.hideMediaChooser();
    }
  });
  window.MediaChooserModalView = Backbone.View.extend({
    initialize: function() {
      this.$el.modal().modal("hide");
      this.model.on("showMediaChooser", this.show, this);
      return this.model.on("hideMediaChooser", this.hide, this);
    },
    show: function(backdrop) {
      this.$el.modal("show");
      if (!backdrop) {
        return $(".modal-backdrop:last").remove();
      }
    },
    hide: function() {
      return this.$el.modal("hide");
    }
  });
  window.TextAreaModalView = Backbone.View.extend({
    initialize: function() {
      this.$el.modal().modal('hide');
      this.textarea = $("#textarea-modal-textarea");
      return this.model.on("showTextAreaModal", this.show, this);
    },
    events: {
      'click #textarea-modal-done-button': 'doneClickHandler'
    },
    show: function(text) {
      this.$el.modal('show');
      return this.textarea.val(text);
    },
    doneClickHandler: function() {
      return this.model.textAreaModalClosed(this.textarea.val());
    }
  });
  window.RichTextAreaView = Backbone.View.extend({
    initialize: function() {
      this.uid = counter;
      counter++;
      this.controls = $($("#textarea-controls-template").text());
      this.assetButton = this.controls.find('.rich-text-asset-button');
      this.$el.parent().prepend(this.controls);
      this.assetButton.click(_.bind(this.assetButtonClickHandler, this));
      this.fullscreenButton = this.controls.find('.rich-text-fullscreen-button');
      if (this.options.noFullscreen) {
        this.fullscreenButton.hide();
      }
      ({
        "else": this.fullscreenButton.click(_.bind(this.fullscreenButtonClickHandler, this))
      });
      this.model.on("assetSelected", this.assetSelectedHandler, this);
      return this.model.on("textAreaModalChange", this.textAreaModalChangeHandler, this);
    },
    assetButtonClickHandler: function(e) {
      if (this.options.hideMediaChooserBackdrop) {
        this.model.showMediaChooser(this.uid, false);
      } else {
        this.model.showMediaChooser(this.uid);
      }
      return e.preventDefault();
    },
    assetSelectedHandler: function(obj) {
      if (this.model.get("uid") !== this.uid) {
        return;
      }
      Utilities.insertAtCaret(this.$el.attr('id'), obj.url);
      return this.model.hideMediaChooser();
    },
    fullscreenButtonClickHandler: function(e) {
      this.model.showTextAreaModal(this.uid, this.$el.val());
      return e.preventDefault();
    },
    textAreaModalChangeHandler: function(text) {
      if (this.model.get("uid") !== this.uid) {
        return;
      }
      return this.$el.val(text);
    }
  });
}).call(this);
