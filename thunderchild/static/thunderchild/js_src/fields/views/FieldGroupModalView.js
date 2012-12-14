define(['jquery', 'fields/models/AppModel', 'fields/models/FieldGroupCollection', 'lib/utilities', 'lib/backbone', 'lib/bootstrap'], function($, appModel, fieldGroups, Utilities) {
	
	var FieldGroupModalView = Backbone.View.extend({
		
		el:"#fieldgroup-modal",
		
		initialize: function() {
		    this.EDIT_MODE = "editMode";
		    this.CREATE_MODE = "createMode";
		    appModel.on("openCreateFieldGroupModal", this.openCreateFieldGroupModal, this);
		    appModel.on("openEditFieldGroupModal", this.openEditFieldGroupModal, this);
		    Utilities.autoAlphanumeric( $("#id_fieldgroup_name"), $("#id_fieldgroup_short_name") );
		},
  
	  	events:{
	  		"click #fieldgroup-form-modal-ok-button":"okClickHandler"
	  	},
	  
		setTitle: function(text) {
			this.$(".modal-header h3").text(text);
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
	  
	  	close: function() {
	    	this.$el.modal("hide");
	   	},
	  
	  	open: function() {
	    	this.removeErrors();
	    	this.$el.modal("show");
	   	},
	  
		okClickHandler: function(e) {
		    if ($("#fieldgroup-form-modal-ok-button").hasClass("disabled")) {
		    	e.preventDefault()
		      	return
		    }
		    if (this.mode == this.EDIT_MODE) {
		    	var formData = $("#fieldgroup-modal-form").serializeObject();
		      	this.model.save(formData, {
			        wait:true,
			        success: _.bind(this.close, this),
			        error: _.bind(function(model, response) {
			        	this.removeErrors();
			          	if (response.status == 400) {
			            	resp = $.parseJSON(response.responseText)
			            	this.addErrors(resp.errors)
			          	}
			        }, this)  
		    	});
		    } else {
		      	var formData = $("#fieldgroup-modal-form").serializeObject();
		      	fieldGroups.create(formData, {
		        	wait:true,
		        	success:_.bind(this.close, this),
		        	error: _.bind(function (model, response) {
			          	this.removeErrors()
			          	if (response.status == 400) {
			            	resp = $.parseJSON(response.responseText)
			            	this.addErrors(resp.errors)
			           	}
		         	}, this)
		         });
		    }
		    e.preventDefault()
		},
	  
	  	openCreateFieldGroupModal: function() {
	    	this.mode = this.CREATE_MODE;
	    	this.setTitle("Create field group");
	    	$("#fieldgroup-modal-form")[0].reset();
	    	this.open();
	    	$("#fieldgroup-modal-form *:input[type!=hidden]:first").focus();
	   	},
	    
	  	openEditFieldGroupModal: function(fieldGroupModel) {
		    this.mode = this.EDIT_MODE;
		    this.setTitle("Edit field group");
		    this.model = fieldGroupModel;
		    this.open();
		    $("#id_fieldgroup_name").val( this.model.get("fieldgroup_name") ).focus();
		    $("#id_fieldgroup_short_name").val( this.model.get("fieldgroup_short_name") );
		}
	});
	
	return FieldGroupModalView;
	
});
