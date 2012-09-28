define(['jquery', 'lib/utilities', 'lib/backbone'], function($, Utilities) {

	var counter = 0;
	var RichTextAreaView = Backbone.View.extend({
		initialize : function() {
			this.uid = counter;
			// We give each widget a UID
			counter++;

			this.controls = $($("#textarea-controls-template").text());
			this.assetButton = this.controls.find('.rich-text-asset-button');
			this.$el.parent().prepend(this.controls);

			this.assetButton.click(_.bind(this.assetButtonClickHandler, this));

			this.fullscreenButton = this.controls.find('.rich-text-fullscreen-button');
			if (this.options.noFullscreen) {
				this.fullscreenButton.hide();
			} else {
				this.fullscreenButton.click(_.bind(this.fullscreenButtonClickHandler, this));
			}

			this.model.on("assetSelected", this.assetSelectedHandler, this);
			this.model.on("textAreaModalChange", this.textAreaModalChangeHandler, this);
		},

		assetButtonClickHandler : function(e) {
			if (this.options.hideMediaChooserBackdrop) {
				this.model.showMediaChooser(this.uid, false);
			} else {
				this.model.showMediaChooser(this.uid);
			}
			e.preventDefault();
		},

		assetSelectedHandler : function(obj) {
			if (this.model.get("uid") !== this.uid) {
				return; // Make sure the event belongs to us by checking the active uid matches.
			}
			Utilities.insertAtCaret(this.$el.attr('id'), obj.url);
			// Hide the chooser
			this.model.hideMediaChooser();
		},

		fullscreenButtonClickHandler : function(e) {
			this.model.showTextAreaModal(this.uid, this.$el.val());
			e.preventDefault();
		},

		textAreaModalChangeHandler : function(text) {
			if (this.model.get("fullscreen_source_uid") !== this.uid) {
				return // Make sure the event belongs to us by checking the active uid matches.
			}
			this.$el.val(text);
		}
	});
	
	return RichTextAreaView;
	
}); 