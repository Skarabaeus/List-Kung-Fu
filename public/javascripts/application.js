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
	return jQuery(a).text().toLowerCase().indexOf(m[3].toLowerCase()) >= 0;
};

jQuery.expr[':'].HasExactValue = function(a,i,m){
	return jQuery.trim(jQuery(a).text().toLowerCase()) === m[3].toLowerCase();
};

/*
	Main Layout
*/

$(document).ready(function () {
	ListKungFu.MainLayout = $('body').layout({
		defaults: {
			contentSelector: ".ui-layout-content",
			contentIgnoreSelector: ".ui-layout-ignore"
		},

		north: {
			maxSize: 92,
			minSize: 92
		},

		south: {
			minSize: 40
		},

		west: {
			minSize: 300
		},

		east: {
			minSize: 100,
			initClosed: true
		},

		center: {
			minSize: 300
		}
	});

	/*
		Initialize Views
	*/

	ListKungFu.LayoutSouth.StatusBar();

	ListKungFu.LayoutCenter.ListItemView({
		SelectLastList: function( event, data ) {
			ListKungFu.LayoutWest.ListView( "SelectList" );
		},
		ContentDimensionsChanged: function(){
			ListKungFu.MainLayout.resizeContent("center");
		},
		ReinitPanes: function(){
			ListKungFu.MainLayout.reinitPane();
		},
		StartedDraggingListItem: function( event, data ) {
			ListKungFu.LayoutWest.ListView( "SetupDroppable", data.dragType );
		}
	});

	ListKungFu.LayoutWest.ListView({
		ContentDimensionsChanged: function(){
			ListKungFu.MainLayout.resizeContent( "west" );
		},
		OpenList: function( event, data ) {
			ListKungFu.LayoutCenter.Dashboard( "Hide" );
			ListKungFu.LayoutCenter.ListItemView( "OpenList", data.selectedList );
		},
		CloseList: function( event, data ) {
			ListKungFu.LayoutCenter.ListItemView( "RemoveList" );
		},
		SelectListItem: function( event, data ) {
			ListKungFu.LayoutCenter.ListItemView( "SelectListItem" );
		}
	});

	ListKungFu.LayoutCenter.Dashboard( {
		ContentDimensionsChanged: function(){
			ListKungFu.MainLayout.resizeContent("center");
		},
		ReinitPanes: function(){
			ListKungFu.MainLayout.reinitPane();
		},
		OpenList: function( event, data ) {
			ListKungFu.LayoutCenter.Dashboard( "Hide" );
			ListKungFu.LayoutCenter.ListItemView( "OpenList", data.selectedList );
		}
	});

	ListKungFu.LayoutWest.find( '#tags' ).TagView({
		StartedDraggingTag: function( event, data ) {
			ListKungFu.LayoutWest.ListView( "SetupDroppable", data.dragType );
		},
		AfterColorChanged: function( event, data ) {
			ListKungFu.LayoutWest.ListView( "ReloadLists" );
		},
		AfterTagDeleted: function( event, data ) {
			ListKungFu.LayoutWest.ListView( "ReloadLists" );
		},
		TagSelected: function( event, selectedTagsArray ) {
			ListKungFu.LayoutWest.ListView( "Filter", selectedTagsArray, null );
		}
	});

	ListKungFu.LayoutNorth.find( '#ultimate-search-widget' ).UltimateSearch({
		OnFilterChanged: function( event, filter ) {
			var filterDashboard = filter.searchOptions.searchDashboard;
			var filterLists = filter.searchOptions.searchLists;
			var filterListItems = filter.searchOptions.searchListItems;

			if ( filterDashboard ) {
				ListKungFu.LayoutCenter.Dashboard( "Filter", filter.searchText );
			}

			if ( filterLists ) {
				ListKungFu.LayoutWest.ListView( "Filter", null, filter.searchText );
			}

			if ( filterListItems ) {
				ListKungFu.LayoutCenter.ListItemView( "Filter", filter.searchText );
			}
		}
	});

	// bind "Dashboard"-link
	$( "#dashboard" ).bind( "click", function() {
		ListKungFu.LayoutCenter.ListItemView( "RemoveList" );
		ListKungFu.LayoutCenter.Dashboard( "Show" );
		return false;
	});

	// show Dashboard by default after login
	$( "#dashboard" ).trigger( "click" );
});



