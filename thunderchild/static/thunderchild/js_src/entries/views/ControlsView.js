define(['jquery', 'entries/models/AppModel', 'entries/models/EntryModelCollection', 'lib/backbone'], function($, appModel, entryModelCollection) {

	var ControlsView = Backbone.View.extend({

		el : ".controls",
		
		initialize : function() {
			entryModelCollection.on("change", this.entryChangeHandler, this);
		},

		events : {
			"click #delete-selected-btn" : "deleteSelectedClickHandler"
		},

		entryChangeHandler : function() {
			if (entryModelCollection.numSelected() > 0) {
				$("#delete-selected-btn").removeClass("disabled");
			} else {
				$("#delete-selected-btn").addClass("disabled");
			}
		},
		
		deleteSelectedClickHandler : function(e) {
			if (!$("#delete-selected-btn").hasClass('disabled')) {
				appModel.openConfirmDeleteModal();
			}
			e.preventDefault();
		}
		
	});

	return ControlsView;

});
