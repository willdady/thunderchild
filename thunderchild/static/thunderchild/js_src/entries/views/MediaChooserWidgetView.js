define(['jquery', 'lib/backbone'], function($) {
	
	var counter = 0;
	var MediaChooserWidgetView = Backbone.View.extend({
	
	  initialize: function() {
	    this.chooseFileButton = $('<a href="#" class="btn choose-file-button">Choose file</a>');
	    this.$el.parent().prepend(this.chooseFileButton);
	    this.chooseFileButton.click(_.bind(this.chooseFileButtonClickHandler, this));
	    this.$el.hide(); // We hide the actual input element
	    
	    this.thumbnailTemplate = _.template( $("#mediaAssetThumbnailTemplate").text() );
	    
	    this.thumbnail = this.$el.parent().find(".media-asset-thumbnail");
	    this.removeAssetButton = this.thumbnail.find(".remove-asset-button").click(_.bind(this.removeAssetClickHandler, this));
	    
	    this.uid = counter; // We give each widget a UID
	    counter++;
	    this.model.on("assetSelected", this.assetSelectedHandler, this);
	  },
	    
	  removeAssetClickHandler: function(e) {
	    if (this.thumbnail) {
	      this.thumbnail.remove();
	      this.$el.removeAttr("value");
	    }
	    e.preventDefault();
	  },
	
	  chooseFileButtonClickHandler: function(e) {
	    this.model.showMediaChooser(this.uid);
	    e.preventDefault();
	  },
	    
	  assetSelectedHandler: function(obj) {
	    if (this.model.get("uid") != this.uid) {
	      return // Make sure the event belongs to us by checking the received uid matches.
	    }
	    // Assign the MediaAsset's id to the value of the field
	    this.$el.val(obj.id);
	    // Replace the content of the thumbnail holder with the newly selected asset
	    var content = this.thumbnailTemplate({thumbnail_url:obj.thumbnail_url, filename:obj.filename});
	    this.existingThumbnail = this.$el.parent().find(".media-asset-thumbnail");
	    if (this.existingThumbnail.length > 0) {
	      this.existingThumbnail.replaceWith( content )
	    } else {
	      this.$el.parent().append( content )
	    }
	    // Bind the remove button
	    this.thumbnail = this.$el.parent().find(".media-asset-thumbnail");
	    this.removeAssetButton = this.thumbnail.find(".remove-asset-button").click(_.bind(this.removeAssetClickHandler, this));
	    // Hide the chooser
	    this.model.hideMediaChooser();
	  }
	  
	});
	return MediaChooserWidgetView;
});