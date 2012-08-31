(function() {
  var AppView;
  AppView = Backbone.View.extend({
    initialize: function() {
      return this.typeChangeHandler();
    },
    events: {
      'change #id_field_type': 'typeChangeHandler'
    },
    typeChangeHandler: function() {
      var type;
      type = $("#id_field_type option:selected").val();
      if (type === 'text' || type === 'textarea') {
        $("#max-length-group").show();
      } else {
        $("#max-length-group").hide();
      }
      if (type === 'select' || type === 'checkboxes' || type === 'radiobuttons') {
        return $("#field-choices-group").show();
      } else {
        return $("#field-choices-group").hide();
      }
    }
  });
  $(function() {
    var appView;
    return appView = new AppView({
      el: window
    });
  });
}).call(this);
