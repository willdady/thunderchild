(function() {
  var ActionBarView, AppModel, NewTemplateModalView, SettingsView, TemplateCollection, TemplateEditorView, TemplateGroupView, TemplateListItemView, TemplateModel, templateGroupRoot, templateRoot;
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
    openNewTemplateModal: function(group_id) {
      return this.trigger("openNewTemplateModal", group_id);
    }
  });
  TemplateModel = Backbone.Model.extend({
    urlRoot: templateRoot
  });
  TemplateCollection = Backbone.Collection.extend({
    model: TemplateModel,
    url: templateRoot
  });
  ActionBarView = Backbone.View.extend({
    events: {
      "click #create-templategroup-button": "createTemplateGroupClickHandler",
      "click #delete-template-button": "deleteTemplateClickHandler",
      "click #save-template-button": "saveTemplateClickHandler"
    },
    createTemplateGroupClickHandler: function(e) {
      log("createTemplateGroupClickHandler");
      return e.preventDefault();
    },
    deleteTemplateClickHandler: function(e) {
      log("deleteTemplateClickHandler");
      return e.preventDefault();
    },
    saveTemplateClickHandler: function(e) {
      log("saveTemplateClickHandler");
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
    open: function(group_id) {
      $("#id2_templategroup").val(group_id);
      this.$el.find(".alert").remove();
      this.$el.find(".error").removeClass("error");
      this.$el.find("form").each(function() {
        return this.reset();
      });
      this.$el.modal("show");
      return $("#id2_template_short_name").focus();
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
        error: function(model, response) {
          var errors_html, resp;
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
        }
      });
      return e.preventDefault();
    }
  });
  TemplateGroupView = Backbone.View.extend({
    initialize: function() {
      this.id = parseInt(this.$el.attr("data-id"));
      this.$el.find("ul li").each(__bind(function(i, el) {
        var model;
        model = new TemplateModel({
          id: $(el).attr("data-id"),
          templategroup: this.id
        });
        new TemplateListItemView({
          el: el,
          model: model,
          appModel: this.model
        });
        return this.collection.add(model, {
          silent: true
        });
      }, this));
      return this.collection.on("add", this.templateAddedHandler, this);
    },
    events: {
      "click .new-template-button": "newTemplateButtonClickHandler"
    },
    newTemplateButtonClickHandler: function(e) {
      this.model.openNewTemplateModal(this.id);
      e.stopPropagation();
      return e.preventDefault();
    },
    templateAddedHandler: function(templateModel) {
      var el, templateView;
      if (templateModel.get("templategroup") === this.id) {
        el = $(_.template($("#template-list-item-template").text(), templateModel.toJSON()));
        this.$el.find("ul").prepend(el);
        this.$el.find("ul>li").tsort();
        templateView = new TemplateListItemView({
          el: el,
          model: templateModel,
          appModel: this.model
        });
        templateView.modelPopulated = true;
        return this.model.selectedTemplate(templateModel);
      }
    }
  });
  TemplateListItemView = Backbone.View.extend({
    initialize: function() {
      this.modelPopulated = false;
      this.options.appModel.on("change:selectedTemplate", this.selectedTemplateChangeHandler, this);
      return this.model.on("change", this.modelChangeHandler, this);
    },
    events: {
      'click a': 'clickHandler'
    },
    modelChangeHandler: function() {
      return this.modelPopulated = true;
    },
    clickHandler: function(e) {
      this.options.appModel.selectedTemplate(this.model);
      if (!this.modelPopulated) {
        this.model.fetch();
      }
      return e.preventDefault();
    },
    selectedTemplateChangeHandler: function() {
      if (this.options.appModel.get("selectedTemplate") === this.model) {
        return this.$el.addClass("active");
      } else {
        return this.$el.removeClass("active");
      }
    }
  });
  TemplateEditorView = Backbone.View.extend({
    initialize: function() {
      this.editor = ace.edit("editor");
      this.editor.setTheme("ace/theme/twilight");
      this.editor.setShowPrintMargin(false);
      this.setMode("ace/mode/html");
      return this.model.on("change:selectedTemplate", this.selectedTemplateChangeHandler, this);
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
      var text;
      text = this.templateModel.get("template_content");
      if (text) {
        return this.editor.getSession().getDocument().setValue(text);
      }
    },
    setMode: function(mode) {
      var M;
      M = require(mode).Mode;
      return this.editor.getSession().setMode(new M());
    }
  });
  SettingsView = Backbone.View.extend({
    initialize: function() {
      return this.model.on("change:selectedTemplate", this.selectedTemplateChangeHandler, this);
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
        return $("input:radio[name=template_is_private][value='False']").attr("checked", !this.templateModel.get("template_is_private"));
      }
    }
  });
  $(function() {
    var actionBarView, appModel, newTemplateModal, settingsView, templateCollection, templateEditorView;
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
    $("#template-browser > ul > li").each(function(i, el) {
      return new TemplateGroupView({
        el: el,
        model: appModel,
        collection: templateCollection
      });
    });
    $("#tabs a").click(function(e) {
      $(this).tab("show");
      return e.preventDefault();
    });
    return $("#tabs a:first").tab("show");
  });
}).call(this);
