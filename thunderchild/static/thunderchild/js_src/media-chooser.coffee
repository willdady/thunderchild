######################################################################################    
# Models
###################################################################################### 

AppModel = Backbone.Model.extend

  showUploadModal: ->
    @trigger 'showUploadModal'
    
  assetSelectionCallback: (obj) ->
    if parent != window
      parent.appModel.assetSelectionCallback(obj)
    

######################################################################################    
# Views
###################################################################################### 

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
    
    @replaceAssetControlsDisabled = false
    
    @model.on "showUploadModal", @show, @
    @options.uploadService.on "progress", @uploadProgressHandler, @
    @options.uploadService.on "complete", @uploadCompleteHandler, @
    @options.uploadService.on "nameConflict", @uploadNameConflictHandler, @
    @options.uploadService.on "replaceComplete", @replaceCompleteHandler, @
    
  events:
    'click #modal_upload_button':'uploadClickHandler',
    'change #modal_file_field':'fileFieldChangeHandler',
    'click #yes-replace-button':'replaceFileClickHandler'
    'click #no-replace-button':'dontReplaceFileClickHandler'
    
  showState:(state) ->
    stateElements = @$el.find('[data-state]')
    stateElements.filter("[data-state='#{ state }']").show()
    stateElements.filter("[data-state!='#{ state }']").hide()

  uploadClickHandler:(e) ->
    file_list = @modalFileField[0].files
    if file_list.length > 0
      file = file_list[0]
      @showState(@UPLOADING_STATE)
      @options.uploadService.uploadFile(file)
    e.preventDefault()
    
  uploadProgressHandler:(percentage) ->
    @progressBar.width(percentage+"%")
  
  uploadCompleteHandler: ->
    @$el.modal("hide")
    window.location.replace(window.location.href) # We reload the page (without url parameters, taking us to the first page)

  uploadNameConflictHandler: (response) ->
    @model.set("uploadResponse", response) # Store the response in the app model so we can retrieve it later.
    @showState(@NAME_CONFLICT_STATE)
      
  show: ->
    #We disable the upload button and reset the form when displaying the modal
    @uploadButton.addClass "disabled"
    $("#modal_upload_form")[0].reset()
    @showState(@CHOOSE_FILE_STATE)
    @$el.modal("show")
    
  fileFieldChangeHandler: ->
    @uploadButton.removeClass "disabled" #When the input changes we enable the upload button
    
  replaceFileClickHandler:(e) ->
    if !@replaceAssetControlsDisabled
      uploadResponse = @model.get("uploadResponse")
      @replaceAssetControlsDisabled = true
      @options.uploadService.replaceAsset(uploadResponse.name_conflict.id, uploadResponse.id)
    e.preventDefault()
    
  replaceCompleteHandler: ->
    @$el.modal("hide")
    window.location.replace(window.location.href) # We reload the page (without url parameters, taking us to the first page)
    
  dontReplaceFileClickHandler:(e) ->
    if !@replaceAssetControlsDisabled
      @$el.modal("hide")
      window.location.replace(window.location.href) # We reload the page (without url parameters, taking us to the first page)
    e.preventDefault()
  
  
AssetItemView = Backbone.View.extend

  initialize: ->
    @filename = @$el.find("p").text()
    @id = @$el.attr("data-id")
    
  events: ->
    'click':'clickHandler'
    
  clickHandler: (e) ->
    @model.assetSelectionCallback( {id:@id, filename:@filename, thumbnail_url:@$el.find("img")[0].src } )
    e.preventDefault()
  
    
AppView = Backbone.View.extend

  el:window
  
  initialize: ->
    $(".thumbnail").each (i, val) =>
      new AssetItemView({el:val, model:@model})
  
  events:
    'click #media_chooser_upload_button':'uploadButtonClickHandler',
    
  uploadButtonClickHandler:(e) ->
    @model.showUploadModal()
    e.preventDefault()
    

$ ->
  model = new AppModel()
  uploadService = new window.MediaUploadService()
  
  uploadModal = new UploadModalView({model:model, uploadService:uploadService})
  appView = new AppView({model:model})
  