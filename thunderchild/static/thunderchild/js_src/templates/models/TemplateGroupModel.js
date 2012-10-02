define(['jquery', 'lib/backbone'], function($) {

	var TemplateGroupModel = Backbone.Model.extend({

		urlRoot : templateGroupRoot,

		indexTemplateModel : function(model) {
			if (model) {
				this._indexTemplateModel = model;
			}
			return this._indexTemplateModel;
		}
	})

	return TemplateGroupModel;

}); 