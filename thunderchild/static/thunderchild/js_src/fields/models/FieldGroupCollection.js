define(['jquery', 'fields/models/FieldGroupModel', 'lib/backbone'], function($, FieldGroupModel) {
	var FieldGroupCollection = Backbone.Collection.extend({
	  url:'/dashboard/fields/fieldgroups',
	  model:FieldGroupModel
	});
	return new FieldGroupCollection();
});
