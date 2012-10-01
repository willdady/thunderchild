define(['jquery', 'media_chooser/views/AssetItemView', 'media_chooser/models/AppModel', 'lib/backbone'], function($, AssetItemView, appModel) {


	var AppView = Backbone.View.extend({

		el : window,

		initialize : function() {
			$(".thumbnail").each(_.bind(function(i, val) {
				new AssetItemView({
					el : val
				})
			}, this));
		},

		events : {
			'click #media_chooser_upload_button' : 'uploadButtonClickHandler'
		},

		uploadButtonClickHandler : function(e) {
			appModel.showUploadModal();
			e.preventDefault();
		}
	})

	return AppView;

});