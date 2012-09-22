(function() {
  var AppModel, AppView, CategoryCollection, CategoryGroupCollection, CategoryGroupModalView, CategoryGroupModel, CategoryGroupView, CategoryModel, CategoryView, ConfirmDeleteModalView, appModel, categories, categoryGroups;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  AppModel = Backbone.Model.extend({
    openCreateCategoryGroupModal: function() {
      return this.trigger("openCreateCategoryGroupModal");
    },
    openEditCategoryGroupModal: function(categoryGroupModel) {
      return this.trigger("openEditCategoryGroupModal", categoryGroupModel);
    },
    openConfirmDeleteCategoryGroupModal: function(categoryGroupModel) {
      return this.trigger("openConfirmDeleteCategoryGroupModal", categoryGroupModel);
    },
    openConfirmDeleteCategoryModal: function(categoryModel) {
      return this.trigger("openConfirmDeleteCategoryModal", categoryModel);
    }
  });
  CategoryModel = Backbone.Model.extend();
  CategoryGroupModel = Backbone.Model.extend();
  CategoryCollection = Backbone.Collection.extend({
    url: '/dashboard/categories/categories',
    model: CategoryModel
  });
  CategoryGroupCollection = Backbone.Collection.extend({
    url: '/dashboard/categories/categorygroups',
    model: CategoryGroupModel
  });
  appModel = new AppModel();
  categories = new CategoryCollection();
  categoryGroups = new CategoryGroupCollection();
  ConfirmDeleteModalView = Backbone.View.extend({
    el: $("#confirm-delete-modal"),
    initialize: function() {
      appModel.on("openConfirmDeleteCategoryGroupModal", this.openConfirmDeleteCategoryGroupModal, this);
      return appModel.on("openConfirmDeleteCategoryModal", this.openConfirmDeleteCategoryModal, this);
    },
    events: {
      "click #confirm-delete-button": "confirmDeleteHandler"
    },
    confirmDeleteHandler: function(e) {
      this.model.destroy();
      this.close();
      return e.preventDefault();
    },
    openConfirmDeleteCategoryGroupModal: function(model) {
      this.model = model;
      $("#confirm-delete-message").html("Are you sure you want to <b>permanently</b> delete this category group including all of it's categories?");
      return this.open();
    },
    openConfirmDeleteCategoryModal: function(model) {
      this.model = model;
      $("#confirm-delete-message").html("Are you sure you want to <b>permanently</b> delete this category?");
      return this.open();
    },
    close: function() {
      return this.$el.modal("hide");
    },
    open: function() {
      return this.$el.modal("show");
    }
  });
  CategoryGroupModalView = Backbone.View.extend({
    el: $("#categorygroup-modal"),
    initialize: function() {
      this.EDIT_MODE = "editMode";
      this.CREATE_MODE = "createMode";
      appModel.on("openCreateCategoryGroupModal", this.openCreateCategoryGroupModal, this);
      appModel.on("openEditCategoryGroupModal", this.openEditCategoryGroupModal, this);
      return Utilities.autoSlug($("#id_categorygroup_name"), $("#id_categorygroup_short_name"));
    },
    events: {
      "click #categorygroup-form-modal-ok-button": "okClickHandler"
    },
    removeErrors: function() {
      this.$el.find(".alert").remove();
      return this.$el.find(".error").removeClass("error");
    },
    addErrors: function(errors) {
      var errors_html;
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
    close: function() {
      return this.$el.modal("hide");
    },
    open: function() {
      this.removeErrors();
      return this.$el.modal("show");
    },
    okClickHandler: function(e) {
      var formData;
      if ($("#categorygroup-form-modal-ok-button").hasClass("disabled")) {
        e.preventDefault();
        return;
      }
      if (this.mode === this.EDIT_MODE) {
        formData = $("#categorygroup-modal-form").serializeObject();
        this.model.save(formData, {
          wait: true,
          success: __bind(function() {
            return this.close();
          }, this),
          error: __bind(function(model, response) {
            var resp;
            this.removeErrors();
            if (response.status === 400) {
              resp = $.parseJSON(response.responseText);
              return this.addErrors(resp.errors);
            }
          }, this)
        });
      } else {
        formData = $("#categorygroup-modal-form").serializeObject();
        categoryGroups.create(formData, {
          wait: true,
          success: __bind(function() {
            return this.close();
          }, this),
          error: __bind(function(model, response) {
            var resp;
            this.removeErrors();
            if (response.status === 400) {
              resp = $.parseJSON(response.responseText);
              return this.addErrors(resp.errors);
            }
          }, this)
        });
      }
      return e.preventDefault();
    },
    openCreateCategoryGroupModal: function() {
      this.mode = this.CREATE_MODE;
      this.open();
      return $("#id_categorygroup_name").focus();
    },
    openEditCategoryGroupModal: function(categoryGroupModel) {
      this.mode = this.EDIT_MODE;
      this.model = categoryGroupModel;
      this.open();
      $("#id_categorygroup_name").val(this.model.get("categorygroup_name")).focus();
      return $("#id_categorygroup_short_name").val(this.model.get("categorygroup_short_name"));
    }
  });
  CategoryView = Backbone.View.extend({
    template: _.template($("#category-template").html())
  });
  CategoryGroupView = Backbone.View.extend({
    template: _.template($("#categorygroup-template").html()),
    className: "row-fluid accordion-group",
    initialize: function() {
      categories.on("add", this.categoryAddHandler, this);
      this.model.on("change", this.render, this);
      this.model.on("destroy", this.destroyHandler, this);
      return this.render();
    },
    events: {
      "click .edit-group-button": "editGroupClickHandler",
      "click .delete-group-button": "deleteClickHandler"
    },
    render: function() {
      return this.$el.html(this.template(this.model.toJSON()));
    },
    destroyHandler: function() {
      return this.$el.remove();
    },
    editGroupClickHandler: function(e) {
      appModel.openEditCategoryGroupModal(this.model);
      e.preventDefault();
      return e.stopPropagation();
    },
    deleteClickHandler: function(e) {
      appModel.openConfirmDeleteCategoryGroupModal(this.model);
      e.preventDefault();
      return e.stopPropagation();
    },
    categoryAddHandler: function(categoryModel) {
      var categoryView;
      if (categoryModel.get("categorygroup") === this.model.id) {
        return categoryView = new CategoryView({
          model: categoryModel
        });
      }
    }
  });
  AppView = Backbone.View.extend({
    el: $(window),
    initialize: function() {
      categoryGroups.on("reset", this.categoryGroupResetHandler, this);
      return categoryGroups.on("add", this.categoryGroupAddHandler, this);
    },
    events: function() {
      return {
        'click #create-categorygroup-button': 'createCategoryGroupClickHandler'
      };
    },
    createCategoryGroupClickHandler: function(e) {
      appModel.openCreateCategoryGroupModal();
      return e.preventDefault();
    },
    categoryGroupResetHandler: function() {
      var container;
      container = $("#content_container");
      return _.each(categoryGroups.models, function(model) {
        var view;
        view = new CategoryGroupView({
          model: model
        });
        return container.append(view.el);
      });
    },
    categoryGroupAddHandler: function(model) {
      var view;
      view = new CategoryGroupView({
        model: model
      });
      return $("#content_container").append(view.el);
    }
  });
  $(function() {
    var appView, categoryGroupModalView, confirmDeleteModalView;
    appView = new AppView();
    categoryGroupModalView = new CategoryGroupModalView();
    confirmDeleteModalView = new ConfirmDeleteModalView();
    categoryGroups.reset(categoryGroupData);
    return categories.reset(categoryData);
  });
}).call(this);
