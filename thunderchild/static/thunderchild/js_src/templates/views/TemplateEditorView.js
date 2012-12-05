define(['jquery', 'templates/models/AppModel', 'lib/backbone'], function($, appModel) {

	var TemplateEditorView = Backbone.View.extend({

		el : "#editor-pane",

		initialize : function() {
			this.editor = ace.edit("editor");
			this.editor.setTheme("ace/theme/twilight");
			this.editor.setShowPrintMargin(false);
			this.editor.getSession().on("change", _.bind(this.editorChangeHandler, this));
			this.setMode("ace/mode/html");
			appModel.on("change:selectedTemplate", this.selectedTemplateChangeHandler, this);

			this.selectedTemplateChangeHandler();

			this.ignoreEditorChange = false;
			// Listen to event triggered from the media chooser to add the URL of chosen asset to the editor at the cursor.
			appModel.on("assetSelected", this.assetSelectedHandler, this);
		},

		assetSelectedHandler : function(obj) {
			this.editor.insert(obj.url);
		},

		editorChangeHandler : function(e) {
			if (this.ignoreEditorChange || !this.templateModel)
				return;
			this.templateModel.requiresSave(true);
			this.templateModel.set({
				template_content : this.editor.getSession().getValue()
			}, {
				silent : true
			});
		},

		selectedTemplateChangeHandler : function() {
			if (this.templateModel) {
				this.templateModel.off("change", this.changeHandler, this);
			}
			this.templateModel = appModel.get("selectedTemplate");
			this.templateModel.on("change", this.changeHandler, this);
			this.setValue(this.templateModel.get("template_content"));
			this.setMode(this.templateModel.getMode());
		},

		changeHandler : function() {
			console.log("change!");
			this.setValue(this.templateModel.get("template_content"));
			this.setMode(this.templateModel.getMode());
		},

		setValue : function(value) {
			this.ignoreEditorChange = true;
			this.editor.getSession().clearAnnotations();
			this.editor.getSession().setValue(value);
			this.ignoreEditorChange = false;
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
