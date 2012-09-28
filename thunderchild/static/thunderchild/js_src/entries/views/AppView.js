define([
	'jquery', 
	'entries/models/AppModel', 
	'lib/utilities', 
	'entries/views/MediaChooserModalView', 
	'entries/views/TextAreaModalView',
	'entries/views/RichTextAreaView',
	'entries/views/MediaChooserWidgetView', 
	'lib/backbone',
	'lib/farbtastic',
	'lib/jquery-ui-1.8.21.custom.min',
	'lib/jquery-ui-timepicker-addon',
	], 
	function($, appModel, Utilities, MediaChooserModalView, TextAreaModalView, RichTextAreaView, MediaChooserWidgetView) {

	var AppView = Backbone.View.extend({

		initialize : function() {
			//# Select first tab by default
			$("#tabs a:first").tab("show");
			// Auto slug the title field
			Utilities.autoSlug($("#id_title"), $("#id_slug"));
			// Initialize date and datetime pickers
			$('[data-field-type="datetime"]').datetimepicker({
				dateFormat : 'yy-mm-dd',
				timeFormat : 'hh:mm:ss',
				showSecond : true
			});
			$('[data-field-type="date"]').datepicker({
				dateFormat : 'yy-mm-dd'
			});
			var mediaChooserModal = new MediaChooserModalView({
				el : $("#media_chooser_modal"),
				model : appModel
			});
			$('[data-field-type="file"]').each(function() {
				new MediaChooserWidgetView({
					el : $(this),
					model : appModel
				});
			});
			// Convert all textareas to rich textareas. Note the textearea in the textarea modal will not create a fullscreen button.
			$('textarea').each(function() {
				var el = $(this);
				if (el.attr("id") !== "textarea-modal-textarea") {
					new RichTextAreaView({
						el : el,
						model : appModel
					});
				} else {
					new RichTextAreaView({
						el : el,
						model : appModel,
						noFullscreen : true,
						hideMediaChooserBackdrop : true
					});
				}
			});
			var textAreaModal = new TextAreaModalView({
				el : $("#textarea-modal"),
				model : appModel
			});
			// Initialize color pickers
			$('[data-field-type="color"]').each(function(i, el) {
				var pickerID = "picker" + i;
				var picker = $('<div id="' + pickerID + '" class="picker"></div>');
				$(this).parent().append(picker);
				$(picker).farbtastic($(this));
			})
		}
	});
	return AppView;
});
