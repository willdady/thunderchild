define(['jquery', 'categories/models/AppModel', 'categories/models/CategoryGroupCollection', 'lib/utilities', 'lib/backbone', 'lib/bootstrap'], function($, appModel, categoryGroups, Utilities) {
	
	var CategoryGroupModalView = Backbone.View.extend({
		
		el:"#categorygroup-modal",
		
		initialize: function() {
		    this.EDIT_MODE = "editMode";
		    this.CREATE_MODE = "createMode";
		    appModel.on("openCreateCategoryGroupModal", this.openCreateCategoryGroupModal, this);
		    appModel.on("openEditCategoryGroupModal", this.openEditCategoryGroupModal, this);
		    Utilities.autoAlphanumeric( $("#id_categorygroup_name"), $("#id_categorygroup_short_name") );
		},
  
	  	events:{
	  		"click #categorygroup-form-modal-ok-button":"okClickHandler"
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
		    if ($("#categorygroup-form-modal-ok-button").hasClass("disabled")) {
		    	e.preventDefault()
		      	return
		    }
		    if (this.mode == this.EDIT_MODE) {
		    	var formData = $("#categorygroup-modal-form").serializeObject();
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
		      	var formData = $("#categorygroup-modal-form").serializeObject();
		      	categoryGroups.create(formData, {
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
	  
	  	openCreateCategoryGroupModal: function() {
	    	this.mode = this.CREATE_MODE;
	    	this.setTitle("Create category group");
	    	$("#categorygroup-modal-form")[0].reset();
	    	this.open();
	    	$("#categorygroup-modal-form *:input[type!=hidden]:first").focus();
	   	},
	    
	  	openEditCategoryGroupModal: function(categoryGroupModel) {
		    this.mode = this.EDIT_MODE;
		    this.setTitle("Edit category group");
		    this.model = categoryGroupModel;
		    this.open();
		    $("#id_categorygroup_name").val( this.model.get("categorygroup_name") ).focus();
		    $("#id_categorygroup_short_name").val( this.model.get("categorygroup_short_name") );
		}
	});
	
	return CategoryGroupModalView;
	
});
