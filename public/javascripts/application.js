/*
	Main Layout
*/

var ListKungFuLayout;
$(document).ready(function () {
	ListKungFuLayout = $('body').layout({
		defaults: {
			
		},
		
		north: {
			maxSize: 92,
			minSize: 92
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



/*
	Initialize Views
*/

$("#mainlayout-west").ListView();


/*
	Global Shortcuts
*/

// insert new list

$(document).bind('keydown', 'ctrl+i', function(e){
	$("#mainlayout-west").find( "#list-new" ).effect('puff', {}, 300, function(){ $(this).show(); }).trigger('click');
	return false;
});














$( "#notice ").hide(function(e){
	$( e.target ).html("");
});
$( "#alert" ).hide(function(e){
	$( e.target ).html("");
});
