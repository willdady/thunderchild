(function() {
  var ActionBarView, AppModel, ConfirmDeleteTemplateGroupModalView, ConfirmDeleteTemplateModalView, EditTemplateGroupModalView, MediaChooserModalView, NewTemplateGroupModalView, NewTemplateModalView, SettingsView, TemplateBrowserView, TemplateCollection, TemplateEditorView, TemplateGroupCollection, TemplateGroupModel, TemplateGroupView, TemplateListItemView, TemplateModel, TemplatePreviewControlsView;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  AppModel = Backbone.Model.extend({
    assetSelectionCallback: function(obj) {
      this.closeMediaChooserModal();
      return this.trigger("assetSelected", obj);
    },
    selectedTemplate: function(model) {
      if (model) {
        this.set("selectedTemplate", model);
      }
      return this.get("selectedTemplate");
    },
    rootTemplateGroup: function(model) {
      if (model) {
        this.set("rootTemplateGroup", model);
      }
      return this.get("rootTemplateGroup");
    },
    openNewTemplateModal: function(templateGroupModel) {
      return this.trigger("openNewTemplateModal", templateGroupModel);
    },
    openNewTemplateGroupModal: function() {
      return this.trigger("openNewTemplateGroupModal");
    },
    openEditTemplateGroupModal: function(templateGroupModel) {
      return this.trigger("openEditTemplateGroupModal", templateGroupModel);
    },
    openConfirmDeleteTemplateModal: function() {
      return this.trigger("openConfirmDeleteTemplateModal");
    },
    openConfirmDeleteTemplateGroupModal: function(templateGroupModel) {
      return this.trigger("openConfirmDeleteTemplateGroupModal", templateGroupModel);
    },
    openMediaChooserModal: function() {
      return this.trigger("openMediaChooserModal");
    },
    closeMediaChooserModal: function() {
      return this.trigger("closeMediaChooserModal");
    }
  });
  TemplateGroupModel = Backbone.Model.extend({
    urlRoot: templateGroupRoot,
    indexTemplateModel: function(model) {
      if (model) {
        this._indexTemplateModel = model;
      }
      return this._indexTemplateModel;
    }
  });
  TemplateModel = Backbone.Model.extend({
    urlRoot: templateRoot,
    initialFetch: function() {
      return this.fetch({
        success: __bind(function() {
          return this.trigger("initialFetchComplete");
        }, this)
      });
    },
    templateGroupModel: function(model) {
      if (model) {
        this._templateGroupModel = model;
      }
      return this._templateGroupModel;
    },
    errors: function(obj) {
      if (obj) {
        this._errors = obj;
        this.trigger("errors", this._errors);
      }
      return this._errors;
    },
    requiresSave: function(bool) {
      if (bool || bool === false) {
        this._requiresSave = bool;
        this.trigger("requiresSave");
      }
      return this._requiresSave;
    },
    getMode: function() {
      switch (this.get("template_content_type")) {
        case "text/html":
        case "text/xhtml+xml":
          return "ace/mode/html";
        case "text/css":
          return "ace/mode/css";
        case "application/javascript":
          return "ace/mode/javascript";
        case "application/json":
          return "ace/mode/json";
        case "application/rss+xml":
        case "application/atom+xml":
        case "text/xml":
        case "application/soap+xml":
          return "ace/mode/xml";
        case "text/less":
          return "ace/mode/less";
        case "text/scss":
          return "ace/mode/scss";
        default:
          return "ace/mode/text";
      }
    }
  });
  TemplateCollection = Backbone.Collection.extend({
    model: TemplateModel,
    url: templateRoot
  });
  TemplateGroupCollection = Backbone.Collection.extend({
    model: TemplateGroupModel
  });
  ActionBarView = Backbone.View.extend({
    initialize: function() {
      return this.model.on("change:selectedTemplate", this.selectedTemplateChangeHandler, this);
    },
    events: {
      "click #create-templategroup-button": "createTemplateGroupClickHandler",
      "click #delete-template-button": "deleteTemplateClickHandler",
      "click #save-template-button": "saveTemplateClickHandler"
    },
    selectedTemplateChangeHandler: function() {
      var selectedTemplate;
      selectedTemplate = this.model.get("selectedTemplate");
      if (selectedTemplate.get("template_short_name") === "index") {
        return $("#delete-template-button").addClass("disabled");
      } else {
        return $("#delete-template-button").removeClass("disabled");
      }
    },
    createTemplateGroupClickHandler: function(e) {
      this.model.openNewTemplateGroupModal();
      return e.preventDefault();
    },
    deleteTemplateClickHandler: function(e) {
      if (!$("#delete-template-button").hasClass("disabled")) {
        this.model.openConfirmDeleteTemplateModal();
      }
      return e.preventDefault();
    },
    saveTemplateClickHandler: function(e) {
      var templateModel;
      if ($("#save-template-button").hasClass("disabled")) {
        return;
      }
      $("#save-template-button").addClass("disabled");
      templateModel = this.model.selectedTemplate();
      templateModel.errors({});
      templateModel.save({}, {
        wait: true,
        success: function(model, response) {
          model.requiresSave(false);
          return $("#save-template-button").removeClass("disabled");
        },
        error: function(model, response) {
          var resp;
          resp = $.parseJSON(response.responseText);
          templateModel.errors(resp.errors);
          return $("#save-template-button").removeClass("disabled");
        }
      });
      return e.preventDefault();
    }
  });
  TemplatePreviewControlsView = Backbone.View.extend({
    initialize: function() {
      return this.model.on("change:selectedTemplate", this.selectedTemplateChangeHandler, this);
    },
    events: {
      "change .preview-url-parameters": "resetPreviewButtonHref"
    },
    resetPreviewButtonHref: function() {
      var url;
      url = $(".preview-url").text() + $(".preview-url-parameters").val();
      return $("#preview-template-button").attr("href", url);
    },
    selectedTemplateChangeHandler: function(model, templateModel) {
      var templateGroupName, templateName, templateUID;
      templateName = templateModel.get("template_short_name");
      templateGroupName = templateModel.templateGroupModel().get("templategroup_short_name");
      if (templateGroupName === 'root' && templateName === 'index') {
        templateUID = '';
      } else if (templateGroupName === 'root' && templateName !== 'index') {
        templateUID = templateName;
      } else if (templateName === 'index') {
        templateUID = "" + templateGroupName + "/";
      } else {
        templateUID = "" + templateGroupName + "/" + templateName;
      }
      this.$el.find(".template-uid").text(templateUID);
      return this.resetPreviewButtonHref();
    }
  });
  TemplateBrowserView = Backbone.View.extend({
    initialize: function() {
      this.$el.find("> ul > li").each(__bind(function(i, el) {
        var indexModel, model, templategroup;
        model = new TemplateGroupModel({
          id: parseInt($(el).attr("data-id")),
          templategroup_short_name: $(el).find(".group-header h3").text()
        });
        templategroup = new TemplateGroupView({
          el: el,
          model: model,
          collection: this.options.templateCollection,
          appModel: this.model
        });
        if (model.get("templategroup_short_name") === 'root') {
          indexModel = templategroup.getIndexModel();
          this.model.selectedTemplate(indexModel);
          this.model.rootTemplateGroup(model);
        }
        return this.options.templateGroupCollection.add(model, {
          silent: true
        });
      }, this));
      return this.options.templateGroupCollection.on("add", this.templateGroupAddHandler, this);
    },
    sort: function() {
      this.$el.find("> ul > li").tsort(".group-header h3");
      return this.$el.find("> ul").prepend(this.$el.find("ul > li .group-header h3:contains(root)").closest("li"));
    },
    templateGroupAddHandler: function(model) {
      var templategroup, templategroup_element;
      templategroup_element = $(_.template($("#templategroup-list-item-template").text(), model.toJSON()));
      this.$el.find("> ul").prepend(templategroup_element);
      templategroup = new TemplateGroupView({
        el: templategroup_element,
        model: model,
        collection: this.options.templateCollection,
        appModel: this.model
      });
      return this.sort();
    }
  });
  TemplateGroupView = Backbone.View.extend({
    initialize: function() {
      this.$el.find("ul.collapse > li").each(__bind(function(i, el) {
        var model, templateListItemView;
        model = new TemplateModel({
          id: $(el).attr("data-id"),
          templategroup: this.model.id,
          template_short_name: $.trim($(el).text())
        });
        model.templateGroupModel(this.model);
        templateListItemView = new TemplateListItemView({
          el: el,
          model: model,
          appModel: this.options.appModel
        });
        this.collection.add(model, {
          silent: true
        });
        if (model.get("template_short_name") === "index") {
          return this.model.indexTemplateModel(model);
        }
      }, this));
      this.collection.on("add", this.templateAddedHandler, this);
      this.model.on("destroy", this.destroyHandler, this);
      return this.model.on("change", this.render, this);
    },
    events: {
      "click .new-template-button": "newTemplateButtonClickHandler",
      "click .edit-templategroup-button": "editTemplateGroupButtonClickHandler"
    },
    newTemplateButtonClickHandler: function(e) {
      this.options.appModel.openNewTemplateModal(this.model);
      e.stopPropagation();
      return e.preventDefault();
    },
    editTemplateGroupButtonClickHandler: function(e) {
      this.options.appModel.openEditTemplateGroupModal(this.model);
      e.preventDefault();
      return e.stopPropagation();
    },
    sort: function() {
      this.$el.find("> ul > li").tsort();
      return this.$el.find("> ul").prepend(this.$el.find("[data-is-index=1]"));
    },
    templateAddedHandler: function(templateModel) {
      var el, templateView;
      if (templateModel.get("templategroup") === this.model.id) {
        el = $(_.template($("#template-list-item-template").text(), templateModel.toJSON()));
        this.$el.find("ul.collapse").prepend(el);
        this.sort();
        templateView = new TemplateListItemView({
          el: el,
          model: templateModel,
          appModel: this.options.appModel
        });
        templateView.modelPopulated = true;
        return this.options.appModel.selectedTemplate(templateModel);
      }
    },
    getIndexModel: function() {
      var templates;
      templates = this.collection.where({
        templategroup: this.model.id
      });
      return _.find(templates, function(model) {
        return model.get("template_short_name") === 'index';
      });
    },
    destroyHandler: function() {
      return this.$el.remove();
    },
    render: function() {
      return this.$el.find(".group-header h3").text(this.model.get("templategroup_short_name"));
    }
  });
  TemplateListItemView = Backbone.View.extend({
    initialize: function() {
      this.options.appModel.on("change:selectedTemplate", this.selectedTemplateChangeHandler, this);
      this.model.on("destroy", this.modelDestroyHandler, this);
      return this.model.on("change requiresSave", this.render, this);
    },
    events: {
      'click a': 'clickHandler'
    },
    clickHandler: function(e) {
      this.options.appModel.selectedTemplate(this.model);
      return e.preventDefault();
    },
    selectedTemplateChangeHandler: function() {
      var model;
      model = this.options.appModel.get("selectedTemplate");
      if (model === this.model) {
        if (!this.model.has("template_content")) {
          this.model.initialFetch();
        }
        return this.$el.addClass("active");
      } else {
        return this.$el.removeClass("active");
      }
    },
    modelDestroyHandler: function() {
      return this.$el.remove();
    },
    render: function() {
      if (this.model.templateGroupModel().indexTemplateModel() === this.model) {
        this.$el.find("a em").text(this.model.get("template_short_name"));
      } else {
        this.$el.find("a").text(this.model.get("template_short_name"));
      }
      if (this.model.requiresSave()) {
        return this.$el.addClass("unsaved");
      } else {
        return this.$el.removeClass("unsaved");
      }
    }
  });
  TemplateEditorView = Backbone.View.extend({
    initialize: function() {
      this.editor = ace.edit("editor");
      this.editor.setTheme("ace/theme/twilight");
      this.editor.setShowPrintMargin(false);
      this.editor.getSession().on("change", _.bind(this.editorChangeHandler, this));
      this.setMode("ace/mode/html");
      this.model.on("change:selectedTemplate", this.selectedTemplateChangeHandler, this);
      this.selectedTemplateChangeHandler();
      $("#tabs").on("shown", _.bind(this.tabShownHandler, this));
      this.ignoreEditorChange = false;
      return this.model.on("assetSelected", this.assetSelectedHandler, this);
    },
    events: {
      "click #media_chooser_button": "mediaChooserButtonClickHandler"
    },
    assetSelectedHandler: function(obj) {
      log("ASSET SELECTED", obj);
      return this.editor.insert(obj.url);
    },
    mediaChooserButtonClickHandler: function(e) {
      this.model.openMediaChooserModal();
      return e.preventDefault();
    },
    tabShownHandler: function(e) {
      if (this.$el.hasClass("active") && this.templateModel) {
        this.setValue(this.templateModel.get("template_content"));
        if (this.getMode() !== this.templateModel.getMode()) {
          return this.setMode(this.templateModel.getMode());
        }
      }
    },
    editorChangeHandler: function(e) {
      if (this.ignoreEditorChange) {
        return;
      }
      this.templateModel = this.model.get("selectedTemplate");
      this.templateModel.requiresSave(true);
      return this.templateModel.set("template_content", this.editor.getSession().getValue());
    },
    selectedTemplateChangeHandler: function() {
      if (this.templateModel) {
        this.templateModel.off("initialFetchComplete", this.initialFetchCompleteHandler, this);
        this.templateModel.off("change:template_content_type", this.contentTypeChangeHandler, this);
      }
      this.templateModel = this.model.get("selectedTemplate");
      this.templateModel.on("initialFetchComplete", this.initialFetchCompleteHandler, this);
      this.templateModel.on("change:template_content_type", this.contentTypeChangeHandler, this);
      this.setValue(this.templateModel.get("template_content"));
      return this.setMode(this.templateModel.getMode());
    },
    contentTypeChangeHandler: function() {
      return this.setMode(this.templateModel.getMode());
    },
    setValue: function(value) {
      this.ignoreEditorChange = true;
      this.editor.getSession().clearAnnotations();
      this.editor.getSession().setValue(value);
      return this.ignoreEditorChange = false;
    },
    initialFetchCompleteHandler: function() {
      this.setValue(this.templateModel.get("template_content"));
      return this.setMode(this.templateModel.getMode());
    },
    setMode: function(mode) {
      return this.editor.getSession().setMode(mode);
    },
    getMode: function() {
      return this.editor.getSession().getMode().$id;
    }
  });
  SettingsView = Backbone.View.extend({
    initialize: function() {
      this.model.on("change:selectedTemplate", this.selectedTemplateChangeHandler, this);
      return this.selectedTemplateChangeHandler();
    },
    events: {
      "change :input": "inputChangeHander"
    },
    inputChangeHander: function() {
      var formData;
      if (this.templateModel) {
        formData = this.$el.find("form").serializeObject();
        this.templateModel.set(formData, {
          silent: true
        });
        this.templateModel.requiresSave(true);
      }
      if ($("input:radio[name=template_is_private][value='True']").prop("checked")) {
        return $("#cache-timeout-group, #redirect-group, #redirect-url-group").hide();
      } else {
        return $("#cache-timeout-group, #redirect-group, #redirect-url-group").show();
      }
    },
    selectedTemplateChangeHandler: function() {
      var errors;
      if (this.templateModel) {
        this.templateModel.off("change", this.populateFromModel, this);
        this.templateModel.off("errors", this.renderErrors, this);
      }
      this.templateModel = this.model.get("selectedTemplate");
      if (this.templateModel) {
        this.templateModel.on("change", this.populateFromModel, this);
        this.templateModel.on("errors", this.renderErrors, this);
        this.populateFromModel();
      }
      this.removeErrors();
      errors = this.templateModel.errors();
      if (errors) {
        return this.renderErrors(errors);
      }
    },
    removeErrors: function() {
      this.$el.find(".alert").remove();
      return this.$el.find(".error").removeClass("error");
    },
    renderErrors: function(errors) {
      var errors_html;
      this.removeErrors();
      errors_html = '';
      return _.each(errors, function(value, key) {
        _.each(value, function(el, i) {
          return errors_html += _.template("<li><%= error %></li>", {
            error: el
          });
        });
        $("#id_" + key).before(_.template($("#form-error-template").text(), {
          errors: errors_html
        }));
        return $("#id_" + key).parent().addClass("error");
      });
    },
    populateFromModel: function() {
      if (this.templateModel.get("template_short_name")) {
        $("#id_template_short_name").val(this.templateModel.get("template_short_name"));
        $("#id_template_content_type").val(this.templateModel.get("template_content_type"));
        $("#id_template_cache_timeout").val(this.templateModel.get("template_cache_timeout"));
        $("#id_template_redirect_type").val(this.templateModel.get("template_redirect_type"));
        $("#id_template_redirect_url").val(this.templateModel.get("template_redirect_url"));
        $("#id_templategroup").val(this.templateModel.get("templategroup"));
        if (this.templateModel.get("template_is_private")) {
          $("input:radio[name=template_is_private][value='True']").prop("checked", true);
          $("input:radio[name=template_is_private][value='False']").prop("checked", false);
          $("#cache-timeout-group, #redirect-group, #redirect-url-group").hide();
        } else {
          $("input:radio[name=template_is_private][value='True']").prop("checked", false);
          $("input:radio[name=template_is_private][value='False']").prop("checked", true);
          $("#cache-timeout-group, #redirect-group, #redirect-url-group").show();
        }
        if (this.templateModel.get("template_short_name") === 'index') {
          return $("#id_template_short_name").parent().parent().hide();
        } else {
          return $("#id_template_short_name").parent().parent().show();
        }
      }
    }
  });
  MediaChooserModalView = Backbone.View.extend({
    initialize: function() {
      this.model.on("openMediaChooserModal", this.open, this);
      return this.model.on("closeMediaChooserModal", this.close, this);
    },
    open: function() {
      return this.$el.modal("show");
    },
    close: function() {
      return this.$el.modal("hide");
    }
  });
  ConfirmDeleteTemplateModalView = Backbone.View.extend({
    initialize: function() {
      return this.model.on("openConfirmDeleteTemplateModal", this.open, this);
    },
    events: {
      "click #confirm-delete-template-button": "confirmDeleteHandler"
    },
    open: function() {
      return this.$el.modal("show");
    },
    close: function() {
      return this.$el.modal("hide");
    },
    confirmDeleteHandler: function(e) {
      var templateModel;
      templateModel = this.model.get("selectedTemplate");
      templateModel.destroy();
      this.close();
      this.model.selectedTemplate(templateModel.templateGroupModel().indexTemplateModel());
      return e.preventDefault();
    }
  });
  NewTemplateModalView = Backbone.View.extend({
    initialize: function() {
      return this.model.on("openNewTemplateModal", this.open, this);
    },
    events: {
      "click #create-template-button": "createTemplateButtonClickHandler",
      "keypress input": "inputKeyPressHandler"
    },
    inputKeyPressHandler: function(e) {
      if (e.which === 13) {
        this.createTemplateButtonClickHandler();
        return e.preventDefault();
      }
    },
    open: function(templateGroupModel) {
      this.templateGroupModel = templateGroupModel;
      $("#id2_templategroup").val(templateGroupModel.id);
      this.removeErrors();
      this.$el.find("form").each(function() {
        return this.reset();
      });
      $("#id2_template_is_private_0").prop("checked", true);
      this.$el.modal("show");
      return $("#id2_template_short_name").focus();
    },
    removeErrors: function() {
      this.$el.find(".alert").remove();
      return this.$el.find(".error").removeClass("error");
    },
    close: function() {
      return this.$el.modal("hide");
    },
    createTemplateButtonClickHandler: function(e) {
      var formData;
      formData = this.$el.find("form").serializeObject();
      formData.template_cache_timeout = 0;
      this.temp_model = new TemplateModel(formData);
      this.temp_model.save({}, {
        success: __bind(function(model, response) {
          model.templateGroupModel(this.templateGroupModel);
          this.collection.add(model);
          return this.close();
        }, this),
        error: __bind(function(model, response) {
          var errors_html, resp;
          this.removeErrors();
          if (response.status === 400) {
            resp = $.parseJSON(response.responseText);
            errors_html = '';
            return _.each(resp.errors, function(value, key) {
              _.each(value, function(el, i) {
                return errors_html += _.template("<li><%= error %></li>", {
                  error: el
                });
              });
              $("#id2_" + key).before(_.template($("#form-error-template").text(), {
                errors: errors_html
              }));
              return $("#id2_" + key).parent().addClass("error");
            });
          }
        }, this)
      });
      if (e) {
        return e.preventDefault();
      }
    }
  });
  NewTemplateGroupModalView = Backbone.View.extend({
    initialize: function() {
      return this.model.on("openNewTemplateGroupModal", this.open, this);
    },
    events: {
      "click #create-templategroup-button": "createTemplateGroupButtonClickHandler",
      "keypress input": "inputKeyPressHandler"
    },
    inputKeyPressHandler: function(e) {
      if (e.which === 13) {
        this.createTemplateGroupButtonClickHandler();
        return e.preventDefault();
      }
    },
    open: function() {
      this.removeErrors();
      this.$el.find("form").each(function() {
        return this.reset();
      });
      this.$el.modal("show");
      return $("#id_templategroup_short_name").focus();
    },
    removeErrors: function() {
      this.$el.find(".alert").remove();
      return this.$el.find(".error").removeClass("error");
    },
    close: function() {
      return this.$el.modal("hide");
    },
    createTemplateGroupButtonClickHandler: function(e) {
      var formData;
      formData = this.$el.find("form").serializeObject();
      $.post(templateGroupRoot, JSON.stringify(formData), __bind(function(data, textStatus, jqXHR) {
        var template_model, templategroup_model;
        if (jqXHR.status === 200) {
          templategroup_model = new TemplateGroupModel(data.templategroup);
          template_model = new TemplateModel(data.template);
          template_model.templateGroupModel(templategroup_model);
          templategroup_model.indexTemplateModel(template_model);
          this.options.templateGroupCollection.add(templategroup_model);
          this.options.templateCollection.add(template_model);
          this.model.selectedTemplate(template_model);
          return this.close();
        }
      }, this), "json").error(__bind(function(jqXHR) {
        var errors_html, resp;
        this.removeErrors();
        if (jqXHR.status === 400) {
          resp = $.parseJSON(jqXHR.responseText);
          errors_html = '';
          return _.each(resp.errors, function(value, key) {
            _.each(value, function(el, i) {
              return errors_html += _.template("<li><%= error %></li>", {
                error: el
              });
            });
            $("#id_" + key).before(_.template($("#form-error-template").text(), {
              errors: errors_html
            }));
            return $("#id_" + key).parent().addClass("error");
          });
        }
      }, this));
      if (e) {
        return e.preventDefault();
      }
    }
  });
  EditTemplateGroupModalView = Backbone.View.extend({
    initialize: function() {
      return this.model.on("openEditTemplateGroupModal", this.open, this);
    },
    events: {
      "click #save-templategroup-button": "saveTemplateGroupButtonClickHandler",
      "click #delete-templategroup-button": "deleteTemplateGroupButtonClickHandler",
      "keypress input": "inputKeyPressHandler"
    },
    inputKeyPressHandler: function(e) {
      if (e.which === 13) {
        this.saveTemplateGroupButtonClickHandler();
        return e.preventDefault();
      }
    },
    open: function(templateGroupModel) {
      this.templateGroupModel = templateGroupModel;
      this.removeErrors();
      this.$el.find("form").each(function() {
        return this.reset();
      });
      this.$el.modal("show");
      return $("#id2_templategroup_short_name").val(this.templateGroupModel.get("templategroup_short_name")).focus();
    },
    removeErrors: function() {
      this.$el.find(".alert").remove();
      return this.$el.find(".error").removeClass("error");
    },
    close: function() {
      return this.$el.modal("hide");
    },
    saveTemplateGroupButtonClickHandler: function(e) {
      var formData;
      formData = this.$el.find("form").serializeObject();
      if (formData.templategroup_short_name === this.templateGroupModel.get("templategroup_short_name")) {
        this.close();
        return;
      }
      this.templateGroupModel.save(formData, {
        wait: true,
        success: __bind(function() {
          return this.close();
        }, this),
        error: __bind(function(model, response) {
          var errors_html, resp;
          this.removeErrors();
          if (response.status === 400) {
            resp = $.parseJSON(response.responseText);
            errors_html = '';
            return _.each(resp.errors, function(value, key) {
              _.each(value, function(el, i) {
                return errors_html += _.template("<li><%= error %></li>", {
                  error: el
                });
              });
              $("#id2_" + key).before(_.template($("#form-error-template").text(), {
                errors: errors_html
              }));
              return $("#id2_" + key).parent().addClass("error");
            });
          }
        }, this)
      });
      if (e) {
        return e.preventDefault();
      }
    },
    deleteTemplateGroupButtonClickHandler: function(e) {
      this.close();
      this.model.openConfirmDeleteTemplateGroupModal(this.templateGroupModel);
      return e.preventDefault();
    }
  });
  ConfirmDeleteTemplateGroupModalView = Backbone.View.extend({
    initialize: function() {
      return this.model.on("openConfirmDeleteTemplateGroupModal", this.open, this);
    },
    events: {
      "click #confirm-delete-templategroup-button": "confirmDeleteHandler"
    },
    open: function(templateGroupModel) {
      this.templateGroupModel = templateGroupModel;
      return this.$el.modal("show");
    },
    close: function() {
      return this.$el.modal("hide");
    },
    confirmDeleteHandler: function(e) {
      this.templateGroupModel.destroy();
      this.close();
      this.model.selectedTemplate(this.model.rootTemplateGroup().indexTemplateModel());
      return e.preventDefault();
    }
  });
  $(function() {
    var actionBarView, confirmDeleteTemplateGroupModal, confirmDeleteTemplateModal, editTemplateGroupModal, mediaChooserModal, newTemplateGroupModal, newTemplateModal, settingsView, templateBrowserView, templateCollection, templateEditorView, templateGroupCollection, templatePreviewControlsView;
    window.appModel = new AppModel();
    templateCollection = new TemplateCollection();
    templateGroupCollection = new TemplateGroupCollection();
    actionBarView = new ActionBarView({
      el: $(".action-bar"),
      model: window.appModel
    });
    templatePreviewControlsView = new TemplatePreviewControlsView({
      el: $("#preview-link-holder"),
      model: window.appModel
    });
    templateBrowserView = new TemplateBrowserView({
      el: $("#template-browser"),
      model: window.appModel,
      templateCollection: templateCollection,
      templateGroupCollection: templateGroupCollection
    });
    templateEditorView = new TemplateEditorView({
      el: $("#editor-pane"),
      model: window.appModel
    });
    settingsView = new SettingsView({
      el: $("#settings-pane"),
      model: window.appModel
    });
    newTemplateModal = new NewTemplateModalView({
      el: $("#create-template-modal"),
      model: window.appModel,
      collection: templateCollection
    });
    confirmDeleteTemplateModal = new ConfirmDeleteTemplateModalView({
      el: $("#delete-template-modal"),
      model: window.appModel
    });
    mediaChooserModal = new MediaChooserModalView({
      el: $("#media_chooser_modal"),
      model: window.appModel
    });
    newTemplateGroupModal = new NewTemplateGroupModalView({
      el: $("#create-templategroup-modal"),
      model: window.appModel,
      templateGroupCollection: templateGroupCollection,
      templateCollection: templateCollection
    });
    editTemplateGroupModal = new EditTemplateGroupModalView({
      el: $("#edit-templategroup-modal"),
      model: window.appModel
    });
    confirmDeleteTemplateGroupModal = new ConfirmDeleteTemplateGroupModalView({
      el: $("#delete-templategroup-modal"),
      model: window.appModel
    });
    $("#tabs a").click(function(e) {
      $(this).tab("show");
      return e.preventDefault();
    });
    return $("#tabs a:first").tab("show");
  });
}).call(this);
