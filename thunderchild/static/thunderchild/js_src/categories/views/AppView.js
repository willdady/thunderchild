define(['jquery', 'categories/models/AppModel', 'categories/models/CategoryGroupCollection', 'categories/views/CategoryGroupView', 'lib/backbone'], function($, appModel, categoryGroups, CategoryGroupView) {

	
	var AppView = Backbone.View.extend({

		el : "body",

		initialize : function() {
			categoryGroups.on("reset", this.categoryGroupResetHandler, this);
			categoryGroups.on("add", this.categoryGroupAddHandler, this);
			categoryGroups.on("remove", this.categoryGroupRemoveHandler, this);
			$("#create-categorygroup-button").click(_.bind(this.createCategoryGroupClickHandler, this));
		},

		createCategoryGroupClickHandler : function(e) {
			appModel.openCreateCategoryGroupModal();
			e.preventDefault();
		},

		categoryGroupResetHandler : function() {
			if (categoryGroups.models.length == 0) {
				$("#no-groups-msg").removeClass('hide');
			} else {
				$("#no-groups-msg").addClass('hide');
				var container = $("#content-container");
				_.each(categoryGroups.models, function(model) {
					var view = new CategoryGroupView({
						model : model
					});
					container.append(view.el);
				});
			}
		},

		categoryGroupAddHandler : function(model) {
			$("#no-groups-msg").addClass('hide');
			view = new CategoryGroupView({
				model : model
			});
			$("#content-container").append(view.el);
		},
		
		categoryGroupRemoveHandler : function(model) {
			if (categoryGroups.models.length === 0) {
				$("#no-groups-msg").removeClass('hide');
			}
		}
	})

	return AppView;


});
