define("entries/models/AppModel",["jquery","lib/backbone"],function(e){var t=Backbone.Model.extend({openConfirmDeleteModal:function(){this.trigger("openConfirmDeleteModal")},selectAll:function(){this.trigger("selectAll")},selectNone:function(){this.trigger("selectNone")}});return new t}),define("entries/models/EntryModel",["jquery","lib/backbone"],function(e){var t=Backbone.Model.extend({isSelected:function(e){return e!==undefined&&this.set("isSelected",e===!0),this.get("isSelected")}});return t}),define("entries/models/EntryModelCollection",["jquery","entries/models/EntryModel","lib/backbone","lib/log"],function(e,t){var n=Backbone.Collection.extend({model:t,numSelected:function(){var e=0;return _.each(this.models,function(t){t.isSelected()&&e++}),e},deleteSelected:function(){var t=[];_.each(this.models,function(e){if(e.isSelected()){var n={id:e.id};t.push(n)}}),t=JSON.stringify(t),e.ajax({url:deleteURL,type:"DELETE",data:t,success:function(e,t,n){n.status==200?location.reload():console.log("Non 200 response returned.")}})}});return new n}),define("entries/views/EntryView",["jquery","entries/models/AppModel","lib/backbone"],function(e,t){var n=Backbone.View.extend({initialize:function(){t.on("selectAll",this.select,this),t.on("selectNone",this.deselect,this)},events:{"change .entry-checkbox":"checkboxChangeHandler"},select:function(){this.$el.addClass("selected"),this.$(".entry-checkbox").prop("checked",!0),this.model.isSelected(!0)},deselect:function(){this.$el.removeClass("selected"),this.$(".entry-checkbox").prop("checked",!1),this.model.isSelected(!1)},checkboxChangeHandler:function(){var e=this.$(".entry-checkbox").is(":checked");this.model.isSelected(e),e?this.$el.addClass("selected"):this.$el.removeClass("selected")}});return n}),define("entries/views/AppView",["jquery","entries/models/AppModel","entries/models/EntryModel","entries/models/EntryModelCollection","entries/views/EntryView","lib/backbone"],function(e,t,n,r,i){var s=Backbone.View.extend({el:"body",initialize:function(){e("#entries-table tbody tr").each(function(){var t=new n({id:e(this).attr("data-id")}),s=new i({el:this,model:t});r.add(t,{silent:!0})})},events:{"change #select-all-checkbox":"selectAllChangeHandler"},selectAllChangeHandler:function(){e("#select-all-checkbox").is(":checked")?t.selectAll():t.selectNone()}});return s}),define("entries/views/ConfirmDeleteModalView",["jquery","entries/models/AppModel","entries/models/EntryModelCollection","lib/backbone"],function(e,t,n){var r=Backbone.View.extend({el:"#confirm-delete-modal",initialize:function(){t.on("openConfirmDeleteModal",this.open,this)},events:{"click #confirm-delete-button":"confirmDeleteClickHandler"},open:function(){this.$el.modal("show")},close:function(){this.$el.modal("hide")},confirmDeleteClickHandler:function(){e("#confirm-delete-button").hasClass("disabled")||(e("#confirm-delete-button").addClass("disabled"),n.deleteSelected())}});return r}),define("entries/views/ControlsView",["jquery","entries/models/AppModel","entries/models/EntryModelCollection","lib/backbone"],function(e,t,n){var r=Backbone.View.extend({el:".controls",initialize:function(){n.on("change",this.entryChangeHandler,this)},events:{"click #delete-selected-btn":"deleteSelectedClickHandler"},entryChangeHandler:function(){n.numSelected()>0?e("#delete-selected-btn").removeClass("disabled"):e("#delete-selected-btn").addClass("disabled")},deleteSelectedClickHandler:function(n){e("#delete-selected-btn").hasClass("disabled")||t.openConfirmDeleteModal(),n.preventDefault()}});return r}),requirejs(["jquery","entries/views/AppView","entries/views/ConfirmDeleteModalView","entries/views/ControlsView","lib/log"],function(e,t,n,r){e(function(){console.log("INIT!");var e=new t,i=new n,s=new r})}),define("entries/Main",[],function(){})