define("fields/views/AppView",["jquery","lib/utilities","lib/backbone"],function(e,t){return AppView=Backbone.View.extend({initialize:function(){this.typeChangeHandler(),t.autoAlphanumeric(e("#id_field_name"),e("#id_field_short_name"))},events:{"change #id_field_type":"typeChangeHandler"},typeChangeHandler:function(){var t=e("#id_field_type option:selected").val();t==="text"||t==="textarea"?e("#max-length-group").show():e("#max-length-group").hide(),t==="select"||t==="checkboxes"||t==="radiobuttons"?e("#field-choices-group").show():e("#field-choices-group").hide()}}),AppView}),requirejs(["jquery","fields/views/AppView","lib/log"],function(e,t){e(function(){console.log("INIT!");var n=new t({el:e(window)})})}),define("fields/Main",[],function(){})