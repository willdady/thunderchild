define(['jquery', 'fields/models/FieldGroupModel', 'lib/backbone'], function($, FieldGroupModel) {
	var FieldGroupCollection = Backbone.Collection.extend({
	  url:'/dashboard/fields/categorygroups',
	  model:FieldGroupModel
	});
	return new FieldGroupCollection();
});
