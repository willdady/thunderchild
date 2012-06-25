(function() {
  var AppModel, GroupItemView, GroupPaneControlsView, GroupPaneView, TemplateItemView, TemplatePaneControlsView, TemplatePaneView;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  AppModel = Backbone.Model.extend({
    selectedGroupItem: null,
    selectedTemplateItem: null
  });
  GroupItemView = Backbone.View.extend({
    initialize: function() {
      this.templatePane = this.options.templatePane;
      this.id = this.$el.attr("data-id");
      this.groupName = this.$el.attr("data-group");
      this.editButton = this.$el.find(".edit-button");
      return this.icon = this.$el.find(".icon-folder-close");
    },
    events: {
      "click": "clickHandler"
    },
    clickHandler: function(e) {
      var target;
      this.select();
      e.stopPropagation();
      target = e.target;
      if ($(e.target).attr("href") === "#") {
        return e.preventDefault();
      }
    },
    select: function() {
      this.$el.addClass("selected");
      this.model.set({
        selectedGroupItem: this
      });
      this.editButton.show();
      if (this.groupName !== "root") {
        return this.icon.addClass("icon-folder-open");
      }
    },
    deselect: function() {
      this.$el.removeClass("selected");
      this.editButton.hide();
      if (this.groupName !== "root") {
        return this.icon.removeClass("icon-folder-open");
      }
    }
  });
  GroupPaneView = Backbone.View.extend({
    el: "#group_pane",
    initialize: function() {
      this.groups = [];
      this.$el.find("ul li").each(__bind(function(i, el) {
        var groupItem;
        groupItem = new GroupItemView({
          el: el,
          model: this.model
        });
        return this.groups.push(groupItem);
      }, this));
      return this.model.on("change:selectedGroupItem", this.selectedGroupItemChangeHandler, this);
    },
    selectedGroupItemChangeHandler: function() {
      return _.each(this.groups, __bind(function(item) {
        if (item !== this.model.get("selectedGroupItem")) {
          return item.deselect();
        }
      }, this));
    },
    selectItem: function(groupName) {
      var item, _i, _len, _ref, _results;
      _ref = this.groups;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _results.push(item.groupName === groupName ? item.select() : void 0);
      }
      return _results;
    }
  });
  TemplateItemView = Backbone.View.extend({
    initialize: function() {
      this.id = this.$el.attr("data-id");
      this.groupName = this.$el.attr("data-group");
      this.editButton = this.$el.find(".edit-button");
      return this.editButton.hide();
    },
    events: {
      "click": "clickHandler"
    },
    clickHandler: function(e) {
      this.select();
      this.model.set({
        selectedTemplateItem: this
      });
      e.stopPropagation();
      if ($(e.target).attr("href") === "#") {
        return e.preventDefault();
      }
    },
    show: function() {
      return this.$el.show();
    },
    hide: function() {
      return this.$el.hide();
    },
    select: function() {
      this.$el.addClass("selected");
      return this.editButton.show();
    },
    deselect: function() {
      this.$el.removeClass("selected");
      return this.editButton.hide();
    }
  });
  TemplatePaneView = Backbone.View.extend({
    el: "#template_pane",
    initialize: function() {
      this.templates = [];
      this.$el.find("ul li").each(__bind(function(i, el) {
        return this.templates.push(new TemplateItemView({
          el: el,
          model: this.model
        }));
      }, this));
      this.model.on("change:selectedGroupItem", this.selectedGroupItemChangeHandler, this);
      return this.model.on("change:selectedTemplateItem", this.selectedTemplateItemChangeHandler, this);
    },
    selectedGroupItemChangeHandler: function() {
      var selectedGroupItem;
      selectedGroupItem = this.model.get("selectedGroupItem");
      this.model.set({
        selectedTemplateItem: null
      });
      return this.filter(selectedGroupItem.groupName);
    },
    selectedTemplateItemChangeHandler: function() {
      var templateItem;
      templateItem = this.model.get("selectedTemplateItem");
      return _.each(this.templates, function(template) {
        if (template !== templateItem) {
          return template.deselect();
        }
      });
    },
    filter: function(groupName) {
      var templatesToHide, templatesToShow;
      templatesToShow = _.filter(this.templates, function(template) {
        return template.groupName === groupName;
      });
      templatesToHide = _.reject(this.templates, function(template) {
        return template.groupName === groupName;
      });
      _.each(templatesToShow, function(template) {
        return template.show();
      });
      _.each(templatesToHide, function(template) {
        template.hide();
        return template.deselect();
      });
      return templatesToShow[0].select();
    }
  });
  TemplatePaneControlsView = Backbone.View.extend({
    el: "#template_pane_controls",
    initialize: function() {
      this.createTemplateButton = $("#create_template_button");
      return this.model.on("change:selectedGroupItem", this.selectedGroupItemChangeHandler, this);
    },
    selectedGroupItemChangeHandler: function() {
      var groupItem, url;
      groupItem = this.model.get("selectedGroupItem");
      url = _.template("templates/group/<%= group_id %>/create", {
        group_id: groupItem.id
      });
      return this.createTemplateButton.attr("href", url);
    }
  });
  GroupPaneControlsView = Backbone.View.extend({
    el: "#group_pane_controls"
  });
  $(function() {
    var appModel, groupPane, templatePane, templatePaneControls;
    appModel = new AppModel();
    templatePane = new TemplatePaneView({
      model: appModel
    });
    templatePaneControls = new TemplatePaneControlsView({
      model: appModel
    });
    groupPane = new GroupPaneView({
      model: appModel
    });
    return groupPane.selectItem("root");
  });
}).call(this);
