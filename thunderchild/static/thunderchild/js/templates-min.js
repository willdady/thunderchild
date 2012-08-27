(function(){var e,j,l,i,k,m,f,p,r,s,c,b,g,o,a,n,q,h;var d=function(t,u){return function(){return t.apply(u,arguments)}};j=Backbone.Model.extend({assetSelectionCallback:function(t){this.closeMediaChooserModal();return this.trigger("assetSelected",t)},selectedTemplate:function(t){if(t){this.set("selectedTemplate",t)}return this.get("selectedTemplate")},rootTemplateGroup:function(t){if(t){this.set("rootTemplateGroup",t)}return this.get("rootTemplateGroup")},openNewTemplateModal:function(t){return this.trigger("openNewTemplateModal",t)},openNewTemplateGroupModal:function(){return this.trigger("openNewTemplateGroupModal")},openEditTemplateGroupModal:function(t){return this.trigger("openEditTemplateGroupModal",t)},openConfirmDeleteTemplateModal:function(){return this.trigger("openConfirmDeleteTemplateModal")},openConfirmDeleteTemplateGroupModal:function(t){return this.trigger("openConfirmDeleteTemplateGroupModal",t)},openMediaChooserModal:function(){return this.trigger("openMediaChooserModal")},closeMediaChooserModal:function(){return this.trigger("closeMediaChooserModal")}});o=Backbone.Model.extend({urlRoot:templateGroupRoot,indexTemplateModel:function(t){if(t){this._indexTemplateModel=t}return this._indexTemplateModel}});q=Backbone.Model.extend({urlRoot:templateRoot,initialFetch:function(){return this.fetch({success:d(function(){return this.trigger("initialFetchComplete")},this)})},templateGroupModel:function(t){if(t){this._templateGroupModel=t}return this._templateGroupModel},errors:function(t){if(t){this._errors=t;this.trigger("errors",this._errors)}return this._errors},requiresSave:function(t){if(t||t===false){this._requiresSave=t;this.trigger("requiresSave")}return this._requiresSave},getMode:function(){switch(this.get("template_content_type")){case"text/html":case"text/xhtml+xml":return"ace/mode/html";case"text/css":return"ace/mode/css";case"application/javascript":return"ace/mode/javascript";case"application/json":return"ace/mode/json";case"application/rss+xml":case"application/atom+xml":case"text/xml":case"application/soap+xml":return"ace/mode/xml";case"text/less":return"ace/mode/less";case"text/scss":return"ace/mode/scss";default:return"ace/mode/text"}}});c=Backbone.Collection.extend({model:q,url:templateRoot});g=Backbone.Collection.extend({model:o});e=Backbone.View.extend({initialize:function(){return this.model.on("change:selectedTemplate",this.selectedTemplateChangeHandler,this)},events:{"click #create-templategroup-button":"createTemplateGroupClickHandler","click #delete-template-button":"deleteTemplateClickHandler","click #save-template-button":"saveTemplateClickHandler"},selectedTemplateChangeHandler:function(){var t;t=this.model.get("selectedTemplate");if(t.get("template_short_name")==="index"){return $("#delete-template-button").addClass("disabled")}else{return $("#delete-template-button").removeClass("disabled")}},createTemplateGroupClickHandler:function(t){this.model.openNewTemplateGroupModal();return t.preventDefault()},deleteTemplateClickHandler:function(t){if(!$("#delete-template-button").hasClass("disabled")){this.model.openConfirmDeleteTemplateModal()}return t.preventDefault()},saveTemplateClickHandler:function(u){var t;if($("#save-template-button").hasClass("disabled")){return}$("#save-template-button").addClass("disabled");t=this.model.selectedTemplate();t.errors({});t.save({},{wait:true,success:function(w,v){w.requiresSave(false);return $("#save-template-button").removeClass("disabled")},error:function(w,v){var x;x=$.parseJSON(v.responseText);t.errors(x.errors);return $("#save-template-button").removeClass("disabled")}});return u.preventDefault()}});h=Backbone.View.extend({initialize:function(){return this.model.on("change:selectedTemplate",this.selectedTemplateChangeHandler,this)},events:{"change .preview-url-parameters":"resetPreviewButtonHref"},resetPreviewButtonHref:function(){var t;t=$(".preview-url").text()+$(".preview-url-parameters").val();return $("#preview-template-button").attr("href",t)},selectedTemplateChangeHandler:function(u,w){var v,t,x;t=w.get("template_short_name");v=w.templateGroupModel().get("templategroup_short_name");if(v==="root"&&t==="index"){x=""}else{if(v==="root"&&t!=="index"){x=t}else{if(t==="index"){x=""+v+"/"}else{x=""+v+"/"+t}}}this.$el.find(".template-uid").text(x);return this.resetPreviewButtonHref()}});s=Backbone.View.extend({initialize:function(){this.$el.find("> ul > li").each(d(function(u,w){var x,t,v;t=new o({id:parseInt($(w).attr("data-id")),templategroup_short_name:$(w).find(".group-header h3").text()});v=new a({el:w,model:t,collection:this.options.templateCollection,appModel:this.model});if(t.get("templategroup_short_name")==="root"){x=v.getIndexModel();this.model.selectedTemplate(x);this.model.rootTemplateGroup(t)}return this.options.templateGroupCollection.add(t,{silent:true})},this));return this.options.templateGroupCollection.on("add",this.templateGroupAddHandler,this)},sort:function(){this.$el.find("> ul > li").tsort(".group-header h3");return this.$el.find("> ul").prepend(this.$el.find("ul > li .group-header h3:contains(root)").closest("li"))},templateGroupAddHandler:function(t){var v,u;u=$(_.template($("#templategroup-list-item-template").text(),t.toJSON()));this.$el.find("> ul").prepend(u);v=new a({el:u,model:t,collection:this.options.templateCollection,appModel:this.model});return this.sort()}});a=Backbone.View.extend({initialize:function(){this.$el.find("ul.collapse > li").each(d(function(v,w){var t,u;t=new q({id:$(w).attr("data-id"),templategroup:this.model.id,template_short_name:$.trim($(w).text())});t.templateGroupModel(this.model);u=new n({el:w,model:t,appModel:this.options.appModel});this.collection.add(t,{silent:true});if(t.get("template_short_name")==="index"){return this.model.indexTemplateModel(t)}},this));this.collection.on("add",this.templateAddedHandler,this);this.model.on("destroy",this.destroyHandler,this);return this.model.on("change",this.render,this)},events:{"click .new-template-button":"newTemplateButtonClickHandler","click .edit-templategroup-button":"editTemplateGroupButtonClickHandler"},newTemplateButtonClickHandler:function(t){this.options.appModel.openNewTemplateModal(this.model);t.stopPropagation();return t.preventDefault()},editTemplateGroupButtonClickHandler:function(t){this.options.appModel.openEditTemplateGroupModal(this.model);t.preventDefault();return t.stopPropagation()},sort:function(){this.$el.find("> ul > li").tsort();return this.$el.find("> ul").prepend(this.$el.find("[data-is-index=1]"))},templateAddedHandler:function(u){var t,v;if(u.get("templategroup")===this.model.id){t=$(_.template($("#template-list-item-template").text(),u.toJSON()));this.$el.find("ul.collapse").prepend(t);this.sort();v=new n({el:t,model:u,appModel:this.options.appModel});v.modelPopulated=true;return this.options.appModel.selectedTemplate(u)}},getIndexModel:function(){var t;t=this.collection.where({templategroup:this.model.id});return _.find(t,function(u){return u.get("template_short_name")==="index"})},destroyHandler:function(){return this.$el.remove()},render:function(){return this.$el.find(".group-header h3").text(this.model.get("templategroup_short_name"))}});n=Backbone.View.extend({initialize:function(){this.options.appModel.on("change:selectedTemplate",this.selectedTemplateChangeHandler,this);this.model.on("destroy",this.modelDestroyHandler,this);return this.model.on("change requiresSave",this.render,this)},events:{"click a":"clickHandler"},clickHandler:function(t){this.options.appModel.selectedTemplate(this.model);return t.preventDefault()},selectedTemplateChangeHandler:function(){var t;t=this.options.appModel.get("selectedTemplate");if(t===this.model){if(!this.model.has("template_content")){this.model.initialFetch()}return this.$el.addClass("active")}else{return this.$el.removeClass("active")}},modelDestroyHandler:function(){return this.$el.remove()},render:function(){if(this.model.templateGroupModel().indexTemplateModel()===this.model){this.$el.find("a em").text(this.model.get("template_short_name"))}else{this.$el.find("a").text(this.model.get("template_short_name"))}if(this.model.requiresSave()){return this.$el.addClass("unsaved")}else{return this.$el.removeClass("unsaved")}}});b=Backbone.View.extend({initialize:function(){this.editor=ace.edit("editor");this.editor.setTheme("ace/theme/twilight");this.editor.setShowPrintMargin(false);this.editor.getSession().on("change",_.bind(this.editorChangeHandler,this));this.setMode("ace/mode/html");this.model.on("change:selectedTemplate",this.selectedTemplateChangeHandler,this);this.selectedTemplateChangeHandler();$("#tabs").on("shown",_.bind(this.tabShownHandler,this));this.ignoreEditorChange=false;return this.model.on("assetSelected",this.assetSelectedHandler,this)},events:{"click #media_chooser_button":"mediaChooserButtonClickHandler"},assetSelectedHandler:function(t){log("ASSET SELECTED",t);return this.editor.insert(t.url)},mediaChooserButtonClickHandler:function(t){this.model.openMediaChooserModal();return t.preventDefault()},tabShownHandler:function(t){if(this.$el.hasClass("active")&&this.templateModel){this.setValue(this.templateModel.get("template_content"));if(this.getMode()!==this.templateModel.getMode()){return this.setMode(this.templateModel.getMode())}}},editorChangeHandler:function(t){if(this.ignoreEditorChange){return}this.templateModel=this.model.get("selectedTemplate");this.templateModel.requiresSave(true);return this.templateModel.set("template_content",this.editor.getSession().getValue())},selectedTemplateChangeHandler:function(){if(this.templateModel){this.templateModel.off("initialFetchComplete",this.initialFetchCompleteHandler,this);this.templateModel.off("change:template_content_type",this.contentTypeChangeHandler,this)}this.templateModel=this.model.get("selectedTemplate");this.templateModel.on("initialFetchComplete",this.initialFetchCompleteHandler,this);this.templateModel.on("change:template_content_type",this.contentTypeChangeHandler,this);this.setValue(this.templateModel.get("template_content"));return this.setMode(this.templateModel.getMode())},contentTypeChangeHandler:function(){return this.setMode(this.templateModel.getMode())},setValue:function(t){this.ignoreEditorChange=true;this.editor.getSession().clearAnnotations();this.editor.getSession().setValue(t);return this.ignoreEditorChange=false},initialFetchCompleteHandler:function(){this.setValue(this.templateModel.get("template_content"));return this.setMode(this.templateModel.getMode())},setMode:function(t){return this.editor.getSession().setMode(t)},getMode:function(){return this.editor.getSession().getMode().$id}});r=Backbone.View.extend({initialize:function(){this.model.on("change:selectedTemplate",this.selectedTemplateChangeHandler,this);return this.selectedTemplateChangeHandler()},events:{"change :input":"inputChangeHander"},inputChangeHander:function(){var t;if(this.templateModel){t=this.$el.find("form").serializeObject();this.templateModel.set(t,{silent:true});this.templateModel.requiresSave(true)}if($("input:radio[name=template_is_private][value='True']").prop("checked")){return $("#cache-timeout-group, #redirect-group, #redirect-url-group").hide()}else{return $("#cache-timeout-group, #redirect-group, #redirect-url-group").show()}},selectedTemplateChangeHandler:function(){var t;if(this.templateModel){this.templateModel.off("change",this.populateFromModel,this);this.templateModel.off("errors",this.renderErrors,this)}this.templateModel=this.model.get("selectedTemplate");if(this.templateModel){this.templateModel.on("change",this.populateFromModel,this);this.templateModel.on("errors",this.renderErrors,this);this.populateFromModel()}this.removeErrors();t=this.templateModel.errors();if(t){return this.renderErrors(t)}},removeErrors:function(){this.$el.find(".alert").remove();return this.$el.find(".error").removeClass("error")},renderErrors:function(u){var t;this.removeErrors();t="";return _.each(u,function(w,v){_.each(w,function(y,x){return t+=_.template("<li><%= error %></li>",{error:y})});$("#id_"+v).before(_.template($("#form-error-template").text(),{errors:t}));return $("#id_"+v).parent().addClass("error")})},populateFromModel:function(){if(this.templateModel.get("template_short_name")){$("#id_template_short_name").val(this.templateModel.get("template_short_name"));$("#id_template_content_type").val(this.templateModel.get("template_content_type"));$("#id_template_cache_timeout").val(this.templateModel.get("template_cache_timeout"));$("#id_template_redirect_type").val(this.templateModel.get("template_redirect_type"));$("#id_template_redirect_url").val(this.templateModel.get("template_redirect_url"));$("#id_templategroup").val(this.templateModel.get("templategroup"));if(this.templateModel.get("template_is_private")){$("input:radio[name=template_is_private][value='True']").prop("checked",true);$("input:radio[name=template_is_private][value='False']").prop("checked",false);$("#cache-timeout-group, #redirect-group, #redirect-url-group").hide()}else{$("input:radio[name=template_is_private][value='True']").prop("checked",false);$("input:radio[name=template_is_private][value='False']").prop("checked",true);$("#cache-timeout-group, #redirect-group, #redirect-url-group").show()}if(this.templateModel.get("template_short_name")==="index"){return $("#id_template_short_name").parent().parent().hide()}else{return $("#id_template_short_name").parent().parent().show()}}}});m=Backbone.View.extend({initialize:function(){this.model.on("openMediaChooserModal",this.open,this);return this.model.on("closeMediaChooserModal",this.close,this)},open:function(){return this.$el.modal("show")},close:function(){return this.$el.modal("hide")}});i=Backbone.View.extend({initialize:function(){return this.model.on("openConfirmDeleteTemplateModal",this.open,this)},events:{"click #confirm-delete-template-button":"confirmDeleteHandler"},open:function(){return this.$el.modal("show")},close:function(){return this.$el.modal("hide")},confirmDeleteHandler:function(u){var t;t=this.model.get("selectedTemplate");t.destroy();this.close();this.model.selectedTemplate(t.templateGroupModel().indexTemplateModel());return u.preventDefault()}});p=Backbone.View.extend({initialize:function(){return this.model.on("openNewTemplateModal",this.open,this)},events:{"click #create-template-button":"createTemplateButtonClickHandler","keypress input":"inputKeyPressHandler"},inputKeyPressHandler:function(t){if(t.which===13){this.createTemplateButtonClickHandler();return t.preventDefault()}},open:function(t){this.templateGroupModel=t;$("#id2_templategroup").val(t.id);this.removeErrors();this.$el.find("form").each(function(){return this.reset()});$("#id2_template_is_private_0").prop("checked",true);this.$el.modal("show");return $("#id2_template_short_name").focus()},removeErrors:function(){this.$el.find(".alert").remove();return this.$el.find(".error").removeClass("error")},close:function(){return this.$el.modal("hide")},createTemplateButtonClickHandler:function(u){var t;t=this.$el.find("form").serializeObject();t.template_cache_timeout=0;this.temp_model=new q(t);this.temp_model.save({},{success:d(function(w,v){w.templateGroupModel(this.templateGroupModel);this.collection.add(w);return this.close()},this),error:d(function(x,v){var w,y;this.removeErrors();if(v.status===400){y=$.parseJSON(v.responseText);w="";return _.each(y.errors,function(A,z){_.each(A,function(C,B){return w+=_.template("<li><%= error %></li>",{error:C})});$("#id2_"+z).before(_.template($("#form-error-template").text(),{errors:w}));return $("#id2_"+z).parent().addClass("error")})}},this)});if(u){return u.preventDefault()}}});f=Backbone.View.extend({initialize:function(){return this.model.on("openNewTemplateGroupModal",this.open,this)},events:{"click #create-templategroup-button":"createTemplateGroupButtonClickHandler","keypress input":"inputKeyPressHandler"},inputKeyPressHandler:function(t){if(t.which===13){this.createTemplateGroupButtonClickHandler();return t.preventDefault()}},open:function(){this.removeErrors();this.$el.find("form").each(function(){return this.reset()});this.$el.modal("show");return $("#id_templategroup_short_name").focus()},removeErrors:function(){this.$el.find(".alert").remove();return this.$el.find(".error").removeClass("error")},close:function(){return this.$el.modal("hide")},createTemplateGroupButtonClickHandler:function(u){var t;t=this.$el.find("form").serializeObject();$.post(templateGroupRoot,JSON.stringify(t),d(function(y,z,x){var v,w;if(x.status===200){w=new o(y.templategroup);v=new q(y.template);v.templateGroupModel(w);w.indexTemplateModel(v);this.options.templateGroupCollection.add(w);this.options.templateCollection.add(v);this.model.selectedTemplate(v);return this.close()}},this),"json").error(d(function(w){var v,x;this.removeErrors();if(w.status===400){x=$.parseJSON(w.responseText);v="";return _.each(x.errors,function(z,y){_.each(z,function(B,A){return v+=_.template("<li><%= error %></li>",{error:B})});$("#id_"+y).before(_.template($("#form-error-template").text(),{errors:v}));return $("#id_"+y).parent().addClass("error")})}},this));if(u){return u.preventDefault()}}});k=Backbone.View.extend({initialize:function(){return this.model.on("openEditTemplateGroupModal",this.open,this)},events:{"click #save-templategroup-button":"saveTemplateGroupButtonClickHandler","click #delete-templategroup-button":"deleteTemplateGroupButtonClickHandler","keypress input":"inputKeyPressHandler"},inputKeyPressHandler:function(t){if(t.which===13){this.saveTemplateGroupButtonClickHandler();return t.preventDefault()}},open:function(t){this.templateGroupModel=t;this.removeErrors();this.$el.find("form").each(function(){return this.reset()});this.$el.modal("show");return $("#id2_templategroup_short_name").val(this.templateGroupModel.get("templategroup_short_name")).focus()},removeErrors:function(){this.$el.find(".alert").remove();return this.$el.find(".error").removeClass("error")},close:function(){return this.$el.modal("hide")},saveTemplateGroupButtonClickHandler:function(u){var t;t=this.$el.find("form").serializeObject();if(t.templategroup_short_name===this.templateGroupModel.get("templategroup_short_name")){this.close();return}this.templateGroupModel.save(t,{wait:true,success:d(function(){return this.close()},this),error:d(function(x,v){var w,y;this.removeErrors();if(v.status===400){y=$.parseJSON(v.responseText);w="";return _.each(y.errors,function(A,z){_.each(A,function(C,B){return w+=_.template("<li><%= error %></li>",{error:C})});$("#id2_"+z).before(_.template($("#form-error-template").text(),{errors:w}));return $("#id2_"+z).parent().addClass("error")})}},this)});if(u){return u.preventDefault()}},deleteTemplateGroupButtonClickHandler:function(t){this.close();this.model.openConfirmDeleteTemplateGroupModal(this.templateGroupModel);return t.preventDefault()}});l=Backbone.View.extend({initialize:function(){return this.model.on("openConfirmDeleteTemplateGroupModal",this.open,this)},events:{"click #confirm-delete-templategroup-button":"confirmDeleteHandler"},open:function(t){this.templateGroupModel=t;return this.$el.modal("show")},close:function(){return this.$el.modal("hide")},confirmDeleteHandler:function(t){this.templateGroupModel.destroy();this.close();this.model.selectedTemplate(this.model.rootTemplateGroup().indexTemplateModel());return t.preventDefault()}});$(function(){var u,y,A,v,C,E,x,B,F,D,w,t,z;window.appModel=new j();D=new c();t=new g();u=new e({el:$(".action-bar"),model:window.appModel});z=new h({el:$("#preview-link-holder"),model:window.appModel});F=new s({el:$("#template-browser"),model:window.appModel,templateCollection:D,templateGroupCollection:t});w=new b({el:$("#editor-pane"),model:window.appModel});B=new r({el:$("#settings-pane"),model:window.appModel});x=new p({el:$("#create-template-modal"),model:window.appModel,collection:D});A=new i({el:$("#delete-template-modal"),model:window.appModel});C=new m({el:$("#media_chooser_modal"),model:window.appModel});E=new f({el:$("#create-templategroup-modal"),model:window.appModel,templateGroupCollection:t,templateCollection:D});v=new k({el:$("#edit-templategroup-modal"),model:window.appModel});y=new l({el:$("#delete-templategroup-modal"),model:window.appModel});$("#tabs a").click(function(G){$(this).tab("show");return G.preventDefault()});return $("#tabs a:first").tab("show")})}).call(this);