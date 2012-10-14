define(['jquery', 'lib/backbone'], function($) {
	
	var AppModel = Backbone.Model.extend({
	
		openConfirmDeleteModal : function() {
			this.trigger("openConfirmDeleteModal");	
		},
		
		selectAll : function() {
			this.trigger("selectAll");	
		},
		
		selectNone : function() {
			this.trigger("selectNone");	
		}
	
	});
	
	return new AppModel();
	
});
