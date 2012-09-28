define(['jquery', 'categories/models/CategoryGroupModel', 'lib/backbone'], function($, CategoryGroupModel) {
	var CategoryGroupCollection = Backbone.Collection.extend({
	  url:'/dashboard/categories/categorygroups',
	  model:CategoryGroupModel
	});
	return new CategoryGroupCollection();
});
