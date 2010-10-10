(function(){
	var ListView = function(){

		var _myPrivateFunction = function() {
		};


		var template = '<div>{{title}}</div>';
		

		

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
					
					for ( var i = 0; i < data.length; i++ ) {
						var newElement = $( $.mustache( template, data[ i ].list ) );
						
						newElement.attr('tabindex', i);						
						newElement.data('data', data[ i ]);
						if ( i % 2 === 0) {
							newElement.addClass("highlighted-row")
						}
						newElement.addClass('row');
						
						newElement.bind('keydown', 'down', function( e ){
							e.preventDefault();
							$( e.target ).next().focus();
							return false;
						});
						
						newElement.bind('keydown', 'up', function( e ){
							e.preventDefault();
							$( e.target ).prev().focus();
							return false;
						});
						
						newElement.bind('focus', function(e){
							$( e.target ).addClass('selected-row');
						});
						
						newElement.bind('focusout', function(e){
							$( e.target ).removeClass('selected-row');
						});
						
						newElement.bind( 'keydown dblclick', 'return', function(e){
							alert("pressed enter");
						});
						
						widget.element.append( newElement );
					}


				});
			},

			destroy: function() {

			},
		};
	}();
	// register widget
	$.widget("ui.ListView", ListView);
})();
