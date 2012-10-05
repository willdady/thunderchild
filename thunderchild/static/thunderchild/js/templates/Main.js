define("templates/models/AppModel",["jquery","lib/backbone"],function(){var e=Backbone.Model.extend({assetSelectionCallback:function(e){this.closeMediaChooserModal(),this.trigger("assetSelected",e)},selectedTemplate:function(e){return e&&this.set("selectedTemplate",e),this.get("selectedTemplate")},rootTemplateGroup:function(e){return e&&this.set("rootTemplateGroup",e),this.get("rootTemplateGroup")},openNewTemplateModal:function(e){this.trigger("openNewTemplateModal",e)},openNewTemplateGroupModal:function(){this.trigger("openNewTemplateGroupModal")},openEditTemplateGroupModal:function(e){this.trigger("openEditTemplateGroupModal",e)},openConfirmDeleteTemplateModal:function(){this.trigger("openConfirmDeleteTemplateModal")},openConfirmDeleteTemplateGroupModal:function(e){this.trigger("openConfirmDeleteTemplateGroupModal",e)},openMediaChooserModal:function(){this.trigger("openMediaChooserModal")},closeMediaChooserModal:function(){this.trigger("closeMediaChooserModal")}});return new e}),define("templates/views/ActionBarView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:".action-bar",initialize:function(){t.on("change:selectedTemplate",this.selectedTemplateChangeHandler,this)},events:{"click #create-templategroup-button":"createTemplateGroupClickHandler","click #delete-template-button":"deleteTemplateClickHandler","click #save-template-button":"saveTemplateClickHandler"},selectedTemplateChangeHandler:function(){var n=t.get("selectedTemplate");n.get("template_short_name")=="index"?e("#delete-template-button").addClass("disabled"):e("#delete-template-button").removeClass("disabled")},createTemplateGroupClickHandler:function(e){t.openNewTemplateGroupModal(),e.preventDefault()},deleteTemplateClickHandler:function(n){e("#delete-template-button").hasClass("disabled")||t.openConfirmDeleteTemplateModal(),n.preventDefault()},saveTemplateClickHandler:function(n){if(e("#save-template-button").hasClass("disabled"))return;e("#save-template-button").addClass("disabled"),templateModel=t.selectedTemplate(),templateModel.errors({}),templateModel.save({},{wait:!0,success:function(t,n){t.requiresSave(!1),e("#save-template-button").removeClass("disabled")},error:function(t,n){var r=e.parseJSON(n.responseText);templateModel.errors(r.errors),e("#save-template-button").removeClass("disabled")}}),n.preventDefault()}});return n}),define("templates/views/TemplatePreviewControlsView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:"#preview-link-holder",initialize:function(){t.on("change:selectedTemplate",this.selectedTemplateChangeHandler,this)},events:{"change .preview-url-parameters":"resetPreviewButtonHref"},resetPreviewButtonHref:function(){var t=e(".preview-url").text()+e(".preview-url-parameters").val();e("#preview-template-button").attr("href",t)},selectedTemplateChangeHandler:function(e,t){var n=t.get("template_short_name");templateGroupName=t.templateGroupModel().get("templategroup_short_name");if(templateGroupName=="root"&&n=="index")var r="";else if(templateGroupName=="root"&&n!=="index")var r=n;else if(n=="index")var r=templateGroupName+"/";else var r=templateGroupName+"/"+n;this.$el.find(".template-uid").text(r),this.resetPreviewButtonHref()}});return n}),define("templates/models/TemplateGroupModel",["jquery","lib/backbone"],function(e){var t=Backbone.Model.extend({urlRoot:templateGroupRoot,indexTemplateModel:function(e){return e&&(this._indexTemplateModel=e),this._indexTemplateModel}});return t}),define("templates/models/TemplateModel",["jquery","lib/backbone"],function(e){var t=Backbone.Model.extend({urlRoot:templateRoot,initialFetch:function(){this.fetch({success:_.bind(function(){this.trigger("initialFetchComplete")},this)})},templateGroupModel:function(e){return e&&(this._templateGroupModel=e),this._templateGroupModel},errors:function(e){return e&&(this._errors=e,this.trigger("errors",this._errors)),this._errors},requiresSave:function(e){if(e||e==0)this._requiresSave=e,this.trigger("requiresSave");return this._requiresSave},getMode:function(){switch(this.get("template_content_type")){case"text/html":return"ace/mode/html";case"text/css":return"ace/mode/css";case"application/javascript":return"ace/mode/javascript";case"application/json":return"ace/mode/json";case"application/rss+xml":return"ace/mode/xml";case"text/less":return"ace/mode/less";case"text/scss":return"ace/mode/scss";default:return"ace/mode/text"}}});return t}),define("templates/views/TemplateListItemView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({initialize:function(){t.on("change:selectedTemplate",this.selectedTemplateChangeHandler,this),this.model.on("destroy",this.modelDestroyHandler,this),this.model.on("change requiresSave",this.render,this)},events:{"click a":"clickHandler"},clickHandler:function(e){t.selectedTemplate(this.model),e.preventDefault()},selectedTemplateChangeHandler:function(){var e=t.get("selectedTemplate");e==this.model?(this.model.has("template_content")||this.model.initialFetch(),this.$el.addClass("active")):this.$el.removeClass("active")},modelDestroyHandler:function(){this.$el.remove()},render:function(){this.model.templateGroupModel().indexTemplateModel()==this.model?this.$el.find("a em").text(this.model.get("template_short_name")):this.$el.find("a").text(this.model.get("template_short_name")),this.model.requiresSave()?this.$el.addClass("unsaved"):this.$el.removeClass("unsaved")}});return n}),define("templates/models/TemplateCollection",["jquery","templates/models/TemplateModel","lib/backbone"],function(e,t){var n=Backbone.Collection.extend({model:t,url:templateRoot});return new n}),define("templates/views/TemplateGroupView",["jquery","templates/models/AppModel","templates/models/TemplateModel","templates/views/TemplateListItemView","templates/models/TemplateCollection","lib/backbone"],function(e,t,n,r,i){var s=Backbone.View.extend({initialize:function(){this.$el.find("ul.collapse > li").each(_.bind(function(t,s){var o=new n({id:e(s).attr("data-id"),templategroup:this.model.id,template_short_name:e.trim(e(s).text())});o.templateGroupModel(this.model),templateListItemView=new r({el:s,model:o}),i.add(o,{silent:!0}),o.get("template_short_name")=="index"&&this.model.indexTemplateModel(o)},this)),i.on("add",this.templateAddedHandler,this),this.model.on("destroy",this.destroyHandler,this),this.model.on("change",this.render,this)},events:{"click .new-template-button":"newTemplateButtonClickHandler","click .edit-templategroup-button":"editTemplateGroupButtonClickHandler"},newTemplateButtonClickHandler:function(e){t.openNewTemplateModal(this.model),e.stopPropagation(),e.preventDefault()},editTemplateGroupButtonClickHandler:function(e){t.openEditTemplateGroupModal(this.model),e.preventDefault(),e.stopPropagation()},sort:function(){this.$el.find("> ul > li").tsort(),this.$el.find("> ul").prepend(this.$el.find("[data-is-index=1]"))},templateAddedHandler:function(n){if(n.get("templategroup")==this.model.id){var i=e(_.template(e("#template-list-item-template").text(),n.toJSON()));this.$el.find("ul.collapse").prepend(i),this.sort();var s=new r({el:i,model:n});s.modelPopulated=!0,t.selectedTemplate(n)}},getIndexModel:function(){var e=i.where({templategroup:this.model.id});return _.find(e,function(e){return e.get("template_short_name")=="index"})},destroyHandler:function(){this.$el.remove()},render:function(){this.$el.find(".group-header h3").text(this.model.get("templategroup_short_name"))}});return s}),define("templates/models/TemplateGroupCollection",["jquery","templates/models/TemplateGroupModel","lib/backbone"],function(e,t){var n=Backbone.Collection.extend({model:t});return new n}),function(e){function a(e){return e&&e.toLowerCase?e.toLowerCase():e}function f(e,n){for(var r=0,i=e.length;r<i;r++)if(e[r]==n)return!t;return t}var t=!1,n=null,r=parseFloat,i=Math.min,s=/(-?\d+\.?\d*)$/g,o=[],u=[];e.tinysort={id:"TinySort",version:"1.4.29",copyright:"Copyright (c) 2008-2012 Ron Valstar",uri:"http://tinysort.sjeiti.com/",licensed:{MIT:"http://www.opensource.org/licenses/mit-license.php",GPL:"http://www.gnu.org/licenses/gpl.html"},plugin:function(e,t){o.push(e),u.push(t)},defaults:{order:"asc",attr:n,data:n,useVal:t,place:"start",returns:t,cases:t,forceStrings:t,sortFunction:n}},e.fn.extend({tinysort:function(l,c){l&&typeof l!="string"&&(c=l,l=n);var h=e.extend({},e.tinysort.defaults,c),p,d=this,v=e(this).length,m={},g=!!l&&l!="",y=h.attr!==n&&h.attr!="",b=h.data!==n,w=g&&l[0]==":",E=w?d.filter(l):d,S=h.sortFunction,x=h.order=="asc"?1:-1,T=[];e.each(o,function(e,t){t.call(t,h)}),S||(S=h.order=="rand"?function(){return Math.random()<.5?1:-1}:function(n,i){var o=t,f=h.cases?n.s:a(n.s),l=h.cases?i.s:a(i.s);if(!h.forceStrings){var c=f&&f.match(s),p=l&&l.match(s);if(c&&p){var d=f.substr(0,f.length-c[0].length),v=l.substr(0,l.length-p[0].length);d==v&&(o=!t,f=r(c[0]),l=r(p[0]))}}var m=x*(f<l?-1:f>l?1:0);return e.each(u,function(e,t){m=t.call(t,o,f,l,m)}),m}),d.each(function(t,n){var r=e(n),i=g?w?E.filter(n):r.find(l):r,s=b?""+i.data(h.data):y?i.attr(h.attr):h.useVal?i.val():i.text(),o=r.parent();m[o]||(m[o]={s:[],n:[]}),i.length>0?m[o].s.push({s:s,e:r,n:t}):m[o].n.push({e:r,n:t})});for(p in m)m[p].s.sort(S);for(p in m){var N=m[p],C=[],k=v,L=[0,0],A;switch(h.place){case"first":e.each(N.s,function(e,t){k=i(k,t.n)});break;case"org":e.each(N.s,function(e,t){C.push(t.n)});break;case"end":k=N.n.length;break;default:k=0}for(A=0;A<v;A++){var O=f(C,A)?!t:A>=k&&A<k+N.s.length,M=(O?N.s:N.n)[L[O?0:1]].e;M.parent().append(M),(O||!h.returns)&&T.push(M.get(0)),L[O?0:1]++}}return d.length=0,Array.prototype.push.apply(d,T),d}}),e.fn.TinySort=e.fn.Tinysort=e.fn.tsort=e.fn.tinysort}(jQuery),Array.prototype.indexOf||(Array.prototype.indexOf=function(e){var t=this.length,n=Number(arguments[1])||0;n=n<0?Math.ceil(n):Math.floor(n),n<0&&(n+=t);for(;n<t;n++)if(n in this&&this[n]===e)return n;return-1}),define("lib/jquery.tinysort",[],function(){}),define("templates/views/TemplateBrowserView",["jquery","templates/models/AppModel","templates/models/TemplateGroupModel","templates/views/TemplateGroupView","templates/models/TemplateGroupCollection","lib/backbone","lib/jquery.tinysort"],function(e,t,n,r,i){var s=Backbone.View.extend({el:"#template-browser",initialize:function(){this.$el.find("> ul > li").each(_.bind(function(s,o){var u=new n({id:parseInt(e(o).attr("data-id")),templategroup_short_name:e(o).find(".group-header h3").text()}),a=new r({el:o,model:u,collection:this.options.templateCollection});if(u.get("templategroup_short_name")=="root"){var f=a.getIndexModel();t.selectedTemplate(f),t.rootTemplateGroup(u)}i.add(u,{silent:!0})},this)),i.on("add",this.templateGroupAddHandler,this)},sort:function(){this.$el.find("> ul > li").tsort(".group-header h3"),this.$el.find("> ul").prepend(this.$el.find("ul > li .group-header h3:contains(root)").closest("li"))},templateGroupAddHandler:function(t){var n=e(_.template(e("#templategroup-list-item-template").text(),t.toJSON()));this.$el.find("> ul").prepend(n);var i=new r({el:n,model:t,collection:this.options.templateCollection});this.sort()}});return s}),define("templates/views/TemplateEditorView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:"#editor-pane",initialize:function(){this.editor=ace.edit("editor"),this.editor.setTheme("ace/theme/twilight"),this.editor.setShowPrintMargin(!1),this.editor.getSession().on("change",_.bind(this.editorChangeHandler,this)),this.setMode("ace/mode/html"),t.on("change:selectedTemplate",this.selectedTemplateChangeHandler,this),this.selectedTemplateChangeHandler(),e("#tabs").on("shown",_.bind(this.tabShownHandler,this)),this.ignoreEditorChange=!1,t.on("assetSelected",this.assetSelectedHandler,this)},events:{"click #media_chooser_button":"mediaChooserButtonClickHandler"},assetSelectedHandler:function(e){this.editor.insert(e.url)},mediaChooserButtonClickHandler:function(e){t.openMediaChooserModal(),e.preventDefault()},tabShownHandler:function(e){this.$el.hasClass("active")&&this.templateModel&&(this.setValue(this.templateModel.get("template_content")),this.getMode()!==this.templateModel.getMode()&&this.setMode(this.templateModel.getMode()))},editorChangeHandler:function(e){if(this.ignoreEditorChange)return;this.templateModel=t.get("selectedTemplate"),this.templateModel.requiresSave(!0),this.templateModel.set("template_content",this.editor.getSession().getValue())},selectedTemplateChangeHandler:function(){this.templateModel&&(this.templateModel.off("initialFetchComplete",this.initialFetchCompleteHandler,this),this.templateModel.off("change:template_content_type",this.contentTypeChangeHandler,this)),this.templateModel=t.get("selectedTemplate"),this.templateModel.on("initialFetchComplete",this.initialFetchCompleteHandler,this),this.templateModel.on("change:template_content_type",this.contentTypeChangeHandler,this),this.setValue(this.templateModel.get("template_content")),this.setMode(this.templateModel.getMode())},contentTypeChangeHandler:function(){this.setMode(this.templateModel.getMode())},setValue:function(e){this.ignoreEditorChange=!0,this.editor.getSession().clearAnnotations(),this.editor.getSession().setValue(e),this.ignoreEditorChange=!1},initialFetchCompleteHandler:function(){this.setValue(this.templateModel.get("template_content")),this.setMode(this.templateModel.getMode())},setMode:function(e){this.editor.getSession().setMode(e)},getMode:function(){this.editor.getSession().getMode().$id}});return n}),define("templates/views/SettingsView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:"#settings-pane",initialize:function(){t.on("change:selectedTemplate",this.selectedTemplateChangeHandler,this),this.selectedTemplateChangeHandler()},events:{"change :input":"inputChangeHander"},inputChangeHander:function(){if(this.templateModel){var t=this.$el.find("form").serializeObject();this.templateModel.set(t,{silent:!0}),this.templateModel.requiresSave(!0)}e("input:radio[name=template_is_private][value='True']").prop("checked")?e("#cache-timeout-group, #redirect-group, #redirect-url-group").hide():e("#cache-timeout-group, #redirect-group, #redirect-url-group").show()},selectedTemplateChangeHandler:function(){this.templateModel&&(this.templateModel.off("change",this.populateFromModel,this),this.templateModel.off("errors",this.renderErrors,this)),this.templateModel=t.get("selectedTemplate"),this.templateModel&&(this.templateModel.on("change",this.populateFromModel,this),this.templateModel.on("errors",this.renderErrors,this),this.populateFromModel()),this.removeErrors();var e=this.templateModel.errors();e&&this.renderErrors(e)},removeErrors:function(){this.$el.find(".alert").remove(),this.$el.find(".error").removeClass("error")},renderErrors:function(t){this.removeErrors();var n="";_.each(t,function(t,r){_.each(t,function(e,t){n+=_.template("<li><%= error %></li>",{error:e})}),e("#id_"+r).before(_.template(e("#form-error-template").text(),{errors:n})),e("#id_"+r).parent().addClass("error")})},populateFromModel:function(){this.templateModel.get("template_short_name")&&(e("#id_template_short_name").val(this.templateModel.get("template_short_name")),e("#id_template_content_type").val(this.templateModel.get("template_content_type")),e("#id_template_cache_timeout").val(this.templateModel.get("template_cache_timeout")),e("#id_template_redirect_type").val(this.templateModel.get("template_redirect_type")),e("#id_template_redirect_url").val(this.templateModel.get("template_redirect_url")),e("#id_templategroup").val(this.templateModel.get("templategroup")),this.templateModel.get("template_is_private")?(e("input:radio[name=template_is_private][value='True']").prop("checked",!0),e("input:radio[name=template_is_private][value='False']").prop("checked",!1),e("#cache-timeout-group, #redirect-group, #redirect-url-group").hide()):(e("input:radio[name=template_is_private][value='True']").prop("checked",!1),e("input:radio[name=template_is_private][value='False']").prop("checked",!0),e("#cache-timeout-group, #redirect-group, #redirect-url-group").show()),this.templateModel.get("template_short_name")=="index"?e("#id_template_short_name").parent().parent().hide():e("#id_template_short_name").parent().parent().show())}});return n}),$.fn.serializeObject=function(){var e={},t=this.serializeArray();return $.each(t,function(){e[this.name]!==undefined?(e[this.name].push||(e[this.name]=[e[this.name]]),e[this.name].push(this.value||"")):e[this.name]=this.value||""}),e},define("lib/jquery.serialize-object",[],function(){}),define("templates/views/NewTemplateModalView",["jquery","templates/models/AppModel","templates/models/TemplateModel","templates/models/TemplateCollection","lib/backbone","lib/jquery.serialize-object"],function(e,t,n,r){var i=Backbone.View.extend({el:"#create-template-modal",initialize:function(){t.on("openNewTemplateModal",this.open,this)},events:{"click #create-template-button":"createTemplateButtonClickHandler","keypress input":"inputKeyPressHandler"},inputKeyPressHandler:function(e){e.which==13&&(this.createTemplateButtonClickHandler(),e.preventDefault())},open:function(t){this.templateGroupModel=t,e("#id2_templategroup").val(t.id),this.removeErrors(),this.$el.find("form").each(function(){this.reset()}),e("#id2_template_is_private_0").prop("checked",!0),this.$el.modal("show"),e("#id2_template_short_name").focus()},removeErrors:function(){this.$el.find(".alert").remove(),this.$el.find(".error").removeClass("error")},close:function(){this.$el.modal("hide")},createTemplateButtonClickHandler:function(t){var i=this.$el.find("form").serializeObject();i.template_cache_timeout=0,this.temp_model=new n(i),this.temp_model.save({},{success:_.bind(function(e,t){e.templateGroupModel(this.templateGroupModel),r.add(e),this.close()},this),error:_.bind(function(t,n){this.removeErrors();if(n.status==400){var r=e.parseJSON(n.responseText),i="";_.each(r.errors,function(t,n){_.each(t,function(e,t){i+=_.template("<li><%= error %></li>",{error:e})}),e("#id2_"+n).before(_.template(e("#form-error-template").text(),{errors:i})),e("#id2_"+n).parent().addClass("error")})}},this)}),t&&t.preventDefault()}});return i}),define("templates/views/ConfirmDeleteTemplateModalView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:"#delete-template-modal",initialize:function(){t.on("openConfirmDeleteTemplateModal",this.open,this)},events:{"click #confirm-delete-template-button":"confirmDeleteHandler"},open:function(){this.$el.modal("show")},close:function(){this.$el.modal("hide")},confirmDeleteHandler:function(e){var n=t.get("selectedTemplate");n.destroy(),this.close(),t.selectedTemplate(n.templateGroupModel().indexTemplateModel()),e.preventDefault()}});return n}),define("templates/views/MediaChooserModalView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:"#media_chooser_modal",initialize:function(){t.on("openMediaChooserModal",this.open,this),t.on("closeMediaChooserModal",this.close,this)},open:function(){this.$el.modal("show")},close:function(){this.$el.modal("hide")}});return n}),define("templates/views/NewTemplateGroupModalView",["jquery","templates/models/AppModel","templates/models/TemplateGroupModel","templates/models/TemplateModel","templates/models/TemplateCollection","templates/models/TemplateGroupCollection","lib/backbone"],function(e,t,n,r,i,s){var o=Backbone.View.extend({el:"#create-templategroup-modal",initialize:function(){t.on("openNewTemplateGroupModal",this.open,this)},events:{"click #create-templategroup-button":"createTemplateGroupButtonClickHandler","keypress input":"inputKeyPressHandler"},inputKeyPressHandler:function(e){e.which==13&&(this.createTemplateGroupButtonClickHandler(),e.preventDefault())},open:function(){this.removeErrors(),this.$el.find("form").each(function(){this.reset()}),this.$el.modal("show"),e("#id_templategroup_short_name").focus()},removeErrors:function(){this.$el.find(".alert").remove(),this.$el.find(".error").removeClass("error")},close:function(){this.$el.modal("hide")},createTemplateGroupButtonClickHandler:function(o){var u=this.$el.find("form").serializeObject();e.post(templateGroupRoot,JSON.stringify(u),_.bind(function(e,o,u){if(u.status==200){var a=new n(e.templategroup),f=new r(e.template);f.templateGroupModel(a),a.indexTemplateModel(f),s.add(a),i.add(f),t.selectedTemplate(f),this.close()}},this),"json").error(_.bind(function(t){this.removeErrors(),t.status==400&&(resp=e.parseJSON(t.responseText),errors_html="",_.each(resp.errors,function(t,n){_.each(t,function(e,t){errors_html+=_.template("<li><%= error %></li>",{error:e})}),e("#id_"+n).before(_.template(e("#form-error-template").text(),{errors:errors_html})),e("#id_"+n).parent().addClass("error")}))},this)),o&&o.preventDefault()}});return o}),define("templates/views/EditTemplateGroupModalView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:"#edit-templategroup-modal",initialize:function(){t.on("openEditTemplateGroupModal",this.open,this)},events:{"click #save-templategroup-button":"saveTemplateGroupButtonClickHandler","click #delete-templategroup-button":"deleteTemplateGroupButtonClickHandler","keypress input":"inputKeyPressHandler"},inputKeyPressHandler:function(e){e.which==13&&(this.saveTemplateGroupButtonClickHandler(),e.preventDefault())},open:function(t){this.templateGroupModel=t,this.removeErrors(),this.$el.find("form").each(function(){this.reset()}),this.$el.modal("show"),e("#id2_templategroup_short_name").val(this.templateGroupModel.get("templategroup_short_name")).focus()},removeErrors:function(){this.$el.find(".alert").remove(),this.$el.find(".error").removeClass("error")},close:function(){this.$el.modal("hide")},saveTemplateGroupButtonClickHandler:function(t){var n=this.$el.find("form").serializeObject();if(n.templategroup_short_name==this.templateGroupModel.get("templategroup_short_name")){this.close();return}this.templateGroupModel.save(n,{wait:!0,success:_.bind(function(){this.close()},this),error:_.bind(function(t,n){this.removeErrors();if(n.status==400){var r=e.parseJSON(n.responseText),i="";_.each(r.errors,function(t,n){_.each(t,function(e,t){i+=_.template("<li><%= error %></li>",{error:e})}),e("#id2_"+n).before(_.template(e("#form-error-template").text(),{errors:i})),e("#id2_"+n).parent().addClass("error")})}},this)}),t&&t.preventDefault()},deleteTemplateGroupButtonClickHandler:function(e){this.close(),t.openConfirmDeleteTemplateGroupModal(this.templateGroupModel),e.preventDefault()}});return n}),define("templates/views/ConfirmDeleteTemplateGroupModalView",["jquery","templates/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({el:"#delete-templategroup-modal",initialize:function(){t.on("openConfirmDeleteTemplateGroupModal",this.open,this)},events:{"click #confirm-delete-templategroup-button":"confirmDeleteHandler"},open:function(e){this.templateGroupModel=e,this.$el.modal("show")},close:function(){this.$el.modal("hide")},confirmDeleteHandler:function(e){this.templateGroupModel.destroy(),this.close(),t.selectedTemplate(t.rootTemplateGroup().indexTemplateModel()),e.preventDefault()}});return n}),define("templates/views/AppView",["jquery","templates/views/ActionBarView","templates/views/TemplatePreviewControlsView","templates/views/TemplateBrowserView","templates/views/TemplateEditorView","templates/views/SettingsView","templates/views/NewTemplateModalView","templates/views/ConfirmDeleteTemplateModalView","templates/views/MediaChooserModalView","templates/views/NewTemplateGroupModalView","templates/views/EditTemplateGroupModalView","templates/views/ConfirmDeleteTemplateGroupModalView","lib/backbone","lib/bootstrap"],function(e,t,n,r,i,s,o,u,a,f,l,c){var h=Backbone.View.extend({el:window,initialize:function(){var h=new t,p=new n,d=new r,v=new i,m=new s,g=new o,y=new u,b=new a,w=new f,E=new l,S=new c;e("#tabs a").click(this.tabClickHandler),e("#tabs a:first").tab("show")},tabClickHandler:function(t){e(this).tab("show"),t.preventDefault()}});return h}),requirejs(["jquery","templates/models/AppModel","templates/views/AppView","lib/log"],function(e,t,n){e(function(){window.appModel=t;var e=new n})}),define("templates/Main",[],function(){})