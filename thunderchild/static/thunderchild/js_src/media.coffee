######################################################################################    
# Models
###################################################################################### 

AssetModel = Backbone.Model.extend({selected:false})

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
    @$el.modal().modal("hide");
    @model.on "showPreviewModal", @show, @
    @imageTemplate = _.template( $("#preview_modal_template").html() )
    
  show:(assetModel) ->
    modal_body = @$el.find ".modal-body"
    modal_body.html( @imageTemplate(assetModel.toJSON()) )
    @$el.modal("show")
    

DeleteSelectedModalView = Backbone.View.extend

  el:"#delete_selected_modal"

  initialize: ->
    @$el.modal().modal("hide");
    @model.on "showDeleteSelectedModal", @show, @
    
  events:
    'click #modal_confirm_delete_button':'confirmDeleteButtonHandler'
    
  confirmDeleteButtonHandler:(e) ->
    $("#thumbnails_form").submit()
    e.preventDefault()
    
  show: ->
    @$el.modal("show")
    

UploadModalView = Backbone.View.extend

  el:"#upload_modal"
  
  initialize: ->
    @CHOOSE_FILE_STATE = "choose_file"
    @UPLOADING_STATE = "uploading"
    @NAME_CONFLICT_STATE = "name_conflict"
    
    @$el.modal().modal("hide")
    @modalFileField = $("#modal_file_field")
    @uploadButton = $("#modal_upload_button")
    @progressBar = @$el.find(".progress .bar")
    
    @replaceAssetControlsDisabled = false;
    
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
    window.location.replace(mediaURL) # We reload the page (without url parameters, taking us to the first page)

  uploadNameConflictHandler: (response) ->
    @model.set("uploadResponse", response) # Store the response in the app model so we can retrieve it later.
    @showState(@NAME_CONFLICT_STATE)
      
  show: ->
    @uploadButton.addClass "disabled" #We disable the upload button and reset the form when displaying the modal
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
      window.location.replace(mediaURL) # We reload the page (without url parameters, taking us to the first page)
    e.preventDefault()

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
    
    @$el.children().each (i, el) =>
      el = $(el)
      m = new AssetModel
        id:el.find('.thumbnail').attr('data-id'),
        is_image:el.find('.thumbnail').attr('data-is-image') == 'True',
        filename:el.find('.thumbnail').attr('data-filename'),
        url:el.find('.thumbnail').attr('data-url'),
        size:el.find('.size').text(),
        width:el.find('img').attr('data-width'),
        height:el.find('img').attr('data-height'),
                           
      asset = new AssetItemView({el:el, model:m, appModel:@model})
      asset.on "selection_change", @assetSelectionChangeHandler, @
      
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
    'click #delete_button':'deleteButtonClickHandler',
    'click #select_all_button':'selectAllButtonClickHandler'
    
  uploadButtonClickHandler:(e) ->
    @model.showUploadModal()
    e.preventDefault()
    
  deselectButtonClickHandler:(e) ->
    button = $(e.currentTarget)
    if !button.hasClass('disabled')
      @thumbnailsForm[0].reset()
      @model.set("numCheckedAssets", 0)
    e.preventDefault()
    
  selectAllButtonClickHandler:(e) ->
    button = $(e.currentTarget)
    checkboxes = $(".thumbnail input[type='checkbox']")
    checkboxes.prop("checked", true);
    checkboxes.trigger "change" # We must manually force a change event for the checkboxes
    @model.set("numCheckedAssets", checkboxes.length)
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
  model = new AppModel()
  uploadService = new window.MediaUploadService()
  
  uploadModal = new UploadModalView({model:model, uploadService:uploadService})
  deleteSelectedModal = new DeleteSelectedModalView({model:model})
  previewModal = new PreviewModalView({model:model})
  appView = new AppView({model:model})

  assetItemsView = new AssetItemsView({model:model})
  
  

  
  
