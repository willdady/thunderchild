(function() {
  var AppModel, MediaChooserModalView, MediaChooserWidgetView, RichTextAreaView, TextAreaModalView, counter;
  counter = 0;
  AppModel = Backbone.Model.extend({
    hideMediaChooser: function() {
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
      this.set("fullscreen_source_uid", uid);
      return this.trigger("showTextAreaModal", text);
    },
    textAreaModalClosed: function(text) {
      return this.trigger("textAreaModalChange", text);
    }
  });
  MediaChooserWidgetView = Backbone.View.extend({
    initialize: function() {
      this.chooseFileButton = $('<a href="#" class="btn choose-file-button">Choose file</a>').click(_.bind(this.chooseFileButtonClickHandler, this));
      this.$el.parent().prepend(this.chooseFileButton);
      this.$el.hide();
      this.thumbnailTemplate = _.template($("#mediaAssetThumbnailTemplate").text());
      this.thumbnail = this.$el.parent().find(".media-asset-thumbnail");
      this.removeAssetButton = this.thumbnail.find(".remove-asset-button").click(_.bind(this.removeAssetClickHandler, this));
      this.uid = counter;
      counter++;
      return this.model.on("assetSelected", this.assetSelectedHandler, this);
    },
    removeAssetClickHandler: function(e) {
      if (this.thumbnail) {
        this.thumbnail.remove();
        this.$el.removeAttr("value");
      }
      return e.preventDefault();
    },
    chooseFileButtonClickHandler: function(e) {
      this.model.showMediaChooser(this.uid);
      return e.preventDefault();
    },
    assetSelectedHandler: function(obj) {
      var content;
      if (this.model.get("uid") !== this.uid) {
        return;
      }
      this.$el.val(obj.id);
      content = this.thumbnailTemplate({
        thumbnail_url: obj.thumbnail_url,
        filename: obj.filename
      });
      this.existingThumbnail = this.$el.parent().find(".media-asset-thumbnail");
      if (this.existingThumbnail.length > 0) {
        this.existingThumbnail.replaceWith(content);
      } else {
        this.$el.parent().append(content);
      }
      this.thumbnail = this.$el.parent().find(".media-asset-thumbnail");
      this.removeAssetButton = this.thumbnail.find(".remove-asset-button").click(_.bind(this.removeAssetClickHandler, this));
      return this.model.hideMediaChooser();
    }
  });
  MediaChooserModalView = Backbone.View.extend({
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
  TextAreaModalView = Backbone.View.extend({
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
  RichTextAreaView = Backbone.View.extend({
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
      if (this.model.get("fullscreen_source_uid") !== this.uid) {
        return;
      }
      return this.$el.val(text);
    }
  });
  $(function() {
    var mediaChooserModal, textAreaModal;
    $(".field_label_holder label").click(function(e) {
      return e.preventDefault();
    });
    $("#tabs a:first").tab("show");
    Utilities.autoSlug($("#id_title"), $("#id_slug"));
    $('[data-field-type="datetime"]').datetimepicker({
      dateFormat: 'yy-mm-dd',
      timeFormat: 'hh:mm:ss',
      showSecond: true
    });
    $('[data-field-type="date"]').datepicker({
      dateFormat: 'yy-mm-dd'
    });
    window.appModel = new AppModel();
    mediaChooserModal = new MediaChooserModalView({
      el: $("#media_chooser_modal"),
      model: appModel
    });
    $('[data-field-type="file"]').each(function() {
      return new MediaChooserWidgetView({
        el: $(this),
        model: appModel
      });
    });
    $('textarea').each(function() {
      var el;
      el = $(this);
      if (el.attr("id") !== "textarea-modal-textarea") {
        return new RichTextAreaView({
          el: el,
          model: appModel
        });
      } else {
        return new RichTextAreaView({
          el: el,
          model: appModel,
          noFullscreen: true,
          hideMediaChooserBackdrop: true
        });
      }
    });
    textAreaModal = new TextAreaModalView({
      el: $("#textarea-modal"),
      model: appModel
    });
    return $('[data-field-type="color"]').each(function(i, el) {
      var picker, pickerID;
      pickerID = "picker" + i;
      picker = $('<div id="' + pickerID + '" class="picker"></div>');
      $(this).parent().append(picker);
      return $(picker).farbtastic($(this));
    });
  });
}).call(this);
