define("entries/views/AppView",["jquery","lib/backbone"],function(e){var t=Backbone.View.extend({el:window,initialize:function(){e("#entry_type_select").change(this.entryTypeChangeHandler)},entryTypeChangeHandler:function(){e("#go_button").attr("href","/dashboard/entries/create/"+e(this).val())}});return t}),requirejs(["jquery","entries/views/AppView","lib/log"],function(e,t){e(function(){console.log("INIT!");var e=new t})}),define("entries/Main",[],function(){})