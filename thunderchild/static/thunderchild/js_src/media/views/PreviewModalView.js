define(['jquery', 'media/models/AppModel', 'lib/backbone', 'lib/bootstrap'], function($, appModel) {
	
	var PreviewModalView = Backbone.View.extend({

		el : "#preview-modal",

		initialize : function() {
			this.$el.modal().modal("hide");
			appModel.on("showPreviewModal", this.show, this);
			this.imageTemplate = _.template($("#preview-modal_template").html())
		},

		show : function(assetModel) {
			var modal_body = this.$(".modal-body");
			modal_body.html(this.imageTemplate(assetModel.toJSON()));
			if (assetModel.get("type") === "image/png") {
				modal_body.find(".img-wrapper").addClass("transparency");
			}
			this.$el.modal("show");
		}
	})

	return PreviewModalView;

}); 