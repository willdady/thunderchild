define(['jquery', 'templates/models/TemplateGroupModel', 'lib/backbone'], function($, TemplateGroupModel) {

	var TemplateGroupCollection = Backbone.Collection.extend({
		model : TemplateGroupModel
	});

	return new TemplateGroupCollection();

});
