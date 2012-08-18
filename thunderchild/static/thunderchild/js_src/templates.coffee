# The below two variables are set dynamically in the global scope.
#templateRoot = '/backend/api/templates/template'
#templateGroupRoot = '/backend/api/templates/group'

######################################################################################################################################
# Models
######################################################################################################################################

AppModel = Backbone.Model.extend

  selectedTemplate: (model) ->
    if model
      @set("selectedTemplate", model)
    return @get("selectedTemplate")
    
  rootTemplateGroup: (model) ->
    if model
      @set("rootTemplateGroup", model)
    return @get("rootTemplateGroup")
    
  openNewTemplateModal: (templateGroupModel) ->
    @trigger "openNewTemplateModal", templateGroupModel
    
  openNewTemplateGroupModal: () ->
    @trigger "openNewTemplateGroupModal"
    
  openEditTemplateGroupModal: (templateGroupModel) ->
    @trigger "openEditTemplateGroupModal", templateGroupModel
    
  openConfirmDeleteTemplateModal: ->
    @trigger "openConfirmDeleteTemplateModal"
    
  openConfirmDeleteTemplateGroupModal: (templateGroupModel) ->
    @trigger "openConfirmDeleteTemplateGroupModal", templateGroupModel


TemplateGroupModel = Backbone.Model.extend

  urlRoot:templateGroupRoot

  indexTemplateModel: (model) ->
    if model
      @_indexTemplateModel = model
    return @_indexTemplateModel
    

TemplateModel = Backbone.Model.extend

  urlRoot:templateRoot
  
  initialFetch: ->
    @fetch success: =>
      @trigger "initialFetchComplete"
      
  templateGroupModel: (model) ->
    if model
      @_templateGroupModel = model
    return @_templateGroupModel
    
  errors: (obj) ->
    if obj
      @_errors = obj
      @trigger("errors", @_errors)
    return @_errors
    
  requiresSave:(bool) ->
    if bool or bool == false
      @_requiresSave = bool
      @trigger("change")
    return @_requiresSave
    
  getMode: ->
    switch @get("template_content_type")
      when "text/html", "text/xhtml+xml" then return "ace/mode/html"
      when "text/css" then return"ace/mode/css"
      when "application/javascript" then return "ace/mode/javascript"
      when "application/json" then return "ace/mode/json"
      when "application/rss+xml", "application/atom+xml", "text/xml", "application/soap+xml" then return "ace/mode/xml"
      when "text/less" then return "ace/mode/less"
      when "text/scss" then return "ace/mode/scss"
      else return"ace/mode/text"
    

TemplateCollection = Backbone.Collection.extend {model:TemplateModel, url:templateRoot}

TemplateGroupCollection = Backbone.Collection.extend {model:TemplateGroupModel}

######################################################################################################################################
# Views
######################################################################################################################################

ActionBarView = Backbone.View.extend

  initialize: ->
    @model.on "change:selectedTemplate", @selectedTemplateChangeHandler, @

  events:
    "click #create-templategroup-button":"createTemplateGroupClickHandler",
    "click #delete-template-button":"deleteTemplateClickHandler",
    "click #save-template-button":"saveTemplateClickHandler"
    
  selectedTemplateChangeHandler: ->
    # Disable the delete button if an index template becomes selected. Index templates cannot be deleted.
    selectedTemplate = @model.get("selectedTemplate")
    if selectedTemplate.get("template_short_name") == "index"
      $("#delete-template-button").addClass("disabled")
    else
      $("#delete-template-button").removeClass("disabled")
    
  createTemplateGroupClickHandler: (e) ->
    @model.openNewTemplateGroupModal()
    e.preventDefault()
    
  deleteTemplateClickHandler: (e) ->
    if !$("#delete-template-button").hasClass("disabled")
      @model.openConfirmDeleteTemplateModal()
    e.preventDefault()
    
  saveTemplateClickHandler:(e) ->
    if $("#save-template-button").hasClass("disabled")
      return
    $("#save-template-button").addClass("disabled")
    templateModel = @model.selectedTemplate()
    templateModel.errors({}) # Clear any existing errors
    templateModel.save {},
      wait:true
      success: (model, response) ->
        model.requiresSave(false)
        $("#save-template-button").removeClass("disabled")
      error: (model, response) ->
        resp = $.parseJSON(response.responseText)
        templateModel.errors(resp.errors)
        $("#save-template-button").removeClass("disabled")
       
    e.preventDefault()


