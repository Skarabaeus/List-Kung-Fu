// Global Application Object

var ListKungFu = {
	LayoutWest: $("#mainlayout-west"),
	LayoutNorth: $("#mainlayout-north"),
	LayoutEast: $("#mainlayout-east"),
	LayoutSouth: $("#mainlayout-south"),
	LayoutCenter: $("#mainlayout-center")
};

/*
	Helpers
*/


jQuery.expr[':'].Contains = function(a,i,m){
     return jQuery(a).text().toLowerCase().indexOf(m[3].toLowerCase())>=0;
};

/*
	Main Layout
*/

$(document).ready(function () {
	ListKungFu.MainLayout = $('body').layout({
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

	/*
		Initialize Views
	*/

	ListKungFu.LayoutSouth.StatusBar();

	ListKungFu.LayoutCenter.ListItemView({
		OpenList: function() {}
	});

	ListKungFu.LayoutWest.ListView({
		ContentDimensionsChanged: function(){
			ListKungFu.MainLayout.resizeContent( "west" );
		},
		OpenList: function( event, data ) {
			ListKungFu.LayoutCenter.ListItemView( "OpenList", data.selectedList );
		},
		CloseList: function( event, data ) {
			ListKungFu.LayoutCenter.ListItemView( "RemoveList" );
		}
	});
});



