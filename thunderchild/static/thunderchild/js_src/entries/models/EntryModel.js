define(['jquery', 'lib/backbone'], function($) {

	var EntryModel = Backbone.Model.extend({

		isSelected : function(bool) {
			if (bool !== undefined) {
				this.set("_isSelected", bool === true);
			}
			return this.get("_isSelected");
		}
	});

	return EntryModel;

});
