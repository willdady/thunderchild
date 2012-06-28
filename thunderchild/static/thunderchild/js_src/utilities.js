Utilities = (function() {
	var methods = {
		getCookie:function (name) {
	        var cookieValue = null;
	        if (document.cookie && document.cookie != '') {
	            var cookies = document.cookie.split(';');
	            for (var i = 0; i < cookies.length; i++) {
	                var cookie = jQuery.trim(cookies[i]);
	                // Does this cookie string begin with the name we want?
	                if (cookie.substring(0, name.length + 1) == (name + '=')) {
	                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
	                    break;
	                }
	            }
	        }
	        return cookieValue;
	   },
	   autoSlug:function (source, dest) {
		     source.keyup(function(e){
		          dest.val(source.val().toLowerCase().replace(/[^_-a-zA-Z0-9\s]+/ig, "").replace(/\s+/g, "-"));
		     });
		},
		insertAtCaret: function(areaId, text) {
			var txtarea = document.getElementById(areaId);
		    var scrollPos = txtarea.scrollTop;
		    var strPos = 0;
		    var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ? 
		        "ff" : (document.selection ? "ie" : false ) );
		    if (br == "ie") { 
		        txtarea.focus();
		        var range = document.selection.createRange();
		        range.moveStart ('character', -txtarea.value.length);
		        strPos = range.text.length;
		    }
		    else if (br == "ff") strPos = txtarea.selectionStart;
		
		    var front = (txtarea.value).substring(0,strPos);  
		    var back = (txtarea.value).substring(strPos,txtarea.value.length); 
		    txtarea.value=front+text+back;
		    strPos = strPos + text.length;
		    if (br == "ie") { 
		        txtarea.focus();
		        var range = document.selection.createRange();
		        range.moveStart ('character', -txtarea.value.length);
		        range.moveStart ('character', strPos);
		        range.moveEnd ('character', 0);
		        range.select();
		    }
		    else if (br == "ff") {
		        txtarea.selectionStart = strPos;
		        txtarea.selectionEnd = strPos;
		        txtarea.focus();
		    }
		    txtarea.scrollTop = scrollPos;
		}
	}
	return methods;
})();
