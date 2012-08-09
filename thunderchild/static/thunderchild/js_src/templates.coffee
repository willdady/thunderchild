templateRoot = '/backend/api/templates/template'
templateGroupRoot = '/backend/api/templates/group'

# Models

AppModel = Backbone.Model.extend

  selectedTemplate: (model) ->
    if model
      @set("selectedTemplate", model)
    return @get("selectedTemplate")
    
  openNewTemplateModal: (group_id) ->
    @trigger "openNewTemplateModal", group_id


TemplateModel = Backbone.Model.extend {urlRoot:templateRoot}

TemplateCollection = Backbone.Collection.extend {model:TemplateModel, url:templateRoot}

# Views

ActionBarView = Backbone.View.extend

  events:
    "click #create-templategroup-button":"createTemplateGroupClickHandler",
    "click #delete-template-button":"deleteTemplateClickHandler",
    "click #save-template-button":"saveTemplateClickHandler"
    
  createTemplateGroupClickHandler: (e) ->
    log("createTemplateGroupClickHandler")
    e.preventDefault()
    
  deleteTemplateClickHandler: (e) ->
    log("deleteTemplateClickHandler")
    e.preventDefault()
    
  saveTemplateClickHandler:(e) ->
    log("saveTemplateClickHandler")
    e.preventDefault()

NewTemplateModalView = Backbone.View.extend

  initialize: ->
    @model.on "openNewTemplateModal", @open, @
    
  events:
    "click #create-template-button":"createTemplateButtonClickHandler"
    
  open: (group_id) ->
    $("#id2_templategroup").val(group_id)
    # We clean up the modal by removing any previously entered values and error alerts
    @$el.find(".alert").remove()
    @$el.find(".error").removeClass("error")
    @$el.find("form").each -> this.reset()
    # Show the modal
    @$el.modal("show")
    # Give the first input focus
    $("#id2_template_short_name").focus()
    
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
      error: (model, response) ->
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
    

TemplateGroupView = Backbone.View.extend

  initialize: ->
    @id = parseInt(@$el.attr("data-id"))
    # Instantiate a TemplateListItemView for each Template belonging to this group
    @$el.find("ul li").each (i, el) =>
      model = new TemplateModel {id:$(el).attr("data-id"), templategroup:@id}
      new TemplateListItemView {el:el, model:model, appModel:@model}
      # Add the model to the global template collection
      @collection.add(model, {silent:true})
    # Listen for newly created templates added to the collection
    @collection.on "add", @templateAddedHandler, @
      
  events:
    "click .new-template-button":"newTemplateButtonClickHandler"
    
  newTemplateButtonClickHandler: (e) ->
    @model.openNewTemplateModal(@id)
    e.stopPropagation()
    e.preventDefault()
    
  templateAddedHandler: (templateModel) ->
    # If the newly created template belongs to this group instantiate it's view and add a new element to the DOM.
    if templateModel.get("templategroup") == @id
      el = $(_.template( $("#template-list-item-template").text(), templateModel.toJSON()))
      @$el.find("ul").prepend(el)
      @$el.find("ul>li").tsort() # <- TinySort plugin
      templateView = new TemplateListItemView {el:el, model:templateModel, appModel:@model}
      templateView.modelPopulated = true # Since we have a complete model returned from the server we set this flag true so we don't do another request for the data on selection.
      @model.selectedTemplate(templateModel)

TemplateListItemView = Backbone.View.extend

  initialize: ->
    @modelPopulated = false
    @options.appModel.on "change:selectedTemplate", @selectedTemplateChangeHandler, @
    @model.on "change", @modelChangeHandler, @

  events:
    'click a':'clickHandler'
    
  modelChangeHandler: ->
    @modelPopulated = true
    
  clickHandler:(e) ->
    @options.appModel.selectedTemplate(@model)
    # If the model has not been populated with data we do a fetch
    if not @modelPopulated
      @model.fetch()
    e.preventDefault()
    
  selectedTemplateChangeHandler: ->
    if @options.appModel.get("selectedTemplate") == @model
      @$el.addClass("active")
    else
      @$el.removeClass("active")
      
    
TemplateEditorView = Backbone.View.extend

  initialize: ->
    @editor = ace.edit("editor")
    @editor.setTheme("ace/theme/twilight")
    @editor.setShowPrintMargin(false)
    @setMode("ace/mode/html")
    
    
    @model.on "change:selectedTemplate", @selectedTemplateChangeHandler, @
    
  selectedTemplateChangeHandler: ->
    # If we have a reference to an existing template remove event callback
    if @templateModel
        @templateModel.off "change", @populateFromModel, @
    # Add event callback to newly selected template
    @templateModel = @model.get("selectedTemplate")
    @templateModel.on "change", @populateFromModel, @
    @populateFromModel()
    
  populateFromModel: ->
    text = @templateModel.get("template_content")
    if text
      @editor.getSession().getDocument().setValue(text)
    
  setMode: (mode) ->
    M = require(mode).Mode
    @editor.getSession().setMode( new M() )
    
    
SettingsView = Backbone.View.extend

  initialize: ->
    @model.on "change:selectedTemplate", @selectedTemplateChangeHandler, @
    
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

$ ->
  appModel = new AppModel()
  
  templateCollection = new TemplateCollection()
  
  actionBarView = new ActionBarView {el:$(".action-bar"), model:appModel}
  
  templateEditorView = new TemplateEditorView {el:$("#editor-pane"), model:appModel}
  
  settingsView = new SettingsView {el:$("#settings-pane"), model:appModel}
  
  newTemplateModal = new NewTemplateModalView {el:$("#create-template-modal"), model:appModel, collection:templateCollection}
  
  $("#template-browser > ul > li").each (i, el) ->
    new TemplateGroupView {el:el, model:appModel, collection:templateCollection}
  
  # Activate tabs
  $("#tabs a").click (e) ->
    $(this).tab("show")
    e.preventDefault()
  $("#tabs a:first").tab("show")
  
