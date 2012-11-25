define(['jquery', 'lib/backbone'], function() {

	var AppModel = Backbone.Model.extend({
	
		assetSelectionCallback : function(obj) {
			this.closeMediaChooserModal();
			this.trigger("assetSelected", obj);
		},
	
		selectedTemplate : function(model) {
			if (model) {
				this.set("selectedTemplate", model);
			}
			return this.get("selectedTemplate");
		},
	
		rootTemplateGroup : function(model) {
			if (model) {
				this.set("rootTemplateGroup", model);
			}
			return this.get("rootTemplateGroup");
		},
	
		openNewTemplateModal : function(templateGroupModel) {
			this.trigger("openNewTemplateModal", templateGroupModel);
		},
	
		openNewTemplateGroupModal : function() {
			this.trigger("openNewTemplateGroupModal");
		},
	
		openEditTemplateGroupModal : function(templateGroupModel) {
			this.trigger("openEditTemplateGroupModal", templateGroupModel);
		},
	
		openConfirmDeleteTemplateModal : function(model) {
			this.trigger("openConfirmDeleteTemplateModal", model);
		},
	
		openConfirmDeleteTemplateGroupModal : function(templateGroupModel) {
			this.trigger("openConfirmDeleteTemplateGroupModal", templateGroupModel);
		},
	
		openMediaChooserModal : function() {
			this.trigger("openMediaChooserModal");
		},
	
		closeMediaChooserModal : function() {
			this.trigger("closeMediaChooserModal");
		},
		
		showActionDropDown : function(x, y, callbacks) {
			this.trigger("showActionDropDown", x, y, callbacks);
		}
		
	}) 

	return new AppModel();

});