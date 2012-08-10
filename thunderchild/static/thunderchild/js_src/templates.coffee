templateRoot = '/backend/api/templates/template'
templateGroupRoot = '/backend/api/templates/group'

# Models

AppModel = Backbone.Model.extend

  selectedTemplate: (model) ->
    if model
      @set("selectedTemplate", model)
    return @get("selectedTemplate")
    
  openNewTemplateModal: (templateGroupModel) ->
    @trigger "openNewTemplateModal", templateGroupModel
    
  openNewTemplateGroupModal: () ->
    @trigger "openNewTemplateGroupModal"
    
  openConfirmDeleteModal: ->
    @trigger "openConfirmDeleteModal"


TemplateGroupModel = Backbone.Model.extend

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
    

TemplateCollection = Backbone.Collection.extend {model:TemplateModel, url:templateRoot}

# Views

ActionBarView = Backbone.View.extend

  initialize: ->
    @model.on "change:selectedTemplate", @selectedTemplateChangeHandler, @

  events:
    "click #create-templategroup-button":"createTemplateGroupClickHandler",
    "click #delete-template-button":"deleteTemplateClickHandler",
    "click #save-template-button":"saveTemplateClickHandler"
    
  selectedTemplateChangeHandler: ->
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
      @model.openConfirmDeleteModal()
    e.preventDefault()
    
  saveTemplateClickHandler:(e) ->
    log("saveTemplateClickHandler")
    e.preventDefault()


ConfirmDeleteModalView = Backbone.View.extend

  initialize: ->
    @model.on "openConfirmDeleteModal", @open, @

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
    
  open: (templateGroupModel) ->
    $("#id2_templategroup").val(templateGroupModel.id)
    # We clean up the modal by removing any previously entered values and error alerts
    @removeErrors()
    @$el.find("form").each -> this.reset()
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
    e.preventDefault()
    
    
NewTemplateGroupModalView = Backbone.View.extend

  initialize: ->
    @model.on "openNewTemplateGroupModal", @open, @
    
  events:
    "click #create-templategroup-button":"createTemplateGroupButtonClickHandler"
    
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
        # Create new DOM elements from the data received.
        templategroup_element = $(_.template($("#templategroup-list-item-template").text(), data.templategroup))
        template_element = $(_.template($("#template-list-item-template").text(), data.template))
        templategroup_element.find("ul").append(template_element)
        # Add the new template group element to the DOM
        $("#template-browser > ul").prepend( templategroup_element )
        # Instantiate the Backbone model and view for handling the new elements
        model = new TemplateGroupModel(data.templategroup)
        templategroup = new TemplateGroupView {el:templategroup_element, model:model, collection:@collection, appModel:@model}
        @close()
    ,"json"
    ).error ->
      log("ERROR", data)
    e.preventDefault()
    

TemplateGroupView = Backbone.View.extend

  initialize: ->
    @name = @$el.find(".group-header h3").text()
    # Instantiate a TemplateListItemView for each Template belonging to this group
    @$el.find("ul li").each (i, el) =>
      model = new TemplateModel {id:$(el).attr("data-id"), templategroup:@model.id, template_short_name:$.trim( $(el).text() )}
      model.templateGroupModel(@model)
      templateListItemView = new TemplateListItemView {el:el, model:model, appModel:@options.appModel}
      # Add the model to the global template collection
      @collection.add(model, {silent:true})
      if model.get("template_short_name") == "index"
        @model.indexTemplateModel(model)
    # Listen for newly created templates added to the collection
    @collection.on "add", @templateAddedHandler, @
      
  events:
    "click .new-template-button":"newTemplateButtonClickHandler"
    
  newTemplateButtonClickHandler: (e) ->
    @options.appModel.openNewTemplateModal(@model)
    e.stopPropagation()
    e.preventDefault()
    
  sort: ->
    @$el.find("ul>li").tsort() # <- TinySort plugin
    @$el.find("ul").prepend( @$el.find("[data-is-index=1]") ) # Keep the index template always first
    
  templateAddedHandler: (templateModel) ->
    # If the newly created template belongs to this group instantiate it's view and add a new element to the DOM.
    if templateModel.get("templategroup") == @model.id
      el = $(_.template( $("#template-list-item-template").text(), templateModel.toJSON()))
      @$el.find("ul").prepend(el)
      @sort()
      templateView = new TemplateListItemView {el:el, model:templateModel, appModel:@options.appModel}
      templateView.modelPopulated = true # Since we have a complete model returned from the server we set this flag true so we don't do another request for the data on selection.
      @options.appModel.selectedTemplate(templateModel)
      
  getIndexModel: ->
    templates = @collection.where({templategroup:@model.id})
    return _.find templates, (model) -> return model.get("template_short_name") == 'index'


