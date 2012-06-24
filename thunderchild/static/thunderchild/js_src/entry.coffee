window.AppModel = Backbone.Model.extend

  showFileChooser: ->
    @trigger "showFileChooser"

window.FileChooserWidgetView = Backbone.View.extend

  initialize: ->
    @chooseFileButton = $('<a href="#" class="btn choose-file-button">Choose file</a>').click _.bind(@chooseFileButtonClickHandler, @)
    @$el.parent().prepend @chooseFileButton
    @$el.hide() # We hide the actual input element

  chooseFileButtonClickHandler: (e) ->
    @model.showFileChooser()
    e.preventDefault()

window.FileChooserModalView = Backbone.View.extend

  initialize: ->
    @$el.modal().modal("hide")
    @model.on "showFileChooser", @show, @
    
  show: ->
    @$el.modal("show")
