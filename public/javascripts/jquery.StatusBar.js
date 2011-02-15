(function(){
	var StatusBar = {

		options: {
		},

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

		SetNotice: function( notice ) {
			var widget = this;

			widget.notice.text( notice )
								   .fadeIn()
								   .delay( 2000 )
								   .fadeOut(function(){
				$(this).text("");
			});
		},

		SetAlert: function( alert ) {
			var widget = this;

			widget.alert.text( alert );
			widget.alert.fadeIn().delay( 2000 ).fadeOut(function(){
				$(this).text("");
			});
		},

		destroy: function() {
			widget.ajaxLoader.remove();
			widget.notice.remove();
			widget.alert.remove();
		}
	};
	// register widget
	$.widget("ui.StatusBar", StatusBar);
})();
