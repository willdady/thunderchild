counter = 0

window.AppModel = Backbone.Model.extend

  hideMediaChooser: ->
    @unset("uid")
    @trigger "hideMediaChooser"

  showMediaChooser:(uid) ->
    @set("uid", uid)
    @trigger "showMediaChooser"
    
  assetSelectionCallback: (obj) ->
    @trigger "assetSelected", obj

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
    
  show: ->
    @$el.modal("show")
    
  hide: ->
    @$el.modal("hide")
    

window.RichTextAreaView = Backbone.View.extend

  initialize: ->
    @uid = counter # We give each widget a UID
    counter++
    
    @assetButton = $('<a href="#" class="rich-text-asset-button btn"><i class="icon-picture"></i></a>')
    @$el.parent().prepend(@assetButton)
      
    @assetButton.click _.bind(@assetButtonClickHandler, @)
    @model.on "assetSelected", @assetSelectedHandler, @
    
  assetButtonClickHandler:(e) ->
    @model.showMediaChooser(@uid)
    e.preventDefault()
  
  assetSelectedHandler:(obj) ->
    if @model.get("uid") != @uid
      return # Make sure the event belongs to us by checking the received uid matches.
    Utilities.insertAtCaret( @$el.attr('id'), obj.url )
    # Hide the chooser
    @model.hideMediaChooser()
    
    
