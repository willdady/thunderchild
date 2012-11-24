define(['jquery', 'templates/models/AppModel', 'lib/backbone'], function($, appModel) {

	var ActionDropDownView = Backbone.View.extend({

		el : "#action-drop-down",

		actionTemplate : _.template($("#action-drop-down-item-template").text()),

		initialize : function() {
			appModel.on("showActionDropDown", this.show, this);
		},

		show : function(x, y, callbacks) {
			// Remove any existing elements from the list and remove event handlers.
			this.$el.children().off("click");
			this.$el.empty();
			// Populate the list with the actions and attach their callbacks
			_.each(callbacks, _.bind(function(obj) {
				for (key in obj) {
					if (obj.hasOwnProperty(key)) {
						var actionItem = $(this.actionTemplate({
							action_name : key
						}));
						actionItem.on("click", obj[key]);
						this.$el.append(actionItem);
					}
				}
			}, this));
			// Position and display
			this.$el.css({
				left : x,
				top : y,
				display : 'block'
			});
			// Wire up a one-off event to the body so we hide the drop down on the next mouse click.
			$("body").one("click", _.bind(this.hide, this));
		},

		hide : function() {
			this.$el.hide();
		}
	});

	return ActionDropDownView;

});
