define(['jquery', 'media/models/AppModel', 'lib/backbone'], function($, appModel) {
	
	var AssetItemView = Backbone.View.extend({
	
		initialize : function() {
			this.model.on("destroy", this.destroyHandler, this);
		},
	
		events : {
			'click' : 'clickHandler',
			'click .thumbnail input[type="checkbox"]' : 'thumbnailCheckboxClickHandler',
			'change .thumbnail input[type="checkbox"]' : 'thumbnailCheckboxChangeHandler'
		},
	
		clickHandler : function(e) {
			// If our asset is an image we open it in the preview modal. All other types follow standard default behaviour and a link to the file.
			if (this.model.get('is_image')) {
				appModel.showPreviewModal(this.model);
				e.preventDefault();
			}
		},
	
		thumbnailCheckboxClickHandler : function(e) {
			e.stopPropagation();
		},
	
		thumbnailCheckboxChangeHandler : function(e) {
			var id = $(e.currentTarget).attr('data-id');
			if ($(e.currentTarget).is(':checked')) {
				this.model.set("selected", true);
				this.trigger("selection_change", true);
			} else {
				this.model.set("selected", false);
				this.trigger("selection_change", false);
			}
		},
	
		destroyHandler : function() {
			this.$el.remove();
			this.off();
		}
		
	}); 
	
	return AssetItemView;

});