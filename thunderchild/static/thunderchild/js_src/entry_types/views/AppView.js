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
		},
		
		events : {
			"click #create-entrytype-button" : "createEntryTypeClickHandler"
		},
		
		entryTypeResetHandler : function() {
			_.each(entryTypeCollection.models, _.bind(function(model) {
				var view = new EntryTypeView({
					model : model
				});
				this.tableBody.append(view.el);
			}, this));
		},
		
		entryTypeAddHandler : function(model) {
			var view = new EntryTypeView({
				model : model
			});
			this.tableBody.append(view.el);
		},
		
		createEntryTypeClickHandler : function() {
			appModel.openCreateEntryTypeModal();
		}

	})

	return AppView;


});
