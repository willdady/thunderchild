counter = 0

AppModel = Backbone.Model.extend

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

MediaChooserWidgetView = Backbone.View.extend

  initialize: ->
    @chooseFileButton = $('<a href="#" class="btn choose-file-button">Choose file</a>').click _.bind(@chooseFileButtonClickHandler, @)
    @$el.parent().prepend @chooseFileButton
    @$el.hide() # We hide the actual input element
    
    @thumbnailTemplate = _.template( $("#mediaAssetThumbnailTemplate").text() )
    
    @thumbnail = @$el.parent().find ".media-asset-thumbnail"
    @removeAssetButton = @thumbnail.find(".remove-asset-button").click _.bind(@removeAssetClickHandler, @)
    
    @uid = counter # We give each widget a UID
    counter++
    @model.on "assetSelected", @assetSelectedHandler, @
    
  removeAssetClickHandler: (e) ->
    if @thumbnail
      @thumbnail.remove()
      @$el.removeAttr("value")
    log("REMOVE", @thumbnail, @$el)
    e.preventDefault()

  chooseFileButtonClickHandler: (e) ->
    @model.showMediaChooser(@uid)
    e.preventDefault()
    
  assetSelectedHandler:(obj) ->
    if @model.get("uid") != @uid
      return # Make sure the event belongs to us by checking the received uid matches.
    # Assign the MediaAsset's id to the value of the field
    @$el.val(obj.id)
    # Replace the content of the thumbnail holder with the newly selected asset
    content = @thumbnailTemplate({thumbnail_url:obj.thumbnail_url, filename:obj.filename})
    @existingThumbnail = @$el.parent().find ".media-asset-thumbnail"
    if @existingThumbnail.length > 0
      @existingThumbnail.replaceWith( content )
    else
      @$el.parent().append( content )
    # Bind the remove button
    @thumbnail = @$el.parent().find ".media-asset-thumbnail"
    @removeAssetButton = @thumbnail.find(".remove-asset-button").click _.bind(@removeAssetClickHandler, @)
    # Hide the chooser
    @model.hideMediaChooser()


    
    


MediaChooserModalView = Backbone.View.extend

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
    

TextAreaModalView = Backbone.View.extend

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

RichTextAreaView = Backbone.View.extend

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

$ ->
  # This stops label elements from triggering their associated fields when clicked.
  $(".field_label_holder label").click (e) ->
    e.preventDefault();
  # Select first tab by default
  $("#tabs a:first").tab("show")
  # Auto slug the title field
  Utilities.autoSlug $("#id_title"), $("#id_slug")
  # Initialize date and datetime pickers
  $('[data-field-type="datetime"]').datetimepicker
    dateFormat:'yy-mm-dd',
    timeFormat:'hh:mm:ss',
    showSecond:true
  $('[data-field-type="date"]').datepicker
    dateFormat:'yy-mm-dd'
  
  window.appModel = new AppModel() # Note the appModel avariable is defined on the window object so it can be called from the iframed Media Chooser.
  
  mediaChooserModal = new MediaChooserModalView {el:$("#media_chooser_modal"), model:appModel}
  $('[data-field-type="file"]').each ->
    new MediaChooserWidgetView {el:$(this), model:appModel}
  
  # Convert all textareas to rich textareas. Note the textearea in the textarea modal will not create a fullscreen button
  $('textarea').each ->
    el = $(this)
    if el.attr("id") != "textarea-modal-textarea"
      new RichTextAreaView {el:el, model:appModel}
    else
      new RichTextAreaView {el:el, model:appModel, noFullscreen:true, hideMediaChooserBackdrop:true}
  
  textAreaModal = new TextAreaModalView {el:$("#textarea-modal"), model:appModel}
  
  # Initialize color pickers
  $('[data-field-type="color"]').each (i, el) ->
    pickerID = "picker"+i;
    picker = $('<div id="'+pickerID+'" class="picker"></div>');
    $(this).parent().append(picker)
    $(picker).farbtastic($(this));
