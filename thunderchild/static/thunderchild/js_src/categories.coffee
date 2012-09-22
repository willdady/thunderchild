######################################################################################################################################
# Models
######################################################################################################################################

AppModel = Backbone.Model.extend

  openCreateCategoryGroupModal: ->
    @trigger "openCreateCategoryGroupModal"

  openEditCategoryGroupModal: (categoryGroupModel) ->
    @trigger "openEditCategoryGroupModal", categoryGroupModel
    
  openConfirmDeleteCategoryGroupModal: (categoryGroupModel) ->
    @trigger "openConfirmDeleteCategoryGroupModal", categoryGroupModel
    
  openConfirmDeleteCategoryModal: (categoryModel) ->
    @trigger "openConfirmDeleteCategoryModal", categoryModel


CategoryModel = Backbone.Model.extend()

CategoryGroupModel = Backbone.Model.extend()

CategoryCollection = Backbone.Collection.extend
  url:'/dashboard/categories/categories'
  model:CategoryModel

CategoryGroupCollection = Backbone.Collection.extend
  url:'/dashboard/categories/categorygroups'
  model:CategoryGroupModel

appModel = new AppModel()
categories = new CategoryCollection()
categoryGroups = new CategoryGroupCollection()


######################################################################################################################################
# Views
######################################################################################################################################

ConfirmDeleteModalView = Backbone.View.extend
  el:$("#confirm-delete-modal")
  
  initialize: ->
    appModel.on "openConfirmDeleteCategoryGroupModal", @openConfirmDeleteCategoryGroupModal, @
    appModel.on "openConfirmDeleteCategoryModal", @openConfirmDeleteCategoryModal, @
    
  events:
    "click #confirm-delete-button":"confirmDeleteHandler"
    
  confirmDeleteHandler: (e) ->
    @model.destroy()
    @close()
    e.preventDefault()
  
  openConfirmDeleteCategoryGroupModal: (model) ->
    @model = model
    $("#confirm-delete-message").html( "Are you sure you want to <b>permanently</b> delete this category group including all of it's categories?" )
    @open()
    
  openConfirmDeleteCategoryModal: (model) ->
    @model = model
    $("#confirm-delete-message").html( "Are you sure you want to <b>permanently</b> delete this category?" )
    @open()
  
  close: ->
    @$el.modal("hide")
  
  open: ->
    @$el.modal("show")
  

CategoryGroupModalView = Backbone.View.extend
  el:$("#categorygroup-modal")
  initialize: ->
    @EDIT_MODE = "editMode"
    @CREATE_MODE = "createMode"
    appModel.on "openCreateCategoryGroupModal", @openCreateCategoryGroupModal, @
    appModel.on "openEditCategoryGroupModal", @openEditCategoryGroupModal, @
    Utilities.autoSlug( $("#id_categorygroup_name"), $("#id_categorygroup_short_name") )
  
  events:
    "click #categorygroup-form-modal-ok-button":"okClickHandler"
    
  removeErrors: ->
    @$el.find(".alert").remove()
    @$el.find(".error").removeClass("error")
  
  addErrors: (errors) ->
    errors_html = ''
    # Loop over each field in the errors object. The errors object contains fields in the format {<field name>:["error", "error", ...], ...}
    _.each errors, (value, key) ->
      _.each value, (el, i) ->
        errors_html += _.template("<li><%= error %></li>", {error:el})
      $("#id_"+key).before( _.template($("#form-error-template").text(), {errors:errors_html}) )
      $("#id_"+key).parent().addClass("error")
    
  close: ->
    @$el.modal("hide")
  
  open: ->
    @removeErrors()
    @$el.modal("show")
  
  okClickHandler: (e) ->
    if $("#categorygroup-form-modal-ok-button").hasClass("disabled")
      e.preventDefault()
      return
    if @mode == @EDIT_MODE
      formData = $("#categorygroup-modal-form").serializeObject()
      @model.save formData,
        wait:true
        success: => @close()
        error: (model, response) =>
          @removeErrors()
          if response.status == 400
            resp = $.parseJSON(response.responseText)
            @addErrors(resp.errors)
    else
      formData = $("#categorygroup-modal-form").serializeObject()
      categoryGroups.create formData,
        wait:true
        success: =>
          @close()
        error: (model, response) =>
          @removeErrors()
          if response.status == 400
            resp = $.parseJSON(response.responseText)
            @addErrors(resp.errors)
    e.preventDefault()
  
  openCreateCategoryGroupModal: ->
    @mode = @CREATE_MODE
    @open()
    $("#id_categorygroup_name").focus()
    
  openEditCategoryGroupModal: (categoryGroupModel) ->
    @mode = @EDIT_MODE
    @model = categoryGroupModel
    @open()
    $("#id_categorygroup_name").val( @model.get("categorygroup_name") ).focus()
    $("#id_categorygroup_short_name").val( @model.get("categorygroup_short_name") )


CategoryView = Backbone.View.extend

  template:_.template($("#category-template").html())


CategoryGroupView = Backbone.View.extend

  template:_.template($("#categorygroup-template").html())
  
  className:"row-fluid accordion-group"

  initialize: ->
    categories.on "add", @categoryAddHandler, @
    @model.on "change", @render, @
    @model.on "destroy", @destroyHandler, @
    @render()
    
  events:
    "click .edit-group-button":"editGroupClickHandler"
    "click .delete-group-button":"deleteClickHandler"
    
  render: ->
    @$el.html( @template(@model.toJSON()) )
    
  destroyHandler: ->
    @$el.remove()
    
  editGroupClickHandler: (e) ->
    appModel.openEditCategoryGroupModal( @model )
    e.preventDefault()
    e.stopPropagation()
    
  deleteClickHandler: (e) ->
    appModel.openConfirmDeleteCategoryGroupModal( @model )
    e.preventDefault()
    e.stopPropagation()
    
  categoryAddHandler: (categoryModel) ->
    if categoryModel.get("categorygroup") == @model.id
      categoryView = new CategoryView model:categoryModel
      # TODO: Add categoryView to this view
  

AppView = Backbone.View.extend
  el:$(window)
  initialize: ->
    categoryGroups.on "reset", @categoryGroupResetHandler, @
    categoryGroups.on "add", @categoryGroupAddHandler, @
    
  events: ->
    'click #create-categorygroup-button':'createCategoryGroupClickHandler'
    
  createCategoryGroupClickHandler: (e) ->
    appModel.openCreateCategoryGroupModal()
    e.preventDefault()
    
  categoryGroupResetHandler: ->
    container = $("#content_container")
    _.each categoryGroups.models, (model) ->
      view = new CategoryGroupView model:model
      container.append( view.el )

  categoryGroupAddHandler: (model) ->
    view = new CategoryGroupView model:model
    $("#content_container").append( view.el )


$ ->
  appView = new AppView()
  categoryGroupModalView = new CategoryGroupModalView()
  confirmDeleteModalView = new ConfirmDeleteModalView()
  
  categoryGroups.reset( categoryGroupData )
  categories.reset( categoryData )
    