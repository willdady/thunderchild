define(['jquery', 'lib/backbone'], function($) {
	
	var AppView = Backbone.View.extend({
		
		el:"body",
		
		initialize : function() {
			$("#id_username").focus();
		}
		
	});
	
	return AppView;
	
});
