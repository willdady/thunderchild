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
  
  uploadModal = new UploadModalView({model:model})
  appView = new AppView({model:model})
  