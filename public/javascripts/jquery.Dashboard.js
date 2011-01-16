(function(){
	var Dashboard = function(){

		var widget = null;

		var _TriggerResize = function() {
			widget._trigger("ContentDimensionsChanged", 0, {} );
		};

		return {
			// default options
			options: {

			},

			Show: function() {
				widget.wrapper = $( '<div class="ui-layout-content" id="dashboard-view"></div>' );
				widget.element.append(widget.wrapper);

				widget.wrapper.text( "Dashboard - to be implemented soon" );

				_TriggerResize();
			},

			Hide: function() {
				if ( widget.wrapper ) {
					widget.wrapper.remove();
				}
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
