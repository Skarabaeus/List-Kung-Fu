(function( $ ) {

	$.fn.serializeForm = function() {
		
		// select all elements with a name attribute that contains a closing square bracket.
		var fields = $( this ).find( "*[name*=]]" );
		
		var objects = {};
		
		$.each( fields, function( index, field ) {
			var $field = $( field );
			
			var model = $field.get( 0 ).id.split( "_" )[0];
			var currentField = $field.get( 0 ).id.split( "_" )[1];
			var value = $field.val();			
			
			objects[ model ] = objects[ model ] || {};
			
			objects[ model ][ currentField ] = value;

		});
    
    return objects;
  };
})( jQuery );