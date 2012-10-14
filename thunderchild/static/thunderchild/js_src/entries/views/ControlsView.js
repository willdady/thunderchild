define(['jquery', 'entries/models/AppModel', 'entries/models/EntryModelCollection', 'lib/backbone'], function($, appModel, entryModelCollection) {

	var ControlsView = Backbone.View.extend({

		el : ".controls",
		
		initialize : function() {
			entryModelCollection.on("change", this.entryChangeHandler, this);
		},

		events : {
			"click .dropdown-menu a" : "dropDownItemClickHandler",
			"click #delete-selected-btn" : "deleteSelectedClickHandler"
		},

		dropDownItemClickHandler : function(e) {
			var item = $(e.currentTarget);
			var createButton = this.$(".btn-group > a");
			var href = createButton.attr("href").split("/");
			href = href.slice(0, href.length-1).join("/") + "/" + item.attr("data-id");
			createButton.text( "New "+item.text() );
			createButton.attr( "href", href );
			e.preventDefault();
		},
		
		entryChangeHandler : function() {
			console.log(entryModelCollection.numSelected());
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
