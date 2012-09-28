define(['jquery', 'lib/backbone'], function($){
	var CategoryView = Backbone.View.extend({
  		template:_.template($("#category-template").html())
	});
	return CategoryView;
});
