define(['jquery', 'media_chooser/views/AssetItemView', 'media_chooser/views/UploadModalView', 'media_chooser/models/AppModel', 'lib/backbone'], function($, AssetItemView, UploadModalView, appModel) {


	var AppView = Backbone.View.extend({

		el : window,

		initialize : function() {
			$(".thumbnail").each(_.bind(function(i, val) {
				new AssetItemView({
					el : val
				})
			}, this));
			
			var uploadModalView = new UploadModalView();
		},

		events : {
			'click #media-chooser-upload-button' : 'uploadButtonClickHandler'
		},

		uploadButtonClickHandler : function(e) {
			appModel.showUploadModal();
			e.preventDefault();
		}
	})

	return AppView;

});