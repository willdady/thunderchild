define(['jquery', 'categories/models/AppModel', 'lib/backbone'], function($, appModel) {
	
	var CategoryView = Backbone.View.extend({
		
  		template:_.template( $("#category-template").html() ),
  		
  		initialize: function() {
  			this.setElement(this.template( this.model.toJSON()));
  			this.model.on("change", this.render, this);
  			this.model.on("destroy", this.destroyHandler, this);
  		},
  		
  		events:{
  			'click a.category-name':'clickHandler',
  			'click a.delete-category-button':'deleteClickHandler'
  		},
  		
  		clickHandler: function(e) {
  			appModel.openEditCategoryModal( this.model );
  			e.preventDefault();
  		},
  		
  		deleteClickHandler : function() {
  			appModel.openConfirmDeleteCategoryModal( this.model );
  		},
  		
  		render : function() {
  			var data = this.model.toJSON();
  			this.$(".category-name").text(data.category_name);
  			this.$(".category-short-name").text(data.category_short_name);
  		},
  		
  		destroyHandler : function() {
  			this.$el.remove();
  		}
  		
	});
	
	return CategoryView;
	
});
