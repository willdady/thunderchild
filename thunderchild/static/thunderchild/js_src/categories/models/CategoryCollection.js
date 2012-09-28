define(['jquery', 'categories/models/CategoryModel', 'lib/backbone'], function($, CategoryModel) {
	var CategoryCollection = Backbone.Collection.extend({
  		url:'/dashboard/categories/categories',
  		model:CategoryModel
  	});
  	return new CategoryCollection();
});
