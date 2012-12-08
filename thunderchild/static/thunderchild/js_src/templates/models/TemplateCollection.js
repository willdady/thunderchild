define(['jquery', 'templates/models/TemplateModel', 'lib/backbone'], function($, TemplateModel) {

	var TemplateCollection = Backbone.Collection.extend({
		model : TemplateModel,
		url : thunderchild.templateRoot // thunderchild object is global obj defined in templates.html.
	});

	return new TemplateCollection();
});
