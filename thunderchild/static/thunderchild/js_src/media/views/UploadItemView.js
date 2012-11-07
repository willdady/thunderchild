define(['jquery', 'lib/backbone'], function($) {
	
	var UploadItemView = Backbone.View.extend({
		
		tagName : 'li',
		
		template : _.template($("#upload-item-template").text()),
		
		initialize : function() {
			this.$el.html( this.template(this.model.toJSON()) );
			this.progressBar = this.$(".progress .bar");
			this.model.on("progress", this.progressHandler, this);
		},
		
		progressHandler : function(percentage) {
			this.progressBar.css("width", percentage + "%");
		}
		
	});
	
	return UploadItemView;
	
});
