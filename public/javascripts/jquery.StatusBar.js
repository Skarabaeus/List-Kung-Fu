(function(){
	var StatusBar = function(){

		var _myPrivateFunction = function() {
		};

		// put all private functions in here
		// that improves minification. See http://blog.project-sierra.de/archives/1622

		return {
			// default options
			options: {

			},

			// required function. Automatically called when widget is created
			_create: function() {
				var widget = this;
				
				widget.ajaxLoader = $('<div id="ajax-indicator"> \
						<img src="/images/ajax-loader.gif" class="ajax-indicator" /> Loading ... \
						</div>');
				
				widget.notice = $('<p id="notice"></p>');
				widget.alert = $('<p id="alert"></p>');
				
				widget.element.append( widget.ajaxLoader );
				widget.element.append( widget.notice );
				widget.element.append( widget.alert );
				
				widget.notice.hide(function( e ){
					$( e.target ).html("");
				});
				widget.alert.hide(function( e ){
					$( e.target ).html("");
				});
				
				widget.ajaxLoader.bind("ajaxSend", function(){
				  $(this).show();
				}).bind("ajaxComplete", function(){
				  $(this).hide();
				});
				
			},

			destroy: function() {
				widget.ajaxLoader.remove();
				widget.notice.remove();
				widget.alert.remove();
			}
		};
	}();
	// register widget
	$.widget("ui.StatusBar", StatusBar);
})();
