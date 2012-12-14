define("entry_types/models/AppModel",["jquery","lib/backbone"],function(e){var t=Backbone.Model.extend({openConfirmDeleteModal:function(e){this.trigger("openConfirmDeleteModal",e)},openEditEntryTypeModal:function(e){this.trigger("openEditEntryTypeModal",e)},openCreateEntryTypeModal:function(){this.trigger("openCreateEntryTypeModal")}});return new t}),define("entry_types/models/EntryTypeModel",["jquery","lib/backbone"],function(e){var t=Backbone.Model.extend({});return t}),define("entry_types/models/EntryTypeCollection",["jquery","entry_types/models/EntryTypeModel","lib/backbone"],function(e,t){var n=Backbone.Collection.extend({model:t,url:"/dashboard/entry-types/entry-type"});return new n}),define("entry_types/views/EntryTypeView",["jquery","entry_types/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({template:_.template(e("#entrytype_template").html()),initialize:function(){this.setElement(this.template(this.model.toJSON())),this.model.on("change",this.render,this),this.model.on("destroy",this.destroyHandler,this)},events:{"click a.entrytype-name":"clickHandler","click a.delete-button":"deleteClickHandler"},render:function(){var e=this.model.toJSON();this.$(".entrytype-name").text(e.entrytype_name),this.$(".entrytype-shortname").text("{"+e.entrytype_short_name+"}")},clickHandler:function(e){t.openEditEntryTypeModal(this.model),e.preventDefault()},deleteClickHandler:function(e){t.openConfirmDeleteModal(this.model),e.preventDefault()},destroyHandler:function(){this.$el.remove()}});return n}),define("entry_types/views/AppView",["jquery","entry_types/models/EntryTypeCollection","entry_types/views/EntryTypeView","entry_types/models/AppModel","lib/backbone"],function(e,t,n,r){var i=Backbone.View.extend({el:"body",initialize:function(){this.tableBody=this.$("table tbody"),t.on("reset",this.entryTypeResetHandler,this),t.on("add",this.entryTypeAddHandler,this)},events:{"click #create-entrytype-button":"createEntryTypeClickHandler"},entryTypeResetHandler:function(){_.each(t.models,_.bind(function(e){var t=new n({model:e});this.tableBody.append(t.el)},this))},entryTypeAddHandler:function(e){var t=new n({model:e});this.tableBody.append(t.el)},createEntryTypeClickHandler:function(){r.openCreateEntryTypeModal()}});return i}),define("entry_types/views/ConfirmDeleteModalView",["jquery","entry_types/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:"#confirm-delete-modal",initialize:function(){t.on("openConfirmDeleteModal",this.openConfirmDeleteModal,this)},events:{"click #confirm-delete-button":"confirmDeleteHandler"},confirmDeleteHandler:function(e){this.model.destroy(),this.close(),e.preventDefault()},openConfirmDeleteModal:function(e){this.model=e,this.open()},close:function(){this.$el.modal("hide")},open:function(){this.$el.modal("show")}});return n}),define("entry_types/views/EntryTypeModalView",["jquery","entry_types/models/AppModel","entry_types/models/EntryTypeCollection","lib/utilities","lib/backbone"],function(e,t,n,r){var i=Backbone.View.extend({el:"#entrytype-modal",initialize:function(){this.EDIT_MODE="editMode",this.CREATE_MODE="createMode",this.okButton=e("#entrytype-form-modal-ok-button"),t.on("openEditEntryTypeModal",this.openInEditMode,this),t.on("openCreateEntryTypeModal",this.openInCreateMode,this),r.autoAlphanumeric(e("#id_entrytype_name"),e("#id_entrytype_short_name"))},events:{"click #entrytype-form-modal-ok-button":"okButtonClickHandler"},setTitle:function(e){this.$(".modal-header h3").text(e)},removeErrors:function(){this.$(".alert").remove(),this.$(".error").removeClass("error")},okButtonDisabled:function(e){return e!==undefined&&this.okButton.toggleClass("disabled",e),this.okButton.hasClass("disabled")},addErrors:function(t){var n="",r=_.template(e("#form-error-template").text());_.each(t,function(t,i){_.each(t,function(e){n+="<li>"+e+"</li>"}),e("#id_"+i).before(r({errors:n})),e("#id_"+i).parent().addClass("error"),n=""})},open:function(){this.removeErrors(),this.okButtonDisabled(!1),this.$el.modal("show"),e("#entrytype-form *:input[type!=hidden]:first").focus()},close:function(){this.$el.modal("hide")},okButtonClickHandler:function(t){var r=e("#entrytype-form").serializeObject();if(this.okButtonDisabled()==1)return;this.okButtonDisabled(!0),this.mode===this.CREATE_MODE?n.create(r,{wait:!0,success:_.bind(this.close,this),error:_.bind(function(t,n){this.removeErrors(),n.status==400&&(resp=e.parseJSON(n.responseText),this.addErrors(resp.errors)),this.okButtonDisabled(!1)},this)}):this.mode===this.EDIT_MODE&&this.model.save(r,{wait:!0,success:_.bind(this.close,this),error:_.bind(function(t,n){this.removeErrors(),n.status==400&&(resp=e.parseJSON(n.responseText),this.addErrors(resp.errors)),this.okButtonDisabled(!1)},this)})},openInCreateMode:function(t){this.mode=this.CREATE_MODE,e("#entrytype-form")[0].reset(),this.setTitle("Create Entry Type"),this.open()},openInEditMode:function(t){this.model=t,this.mode=this.EDIT_MODE,this.setTitle("Edit Entry Type"),_.each(t.toJSON(),function(t,n){e("#entrytype-form :input[name="+n+"]").val(t)}),this.open()}});return i}),requirejs(["jquery","entry_types/models/AppModel","entry_types/models/EntryTypeCollection","entry_types/views/AppView","entry_types/views/ConfirmDeleteModalView","entry_types/views/EntryTypeModalView","lib/log"],function(e,t,n,r,i,s){e(function(){var e=new r,t=new i,o=new s;n.reset(entryTypeData)})}),define("entry_types/Main",[],function(){})