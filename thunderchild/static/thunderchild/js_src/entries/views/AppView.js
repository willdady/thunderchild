define(['jquery', 'entries/models/AppModel', 'entries/models/EntryModel', 'entries/views/EntryView', 'lib/backbone'], function($, appModel, EntryModel, EntryView) {

	var AppView = Backbone.View.extend({

		el : $(window),

		initialize : function() {

			$("#entries-table tbody tr").each(function() {
				var entryModel = new EntryModel({
					id : $(this).attr("data-id")
				});
				var entryView = new EntryView({
					el : this,
					model : entryModel
				});
			});

		},

		events : {
			"change #select-all-checkbox" : "selectAllChangeHandler",
			"change #entry_type_select" : "entryTypeChangeHandler",
			"click #delete-selected-btn" : "deleteSelectedClickHandler"
		},

		entryTypeChangeHandler : function(e) {
			$("#go_button").attr("href", "/dashboard/entries/create/" + $(e.currentTarget).val());
		},

		selectAllChangeHandler : function() {
			if( $("#select-all-checkbox").is(":checked") ) {
				appModel.selectAll();
			} else {
				appModel.selectNone();
			}
		},

		deleteSelectedClickHandler : function(e) {
			appModel.openConfirmDeleteModal();
			e.preventDefault();
		}
	});

	return AppView;

});
