define("templates/models/AppModel",["jquery","lib/backbone"],function(){var e=Backbone.Model.extend({assetSelectionCallback:function(e){this.closeMediaChooserModal(),this.trigger("assetSelected",e)},selectedTemplate:function(e){return e&&this.set("selectedTemplate",e),this.get("selectedTemplate")},rootTemplateGroup:function(e){return e&&this.set("rootTemplateGroup",e),this.get("rootTemplateGroup")},openNewTemplateModal:function(e){this.trigger("openNewTemplateModal",e)},openNewTemplateGroupModal:function(){this.trigger("openNewTemplateGroupModal")},openEditTemplateGroupModal:function(e){this.trigger("openEditTemplateGroupModal",e)},openConfirmDeleteTemplateModal:function(e){this.trigger("openConfirmDeleteTemplateModal",e)},openConfirmDeleteTemplateGroupModal:function(e){this.trigger("openConfirmDeleteTemplateGroupModal",e)},openMediaChooserModal:function(){this.trigger("openMediaChooserModal")},openAlertModal:function(e){this.trigger("openAlertModal",e)},openDisallowedRootIndexDeleteAlertModal:function(){this.openAlertModal("Deleting the root index template is forbidden.")},openDisallowedRootGroupDeleteAlertModal:function(){this.openAlertModal("Deleting the root template group is forbidden.")},closeMediaChooserModal:function(){this.trigger("closeMediaChooserModal")},showActionDropDown:function(e,t,n){this.trigger("showActionDropDown",e,t,n)},openTemplateSettingsModal:function(e){this.trigger("openTemplateSettingsModal",e)}});return new e}),define("templates/views/ActionBarView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:".action-bar",events:{"click #delete-template-button":"deleteTemplateClickHandler","click #save-template-button":"saveTemplateClickHandler"},deleteTemplateClickHandler:function(n){if(!e("#delete-template-button").hasClass("disabled")){var r=t.selectedTemplate(),i=r.templateGroupModel();console.log(i.get("templategroup_short_name")),r.get("template_short_name")=="index"&&i.get("templategroup_short_name")=="root"?t.openDisallowedRootIndexDeleteAlertModal():t.openConfirmDeleteTemplateModal(r)}n.preventDefault()},saveTemplateClickHandler:function(n){if(e("#save-template-button").hasClass("disabled"))return;e("#save-template-button").addClass("disabled"),templateModel=t.selectedTemplate(),templateModel.errors({}),templateModel.save({},{wait:!0,success:function(t,n){t.requiresSave(!1),e("#save-template-button").removeClass("disabled")},error:function(t,n){var r=e.parseJSON(n.responseText);templateModel.errors(r.errors),e("#save-template-button").removeClass("disabled")}}),n.preventDefault()}});return n}),define("templates/views/TemplateEditorControlsView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:"#template-editor-controls",initialize:function(){t.on("change:selectedTemplate",this.selectedTemplateChangeHandler,this)},events:{"change #preview-template-control .preview-url-parameters":"resetPreviewButtonHref","click #media-chooser-button":"mediaChooserClickHandler"},mediaChooserClickHandler:function(){t.openMediaChooserModal()},resetPreviewButtonHref:function(){var t=e(".preview-url").text()+e(".preview-url-parameters").val();e("#preview-template-button").attr("href",t)},selectedTemplateChangeHandler:function(e,t){this.templateModel&&this.templateModel.off("change:template_is_private",this.templatePrivacyChangeHandler),this.templateModel!==t&&(this.templateModel=t,this.templateModel.on("change:template_is_private",this.templatePrivacyChangeHandler,this));var n=t.get("template_short_name"),r=t.templateGroupModel().get("templategroup_short_name");if(r=="root"&&n=="index")var i="";else if(r=="root"&&n!=="index")var i=n;else if(n=="index")var i=r+"/";else var i=r+"/"+n;this.$(".template-uid").text(i),this.templatePrivacyChangeHandler(t)},templatePrivacyChangeHandler:function(e){var t=e.get("template_is_private");t?this.$("#preview-template-control").addClass("hide"):(this.$("#preview-template-control").removeClass("hide"),this.resetPreviewButtonHref())}});return n}),define("templates/models/TemplateGroupModel",["jquery","lib/backbone"],function(e){var t=Backbone.Model.extend({urlRoot:thunderchild.templateGroupRoot,indexTemplateModel:function(e){return e&&(this._indexTemplateModel=e),this._indexTemplateModel}});return t}),define("templates/models/TemplateModel",["jquery","lib/backbone"],function(e){var t=Backbone.Model.extend({urlRoot:thunderchild.templateRoot,save:function(e,t){this.trigger("save");var n={wait:!0,success:_.bind(function(e,n){this.trigger("saveSuccess",e,n),t.hasOwnProperty("success")&&t.success(e,n)},this),error:_.bind(function(e,n){this.trigger("saveError",e,n),t.hasOwnProperty("error")&&t.error(e,n)},this)};Backbone.Model.prototype.save.call(this,e,n)},templateGroupModel:function(e){return e&&(this._templateGroupModel=e),this._templateGroupModel},errors:function(e){return e&&(this._errors=e,this.trigger("errors",this._errors)),this._errors},requiresSave:function(e){if(e||e==0)this._requiresSave=e,this.trigger("requiresSave");return this._requiresSave},getMode:function(){switch(this.get("template_content_type")){case"text/html":return"ace/mode/html";case"text/css":return"ace/mode/css";case"application/javascript":return"ace/mode/javascript";case"application/json":return"ace/mode/json";case"application/rss+xml":return"ace/mode/xml";case"text/less":return"ace/mode/less";case"text/scss":return"ace/mode/scss";default:return"ace/mode/text"}}});return t}),define("templates/views/TemplateListItemView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({initialize:function(){t.on("change:selectedTemplate",this.selectedTemplateChangeHandler,this),this.model.on("destroy",this.modelDestroyHandler,this),this.model.on("change, requiresSave",this.render,this),this.model.on("save",this.saveHandler,this),this.model.on("saveSuccess",this.saveSuccessHandler,this),this.render()},events:{click:"clickHandler","click a":"clickHandler","click .but-tmpl-action":"actionButtonClickHandler"},clickHandler:function(e){t.selectedTemplate(this.model),e.preventDefault()},actionButtonClickHandler:function(n){t.selectedTemplate(this.model);var r=e(n.currentTarget).offset(),i=[{Reload:_.bind(this.reloadAction,this)},{Delete:_.bind(this.deleteAction,this)},{Settings:_.bind(this.settingsAction,this)}];t.showActionDropDown(r.left,r.top+15,i),n.stopPropagation()},deleteAction:function(e){this.model.get("template_short_name")=="index"&&this.model.templateGroupModel().get("templategroup_short_name")=="root"?t.openDisallowedRootIndexDeleteAlertModal():t.openConfirmDeleteTemplateModal(this.model),e.preventDefault()},settingsAction:function(e){t.openTemplateSettingsModal(this.model),e.preventDefault()},reloadAction:function(e){this.model.fetch(),e.preventDefault()},selectedTemplateChangeHandler:function(){var e=t.get("selectedTemplate");e==this.model?(this.model.has("template_content")||(this.$(".loading-anim").removeClass("hide"),this.model.fetch({success:_.bind(function(){this.$(".loading-anim").addClass("hide")},this)})),this.$el.addClass("active")):this.$el.removeClass("active")},modelDestroyHandler:function(){this.$el.remove()},render:function(){this.$("a").text(this.model.get("template_short_name")),this.$el.toggleClass("unsaved",this.model.requiresSave()===!0),this.$el.toggleClass("is-fragment",this.model.get("template_is_private")===!0);var e=this.model.get("template_redirect_type");this.$el.toggleClass("is-redirected",e!==undefined&&e!==null)},saveHandler:function(){this.$(".loading-anim").removeClass("hide")},saveSuccessHandler:function(){this.$(".loading-anim").addClass("hide")}});return n}),define("templates/models/TemplateCollection",["jquery","templates/models/TemplateModel","lib/backbone"],function(e,t){var n=Backbone.Collection.extend({model:t,url:thunderchild.templateRoot});return new n}),function(e){function a(e){return e&&e.toLowerCase?e.toLowerCase():e}function f(e,n){for(var r=0,i=e.length;r<i;r++)if(e[r]==n)return!t;return t}var t=!1,n=null,r=parseFloat,i=Math.min,s=/(-?\d+\.?\d*)$/g,o=[],u=[];e.tinysort={id:"TinySort",version:"1.4.29",copyright:"Copyright (c) 2008-2012 Ron Valstar",uri:"http://tinysort.sjeiti.com/",licensed:{MIT:"http://www.opensource.org/licenses/mit-license.php",GPL:"http://www.gnu.org/licenses/gpl.html"},plugin:function(e,t){o.push(e),u.push(t)},defaults:{order:"asc",attr:n,data:n,useVal:t,place:"start",returns:t,cases:t,forceStrings:t,sortFunction:n}},e.fn.extend({tinysort:function(l,c){l&&typeof l!="string"&&(c=l,l=n);var h=e.extend({},e.tinysort.defaults,c),p,d=this,v=e(this).length,m={},g=!!l&&l!="",y=h.attr!==n&&h.attr!="",b=h.data!==n,w=g&&l[0]==":",E=w?d.filter(l):d,S=h.sortFunction,x=h.order=="asc"?1:-1,T=[];e.each(o,function(e,t){t.call(t,h)}),S||(S=h.order=="rand"?function(){return Math.random()<.5?1:-1}:function(n,i){var o=t,f=h.cases?n.s:a(n.s),l=h.cases?i.s:a(i.s);if(!h.forceStrings){var c=f&&f.match(s),p=l&&l.match(s);if(c&&p){var d=f.substr(0,f.length-c[0].length),v=l.substr(0,l.length-p[0].length);d==v&&(o=!t,f=r(c[0]),l=r(p[0]))}}var m=x*(f<l?-1:f>l?1:0);return e.each(u,function(e,t){m=t.call(t,o,f,l,m)}),m}),d.each(function(t,n){var r=e(n),i=g?w?E.filter(n):r.find(l):r,s=b?""+i.data(h.data):y?i.attr(h.attr):h.useVal?i.val():i.text(),o=r.parent();m[o]||(m[o]={s:[],n:[]}),i.length>0?m[o].s.push({s:s,e:r,n:t}):m[o].n.push({e:r,n:t})});for(p in m)m[p].s.sort(S);for(p in m){var N=m[p],C=[],k=v,L=[0,0],A;switch(h.place){case"first":e.each(N.s,function(e,t){k=i(k,t.n)});break;case"org":e.each(N.s,function(e,t){C.push(t.n)});break;case"end":k=N.n.length;break;default:k=0}for(A=0;A<v;A++){var O=f(C,A)?!t:A>=k&&A<k+N.s.length,M=(O?N.s:N.n)[L[O?0:1]].e;M.parent().append(M),(O||!h.returns)&&T.push(M.get(0)),L[O?0:1]++}}return d.length=0,Array.prototype.push.apply(d,T),d}}),e.fn.TinySort=e.fn.Tinysort=e.fn.tsort=e.fn.tinysort}(jQuery),Array.prototype.indexOf||(Array.prototype.indexOf=function(e){var t=this.length,n=Number(arguments[1])||0;n=n<0?Math.ceil(n):Math.floor(n),n<0&&(n+=t);for(;n<t;n++)if(n in this&&this[n]===e)return n;return-1}),define("lib/jquery.tinysort",[],function(){}),define("templates/views/TemplateGroupView",["jquery","templates/models/AppModel","templates/models/TemplateModel","templates/views/TemplateListItemView","templates/models/TemplateCollection","lib/backbone","lib/jquery.tinysort"],function(e,t,n,r,i){var s=Backbone.View.extend({initialize:function(){this.$("ul.collapse > li").each(_.bind(function(t,s){var o=new n({id:e(s).attr("data-id"),templategroup:this.model.id,template_short_name:e.trim(e(s).text()),template_is_private:e(s).hasClass("is-fragment"),template_redirect_type:e(s).attr("data-redirect-type")});o.templateGroupModel(this.model),templateListItemView=new r({el:s,model:o}),i.add(o,{silent:!0}),o.get("template_short_name")=="index"&&this.model.indexTemplateModel(o)},this)),i.on("add",this.templateAddedHandler,this),this.model.on("destroy",this.destroyHandler,this),this.model.on("change",this.render,this),t.on("change:selectedTemplate",this.selectedTemplateChangeHandler,this)},events:{"click .but-tmpl-grp-action":"actionButtonClickHandler"},actionButtonClickHandler:function(n){var r=e(n.currentTarget).offset(),i=[{"New Template":_.bind(this.newTemplateAction,this)},{Delete:_.bind(this.deleteAction,this)},{Settings:_.bind(this.settingsAction,this)}];t.showActionDropDown(r.left,r.top+15,i),n.stopPropagation()},newTemplateAction:function(e){t.openNewTemplateModal(this.model),e.preventDefault()},deleteAction:function(e){this.model.get("templategroup_short_name")=="root"?t.openDisallowedRootGroupDeleteAlertModal():t.openConfirmDeleteTemplateGroupModal(this.model),e.preventDefault()},settingsAction:function(e){t.openEditTemplateGroupModal(this.model),e.preventDefault()},sort:function(){this.$("> ul > li").tsort("a"),this.$("> ul").prepend(this.$("[data-is-index=1]"))},templateAddedHandler:function(n){if(n.get("templategroup")==this.model.id){var i=new r({el:_.template(e("#template-list-item-template").text(),n.toJSON()),model:n});this.$("ul.collapse").prepend(i.el),this.sort(),i.modelPopulated=!0,t.selectedTemplate(n)}},getIndexModel:function(){var e=i.where({templategroup:this.model.id});return _.find(e,function(e){return e.get("template_short_name")=="index"})},destroyHandler:function(){this.$el.remove()},selectedTemplateChangeHandler:function(){var e=t.get("selectedTemplate");this.$el.toggleClass("active",e.templateGroupModel()===this.model)},render:function(){this.$(".group-header h3").text(this.model.get("templategroup_short_name"))}});return s}),define("templates/models/TemplateGroupCollection",["jquery","templates/models/TemplateGroupModel","lib/backbone"],function(e,t){var n=Backbone.Collection.extend({model:t});return new n}),define("templates/views/TemplateBrowserView",["jquery","templates/models/AppModel","templates/models/TemplateGroupModel","templates/views/TemplateGroupView","templates/models/TemplateGroupCollection","lib/backbone","lib/jquery.tinysort"],function(e,t,n,r,i){var s=Backbone.View.extend({el:"#template-browser",initialize:function(){this.$(".inner > ul > li").each(_.bind(function(s,o){var u=new n({id:parseInt(e(o).attr("data-id")),templategroup_short_name:e(o).find(".group-header h3").text()}),a=new r({el:o,model:u,collection:this.options.templateCollection});if(u.get("templategroup_short_name")=="root"){var f=a.getIndexModel();t.selectedTemplate(f),t.rootTemplateGroup(u)}i.add(u,{silent:!0})},this)),i.on("add",this.templateGroupAddHandler,this)},sort:function(){this.$(".inner > ul > li").tsort(".group-header h3"),this.$(".inner > ul").prepend(this.$(".inner ul > li .group-header h3:contains(root)").closest("li"))},templateGroupAddHandler:function(t){var n=e(_.template(e("#templategroup-list-item-template").text(),t.toJSON()));this.$(".inner > ul").prepend(n);var i=new r({el:n,model:t,collection:this.options.templateCollection});this.sort()}});return s}),define("templates/views/TemplateEditorView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:"#editor",initialize:function(){this.editor=ace.edit("editor"),this.editor.setTheme("ace/theme/twilight"),this.editor.setShowPrintMargin(!1),this.editor.getSession().on("change",_.bind(this.editorChangeHandler,this)),this.setMode("ace/mode/html"),t.on("change:selectedTemplate",this.selectedTemplateChangeHandler,this),this.selectedTemplateChangeHandler(),this.ignoreEditorChange=!1,t.on("assetSelected",this.assetSelectedHandler,this)},assetSelectedHandler:function(e){this.editor.insert(e.url)},editorChangeHandler:function(e){if(this.ignoreEditorChange||!this.templateModel)return;this.templateModel.requiresSave(!0),this.templateModel.set({template_content:this.editor.getSession().getValue()},{silent:!0})},selectedTemplateChangeHandler:function(){this.templateModel&&this.templateModel.off("change",this.changeHandler,this),this.templateModel=t.get("selectedTemplate"),this.templateModel.on("change",this.changeHandler,this),this.setValue(this.templateModel.get("template_content")),this.setMode(this.templateModel.getMode())},changeHandler:function(){this.setValue(this.templateModel.get("template_content")),this.setMode(this.templateModel.getMode())},setValue:function(e){this.ignoreEditorChange=!0,this.editor.getSession().clearAnnotations(),this.editor.getSession().setValue(e),this.ignoreEditorChange=!1},setMode:function(e){this.editor.getSession().setMode(e)},getMode:function(){this.editor.getSession().getMode().$id}});return n}),define("templates/views/NewTemplateModalView",["jquery","templates/models/AppModel","templates/models/TemplateModel","templates/models/TemplateCollection","lib/backbone"],function(e,t,n,r){var i=Backbone.View.extend({el:"#create-template-modal",initialize:function(){t.on("openNewTemplateModal",this.open,this)},events:{"click #create-template-button":"createTemplateButtonClickHandler","keypress input":"inputKeyPressHandler"},inputKeyPressHandler:function(e){e.which==13&&(this.createTemplateButtonClickHandler(),e.preventDefault())},open:function(t){this.templateGroupModel=t,e("#id2_templategroup").val(t.id),this.removeErrors(),this.$("form").each(function(){this.reset()}),e("#id2_template_is_private_0").prop("checked",!0),this.$el.modal("show"),e("#id2_template_short_name").focus()},removeErrors:function(){this.$(".alert").remove(),this.$(".error").removeClass("error")},close:function(){this.$el.modal("hide")},createTemplateButtonClickHandler:function(t){var i=this.$("form").serializeObject();i.template_cache_timeout=0,this.temp_model=new n,this.temp_model.save(i,{success:_.bind(function(e,t){e.templateGroupModel(this.templateGroupModel),r.add(e),this.close()},this),error:_.bind(function(t,n){this.removeErrors();if(n.status==400){var r=e.parseJSON(n.responseText),i="";_.each(r.errors,function(t,n){_.each(t,function(e,t){i+=_.template("<li><%= error %></li>",{error:e})}),e("#id2_"+n).before(_.template(e("#form-error-template").text(),{errors:i})),e("#id2_"+n).parent().addClass("error")})}},this)}),t&&t.preventDefault()}});return i}),define("templates/views/ConfirmDeleteTemplateModalView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:"#delete-template-modal",initialize:function(){t.on("openConfirmDeleteTemplateModal",this.open,this)},events:{"click #confirm-delete-template-button":"confirmDeleteHandler"},open:function(e){this.templateModel=e,this.$el.modal("show")},close:function(){this.$el.modal("hide")},confirmDeleteHandler:function(e){this.templateModel.destroy(),this.close(),t.selectedTemplate(this.templateModel.templateGroupModel().indexTemplateModel()),e.preventDefault()}});return n}),define("templates/views/MediaChooserModalView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:"#media-chooser-modal",initialize:function(){t.on("openMediaChooserModal",this.open,this),t.on("closeMediaChooserModal",this.close,this)},open:function(){this.$el.modal("show")},close:function(){this.$el.modal("hide")}});return n}),define("templates/views/NewTemplateGroupModalView",["jquery","templates/models/AppModel","templates/models/TemplateGroupModel","templates/models/TemplateModel","templates/models/TemplateCollection","templates/models/TemplateGroupCollection","lib/backbone"],function(e,t,n,r,i,s){var o=Backbone.View.extend({el:"#create-templategroup-modal",initialize:function(){t.on("openNewTemplateGroupModal",this.open,this)},events:{"click #create-templategroup-button":"createTemplateGroupButtonClickHandler","keypress input":"inputKeyPressHandler"},inputKeyPressHandler:function(e){e.which==13&&(this.createTemplateGroupButtonClickHandler(),e.preventDefault())},open:function(){this.removeErrors(),this.$("form").each(function(){this.reset()}),this.$el.modal("show"),e("#id_templategroup_short_name").focus()},removeErrors:function(){this.$(".alert").remove(),this.$(".error").removeClass("error")},close:function(){this.$el.modal("hide")},createTemplateGroupButtonClickHandler:function(o){var u=this.$("form").serializeObject();e.post(thunderchild.templateGroupRoot,JSON.stringify(u),_.bind(function(e,o,u){if(u.status==200){var a=new n(e.templategroup),f=new r(e.template);f.templateGroupModel(a),a.indexTemplateModel(f),s.add(a),i.add(f),t.selectedTemplate(f),this.close()}},this),"json").error(_.bind(function(t){this.removeErrors(),t.status==400&&(resp=e.parseJSON(t.responseText),errors_html="",_.each(resp.errors,function(t,n){_.each(t,function(e,t){errors_html+=_.template("<li><%= error %></li>",{error:e})}),e("#id_"+n).before(_.template(e("#form-error-template").text(),{errors:errors_html})),e("#id_"+n).parent().addClass("error")}))},this)),o&&o.preventDefault()}});return o}),define("templates/views/EditTemplateGroupModalView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:"#edit-templategroup-modal",initialize:function(){t.on("openEditTemplateGroupModal",this.open,this)},events:{"click #save-templategroup-button":"saveTemplateGroupButtonClickHandler","click #delete-templategroup-button":"deleteTemplateGroupButtonClickHandler","keypress input":"inputKeyPressHandler"},inputKeyPressHandler:function(e){e.which==13&&(this.saveTemplateGroupButtonClickHandler(),e.preventDefault())},open:function(t){this.templateGroupModel=t,this.removeErrors(),this.$("form").each(function(){this.reset()}),this.$el.modal("show"),e("#id2_templategroup_short_name").val(this.templateGroupModel.get("templategroup_short_name")).focus()},removeErrors:function(){this.$(".alert").remove(),this.$(".error").removeClass("error")},close:function(){this.$el.modal("hide")},saveTemplateGroupButtonClickHandler:function(t){var n=this.$("form").serializeObject();if(n.templategroup_short_name==this.templateGroupModel.get("templategroup_short_name")){this.close();return}this.templateGroupModel.save(n,{wait:!0,success:_.bind(function(){this.close()},this),error:_.bind(function(t,n){this.removeErrors();if(n.status==400){var r=e.parseJSON(n.responseText),i="";_.each(r.errors,function(t,n){_.each(t,function(e,t){i+=_.template("<li><%= error %></li>",{error:e})}),e("#id2_"+n).before(_.template(e("#form-error-template").text(),{errors:i})),e("#id2_"+n).parent().addClass("error")})}},this)}),t&&t.preventDefault()},deleteTemplateGroupButtonClickHandler:function(e){this.close(),t.openConfirmDeleteTemplateGroupModal(this.templateGroupModel),e.preventDefault()}});return n}),define("templates/views/ConfirmDeleteTemplateGroupModalView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:"#delete-templategroup-modal",initialize:function(){t.on("openConfirmDeleteTemplateGroupModal",this.open,this)},events:{"click #confirm-delete-templategroup-button":"confirmDeleteHandler"},open:function(e){this.templateGroupModel=e,this.$el.modal("show")},close:function(){this.$el.modal("hide")},confirmDeleteHandler:function(e){this.templateGroupModel.destroy(),this.close(),t.selectedTemplate(t.rootTemplateGroup().indexTemplateModel()),e.preventDefault()}});return n}),define("templates/views/ActionDropDownView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:"#action-drop-down",actionTemplate:_.template(e("#action-drop-down-item-template").text()),initialize:function(){t.on("showActionDropDown",this.show,this)},show:function(t,n,r){this.$el.children().off("click"),this.$el.empty(),_.each(r,_.bind(function(t){for(key in t)if(t.hasOwnProperty(key)){var n=e(this.actionTemplate({action_name:key}));n.on("click",t[key]),this.$el.append(n)}},this)),this.$el.css({left:t,top:n,display:"block"}),e("body").one("click",_.bind(this.hide,this))},hide:function(){this.$el.hide()}});return n}),define("templates/views/TemplateSettingsModalView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:"#template-settings-modal",initialize:function(){t.on("openTemplateSettingsModal",this.open,this)},events:{"change input[type=radio][name=template_is_private]":"isPrivateChangeHander","click #confirm-template-settings-button":"saveClickHandler","change #id_template_redirect_type":"redirectTypeChangeHandler"},isPrivateChangeHander:function(){this.$(".field-holder.template_redirect_type, .field-holder.template_cache_timeout, .field-holder.template_redirect_url").toggle(this.$("input[type=radio][name=template_is_private][value='False']").prop("checked"))},open:function(t){this.model=t,this.removeErrors(),this.$el.modal("show"),e.each(this.model.toJSON(),_.bind(function(e,t){this.$(":input[name='"+e+"']").not("[type=radio]").val(t)},this)),this.model.get("template_is_private")?(this.$("input[type=radio][name=template_is_private][value='True']").prop("checked",!0),this.$("input[type=radio][name=template_is_private][value='False']").prop("checked",!1),this.$(".field-holder.template_redirect_type, .field-holder.template_cache_timeout, .field-holder.template_redirect_url").hide()):(this.$("input[type=radio][name=template_is_private][value='True']").prop("checked",!1),this.$("input[type=radio][name=template_is_private][value='False']").prop("checked",!0),this.$(".field-holder.template_redirect_type, .field-holder.template_cache_timeout, .field-holder.template_redirect_url").show()),e(".field-holder.template_short_name").toggle(this.model.get("template_short_name")!="index");var n=this.model.get("template_redirect_type");e(".field-holder.template_redirect_url").toggle(n=="301"||n=="302")},close:function(){this.$el.modal("hide")},removeErrors:function(){this.$(".alert").remove(),this.$(".error").removeClass("error")},saveClickHandler:function(t){if(e(t.currentTarget).hasClass("disabled"))return;e(t.currentTarget).addClass("disabled");var n=this.$("form").serializeObject();this.removeErrors(),this.model.save(n,{wait:!0,success:_.bind(function(n,r,i){e(t.currentTarget).removeClass("disabled"),this.model.requiresSave(!1),this.close()},this),error:_.bind(function(n,r){e(t.currentTarget).removeClass("disabled");if(r.status==400){var i=e.parseJSON(r.responseText),s="";_.each(i.errors,function(t,n){_.each(t,function(e,t){s+=_.template("<li><%= error %></li>",{error:e})}),e(".field-holder."+n).before(_.template(e("#form-error-template").text(),{errors:s})).addClass("error")})}},this)})},redirectTypeChangeHandler:function(t){var n=e(t.currentTarget).val();e(".field-holder.template_redirect_url").toggle(n==="301"||n==="302")}});return n}),define("templates/views/CreateTemplateGroupButtonView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:"#create-templategroup-button",events:{click:"clickHandler"},clickHandler:function(){t.openNewTemplateGroupModal()}});return n}),define("templates/views/AlertModalView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:"#alert-modal",initialize:function(){t.on("openAlertModal",this.open,this)},open:function(e){this.$(".modal-body p").text(e),this.$el.modal("show")}});return n}),define("templates/views/AppView",["jquery","templates/views/ActionBarView","templates/views/TemplateEditorControlsView","templates/views/TemplateBrowserView","templates/views/TemplateEditorView","templates/views/NewTemplateModalView","templates/views/ConfirmDeleteTemplateModalView","templates/views/MediaChooserModalView","templates/views/NewTemplateGroupModalView","templates/views/EditTemplateGroupModalView","templates/views/ConfirmDeleteTemplateGroupModalView","templates/views/ActionDropDownView","templates/views/TemplateSettingsModalView","templates/views/CreateTemplateGroupButtonView","templates/views/AlertModalView","lib/backbone","lib/bootstrap"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p,d){var v=Backbone.View.extend({el:"body",initialize:function(){var e=new t,v=new n,m=new r,g=new i,y=new s,b=new o,w=new u,E=new a,S=new f,x=new l,T=new c,N=new h,C=new p,k=new d}});return v}),requirejs(["jquery","templates/models/AppModel","templates/views/AppView","lib/log"],function(e,t,n){e(function(){window.appModel=t;var e=new n})}),define("templates/Main",[],function(){})