TemplateBrowserView = Backbone.View.extend

  initialize: ->
    @$el.find("> ul > li").each (i, el) =>
      model = new TemplateGroupModel({ id:parseInt($(el).attr("data-id")), templategroup_short_name:$(el).find(".group-header h3").text() })
      templategroup = new TemplateGroupView {el:el, model:model, collection:@options.templateCollection, appModel:@model}
      # Store a reference to the root template group in our AppModel and select it's index template by default
      if model.get("templategroup_short_name") == 'root'
        indexModel = templategroup.getIndexModel()
        @model.selectedTemplate(indexModel)
        @model.rootTemplateGroup(model)
      @options.templateGroupCollection.add(model, {silent:true})
    @options.templateGroupCollection.on "add", @templateGroupAddHandler, @
    
  sort: ->
    @$el.find("> ul > li").tsort(".group-header h3") # Sort all template groups alphabetically
    @$el.find("> ul").prepend( @$el.find("ul > li .group-header h3:contains(root)").closest("li") ) # Make the root template group always first in the list
    
  templateGroupAddHandler: (model) ->
    templategroup_element = $(_.template($("#templategroup-list-item-template").text(), model.toJSON()))
    @$el.find("> ul").prepend( templategroup_element )
    templategroup = new TemplateGroupView {el:templategroup_element, model:model, collection:@options.templateCollection, appModel:@model}
    @sort()
    

TemplateGroupView = Backbone.View.extend

  initialize: ->
    # Instantiate a TemplateListItemView for each Template belonging to this group
    @$el.find("ul.collapse > li").each (i, el) =>
      model = new TemplateModel {id:$(el).attr("data-id"), templategroup:@model.id, template_short_name:$.trim( $(el).text() )}
      model.templateGroupModel(@model)
      templateListItemView = new TemplateListItemView {el:el, model:model, appModel:@options.appModel}
      # Add the model to the global template collection
      @collection.add(model, {silent:true})
      if model.get("template_short_name") == "index"
        @model.indexTemplateModel(model)
    @collection.on "add", @templateAddedHandler, @ # Listen for newly created templates added to the collection
    @model.on "destroy", @destroyHandler, @
    @model.on "change", @render, @
      
  events:
    "click .new-template-button":"newTemplateButtonClickHandler"
    "click .edit-templategroup-button":"editTemplateGroupButtonClickHandler"
    
  newTemplateButtonClickHandler: (e) ->
    @options.appModel.openNewTemplateModal(@model)
    e.stopPropagation()
    e.preventDefault()
    
  editTemplateGroupButtonClickHandler: (e) ->
    @options.appModel.openEditTemplateGroupModal(@model)
    e.preventDefault()
    e.stopPropagation()
    
  sort: ->
    @$el.find("> ul > li").tsort() # <- TinySort plugin
    @$el.find("> ul").prepend( @$el.find("[data-is-index=1]") ) # Keep the index template always first
    
  templateAddedHandler: (templateModel) ->
    # If the newly created template belongs to this group instantiate it's view and add a new element to the DOM.
    if templateModel.get("templategroup") == @model.id
      el = $(_.template( $("#template-list-item-template").text(), templateModel.toJSON()))
      @$el.find("ul.collapse").prepend(el)
      @sort()
      templateView = new TemplateListItemView {el:el, model:templateModel, appModel:@options.appModel}
      templateView.modelPopulated = true # Since we have a complete model returned from the server we set this flag true so we don't do another request for the data on selection.
      @options.appModel.selectedTemplate(templateModel)
      
  getIndexModel: ->
    templates = @collection.where({templategroup:@model.id})
    return _.find templates, (model) -> return model.get("template_short_name") == 'index'

  destroyHandler: ->
    @$el.remove()
    
  render: ->
    @$el.find(".group-header h3").text( @model.get("templategroup_short_name") )

