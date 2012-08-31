
AppView = Backbone.View.extend

  initialize: ->
    @typeChangeHandler()

  events:
    'change #id_field_type':'typeChangeHandler'
    
  typeChangeHandler: ->
    type = $("#id_field_type option:selected").val()
    if type == 'text' or type == 'textarea'
      $("#max-length-group").show()
    else
      $("#max-length-group").hide()
    if type == 'select' or type == 'checkboxes' or type == 'radiobuttons'
      $("#field-choices-group").show()
    else
      $("#field-choices-group").hide()
      

$ ->
  appView = new AppView el:window