TemplateListItemView = Backbone.View.extend

  initialize: ->
    @options.appModel.on "change:selectedTemplate", @selectedTemplateChangeHandler, @
    @model.on "destroy", @modelDestroyHandler, @

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
      
    
TemplateEditorView = Backbone.View.extend

  initialize: ->
    @editor = ace.edit("editor")
    @editor.setTheme("ace/theme/twilight")
    @editor.setShowPrintMargin(false)
    @editor.getSession().on "change", _.bind @editorChangeHandler, @
    @setMode("ace/mode/html")
    @model.on "change:selectedTemplate", @selectedTemplateChangeHandler, @
    
  editorChangeHandler: ->
    @templateModel = @model.get("selectedTemplate")
    @templateModel.set("template_content", @editor.getSession().getValue(), {silent:true})
    
  selectedTemplateChangeHandler: ->
    if @templateModel
      @templateModel.off "change", @templateModelChangeHandler, @
    @templateModel = @model.get("selectedTemplate")
    @templateModelChangeHandler()
    @templateModel.on "change", @templateModelChangeHandler, @
      
  templateModelChangeHandler: ->
    @templateModel = @model.get("selectedTemplate")
    text = @templateModel.get("template_content")
    if text
      @editor.getSession().setValue(text)
    
  setMode: (mode) ->
    @editor.getSession().setMode(mode)
    
    
SettingsView = Backbone.View.extend

  initialize: ->
    @model.on "change:selectedTemplate", @selectedTemplateChangeHandler, @
    
  events:
    "change :input":"inputChangeHander"
    
  inputChangeHander: ->
    formData = @$el.find("form").serializeObject()
    if @templateModel
      @templateModel.set(formData)
    log("input change", @templateModel)
    
  selectedTemplateChangeHandler: ->
    # If we have a reference to an existing template remove event callback
    if @templateModel
        @templateModel.off "change", @populateFromModel, @
    # Add event callback to newly selected template
    @templateModel = @model.get("selectedTemplate")
    @templateModel.on "change", @populateFromModel, @
    @populateFromModel()
    
  populateFromModel: ->
    if @templateModel.get("template_short_name")
      $("#id_template_short_name").val( @templateModel.get("template_short_name") )
      $("#id_template_content_type").val ( @templateModel.get("template_content_type") )
      $("#id_template_cache_timeout").val( @templateModel.get("template_cache_timeout") )
      $("#id_template_redirect_type").val( @templateModel.get("template_redirect_type") )
      $("#id_template_redirect_url").val( @templateModel.get("template_redirect_url") )
      
      $("input:radio[name=template_is_private][value='True']").attr("checked", @templateModel.get("template_is_private"))
      $("input:radio[name=template_is_private][value='False']").attr("checked", !@templateModel.get("template_is_private"))
      # As index templates are forbidden from being renamed we hide the input
      if @templateModel.get("template_short_name") == 'index'
        $("#id_template_short_name").parent().parent().hide()
      else
        $("#id_template_short_name").parent().parent().show()

$ ->
  appModel = new AppModel()
  
  templateCollection = new TemplateCollection()
  
  actionBarView = new ActionBarView {el:$(".action-bar"), model:appModel}
  
  templateEditorView = new TemplateEditorView {el:$("#editor-pane"), model:appModel}
  
  settingsView = new SettingsView {el:$("#settings-pane"), model:appModel}
  
  newTemplateModal = new NewTemplateModalView {el:$("#create-template-modal"), model:appModel, collection:templateCollection}
  newTemplateGroupModal = new NewTemplateGroupModalView {el:$("#create-templategroup-modal"), model:appModel, collection:templateCollection}
  
  confirmDeleteModal = new ConfirmDeleteModalView {el:$("#delete-template-modal"), model:appModel}
  
  $("#template-browser > ul > li").each (i, el) ->
    model = new TemplateGroupModel({ id:parseInt($(el).attr("data-id")) })
    templategroup = new TemplateGroupView {el:el, model:model, collection:templateCollection, appModel:appModel}
    if templategroup.name == 'root'
      indexModel = templategroup.getIndexModel()
      appModel.selectedTemplate( indexModel )
  
  # Activate tabs
  $("#tabs a").click (e) ->
    $(this).tab("show")
    e.preventDefault()
  $("#tabs a:first").tab("show")
  