TemplateListItemView = Backbone.View.extend

  initialize: ->
    @options.appModel.on "change:selectedTemplate", @selectedTemplateChangeHandler, @
    @model.on "destroy", @modelDestroyHandler, @
    @model.on "change", @render, @

  events:
    'click a':'clickHandler'
    
  clickHandler:(e) ->
    @options.appModel.selectedTemplate(@model)
    e.preventDefault()
    
  selectedTemplateChangeHandler: ->
    model = @options.appModel.get("selectedTemplate")
    if model == @model
      if not @model.has("template_content")
        @model.initialFetch()
      @$el.addClass("active")
    else
      @$el.removeClass("active")
      
  modelDestroyHandler: ->
    @$el.remove()
    
  render: ->
    if @model.templateGroupModel().indexTemplateModel() == @model
      @$el.find("a em").text( @model.get("template_short_name") )
    else
      @$el.find("a").text( @model.get("template_short_name") )
    if @model.requiresSave()
      @$el.addClass("unsaved")
    else
      @$el.removeClass("unsaved")
      
    
TemplateEditorView = Backbone.View.extend

  initialize: ->
    @editor = ace.edit("editor")
    @editor.setTheme("ace/theme/twilight")
    @editor.setShowPrintMargin(false)
    @editor.getSession().on "change", _.bind @editorChangeHandler, @
    @setMode("ace/mode/html")
    @model.on "change:selectedTemplate", @selectedTemplateChangeHandler, @
    @selectedTemplateChangeHandler()
    # We need to listen to changes in the tabs to refresh the editor. It won't update it's content if hidden when new text is entered.
    $("#tabs").on "shown", _.bind(@tabShownHandler, @)
    
    @ignoreEditorChange = false
    
  tabShownHandler: (e) ->
    if @$el.hasClass("active") and @templateModel
      @setValue(@templateModel.get("template_content"))
      if @getMode() != @templateModel.getMode()
        @setMode(@templateModel.getMode())
        #@editor.getSession().clearAnnotations()
    
  editorChangeHandler:(e) ->
    if @ignoreEditorChange
      return
    @templateModel = @model.get("selectedTemplate")
    @templateModel.requiresSave(true)
    @templateModel.set("template_content", @editor.getSession().getValue())
    
  selectedTemplateChangeHandler: ->
    if @templateModel
      @templateModel.off "initialFetchComplete", @initialFetchCompleteHandler, @
      @templateModel.off "change:template_content_type", @contentTypeChangeHandler, @
    @templateModel = @model.get("selectedTemplate")
    @templateModel.on "initialFetchComplete", @initialFetchCompleteHandler, @
    @templateModel.on "change:template_content_type", @contentTypeChangeHandler, @
    @setValue(@templateModel.get("template_content"))
    @setMode(@templateModel.getMode())
    
  contentTypeChangeHandler: ->
    @setMode(@templateModel.getMode())
    
  setValue:(value) ->
    @ignoreEditorChange = true
    @editor.getSession().clearAnnotations()
    @editor.getSession().setValue(value)
    @ignoreEditorChange = false
    
  initialFetchCompleteHandler: ->
    @setValue(@templateModel.get("template_content"))
    @setMode(@templateModel.getMode())
    
  setMode: (mode) ->
    @editor.getSession().setMode(mode)
    
  getMode: ->
    @editor.getSession().getMode().$id
    
    
