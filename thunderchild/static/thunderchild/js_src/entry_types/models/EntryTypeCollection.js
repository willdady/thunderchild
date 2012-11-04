define(["jquery", "entry_types/models/EntryTypeModel", "lib/backbone"], function($, EntryTypeModel) {

	var EntryTypeCollection = Backbone.Collection.extend({

		model : EntryTypeModel,
		url : '/dashboard/entry-types/entry-type'

	});

	return new EntryTypeCollection();

});
