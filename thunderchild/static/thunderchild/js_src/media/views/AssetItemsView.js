define(['jquery', 'media/models/AppModel', 'media/models/AssetModel', 'media/views/AssetItemView', 'lib/backbone'], function($, appModel, AssetModel, AssetItemView) {

	var AssetItemsView = Backbone.View.extend({

		el : "#thumbnails_list",

		initialize : function() {

			this.$el.children().each(_.bind(function(i, el) {
				el = $(el);
				var m = new AssetModel({
					id : el.find('.thumbnail').attr('data-id'),
					is_image : el.find('.thumbnail').attr('data-is-image') === 'True',
					filename : el.find('.thumbnail').attr('data-filename'),
					url : el.find('.thumbnail').attr('data-url'),
					type : el.find('.thumbnail').attr('data-type'),
					size : el.find('.size').text(),
					width : el.find('img').attr('data-width'),
					height : el.find('img').attr('data-height')
				})

				var asset = new AssetItemView({
					el : el,
					model : m
				})
				asset.on("selection_change", this.assetSelectionChangeHandler, this);

			}, this));
		},

		assetSelectionChangeHandler : function(isSelected) {
			var numCheckedAssets = $(".thumbnail input[type='checkbox']:checked").length;
			appModel.set("numCheckedAssets", numCheckedAssets);
		}
	})

	return AssetItemsView;

});