SettingsView = Backbone.View.extend

  initialize: ->
    @model.on "change:selectedTemplate", @selectedTemplateChangeHandler, @
    @selectedTemplateChangeHandler()
    
  events:
    "change :input":"inputChangeHander"
    
  inputChangeHander: ->
    formData = @$el.find("form").serializeObject()
    if @templateModel
      @templateModel.set(formData, {silent:true})
      @templateModel.requiresSave(true)
    
  selectedTemplateChangeHandler: ->
    # If we have a reference to an existing template remove event callback
    if @templateModel
        @templateModel.off "change", @populateFromModel, @
        @templateModel.off "errors", @renderErrors, @
    # Add event callback to newly selected template
    @templateModel = @model.get("selectedTemplate")
    if @templateModel
      @templateModel.on "change", @populateFromModel, @
      @templateModel.on "errors", @renderErrors, @
      @populateFromModel()
    # Remove any previously rendered errors
    @removeErrors()
    # If this template has errors render them
    errors = @templateModel.errors()
    if errors 
      @renderErrors(errors)
      
  removeErrors: ->
    @$el.find(".alert").remove()
    @$el.find(".error").removeClass("error")
      
  renderErrors: (errors) ->
    @removeErrors()
    errors_html = ''
    # Loop over each field in the errors object. The errors object contains fields in the format {<field name>:["error", "error", ...], ...}
    _.each errors, (value, key) ->
      # As there can be multiple errors for a field we loop over the errors too.
      _.each value, (el, i) ->
        errors_html += _.template("<li><%= error %></li>", {error:el})
      $("#id_"+key).before( _.template($("#form-error-template").text(), {errors:errors_html}) )
      $("#id_"+key).parent().addClass("error")
    
  populateFromModel: ->
    if @templateModel.get("template_short_name")
      $("#id_template_short_name").val( @templateModel.get("template_short_name") )
      $("#id_template_content_type").val ( @templateModel.get("template_content_type") )
      $("#id_template_cache_timeout").val( @templateModel.get("template_cache_timeout") )
      $("#id_template_redirect_type").val( @templateModel.get("template_redirect_type") )
      $("#id_template_redirect_url").val( @templateModel.get("template_redirect_url") )
      $("#id_templategroup").val( @templateModel.get("templategroup") )
      
      $("input:radio[name=template_is_private][value='True']").attr("checked", @templateModel.get("template_is_private"))
      $("input:radio[name=template_is_private][value='False']").attr("checked", !@templateModel.get("template_is_private"))
      # As index templates are forbidden from being renamed we hide the input
      if @templateModel.get("template_short_name") == 'index'
        $("#id_template_short_name").parent().parent().hide()
      else
        $("#id_template_short_name").parent().parent().show()


######################################################################################################################################
# Modals
######################################################################################################################################

ConfirmDeleteTemplateModalView = Backbone.View.extend

  initialize: ->
    @model.on "openConfirmDeleteTemplateModal", @open, @

  events:
    "click #confirm-delete-template-button":"confirmDeleteHandler"

  open: ->
    @$el.modal("show")
    
  close: ->
    @$el.modal("hide")
    
  confirmDeleteHandler: (e) ->
    templateModel = @model.get("selectedTemplate")
    templateModel.destroy()
    @close()
    # Select the index template of the group the deleted template belonged to
    @model.selectedTemplate( templateModel.templateGroupModel().indexTemplateModel() )
    e.preventDefault()


