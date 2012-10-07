define(['jquery', 'entries/models/AppModel', 'lib/backbone'], function($, appModel) {
	
	var EntryView = Backbone.View.extend({
		
		initialize : function() {
			appModel.on("selectAll", this.select, this);
			appModel.on("selectNone", this.deselect, this);
		},
		
		events: {
			"change .entry-checkbox" : "checkboxChangeHandler"
		},
		
		select : function() {
			this.$el.addClass("selected");
			this.$(".entry-checkbox").prop("checked", true);
			this.model.isSelected(true);
		},
		
		deselect : function() {
			this.$el.removeClass("selected");
			this.$(".entry-checkbox").prop("checked", false);
			this.model.isSelected(false);
		},
		
		checkboxChangeHandler : function() {
			var checked = this.$(".entry-checkbox").is(":checked");
			this.model.isSelected( checked );
			if(checked) {
				this.$el.addClass("selected");
			} else {
				this.$el.removeClass("selected");
			}
		}
		
	});
	
	return EntryView;
	
});
