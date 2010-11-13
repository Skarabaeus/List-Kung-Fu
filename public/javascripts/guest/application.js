$( document ).ready(function(){
	var padding = $( "#wrapper" ).css( "paddingTop" );
	padding = parseInt( padding.substring( 0, padding.length - 2 ) );
	
	var marginTop = ( $(window).height() / 2 ) - ( $( "#wrapper" ).height() / 2 ) - padding;
	$( "#wrapper" ).css( "marginTop",  marginTop + "px" );
});