NewTemplateModalView = Backbone.View.extend

  initialize: ->
    @model.on "openNewTemplateModal", @open, @
    
  events:
    "click #create-template-button":"createTemplateButtonClickHandler"
    "keypress input":"inputKeyPressHandler"
    
  inputKeyPressHandler:(e) ->
    if e.which == 13
      @createTemplateButtonClickHandler()
      e.preventDefault()
    
  open: (templateGroupModel) ->
    @templateGroupModel = templateGroupModel
    $("#id2_templategroup").val(templateGroupModel.id)
    # We clean up the modal by removing any previously entered values and error alerts
    @removeErrors()
    @$el.find("form").each -> this.reset()
    $("#id2_template_is_private_0").prop("checked", true) # Explicitly set 'Is Private?' radio back to 'No'.
    # Show the modal
    @$el.modal("show")
    # Give the first input focus
    $("#id2_template_short_name").focus()
    
  removeErrors: ->
    @$el.find(".alert").remove()
    @$el.find(".error").removeClass("error")
    
  close: ->
    @$el.modal("hide")
  
  createTemplateButtonClickHandler: (e) ->
    formData = @$el.find("form").serializeObject()
    formData.template_cache_timeout = 0 # This value is not part of the form but is required so we set it here.
    @temp_model = new TemplateModel(formData)
    @temp_model.save {},
      success: (model, response) =>
        model.templateGroupModel(@templateGroupModel)
        @collection.add(model)
        @close()
      error: (model, response) =>
        @removeErrors()
        if response.status == 400
          resp = $.parseJSON(response.responseText)
          errors_html = ''
          # Loop over each field in the errors object. The errors object contains fields in the format {<field name>:["error", "error", ...], ...}
          _.each resp.errors, (value, key) ->
            # As there can be multiple errors for a field we loop over the errors too.
            _.each value, (el, i) ->
              errors_html += _.template("<li><%= error %></li>", {error:el})
            $("#id2_"+key).before( _.template($("#form-error-template").text(), {errors:errors_html}) )
            $("#id2_"+key).parent().addClass("error")
    if e
      e.preventDefault()
    
    
NewTemplateGroupModalView = Backbone.View.extend

  initialize: ->
    @model.on "openNewTemplateGroupModal", @open, @
    
  events:
    "click #create-templategroup-button":"createTemplateGroupButtonClickHandler"
    "keypress input":"inputKeyPressHandler"
    
  inputKeyPressHandler:(e) ->
    if e.which == 13
      @createTemplateGroupButtonClickHandler()
      e.preventDefault()
    
  open: ->
    # We clean up the modal by removing any previously entered values and error alerts
    @removeErrors()
    @$el.find("form").each -> this.reset()
    # Show the modal
    @$el.modal("show")
    # Give the first input focus
    $("#id_templategroup_short_name").focus()
    
  removeErrors: ->
    @$el.find(".alert").remove()
    @$el.find(".error").removeClass("error")
    
  close: ->
    @$el.modal("hide")
  
  createTemplateGroupButtonClickHandler: (e) ->
    formData = @$el.find("form").serializeObject()
    $.post(templateGroupRoot, JSON.stringify(formData), (data, textStatus, jqXHR) =>
      if jqXHR.status == 200
        templategroup_model = new TemplateGroupModel(data.templategroup)
        template_model = new TemplateModel(data.template)
        template_model.templateGroupModel(templategroup_model)
        templategroup_model.indexTemplateModel(template_model)
        @options.templateGroupCollection.add(templategroup_model)
        @options.templateCollection.add(template_model)
        @model.selectedTemplate(template_model)
        @close()
    ,"json"
    ).error (jqXHR) =>
      @removeErrors()
      if jqXHR.status == 400
        resp = $.parseJSON(jqXHR.responseText)
        errors_html = ''
        # Loop over each field in the errors object. The errors object contains fields in the format {<field name>:["error", "error", ...], ...}
        _.each resp.errors, (value, key) ->
          # As there can be multiple errors for a field we loop over the errors too.
          _.each value, (el, i) ->
            errors_html += _.template("<li><%= error %></li>", {error:el})
          $("#id_"+key).before( _.template($("#form-error-template").text(), {errors:errors_html}) )
          $("#id_"+key).parent().addClass("error")
    if e
      e.preventDefault()
    
    
