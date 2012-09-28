define(['jquery', 'lib/backbone'], function($) {
	
	var CategoryModalView = Backbone.View.extend({

		el:$("#category-modal"),
	    
	  	open: function() {
	    	this.$el.modal("show");
	  	},
	    
	  	close: function() {
	    	this.$el.modal("hide");
	  	}
	  	
	});
	
	return new CategoryModalView();
});
