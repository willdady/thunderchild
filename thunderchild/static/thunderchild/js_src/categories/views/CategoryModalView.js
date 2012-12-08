define(['jquery', 'categories/models/AppModel', 'categories/models/CategoryCollection', 'lib/utilities', 'lib/backbone'], function($, appModel, categoryCollection, Utilities) {

	var CategoryModalView = Backbone.View.extend({

		el : "#category-modal",

		initialize : function() {
			this.EDIT_MODE = "editMode";
		    this.CREATE_MODE = "createMode";
		    this.okButton = $("#category-form-modal-ok-button");
			appModel.on("openCreateCategoryModal", this.openInCreateMode, this);
			appModel.on("openEditCategoryModal", this.openInEditMode, this);
			Utilities.autoAlphanumeric( $("#id_category_name"), $("#id_category_short_name") );
		},

		events : {
			'click #category-form-modal-ok-button' : 'okButtonClickHandler'
		},
		
		setTitle: function(text) {
			this.$(".modal-header h3").text(text);
	 	},

		open : function() {
			this.removeErrors();
			this.okButtonDisabled(false);
			this.$el.modal("show");
			$("#category-form *:input[type!=hidden]:first").focus();
		},

		close : function() {
			this.$el.modal("hide");
		},
		
		okButtonDisabled : function(bool) {
			if (bool !== undefined) {
				this.okButton.toggleClass("disabled", bool);
			}
			return this.okButton.hasClass("disabled");
		},
		
		removeErrors: function() {
    		this.$(".alert").remove();
			this.$(".error").removeClass("error");
  		},
	  
	  	addErrors: function(errors) {
	     	var errors_html = '';
	    	var formErrorTemplate = _.template($("#form-error-template").text());
	    	_.each(errors, function(value, key) {
		      	_.each(value, function(value) {
			        errors_html += "<li>"+value+"</li>";
		      	});
		      	$("#id_"+key).before( formErrorTemplate({errors:errors_html}) );
			    $("#id_"+key).parent().addClass("error");
		      	errors_html = '';
	     	});
	   	},

		
		okButtonClickHandler : function(e) {
			var formData = $("#category-form").serializeObject();
			
			if (this.okButtonDisabled() == true) {
				e.preventDefault();
				return;
			}
			this.okButtonDisabled(true);
			
			if (this.mode === this.CREATE_MODE) {
				categoryCollection.create(formData, {
					wait : true,
					success : _.bind(this.close, this),
					error : _.bind(function(model, response) {
						this.removeErrors();
						if (response.status == 400) {
							resp = $.parseJSON(response.responseText);
							this.addErrors(resp.errors);
						}
						this.okButtonDisabled(false);
					}, this)
				});
			} else if (this.mode === this.EDIT_MODE) {
				this.model.save(formData, {
					wait : true,
					success : _.bind(this.close, this),
					error : _.bind(function(model, response) {
						this.removeErrors();
						if (response.status == 400) {
							resp = $.parseJSON(response.responseText);
							this.addErrors(resp.errors);
						}
						this.okButtonDisabled(false);
					}, this)
				})
			}
			e.preventDefault();
		},

		
		openInCreateMode : function(categoryGroupModel) {
			this.mode = this.CREATE_MODE;
			$("#category-form")[0].reset();
			this.setTitle("Create Category");
			this.$("#id_categorygroup").val( categoryGroupModel.get("id") );
			this.open();
		},
		
		openInEditMode : function(categoryModel) {
			this.model = categoryModel;
			this.mode = this.EDIT_MODE;
			this.setTitle("Edit Category");
			_.each(categoryModel.toJSON(), function(val, key) {
				$("#category-form input[name="+key+"]").val(val);
			});
			this.open();
		}
		
	});

	return CategoryModalView;
});