EditTemplateGroupModalView = Backbone.View.extend

  initialize: ->
    @model.on "openEditTemplateGroupModal", @open, @
    
  events:
    "click #save-templategroup-button":"saveTemplateGroupButtonClickHandler"
    "click #delete-templategroup-button":"deleteTemplateGroupButtonClickHandler"
    "keypress input":"inputKeyPressHandler"
    
  inputKeyPressHandler:(e) ->
    if e.which == 13
      @saveTemplateGroupButtonClickHandler()
      e.preventDefault()
  
  open: (templateGroupModel) ->
    @templateGroupModel = templateGroupModel
    # We clean up the modal by removing any previously entered values and error alerts
    @removeErrors()
    @$el.find("form").each -> this.reset()
    # Show the modal
    @$el.modal("show")
    # Give the first input focus
    $("#id2_templategroup_short_name").val(@templateGroupModel.get("templategroup_short_name")).focus()
    
  removeErrors: ->
    @$el.find(".alert").remove()
    @$el.find(".error").removeClass("error")
    
  close: ->
    @$el.modal("hide")
    
  saveTemplateGroupButtonClickHandler: (e) ->
    formData = @$el.find("form").serializeObject()
    if formData.templategroup_short_name == @templateGroupModel.get("templategroup_short_name") # If the form data is the same as the model we don't need to save
      @close()
      return 
    @templateGroupModel.save formData, 
      wait:true 
      success: =>
        @close()
      error: (model, response) =>
        @removeErrors()
        if response.status == 400
          resp = $.parseJSON(response.responseText)
          errors_html = ''
          # Loop over each field in the errors object. The errors object contains fields in the format {<field name>:["error", "error", ...], ...}
          _.each resp.errors, (value, key) ->
            # As there can be multiple errors for a field we loop over the errors too.
            _.each value, (el, i) ->
              errors_html += _.template("<li><%= error %></li>", {error:el})
            $("#id2_"+key).before( _.template($("#form-error-template").text(), {errors:errors_html}) )
            $("#id2_"+key).parent().addClass("error")
    if e
      e.preventDefault()

  deleteTemplateGroupButtonClickHandler: (e) ->
    @close()
    @model.openConfirmDeleteTemplateGroupModal(@templateGroupModel)
    e.preventDefault()


ConfirmDeleteTemplateGroupModalView = Backbone.View.extend

  initialize: ->
    @model.on "openConfirmDeleteTemplateGroupModal", @open, @

  events:
    "click #confirm-delete-templategroup-button":"confirmDeleteHandler"

  open: (templateGroupModel) ->
    @templateGroupModel = templateGroupModel
    @$el.modal("show")
    
  close: ->
    @$el.modal("hide")
    
  confirmDeleteHandler: (e) ->
    @templateGroupModel.destroy()
    @close()
    # Select the root/index template
    @model.selectedTemplate( @model.rootTemplateGroup().indexTemplateModel() )
    e.preventDefault()    

$ ->
  appModel = new AppModel()
  
  templateCollection = new TemplateCollection()
  templateGroupCollection = new TemplateGroupCollection()
  
  actionBarView = new ActionBarView {el:$(".action-bar"), model:appModel}
  
  templateBrowserView = new TemplateBrowserView {el:$("#template-browser"), model:appModel, templateCollection:templateCollection, templateGroupCollection:templateGroupCollection}
  
  templateEditorView = new TemplateEditorView {el:$("#editor-pane"), model:appModel}
  
  settingsView = new SettingsView {el:$("#settings-pane"), model:appModel}
  
  newTemplateModal = new NewTemplateModalView {el:$("#create-template-modal"), model:appModel, collection:templateCollection}
  confirmDeleteTemplateModal = new ConfirmDeleteTemplateModalView {el:$("#delete-template-modal"), model:appModel}
  
  newTemplateGroupModal = new NewTemplateGroupModalView {el:$("#create-templategroup-modal"), model:appModel, templateGroupCollection:templateGroupCollection, templateCollection:templateCollection}
  editTemplateGroupModal = new EditTemplateGroupModalView {el:$("#edit-templategroup-modal"), model:appModel}
  confirmDeleteTemplateGroupModal = new ConfirmDeleteTemplateGroupModalView {el:$("#delete-templategroup-modal"), model:appModel}
  
  # Activate tabs
  $("#tabs a").click (e) ->
    $(this).tab("show")
    e.preventDefault()
  $("#tabs a:first").tab("show")
  
