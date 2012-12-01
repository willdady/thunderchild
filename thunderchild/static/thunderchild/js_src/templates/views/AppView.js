define(
	['jquery', 
	'templates/views/ActionBarView',
	'templates/views/TemplatePreviewControlsView',
	'templates/views/TemplateBrowserView',
	'templates/views/TemplateEditorView',
	'templates/views/NewTemplateModalView',
	'templates/views/ConfirmDeleteTemplateModalView',
	'templates/views/MediaChooserModalView',
	'templates/views/NewTemplateGroupModalView',
	'templates/views/EditTemplateGroupModalView',
	'templates/views/ConfirmDeleteTemplateGroupModalView',
	'templates/views/ActionDropDownView',
	'templates/views/TemplateSettingsModal',
	'lib/backbone',
	'lib/bootstrap'], 
	function($, 
		ActionBarView, 
		TemplatePreviewControlsView, 
		TemplateBrowserView, 
		TemplateEditorView, 
		NewTemplateModalView, 
		ConfirmDeleteTemplateModalView, 
		MediaChooserModalView, 
		NewTemplateGroupModalView, 
		EditTemplateGroupModalView, 
		ConfirmDeleteTemplateGroupModalView,
		ActionDropDownView,
		TemplateSettingsModal) {


	var AppView = Backbone.View.extend({

		el : "body",

		initialize : function() {

			var actionBarView = new ActionBarView();
			var templatePreviewControlsView = new TemplatePreviewControlsView();
			var templateBrowserView = new TemplateBrowserView();
			var templateEditorView = new TemplateEditorView();
			var newTemplateModal = new NewTemplateModalView();
			var confirmDeleteTemplateModal = new ConfirmDeleteTemplateModalView();
			var mediaChooserModal = new MediaChooserModalView();
			var newTemplateGroupModal = new NewTemplateGroupModalView();
			var editTemplateGroupModal = new EditTemplateGroupModalView();
			var confirmDeleteTemplateGroupModal = new ConfirmDeleteTemplateGroupModalView();
			var actionDropDownView = new ActionDropDownView();
			var templateSettingsModal = new TemplateSettingsModal();

			$("#tabs a").click(this.tabClickHandler);
			$("#tabs a:first").tab("show");
		},

		tabClickHandler : function(e) {
			$(this).tab("show");
			e.preventDefault();
		}
	}); 


	return AppView;

});
