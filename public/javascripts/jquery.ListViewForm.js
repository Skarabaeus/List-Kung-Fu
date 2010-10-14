(function(){
	var ListViewForm = function(){

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
				
				widget.formTemplate = $( $( "#ListViewForm" ).html() );;
				
				widget.element.append( widget.formTemplate );
				
				widget.element.find( "#back-to-list" ).bind('click', function(){
					widget.element.hide('slide', { direction: 'left' }, 'slow', function(){
						widget.element.parent().find('div#list-list').show('slide', { direction: 'right'}, 'slow', function(){
							// widget.element.find(".row").first().focus();
						});
					});
				});
			},

			destroy: function() {

			},
		};
	}();
	// register widget
	$.widget("ui.ListViewForm", ListViewForm);
})();
