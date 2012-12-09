define(['jquery', 'templates/models/AppModel', 'lib/backbone'], function($, appModel) {
	
	var CreateTemplateGroupButtonView = Backbone.View.extend({
		
		el : "#create-templategroup-button",
		
		events : {
			'click' : 'clickHandler'
		},
		
		clickHandler : function() {
			appModel.openNewTemplateGroupModal();
		}
		
	});
	
	return CreateTemplateGroupButtonView;
	
});