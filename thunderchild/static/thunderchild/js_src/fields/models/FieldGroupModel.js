define(['jquery', 'fields/models/FieldCollection', 'lib/backbone'], function($, fieldCollection) {
	var FieldGroupModel = Backbone.Model.extend({

		getFields : function() {
			return fieldCollection.where({
				fieldgroup : this.id
			});
		}
		
	});
	return FieldGroupModel;
});
