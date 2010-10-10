/*
	Main Layout
*/

var ListKungFuLayout;
$(document).ready(function () {
	ListKungFuLayout = $('body').layout({
		defaults: {
			
		},
		
		north: {
			maxSize: 100,
			minSize: 100
		},
		
		south: {
			minSize: 50
		},
		
		west: {
			minSize: 300
		},
		
		east: {
			minSize: 100,
			initClosed: true
		}
	});

});

/*
	Global Ajax Events
*/

$("#ajax-indicator").bind("ajaxSend", function(){
  $(this).show();
}).bind("ajaxComplete", function(){
  $(this).hide();
});


$( "#notice ").hide(function(e){
	$( e.target ).html("");
});
$( "#alert" ).hide(function(e){
	$( e.target ).html("");
});

$("#mainlayout-west").ListView();
