######################################################################################    
# Models
###################################################################################### 

AssetModel = Backbone.Model.extend({selected:false})

AssetCollection = Backbone.Collection.extend

  model:AssetModel
  
  url:'/backend/media/assets'


AppModel = Backbone.Model.extend

  showUploadModal: ->
    @trigger 'showUploadModal'
    
  showDeleteSelectedModal: ->
    @trigger 'showDeleteSelectedModal'
    
  showPreviewModal: (model) ->
    @trigger 'showPreviewModal', model
    

######################################################################################    
# Views
######################################################################################    
    
PreviewModalView = Backbone.View.extend

  el:"#preview_modal"
  
  initialize: ->
    @$el.modal({backdrop:"static"}).modal("hide");
    @model.on "showPreviewModal", @show, @
    @imageTemplate = _.template( $("#preview_modal_template").html() )
    
  show:(assetModel) ->
    modal_body = @$el.find ".modal-body"
    modal_body.html( @imageTemplate(assetModel.toJSON()) )
    @$el.modal("show")
    

DeleteSelectedModalView = Backbone.View.extend

  el:"#delete_selected_modal"

  initialize: ->
    @$el.modal({backdrop:"static"}).modal("hide");
    @model.on "showDeleteSelectedModal", @show, @
    
  events:
    'click #modal_confirm_delete_button':'confirmDeleteButtonHandler'
    
  confirmDeleteButtonHandler:(e) ->
    assetCollection = @model.get("assetCollection")
    models_to_delete = []
    for model in assetCollection.models
      if model.get("selected")
        models_to_delete.push(model)
    _.each models_to_delete, (model) ->
      model.destroy()
    @$el.modal("hide")
    @model.set("numCheckedAssets", 0)
    e.preventDefault()
    
  show: ->
    @$el.modal("show")
    

UploadModalView = Backbone.View.extend

  el:"#upload_modal"
  
  initialize: ->
    @CHOOSE_FILE_STATE = "choose_file"
    @UPLOADING_STATE = "uploading"
    @NAME_CONFLICT_STATE = "name_conflict"
    
    @$el.modal({backdrop:"static"}).modal("hide")
    @modalFileField = $("#modal_file_field")
    @uploadButton = $("#modal_upload_button")
    @progressBar = @$el.find(".progress .bar")
    
    @model.on "showUploadModal", @show, @
    
  events:
    'click #modal_upload_button':'uploadClickHandler',
    'change #modal_file_field':'fileFieldChangeHandler'
    
  showState:(state) ->
    stateElements = @$el.find('[data-state]')
    stateElements.filter("[data-state='#{ state }']").show()
    stateElements.filter("[data-state!='#{ state }']").hide()

  uploadClickHandler:(e) ->
    file_list = @modalFileField[0].files
    if file_list.length > 0
      file = file_list[0]
      @showState(@UPLOADING_STATE)
      @uploadFile(file)
    e.preventDefault()

  onProgressHandler:(e) ->
    percentage = Math.round((e.position / e.total) * 100)
    @progressBar.width(percentage+"%")
    console.log("percentage: ", percentage, e)

  onLoadHandler:(e) ->
    if e.currentTarget.status == 200
        #Add the thumbnail to our list of thumbnails
        response = $.parseJSON(e.currentTarget.response)
        if response.name_conflict
          @showState(@NAME_CONFLICT_STATE)
        else
          @$el.modal("hide")
          window.location.replace(window.location.href) # We reload the page (without url parameters, taking us to the first page)
          #@model.get("assetCollection").add(response)

  uploadFile:(file, onprogress, onload) ->
      fd = new FormData()
      fd.append("file", file)
      xhr = new XMLHttpRequest()
      xhr.open("POST","/backend/media/upload", true)
      xhr.upload.onprogress = _.bind(@onProgressHandler, @)
      xhr.onload = _.bind(@onLoadHandler, @)
      xhr.setRequestHeader("X-CSRFToken", Utilities.getCookie('csrftoken'))
      xhr.send(fd)
      
  show: ->
    #We disable the upload button and reset the form when displaying the modal
    @uploadButton.addClass "disabled"
    $("#modal_upload_form")[0].reset()
    @showState(@CHOOSE_FILE_STATE)
    @$el.modal("show")
    
  fileFieldChangeHandler: ->
    #When the input changes we enable the upload button
    @uploadButton.removeClass "disabled"


