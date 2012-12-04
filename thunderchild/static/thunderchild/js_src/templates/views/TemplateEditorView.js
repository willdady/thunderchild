define(['jquery', 'templates/models/AppModel', 'lib/backbone'], function($, appModel) {

	var TemplateEditorView = Backbone.View.extend({
		
		el:"#editor-pane",

		initialize : function() {
			this.editor = ace.edit("editor");
			this.editor.setTheme("ace/theme/twilight");
			this.editor.setShowPrintMargin(false);
			this.editor.getSession().on("change", _.bind(this.editorChangeHandler, this));
			this.setMode("ace/mode/html");
			appModel.on("change:selectedTemplate", this.selectedTemplateChangeHandler, this);

			this.selectedTemplateChangeHandler();
			// We need to listen to changes in the tabs to refresh the editor. It won't update it's content if hidden when new text is entered.
			$("#tabs").on("shown", _.bind(this.tabShownHandler, this));

			this.ignoreEditorChange = false;
			// Listen to event triggered from the media chooser to add the URL of chosen asset to the editor at the cursor.
			appModel.on("assetSelected", this.assetSelectedHandler, this);
		},

		assetSelectedHandler : function(obj) {
			this.editor.insert(obj.url);
		},

		tabShownHandler : function(e) {
			if (this.$el.hasClass("active") && this.templateModel) {
				this.setValue(this.templateModel.get("template_content"))
				if (this.getMode() !== this.templateModel.getMode()) {
					this.setMode(this.templateModel.getMode());
				}
			}
		},

		editorChangeHandler : function(e) {
			if (this.ignoreEditorChange)
				return;
			this.templateModel = appModel.get("selectedTemplate");
			this.templateModel.requiresSave(true);
			this.templateModel.set("template_content", this.editor.getSession().getValue());
		},

		selectedTemplateChangeHandler : function() {
			if (this.templateModel) {
				this.templateModel.off("initialFetchComplete", this.initialFetchCompleteHandler, this);
				this.templateModel.off("change:template_content_type", this.contentTypeChangeHandler, this);
			}
			this.templateModel = appModel.get("selectedTemplate");
			this.templateModel.on("initialFetchComplete", this.initialFetchCompleteHandler, this);
			this.templateModel.on("change:template_content_type", this.contentTypeChangeHandler, this);
			this.setValue(this.templateModel.get("template_content"));
			this.setMode(this.templateModel.getMode());
		},

		contentTypeChangeHandler : function() {
			this.setMode(this.templateModel.getMode());
		},

		setValue : function(value) {
			this.ignoreEditorChange = true;
			this.editor.getSession().clearAnnotations();
			this.editor.getSession().setValue(value);
			this.ignoreEditorChange = false;
		},

		initialFetchCompleteHandler : function() {
			this.setValue(this.templateModel.get("template_content"));
			this.setMode(this.templateModel.getMode());
		},

		setMode : function(mode) {
			this.editor.getSession().setMode(mode);
		},

		getMode : function() {
			this.editor.getSession().getMode().$id
		}
	})
	
	return TemplateEditorView;

}); 