define(["jquery", "entry_types/models/AppModel", "lib/backbone"], function($, appModel) {
	
	var EntryTypeView = Backbone.View.extend({
		
		template : _.template($("#entrytype_template").html()),
		
		initialize : function() {
			this.setElement(this.template( this.model.toJSON()));
			this.model.on("change", this.render, this);
			this.model.on("destroy", this.destroyHandler, this);
		},
		
		events : {
			"click a.entrytype-name" : "clickHandler",
			"click a.delete-button" : "deleteClickHandler"
		},
		
		render : function() {
			var data = this.model.toJSON();
			this.$(".entrytype-name").text(data.entrytype_name);
			this.$(".entrytype-shortname").text("{"+data.entrytype_short_name+"}");
		},
		
		clickHandler : function(e) {
			appModel.openEditEntryTypeModal(this.model);
			e.preventDefault();
		},
		
		deleteClickHandler : function(e) {
  			appModel.openConfirmDeleteModal( this.model );
  			e.preventDefault();
  		},
		
		destroyHandler : function() {
  			this.$el.remove();
  		}
		
	});
	
	return EntryTypeView;
	
});
