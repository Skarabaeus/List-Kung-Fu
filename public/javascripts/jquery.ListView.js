(function(){
	var ListView = function(){

		var _myPrivateFunction = function() {
		};


		var template = '<span>{{title}}</span>';
		

		

		// put all private functions in here
		// that improves minification. See http://blog.project-sierra.de/archives/1622

		return {
			// default options
			options: {

			},

			// required function. Automatically called when widget is created
			_create: function() {
				var widget = this;
				
				List.Index(function( data, status, xhr ) {




				});
			},

			destroy: function() {

			},
		};
	}();
	// register widget
	$.widget("ui.ListView", ListView);
})();
