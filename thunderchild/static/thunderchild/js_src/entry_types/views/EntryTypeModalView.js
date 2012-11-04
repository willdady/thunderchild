define(['jquery', 
		'entry_types/models/AppModel',
		'entry_types/models/EntryTypeCollection', 
		'lib/utilities', 
		'lib/jquery.serialize-object', 
		'lib/backbone'], function($, appModel, entryTypeCollection, Utilities) {
	
	
	var EntryTypeModalView = Backbone.View.extend({

		el : "#entrytype-modal",

		initialize : function() {
			this.EDIT_MODE = "editMode";
			this.CREATE_MODE = "createMode";
			this.okButton = $("#entrytype-form-modal-ok-button");
			appModel.on("openEditEntryTypeModal", this.openInEditMode, this);
			appModel.on("openCreateEntryTypeModal", this.openInCreateMode, this);
			Utilities.autoAlphanumeric($("#id_entrytype_name"), $("#id_entrytype_short_name"));
		},

		events : {
			"click #entrytype-form-modal-ok-button" : "okButtonClickHandler"
		},

		setTitle : function(text) {
			this.$el.find(".modal-header h3").text(text);
		},

		removeErrors : function() {
			this.$(".alert").remove();
			this.$(".error").removeClass("error");
		},

		okButtonDisabled : function(bool) {
			if (bool !== undefined) {
				this.okButton.toggleClass("disabled", bool);
			}
			return this.okButton.hasClass("disabled");
		},

		addErrors : function(errors) {
			var errors_html = '';
			var formErrorTemplate = _.template($("#form-error-template").text());
			_.each(errors, function(value, key) {
				_.each(value, function(value) {
					errors_html += "<li>" + value + "</li>";
				});
				$("#id_" + key).before(formErrorTemplate({
					errors : errors_html
				}));
				$("#id_" + key).parent().addClass("error");
				errors_html = '';
			});
		},

		open : function() {
			this.removeErrors();
			this.okButtonDisabled(false);
			this.$el.modal("show");
			$("#entrytype-form *:input[type!=hidden]:first").focus();
		},

		close : function() {
			this.$el.modal("hide");
		},

		okButtonClickHandler : function(e) {
			var formData = $("#entrytype-form").serializeObject();

			if (this.okButtonDisabled() == true)
				return;

			this.okButtonDisabled(true);

			if (this.mode === this.CREATE_MODE) {
				entryTypeCollection.create(formData, {
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
		},

		openInCreateMode : function(model) {
			this.mode = this.CREATE_MODE;
			$("#entrytype-form")[0].reset();
			this.setTitle("Create Entry Type");
			this.open();
		},

		openInEditMode : function(model) {
			this.model = model;
			this.mode = this.EDIT_MODE;
			this.setTitle("Edit Entry Type");
			_.each(model.toJSON(), function(val, key) {
				$("#entrytype-form :input[name=" + key + "]").val(val);
			});
			this.open();
		}
	});

	return EntryTypeModalView;

	
});
