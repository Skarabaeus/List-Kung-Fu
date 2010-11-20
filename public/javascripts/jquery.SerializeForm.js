(function( $ ) {

	$.fn.serializeForm = function() {
		
		// select all elements with a name attribute that contains a closing square bracket.
		// this takes advantage of Rails' conventions that set the name to something like
		// list[title]
		var fields = $( this ).find( '*[name*="]"]' );
		
		var objects = {};
		
		$.each( fields, function( index, field ) {
			var $field = $( field );
			
			var model = $field.get( 0 ).name.split( "[" )[0];
			var currentField = $field.get( 0 ).name.split( "[" )[1];
			currentField = currentField.replace( "]", "" );
			var value = $field.val();			
			
			objects[ model ] = objects[ model ] || {};
			
			objects[ model ][ currentField ] = value;

		});
    
    return objects;
  };
})( jQuery );