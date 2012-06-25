(function() {
  var counter;
  counter = 0;
  window.AppModel = Backbone.Model.extend({
    hideMediaChooser: function() {
      this.unset("uid");
      return this.trigger("hideMediaChooser");
    },
    showMediaChooser: function(uid) {
      this.set("uid", uid);
      return this.trigger("showMediaChooser");
    },
    assetSelectionCallback: function(obj) {
      return this.trigger("assetSelected", obj);
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
    show: function() {
      return this.$el.modal("show");
    },
    hide: function() {
      return this.$el.modal("hide");
    }
  });
}).call(this);
