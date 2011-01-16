(function(){
	var Dashboard = function(){

		var widget = null;


		var _myPrivateFunction = function() {
		};

		// put all private functions in here
		// that improves minification. See http://blog.project-sierra.de/archives/1622

		return {
			// default options
			options: {

			},

			Show: function() {
				widget.test = $("<div>Dashboard</div>");
				widget.element.append(widget.test);
			},

			Hide: function() {
				widget.test.remove();
			},

			// required function. Automatically called when widget is created
			_create: function() {
				widget = this;
			},

			destroy: function() {

			},
		};
	}();
	// register widget
	$.widget("ui.Dashboard", Dashboard);
})();
