(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  window.MediaUploadService = Backbone.Collection.extend({
    uploadFile: function(file) {
      var fd, xhr;
      fd = new FormData();
      fd.append("file", file);
      xhr = new XMLHttpRequest();
      xhr.open("POST", uploadURL, true);
      xhr.upload.onprogress = __bind(function(e) {
        var percentage;
        percentage = Math.round((e.position / e.total) * 100);
        return this.trigger("progress", percentage);
      }, this);
      xhr.onload = __bind(function(e) {
        var response;
        if (e.currentTarget.status === 200) {
          response = $.parseJSON(e.currentTarget.response);
          if (response.name_conflict) {
            return this.trigger("nameConflict", response);
          } else {
            return this.trigger("complete");
          }
        }
      }, this);
      xhr.setRequestHeader("X-CSRFToken", Utilities.getCookie('csrftoken'));
      return xhr.send(fd);
    },
    replaceAsset: function(existing_asset_id, new_asset_id) {
      return $.post(replaceURL, {
        existing_asset_id: existing_asset_id,
        new_asset_id: new_asset_id
      }, __bind(function(response) {
        if (response.response === 'OK') {
          return this.trigger("replaceComplete");
        } else {
          return this.trigger("replaceError");
        }
      }, this));
    }
  });
}).call(this);
