requirejs(
	['jquery', 
	'media/models/AppModel',
	'media/views/UploadModalView', 
	'media/views/DeleteSelectedModalView',
	'media/views/PreviewModalView',
	'media/views/AppView', 
	'media/views/AssetItemsView',
	'lib/log'
	],
	function($, appModel, UploadModalView, DeleteSelectedModalView, PreviewModalView, AppView, AssetItemsView) 
	{
		
		$(function(){
			var uploadModal = new UploadModalView();
			var deleteSelectedModal = new DeleteSelectedModalView();
			var previewModal = new PreviewModalView();
			var appView = new AppView()
			var assetItemsView = new AssetItemsView()
		});
		
	}
);