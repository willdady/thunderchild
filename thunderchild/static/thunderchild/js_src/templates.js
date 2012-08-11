(function() {
  var ActionBarView, AppModel, ConfirmDeleteTemplateGroupModalView, ConfirmDeleteTemplateModalView, EditTemplateGroupModalView, NewTemplateGroupModalView, NewTemplateModalView, SettingsView, TemplateCollection, TemplateEditorView, TemplateGroupModel, TemplateGroupView, TemplateListItemView, TemplateModel, templateGroupRoot, templateRoot;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  templateRoot = '/backend/api/templates/template';
  templateGroupRoot = '/backend/api/templates/group';
  AppModel = Backbone.Model.extend({
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
    }
  });
  TemplateCollection = Backbone.Collection.extend({
    model: TemplateModel,
    url: templateRoot
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
      return e.preventDefault();
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
      this.$el.find("ul>li").tsort();
      return this.$el.find("ul").prepend(this.$el.find("[data-is-index=1]"));
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
      return this.model.on("destroy", this.modelDestroyHandler, this);
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
    }
  });
  TemplateEditorView = Backbone.View.extend({
    initialize: function() {
      this.editor = ace.edit("editor");
      this.editor.setTheme("ace/theme/twilight");
      this.editor.setShowPrintMargin(false);
      this.editor.getSession().on("change", _.bind(this.editorChangeHandler, this));
      this.setMode("ace/mode/html");
      return this.model.on("change:selectedTemplate", this.selectedTemplateChangeHandler, this);
    },
    editorChangeHandler: function() {
      this.templateModel = this.model.get("selectedTemplate");
      return this.templateModel.set("template_content", this.editor.getSession().getValue(), {
        silent: true
      });
    },
    selectedTemplateChangeHandler: function() {
      if (this.templateModel) {
        this.templateModel.off("change", this.templateModelChangeHandler, this);
      }
      this.templateModel = this.model.get("selectedTemplate");
      this.templateModelChangeHandler();
      return this.templateModel.on("change", this.templateModelChangeHandler, this);
    },
    templateModelChangeHandler: function() {
      var text;
      this.templateModel = this.model.get("selectedTemplate");
      text = this.templateModel.get("template_content");
      if (text) {
        return this.editor.getSession().setValue(text);
      }
    },
    setMode: function(mode) {
      return this.editor.getSession().setMode(mode);
    }
  });
  SettingsView = Backbone.View.extend({
    initialize: function() {
      return this.model.on("change:selectedTemplate", this.selectedTemplateChangeHandler, this);
    },
    events: {
      "change :input": "inputChangeHander"
    },
    inputChangeHander: function() {
      var formData;
      formData = this.$el.find("form").serializeObject();
      if (this.templateModel) {
        return this.templateModel.set(formData);
      }
    },
    selectedTemplateChangeHandler: function() {
      if (this.templateModel) {
        this.templateModel.off("change", this.populateFromModel, this);
      }
      this.templateModel = this.model.get("selectedTemplate");
      this.templateModel.on("change", this.populateFromModel, this);
      return this.populateFromModel();
    },
    populateFromModel: function() {
      if (this.templateModel.get("template_short_name")) {
        $("#id_template_short_name").val(this.templateModel.get("template_short_name"));
        $("#id_template_content_type").val(this.templateModel.get("template_content_type"));
        $("#id_template_cache_timeout").val(this.templateModel.get("template_cache_timeout"));
        $("#id_template_redirect_type").val(this.templateModel.get("template_redirect_type"));
        $("#id_template_redirect_url").val(this.templateModel.get("template_redirect_url"));
        $("input:radio[name=template_is_private][value='True']").attr("checked", this.templateModel.get("template_is_private"));
        $("input:radio[name=template_is_private][value='False']").attr("checked", !this.templateModel.get("template_is_private"));
        if (this.templateModel.get("template_short_name") === 'index') {
          return $("#id_template_short_name").parent().parent().hide();
        } else {
          return $("#id_template_short_name").parent().parent().show();
        }
      }
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
      "click #create-template-button": "createTemplateButtonClickHandler"
    },
    open: function(templateGroupModel) {
      $("#id2_templategroup").val(templateGroupModel.id);
      this.removeErrors();
      this.$el.find("form").each(function() {
        return this.reset();
      });
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
      return e.preventDefault();
    }
  });
  NewTemplateGroupModalView = Backbone.View.extend({
    initialize: function() {
      return this.model.on("openNewTemplateGroupModal", this.open, this);
    },
    events: {
      "click #create-templategroup-button": "createTemplateGroupButtonClickHandler"
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
        var model, template_element, templategroup, templategroup_element;
        if (jqXHR.status === 200) {
          templategroup_element = $(_.template($("#templategroup-list-item-template").text(), data.templategroup));
          template_element = $(_.template($("#template-list-item-template").text(), data.template));
          templategroup_element.find("ul.collapse").append(template_element);
          $("#template-browser > ul").prepend(templategroup_element);
          model = new TemplateGroupModel(data.templategroup);
          templategroup = new TemplateGroupView({
            el: templategroup_element,
            model: model,
            collection: this.collection,
            appModel: this.model
          });
          this.model.selectedTemplate(model.indexTemplateModel());
          return this.close();
        }
      }, this), "json").error(function(jqXHR) {
        return log("ERROR", jqXHR);
      });
      return e.preventDefault();
    }
  });
  EditTemplateGroupModalView = Backbone.View.extend({
    initialize: function() {
      return this.model.on("openEditTemplateGroupModal", this.open, this);
    },
    events: {
      "click #save-templategroup-button": "saveTemplateGroupButtonClickHandler",
      "click #delete-templategroup-button": "deleteTemplateGroupButtonClickHandler"
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
      return e.preventDefault();
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
      this.model.selectTemplate(this.model.rootTemplateGroup().getIndexModel());
      return e.preventDefault();
    }
  });
  $(function() {
    var actionBarView, appModel, confirmDeleteTemplateGroupModal, confirmDeleteTemplateModal, editTemplateGroupModal, newTemplateGroupModal, newTemplateModal, settingsView, templateCollection, templateEditorView;
    appModel = new AppModel();
    templateCollection = new TemplateCollection();
    actionBarView = new ActionBarView({
      el: $(".action-bar"),
      model: appModel
    });
    templateEditorView = new TemplateEditorView({
      el: $("#editor-pane"),
      model: appModel
    });
    settingsView = new SettingsView({
      el: $("#settings-pane"),
      model: appModel
    });
    newTemplateModal = new NewTemplateModalView({
      el: $("#create-template-modal"),
      model: appModel,
      collection: templateCollection
    });
    confirmDeleteTemplateModal = new ConfirmDeleteTemplateModalView({
      el: $("#delete-template-modal"),
      model: appModel
    });
    newTemplateGroupModal = new NewTemplateGroupModalView({
      el: $("#create-templategroup-modal"),
      model: appModel,
      collection: templateCollection
    });
    editTemplateGroupModal = new EditTemplateGroupModalView({
      el: $("#edit-templategroup-modal"),
      model: appModel
    });
    confirmDeleteTemplateGroupModal = new ConfirmDeleteTemplateGroupModalView({
      el: $("#delete-templategroup-modal"),
      model: appModel
    });
    $("#template-browser > ul > li").each(function(i, el) {
      var indexModel, model, templategroup;
      model = new TemplateGroupModel({
        id: parseInt($(el).attr("data-id")),
        templategroup_short_name: $(el).find(".group-header h3").text()
      });
      templategroup = new TemplateGroupView({
        el: el,
        model: model,
        collection: templateCollection,
        appModel: appModel
      });
      if (model.get("templategroup_short_name") === 'root') {
        indexModel = templategroup.getIndexModel();
        appModel.selectedTemplate(indexModel);
        return appModel.rootTemplateGroup(model);
      }
    });
    $("#tabs a").click(function(e) {
      $(this).tab("show");
      return e.preventDefault();
    });
    return $("#tabs a:first").tab("show");
  });
}).call(this);
