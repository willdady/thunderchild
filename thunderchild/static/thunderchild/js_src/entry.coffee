counter = 0

window.AppModel = Backbone.Model.extend

  hideMediaChooser: ->
    @trigger "hideMediaChooser"

  showMediaChooser:(uid, backdrop=true) ->
    @set("uid", uid)
    @trigger "showMediaChooser", backdrop
    
  assetSelectionCallback: (obj) ->
    @trigger "assetSelected", obj
    
  showTextAreaModal:(uid, text) ->
    @set("fullscreen_source_uid", uid)
    @trigger "showTextAreaModal", text
    
  textAreaModalClosed:(text) ->
    @trigger "textAreaModalChange", text

window.MediaChooserWidgetView = Backbone.View.extend

  initialize: ->
    @chooseFileButton = $('<a href="#" class="btn choose-file-button">Choose file</a>').click _.bind(@chooseFileButtonClickHandler, @)
    @$el.parent().prepend @chooseFileButton
    @$el.hide() # We hide the actual input element
    
    @uid = counter # We give each widget a UID
    counter++
    @model.on "assetSelected", @assetSelectedHandler, @

  chooseFileButtonClickHandler: (e) ->
    @model.showMediaChooser(@uid)
    e.preventDefault()
    
  assetSelectedHandler:(obj) ->
    if @model.get("uid") != @uid
      return # Make sure the event belongs to us by checking the received uid matches.
    # Assign the MediaAsset's id to the value of the field
    @$el.val(obj.id)
    # Replace the content of the thumbnail holder with the newly selected asset
    thumbnailTemplate = _.template( $("#mediaAssetThumbnailTemplate").text() )
    content = thumbnailTemplate({thumbnail_url:obj.thumbnail_url, filename:obj.filename})
    @existingThumbnail = @$el.parent().find ".media-asset-thumbnail"
    if @existingThumbnail.length > 0
      @existingThumbnail.replaceWith( content )
    else
      @$el.parent().prepend( content )
    # Hide the chooser
    @model.hideMediaChooser()

window.MediaChooserModalView = Backbone.View.extend

  initialize: ->
    @$el.modal().modal("hide")
    @model.on "showMediaChooser", @show, @
    @model.on "hideMediaChooser", @hide, @
    
  show:(backdrop) ->
    @$el.modal("show")
    if !backdrop
      $(".modal-backdrop:last").remove() # We immediately remove the modal backdrop from the dom of backdrop == false
    
  hide: ->
    @$el.modal("hide")
    

window.TextAreaModalView = Backbone.View.extend

  initialize: ->
    @$el.modal().modal('hide')
    @textarea = $("#textarea-modal-textarea")
    
    @model.on "showTextAreaModal", @show, @
    
  events:
    'click #textarea-modal-done-button':'doneClickHandler'
    
  show:(text) ->
    @$el.modal('show')
    @textarea.val(text)

  doneClickHandler: ->
    @model.textAreaModalClosed( @textarea.val() )

window.RichTextAreaView = Backbone.View.extend

  initialize: ->
    @uid = counter # We give each widget a UID
    counter++
    
    @controls = $( $("#textarea-controls-template").text() )
    @assetButton = @controls.find('.rich-text-asset-button')
    @$el.parent().prepend(@controls)
      
    @assetButton.click _.bind(@assetButtonClickHandler, @)
    
    @fullscreenButton = @controls.find('.rich-text-fullscreen-button')
    if @options.noFullscreen
      @fullscreenButton.hide()
    else:
      @fullscreenButton.click _.bind(@fullscreenButtonClickHandler, @)
    
    @model.on "assetSelected", @assetSelectedHandler, @
    @model.on "textAreaModalChange", @textAreaModalChangeHandler, @
    
  assetButtonClickHandler:(e) ->
    if @options.hideMediaChooserBackdrop
      @model.showMediaChooser(@uid, false)
    else
      @model.showMediaChooser(@uid)
    e.preventDefault()
  
  assetSelectedHandler:(obj) ->
    if @model.get("uid") != @uid
      return # Make sure the event belongs to us by checking the active uid matches.
    Utilities.insertAtCaret( @$el.attr('id'), obj.url )
    # Hide the chooser
    @model.hideMediaChooser()
    
  fullscreenButtonClickHandler:(e) ->
    @model.showTextAreaModal( @uid, @$el.val() )
    e.preventDefault()
    
  textAreaModalChangeHandler:(text) ->
    if @model.get("fullscreen_source_uid") != @uid
      return # Make sure the event belongs to us by checking the active uid matches.
    @$el.val(text)
