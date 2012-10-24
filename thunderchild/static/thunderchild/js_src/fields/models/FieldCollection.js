define(['jquery', 'fields/models/FieldModel', 'lib/backbone'], function($, FieldModel) {
	var FieldCollection = Backbone.Collection.extend({
  		url:'/dashboard/fields/fields',
  		model:FieldModel
  	});
  	return new FieldCollection();
});
