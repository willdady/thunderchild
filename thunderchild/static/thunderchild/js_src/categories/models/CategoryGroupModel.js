define(['jquery', 'categories/models/CategoryCollection', 'lib/backbone'], function($, categoryCollection) {
	var CategoryGroupModel = Backbone.Model.extend({

		getCategories : function() {
			return categoryCollection.where({
				categorygroup : this.id
			});
		}
		
	});
	return CategoryGroupModel;
});
