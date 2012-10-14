define(['jquery', 'lib/backbone'], function($) {

	var EntryModel = Backbone.Model.extend({

		isSelected : function(bool) {
			if (bool !== undefined) {
				this.set("isSelected", bool === true);
			}
			return this.get("isSelected");
		}
	});

	return EntryModel;

});
