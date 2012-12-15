define(['jquery', 
		'entry_types/models/EntryTypeCollection', 
		'entry_types/views/EntryTypeView',
		'entry_types/models/AppModel', 
		'lib/backbone'], 
		function($, entryTypeCollection, EntryTypeView, appModel) {

	
	var AppView = Backbone.View.extend({

		el : "body",

		initialize : function() {
			this.tableBody = this.$("table tbody");
			entryTypeCollection.on("reset", this.entryTypeResetHandler, this);
			entryTypeCollection.on("add", this.entryTypeAddHandler, this);
			entryTypeCollection.on("remove", this.entryTypeRemoveHandler, this);
		},
		
		events : {
			"click #create-entrytype-button" : "createEntryTypeClickHandler"
		},
		
		entryTypeResetHandler : function() {
			if (entryTypeCollection.models.length == 0) {
				$("#no-entrytypes-msg").removeClass('hide');
				$("#entrytype-table").addClass('hide');
			} else {
				$("#no-entrytypes-msg").addClass('hide');
				$("#entrytype-table").removeClass('hide');
				_.each(entryTypeCollection.models, _.bind(function(model) {
					var view = new EntryTypeView({
						model : model
					});
					this.tableBody.append(view.el);
				}, this));
			}
		},
		
		entryTypeAddHandler : function(model) {
			$("#no-entrytypes-msg").addClass('hide');
			$("#entrytype-table").removeClass('hide');
			var view = new EntryTypeView({
				model : model
			});
			this.tableBody.append(view.el);
		},
		
		entryTypeRemoveHandler : function() {
			if (entryTypeCollection.models.length == 0) {
				$("#no-entrytypes-msg").removeClass('hide');
				$("#entrytype-table").addClass('hide');
			}
		},
		
		createEntryTypeClickHandler : function() {
			appModel.openCreateEntryTypeModal();
		}

	})

	return AppView;


});
