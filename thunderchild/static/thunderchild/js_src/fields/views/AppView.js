define(['jquery', 'lib/utilities', 'lib/backbone'], function($, Utilities) {

	AppView = Backbone.View.extend({

		initialize : function() {
			this.typeChangeHandler()
			Utilities.autoAlphanumeric( $("#id_field_name"), $("#id_field_short_name") );
		},

		events : {
			'change #id_field_type' : 'typeChangeHandler'
		},

		typeChangeHandler : function() {
			var type = $("#id_field_type option:selected").val();
			if (type === 'text' || type === 'textarea') {
				$("#max-length-group").show();
			} else {
				$("#max-length-group").hide();
			}
			if (type === 'select' || type === 'checkboxes' || type === 'radiobuttons') {
				$("#field-choices-group").show();
			} else {
				$("#field-choices-group").hide();
			}
		}
	});

	return AppView;

}); 