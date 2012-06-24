(function() {
  window.AppModel = Backbone.Model.extend({
    showFileChooser: function() {
      return this.trigger("showFileChooser");
    }
  });
  window.FileChooserWidgetView = Backbone.View.extend({
    initialize: function() {
      this.chooseFileButton = $('<a href="#" class="btn choose-file-button">Choose file</a>').click(_.bind(this.chooseFileButtonClickHandler, this));
      this.$el.parent().prepend(this.chooseFileButton);
      return this.$el.hide();
    },
    chooseFileButtonClickHandler: function(e) {
      this.model.showFileChooser();
      return e.preventDefault();
    }
  });
  window.FileChooserModalView = Backbone.View.extend({
    initialize: function() {
      this.$el.modal().modal("hide");
      return this.model.on("showFileChooser", this.show, this);
    },
    show: function() {
      return this.$el.modal("show");
    }
  });
}).call(this);
