define(['jquery', 'lib/backbone'], function($) {
	
	var AppView = Backbone.View.extend({
		
		el:window,
		
		initialize : function() {
			$("#entry_type_select").change(this.entryTypeChangeHandler);
		},
		
		entryTypeChangeHandler : function() {
			$("#go_button").attr( "href", "/dashboard/entries/create/"+$(this).val() );
		}
		
	});
	
	return AppView;
	
});
