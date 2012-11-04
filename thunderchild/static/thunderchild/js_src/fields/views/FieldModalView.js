define(['jquery', 
		'fields/models/AppModel', 
		'fields/models/FieldCollection', 
		'lib/utilities',
		'lib/jquery.serialize-object',  
		'lib/backbone'], function($, appModel, fieldCollection, Utilities) {

	var FieldModalView = Backbone.View.extend({

		el : "#field-modal",

		initialize : function() {
			this.EDIT_MODE = "editMode";
		    this.CREATE_MODE = "createMode";
		    this.okButton = $("#field-form-modal-ok-button");
			appModel.on("openCreateFieldModal", this.openInCreateMode, this);
			appModel.on("openEditFieldModal", this.openInEditMode, this);
			Utilities.autoAlphanumeric( $("#id_field_name"), $("#id_field_short_name") );
			this.resetForm();
		},

		events : {
			'click #field-form-modal-ok-button' : 'okButtonClickHandler',
			'change #id_field_type' : 'fieldTypeChangeHandler'
		},
		
		setTitle: function(text) {
			this.$el.find(".modal-header h3").text(text);
	 	},

		open : function() {
			this.removeErrors();
			this.okButtonDisabled(false);
			this.$el.modal("show");
			$("#field-form *:input[type!=hidden]:first").focus();
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
		
		fieldTypeChangeHandler : function() {
			var val = $("#id_field_type").val();
			$("#id_field_choices").parent().toggle( val == 'select' || val == 'checkboxes' || val == 'radiobuttons' );
			$("#id_max_length").parent().toggle( val == 'textarea' || val == 'text' );
		},
		
		okButtonClickHandler : function(e) {
			var formData = $("#field-form").serializeObject();
			
			if (this.okButtonDisabled() == true) {
				e.preventDefault();
				return;
			}
			this.okButtonDisabled(true);
			
			if (this.mode === this.CREATE_MODE) {
				fieldCollection.create(formData, {
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

		resetForm : function() {
			this.$("#field-form")[0].reset();
			// As type is Text by default we go ahead and hide the irrelevant fields for this type.
			this.$("#id_field_choices").parent().hide();
			this.$("#id_max_length").parent().show();
		},
		
		openInCreateMode : function(fieldGroupModel) {
			this.mode = this.CREATE_MODE;
			this.resetForm();
			this.setTitle("Create Field");
			this.$("#id_fieldgroup").val( fieldGroupModel.get("id") );
			this.open();
		},
		
		openInEditMode : function(fieldModel) {
			this.model = fieldModel;
			this.mode = this.EDIT_MODE;
			this.setTitle("Edit Field");
			_.each(fieldModel.toJSON(), function(val, key) {
				var field = $("#field-form input[name="+key+"]");
				if (field.length > 0) {
					switch(field.attr("type")) {
						case "text": 
						case "hidden":
							field.val(val);
							break;
						case "radio":
						case "checkbox":
							if (val === true) {
								field.filter("[value='True']").prop("checked", true);
							} else {
								field.filter("[value='False']").prop("checked", true);
							}
							break;
					}
				} else {
					$("#field-form :input[name="+key+"]").val(val);
				}
			});
			this.fieldTypeChangeHandler(); // This is called to show the correct option fields for the current field type.
			this.open();
		}
		
	});

	return FieldModalView;
});
