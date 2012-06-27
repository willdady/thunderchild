# Note MediaUploadService refers to 2 variables which MUST be defined in the global scope. They are uploadURL and replaceURL.

window.MediaUploadService = Backbone.Collection.extend

  uploadFile:(file) ->
      fd = new FormData()
      fd.append("file", file)
      xhr = new XMLHttpRequest()
      xhr.open("POST", uploadURL, true)
      
      xhr.upload.onprogress = (e) =>
        percentage = Math.round((e.position / e.total) * 100)
        @trigger "progress", percentage
        
      xhr.onload = (e) =>
        if e.currentTarget.status == 200
          response = $.parseJSON(e.currentTarget.response)
          if response.name_conflict
            @trigger "nameConflict", response
          else
            @trigger "complete"
        
      xhr.setRequestHeader("X-CSRFToken", Utilities.getCookie('csrftoken'))
      xhr.send(fd)
      
  replaceAsset: (existing_asset_id, new_asset_id) ->
    $.post replaceURL, {existing_asset_id:existing_asset_id, new_asset_id:new_asset_id}, (response) =>
        if response.response == 'OK'
          @trigger "replaceComplete"
        else
          @trigger "replaceError"