define(['jquery', 'fields/models/AppModel', 'fields/models/FieldGroupCollection', 'fields/views/FieldGroupView', 'lib/backbone'], function($, appModel, fieldGroups, FieldGroupView) {

	
	var AppView = Backbone.View.extend({

		el : "body",

		initialize : function() {
			fieldGroups.on("reset", this.fieldGroupResetHandler, this);
			fieldGroups.on("add", this.fieldGroupAddHandler, this);
			fieldGroups.on("remove", this.fieldGroupRemoveHandler, this);
			$("#create-fieldgroup-button").click(_.bind(this.createFieldGroupClickHandler, this));
		},

		createFieldGroupClickHandler : function(e) {
			appModel.openCreateFieldGroupModal();
			e.preventDefault();
		},

		fieldGroupResetHandler : function() {
			if (fieldGroups.models.length == 0) {
				$("#no-groups-msg").removeClass('hide');
			} else {
				var container = $("#content-container");
				_.each(fieldGroups.models, function(model) {
					var view = new FieldGroupView({
						model : model
					});
					container.append(view.el);
				});
			}
		},

		fieldGroupAddHandler : function(model) {
			$("#no-groups-msg").addClass('hide');
			view = new FieldGroupView({
				model : model
			});
			$("#content-container").append(view.el);
		},
		
		fieldGroupRemoveHandler : function() {
			if (fieldGroups.models.length === 0) {
				$("#no-groups-msg").removeClass('hide');
			}
		}
	})

	return AppView;


});
