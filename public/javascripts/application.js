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


$("#mainlayout-west").ListView();
