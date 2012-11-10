define(['jquery', 'lib/backbone'], function($) {
	
	var UploadItemView = Backbone.View.extend({
		
		tagName : 'li',
		
		template : _.template($("#upload-item-template").text()),
		
		initialize : function() {
			this.$el.html( this.template(this.model.toJSON()) );
			this.progressBar = this.$(".progress .bar");
			this.model.on("progress", this.progressHandler, this);
			this.model.on("complete", this.completeHandler, this);
			this.model.on("error", this.errorHandler, this);
		},
		
		progressHandler : function(percentage) {
			this.progressBar.css("width", percentage + "%");
		},
		
		completeHandler : function() {
			this.$el.addClass("complete");
		},
		
		errorHandler : function() {
			this.$el.addClass("error");
		}
		
	});
	
	return UploadItemView;
	
});
