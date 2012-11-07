define(['jquery', 'media/models/AppModel', 'lib/backbone'], function($, appModel) {

	var AppView = Backbone.View.extend({
	
		el : "body",
	
		initialize : function() {
			this.thumbnailsForm = $("#thumbnails-form");
			appModel.on("change:numCheckedAssets", this.numCheckedAssetsChangeHandler, this);
		},
	
		events : {
			'click #upload_button' : 'uploadButtonClickHandler',
			'click #deselect_button' : 'deselectButtonClickHandler',
			'click #delete_button' : 'deleteButtonClickHandler',
			'click #select_all_button' : 'selectAllButtonClickHandler'
		},
	
		uploadButtonClickHandler : function(e) {
			appModel.showUploadModal();
			e.preventDefault();
		},
	
		deselectButtonClickHandler : function(e) {
			var button = $(e.currentTarget);
			if (!button.hasClass('disabled')) {
				this.thumbnailsForm[0].reset();
				appModel.set("numCheckedAssets", 0);
			}
			e.preventDefault();
		},
	
		selectAllButtonClickHandler : function(e) {
			var button = $(e.currentTarget);
			var checkboxes = $(".thumbnail input[type='checkbox']");
			checkboxes.prop("checked", true);
			// We must manually force a change event for the checkboxes
			checkboxes.trigger("change");
			appModel.set("numCheckedAssets", checkboxes.length);
			e.preventDefault();
		},
	
		deleteButtonClickHandler : function(e) {
			var button = $(e.currentTarget);
			if (!button.hasClass('disabled')) {
				appModel.showDeleteSelectedModal();
			}
			e.preventDefault();
		},
	
		numCheckedAssetsChangeHandler : function(e, num) {
			if (num > 0) {
				$("#deselect_button").removeClass("disabled");
				$("#delete_button").removeClass("disabled");
			} else {
				$("#deselect_button").addClass("disabled");
				$("#delete_button").addClass("disabled");
			}
		}
	}) 

	return AppView;

});