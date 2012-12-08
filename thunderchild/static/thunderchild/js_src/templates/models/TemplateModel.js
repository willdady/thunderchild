define(['jquery', 'lib/backbone'], function($) {

	var TemplateModel = Backbone.Model.extend({

		urlRoot : thunderchild.templateRoot, // thunderchild object is global obj defined in templates.html.
		
		save : function(attributes, options) {
			this.trigger("save");
			var _options = {
				wait : true,
				success : _.bind(function(model, response) {
					this.trigger("saveSuccess", model, response);
					if (options.hasOwnProperty('success')) {
						options.success(model, response);
					}
				}, this),
				error : _.bind(function(model, response) {
					this.trigger("saveError", model, response);
					if (options.hasOwnProperty('error')) {
						options.error(model, response);
					}
				}, this)
			}
			Backbone.Model.prototype.save.call(this, attributes, _options);
		},
		
		templateGroupModel : function(model) {
			if (model) {
				this._templateGroupModel = model;
			}
			return this._templateGroupModel;
		},

		errors : function(obj) {
			if (obj) {
				this._errors = obj;
				this.trigger("errors", this._errors);
			}
			return this._errors;
		},

		requiresSave : function(bool) {
			if (bool || bool == false) {
				this._requiresSave = bool;
				this.trigger("requiresSave");
			}
			return this._requiresSave
		},

		getMode : function() {
			switch (this.get("template_content_type")) {
				case "text/html" || "text/xhtml+xml":
					return "ace/mode/html";
				case "text/css" :
					return "ace/mode/css";
				case "application/javascript" :
					return "ace/mode/javascript";
				case "application/json" :
					return "ace/mode/json";
				case "application/rss+xml" || "application/atom+xml" || "text/xml" || "application/soap+xml" :
					return "ace/mode/xml";
				case "text/less" :
					return "ace/mode/less";
				case "text/scss" :
					return "ace/mode/scss";
				default:
					return "ace/mode/text"
			}
		}
	})

	return TemplateModel;

}); 