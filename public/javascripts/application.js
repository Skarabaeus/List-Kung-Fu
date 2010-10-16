// Global Application Object

var ListKungFu = {
	LayoutWest: $("#mainlayout-west"),
	LayoutNorth: $("#mainlayout-north"),
	LayoutEast: $("#mainlayout-east"),
	LayoutSouth: $("#mainlayout-south"),
	LayoutCenter: $("#mainlayout-center")
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
	ListKungFu.LayoutWest.ListView();


});



