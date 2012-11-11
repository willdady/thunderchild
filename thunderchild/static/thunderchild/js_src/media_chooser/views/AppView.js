define(['jquery', 
		'media_chooser/views/AssetItemView', 
		'media/models/AppModel',
		'lib/backbone'], 
		function($, AssetItemView, appModel) {


	var AppView = Backbone.View.extend({

		el : "body",

		initialize : function() {
			$(".thumbnail").each(_.bind(function(i, val) {
				new AssetItemView({
					el : val
				})
			}, this));
		},

		events : {
			'click #media-chooser-upload-button' : 'uploadButtonClickHandler'
		},

		uploadButtonClickHandler : function(e) {
			console.log("uploadButtonClickHandler", appModel);
			appModel.showUploadModal();
			e.preventDefault();
		}
		
	})

	return AppView;

});