$( document ).ready(function(){
	var padding = $( "#wrapper" ).css( "paddingTop" );
	padding = parseInt( padding.substring( 0, padding.length - 2 ) );

	// adjust height.
	var height = $( window ).height() - ( $( window ).height() / 100 * 30 );
	$( "#wrapper" ).css( "height", height + "px" );
	
	// adjust margin top
	var marginTop = ( $( window ).height() / 2 ) - ( $( "#wrapper" ).height() / 2 ) - padding;
	$( "#wrapper" ).css( "marginTop",  marginTop + "px" );

});