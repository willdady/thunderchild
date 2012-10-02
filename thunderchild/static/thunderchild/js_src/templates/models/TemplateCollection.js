define(['jquery', 'templates/models/TemplateModel', 'lib/backbone'], function($, TemplateModel) {

	var TemplateCollection = Backbone.Collection.extend({
		model : TemplateModel,
		url : templateRoot
	});

	return new TemplateCollection();
});
