define(['jquery', 'lib/backbone'], function($) {

	var TemplateGroupModel = Backbone.Model.extend({

		urlRoot : thunderchild.templateGroupRoot, // thunderchild object is global obj defined in templates.html.

		indexTemplateModel : function(model) {
			if (model) {
				this._indexTemplateModel = model;
			}
			return this._indexTemplateModel;
		}
	})

	return TemplateGroupModel;

}); 