AssetItemView = Backbone.View.extend

  initialize: ->
    @model.on "destroy", @destroyHandler, @

  events:
    'click':'clickHandler',
    'click .thumbnail input[type="checkbox"]':'thumbnailCheckboxClickHandler',
    'change .thumbnail input[type="checkbox"]':'thumbnailCheckboxChangeHandler'

  clickHandler:(e) ->
    # If our asset is an image we open it in the preview modal. All other types follow standard default behaviour and a link to the file.
    if @model.get('is_image')
      @options.appModel.showPreviewModal(@model)
      e.preventDefault()
    
  thumbnailCheckboxClickHandler:(e) ->
    e.stopPropagation()
    
  thumbnailCheckboxChangeHandler:(e) ->
    id = $(e.currentTarget).attr('data-id')
    if $(e.currentTarget).is(':checked')
      @model.set("selected", true)
      @trigger "selection_change", true
    else
      @model.set("selected", false)
      @trigger "selection_change", false
      
  destroyHandler: ->
    @$el.remove()
    @off() # Removes all event callbacks
      
      
AssetItemsView = Backbone.View.extend

  el:"#thumbnails_list"

  initialize: ->
    @collection.on "reset", @collectionResetHandler, @
    @thumbnail_template = _.template($("#thumbnail_template").html())
    
  collectionResetHandler: ->
    @$el.empty()
    for model in @collection.models
      modelJSON = model.toJSON()
      asset = new AssetItemView({el:@thumbnail_template(modelJSON), model:model, appModel:@model})
      asset.on "selection_change", @assetSelectionChangeHandler, @
      @$el.append(asset.el)
      
  assetSelectionChangeHandler:(isSelected) ->
    numCheckedAssets = $(".thumbnail input[type='checkbox']:checked").length
    @model.set("numCheckedAssets", numCheckedAssets)
    

AppView = Backbone.View.extend

  el:window
  
  initialize: ->
    @thumbnailsForm = $("#thumbnails_form")
    @model.on "change:numCheckedAssets", @numCheckedAssetsChangeHandler, @
    
  events:
    'click #upload_button':'uploadButtonClickHandler',
    'click #deselect_button':'deselectButtonClickHandler',
    'click #delete_button':'deleteButtonClickHandler'
    
  uploadButtonClickHandler:(e) ->
    @model.showUploadModal()
    e.preventDefault()
    
  deselectButtonClickHandler:(e) ->
    button = $(e.currentTarget)
    if !button.hasClass('disabled')
      @thumbnailsForm[0].reset()
      @model.set("numCheckedAssets", 0)
    e.preventDefault()
    
  deleteButtonClickHandler:(e) ->
    button = $(e.currentTarget)
    if !button.hasClass('disabled')
      @model.showDeleteSelectedModal()
    e.preventDefault()
    
  numCheckedAssetsChangeHandler:(e, num) ->
    if num > 0
      $("#deselect_button").removeClass("disabled")
      $("#delete_button").removeClass("disabled")
    else
      $("#deselect_button").addClass("disabled")
      $("#delete_button").addClass("disabled")


$ ->
  assetCollection = new AssetCollection()
  model = new AppModel({assetCollection:assetCollection})
  
  uploadModal = new UploadModalView({model:model})
  deleteSelectedModal = new DeleteSelectedModalView({model:model})
  previewModal = new PreviewModalView({model:model})
  appView = new AppView({model:model})

  assetItemsView = new AssetItemsView({collection:assetCollection, model:model})
  assetCollection.reset($.parseJSON(initial_data))
  
  

  
  
