define(['jquery', 'lib/backbone'], function ($) {
	
	var AppModel = Backbone.Model.extend({
		
		openCreateCategoryGroupModal: function () {
			this.trigger("openCreateCategoryGroupModal")
		},
		openEditCategoryGroupModal: function (categoryGroupModel) {
		    this.trigger("openEditCategoryGroupModal", categoryGroupModel)
		},
		openConfirmDeleteCategoryGroupModal: function(categoryGroupModel) {
		    this.trigger("openConfirmDeleteCategoryGroupModal", categoryGroupModel)
		},
 	 	openConfirmDeleteCategoryModal: function(categoryModel) {
    		this.trigger("openConfirmDeleteCategoryModal", categoryModel)
		}
	});
	
	return new AppModel();
	
});
