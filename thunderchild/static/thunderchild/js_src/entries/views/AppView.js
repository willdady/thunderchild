define(['jquery', 'entries/models/AppModel', 'entries/models/EntryModel', 'entries/models/EntryModelCollection', 'entries/views/EntryView', 'lib/backbone'], function($, appModel, EntryModel, entryModelCollection, EntryView) {

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
				entryModelCollection.add(entryModel, {
					silent : true
				});
			}); 


		},

		events : {
			"change #select-all-checkbox" : "selectAllChangeHandler"
		},

		selectAllChangeHandler : function() {
			if( $("#select-all-checkbox").is(":checked") ) {
				appModel.selectAll();
			} else {
				appModel.selectNone();
			}
		}
		
	});

	return AppView;

});
