(function(){
	var UltimateSearch = {

		/**
		* Private functions
		* functions starting with a _ are pseudo private.
		* They cannot be access from the outside.
		*/

		// required function. Automatically called when widget is created
		_create: function() {
			var widget = this;
			widget.searchText = $('<div><input type="text" id="ultimate-search-text"/><span id="ultimate-search-text-cancel"></span></div>');
			var searchOptionsArr = [ '<div id="searchOptions">',
				'<input type="checkbox" id="searchLists" class="searchOptionCheckbox" checked /><label for="searchLists" class="searchOptionLabel">Search List</label>',
				'<input type="checkbox" id="searchDashboard" class="searchOptionCheckbox" checked /><label for="searchDashboard" class="searchOptionLabel">Search Dashboard</label>',
				'<input type="checkbox" id="searchListItems" class="searchOptionCheckbox" checked /><label for="searchListItems" class="searchOptionLabel">Search List Items</label>',
				'</div>'
			];
			widget.searchOptions = $( searchOptionsArr.join( '' ) );

			widget.element.append( widget.searchText );
			widget.element.append( widget.searchOptions );

			$( document ).bind( 'keyup', 'ctrl+f', function() {
				widget.searchText.focus();
			});

			// for windows:
			$( document ).bind( 'keyup', 'shift+f', function() {
				widget.searchText.focus();
			});

			widget.searchText.bind( 'keyup', function( e ) {
				var target = $( e.target );
				var value = target.val();

				widget._trigger( "OnFilterChanged", 0, {
					searchOptions: {
						searchLists: widget.searchOptions.find( '#searchLists:checked' ).length > 0 ? true : false,
						searchListItems: widget.searchOptions.find( '#searchListItems:checked' ).length > 0 ? true : false,
						searchDashboard: widget.searchOptions.find( '#searchDashboard:checked' ).length > 0 ? true : false,
					},

					searchText: value
				});
			});

			widget.searchText.find( '#ultimate-search-text-cancel' ).bind( 'click', function() {
				widget.searchText.find( '#ultimate-search-text' ).val('').trigger( 'keyup' );
			});

		},

		// Once the element is created, all other calls to the widget
		// name where the first parameter is not a string will call the _init()
		// method; if options are passed, the .option() method will be called
		// before the _init() method.
		_init: function() {

		},

		options: {
		},


		destroy: function() {

		}
	};
	// register widget
	$.widget("ui.UltimateSearch", UltimateSearch);
})();
