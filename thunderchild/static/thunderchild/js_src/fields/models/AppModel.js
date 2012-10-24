define(['jquery', 'lib/backbone'], function($) {

	var AppModel = Backbone.Model.extend({

		openCreateFieldGroupModal : function() {
			this.trigger("openCreateFieldGroupModal")
		},
		
		openEditFieldGroupModal : function(fieldGroupModel) {
			this.trigger("openEditFieldGroupModal", fieldGroupModel)
		},
		
		openCreateFieldModal : function(fieldGroupModel) {
			this.trigger("openCreateFieldModal", fieldGroupModel)
		},
		
		openEditFieldModal : function(fieldModel) {
			this.trigger("openEditFieldModal", fieldModel);
		},
		
		openConfirmDeleteFieldGroupModal : function(fieldGroupModel) {
			this.trigger("openConfirmDeleteFieldGroupModal", fieldGroupModel)
		},
		
		openConfirmDeleteFieldModal : function(fieldModel) {
			this.trigger("openConfirmDeleteFieldModal", fieldModel)
		}
	});

	return new AppModel();

});
