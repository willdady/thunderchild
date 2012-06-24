AppModel = Backbone.Model.extend
  selectedGroupItem:null
  selectedTemplateItem:null

GroupItemView = Backbone.View.extend
  
  initialize: ->
    @templatePane = @options.templatePane
    @id = @$el.attr("data-id")
    @groupName = @$el.attr("data-group")
    @editButton = @$el.find ".edit-button"
    @icon = @$el.find(".icon-folder-close")
    
  events:
    "click":"clickHandler"
  
  clickHandler: (e) ->
    @select()
    e.stopPropagation()
    target = e.target
    if $(e.target).attr("href") == "#"
      e.preventDefault()
    
  select: ->
    @$el.addClass "selected"
    @model.set selectedGroupItem:@
    @editButton.show()
    if @groupName != "root"
      @icon.addClass "icon-folder-open"
    
  deselect: ->
    @$el.removeClass "selected"
    @editButton.hide()
    if @groupName != "root"
      @icon.removeClass "icon-folder-open"


GroupPaneView = Backbone.View.extend
  
  el: "#group_pane"
  
  initialize: ->
    @groups = []
    @$el.find("ul li").each (i, el) =>
      groupItem = new GroupItemView 
        el:el
        model:@model 
      @groups.push groupItem
    @model.on "change:selectedGroupItem", @selectedGroupItemChangeHandler, @

  selectedGroupItemChangeHandler: ->
    _.each @groups, (item) =>
      if item != @model.get "selectedGroupItem"
        item.deselect()
    
        
  selectItem: (groupName) ->
    for item in @groups
      if item.groupName == groupName
        item.select()

TemplateItemView = Backbone.View.extend
  
  initialize: ->
    @id = @$el.attr("data-id")
    @groupName = @$el.attr("data-group")
    @editButton = @$el.find ".edit-button"
    @editButton.hide()
    
  events:
    "click":"clickHandler"
  
  clickHandler: (e) ->
    @select()
    @model.set selectedTemplateItem:@
    e.stopPropagation();
    if $(e.target).attr("href") == "#"
      e.preventDefault()
    
  show: ->
    @$el.show()
    
  hide: ->
    @$el.hide()
    
  select: ->
    @$el.addClass "selected"
    @editButton.show()
    
  deselect: ->
    @$el.removeClass "selected"
    @editButton.hide()


TemplatePaneView = Backbone.View.extend
  
  el: "#template_pane"
  
  initialize: ->
    @templates = []
    @$el.find("ul li").each (i,el) =>
      @templates.push new TemplateItemView
        el:el
        model:@model
    @model.on "change:selectedGroupItem", @selectedGroupItemChangeHandler, @
    @model.on "change:selectedTemplateItem", @selectedTemplateItemChangeHandler, @

  selectedGroupItemChangeHandler: ->
    selectedGroupItem = @model.get "selectedGroupItem"
    @model.set selectedTemplateItem:null
    @filter selectedGroupItem.groupName
  
  selectedTemplateItemChangeHandler: ->
    templateItem = @model.get "selectedTemplateItem"
    _.each @templates, (template) ->
      if template != templateItem
        template.deselect()
  
  filter: (groupName) ->
    templatesToShow = _.filter @templates, (template) -> template.groupName == groupName
    templatesToHide = _.reject @templates, (template) -> template.groupName == groupName
    _.each templatesToShow, (template) -> template.show()
    _.each templatesToHide, (template) -> 
      template.hide() 
      template.deselect()
    templatesToShow[0].select()
    

TemplatePaneControlsView = Backbone.View.extend

  el: "#template_pane_controls"
  
  initialize: ->
    @createTemplateButton = $("#create_template_button")
    @model.on "change:selectedGroupItem", @selectedGroupItemChangeHandler, @
    
  selectedGroupItemChangeHandler: ->
    groupItem = @model.get "selectedGroupItem"
    url = _.template "templates/group/<%= group_id %>/create", group_id:groupItem.id
    @createTemplateButton.attr "href", url

GroupPaneControlsView = Backbone.View.extend

  el: "#group_pane_controls"

$ ->
  appModel = new AppModel()
  templatePane = new TemplatePaneView model:appModel
  templatePaneControls = new TemplatePaneControlsView model:appModel
  groupPane = new GroupPaneView model:appModel
  
  groupPane.selectItem "root"
