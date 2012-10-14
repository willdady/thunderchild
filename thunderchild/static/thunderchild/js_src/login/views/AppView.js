define(['jquery', 'lib/backbone'], function($) {
	
	var AppView = Backbone.View.extend({
		
		el:$(window),
		
		initialize : function() {
			$("#id_username").focus();
		}
		
	});
	
	return AppView;
	
});
