define(['jquery', 
		'media/models/AppModel', 
		'lib/backbone'], 
		function($, appModel) {

	var AssetItemView = Backbone.View.extend({

		initialize : function() {
			this.filename = this.$("label").text();
			this.id = this.$el.attr("data-id");
			this.url = this.$el.attr("data-url");
		},

		events : {
			'click' : 'clickHandler'
		},

		clickHandler : function(e) {
			appModel.assetSelectionCallback({
				id : this.id,
				filename : this.filename,
				thumbnail_url : this.$("img")[0].src,
				url : this.url
			});
			e.preventDefault();
		}
	})

	return AssetItemView;

}); 