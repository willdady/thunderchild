define(['jquery', 'entries/models/EntryModel', 'lib/backbone', 'lib/log'], function($, EntryModel) {
	
	var EntryModelCollection = Backbone.Collection.extend({
		
		model : EntryModel,
		
		numSelected : function() {
			var count = 0;
			_.each(this.models, function(model) {
			  if(model.isSelected()) {
			  	count++;
			  }
			});
			return count;	
		},
		
		deleteSelected : function() {

			var data = [];
			_.each(this.models, function(model) {
			  if(model.isSelected()) {
			  	var obj = {'id' : model.id};
			  	data.push(obj);
			  }
			});
			data = JSON.stringify(data);

			$.ajax({
				url : deleteURL,
				type : "DELETE",
				data : data,
				success : function(data, textStatus, jqXHR) {
					if (jqXHR.status == 200) {
						location.reload();
					} else {
						console.log("Non 200 response returned.")
					}
				}
			});

		}


		
		
	});
	
	return new EntryModelCollection();
	
});
