(function(){
	var ListItemShow = {

		_CreateToolbar: function() {
			var widget = this;
			// empty header
			widget.header.html("");

			// build new header
		 	var toolbarArr = ['<div id="list-item-show-toolbar">',
				'<button id="back-to-list">Back [Alt+Backspace]</button>',
				'<div style="clear:both">&nbsp;</div>',
				'</div>'];

			widget.toolbar = $( toolbarArr.join('') );

			// create buttons
			widget.toolbar.find( "#back-to-list" ).button({
				text: false,
				icons: {
					primary: 'ui-icon-arrowthick-1-w'
				}
			});


			// bind events

			widget.toolbar.find( "#back-to-list" ).bind( 'click', function( e ){
				widget.listItemElement.trigger( 'back-to-list' );
			});

			widget.header.append( widget.toolbar );
		},

		_create: function() {
			// nothing
		},

		_init: function() {
			var widget = this;

			widget.element.children().remove();

			widget.wrapper = $( '<div class="ui-layout-content" id="list-item-show-wrapper"></div>' );
			widget.header = $( '<div id="list-item-show-header"></div>' );

			widget.element.append( widget.header );
			widget.element.append( widget.wrapper );

			widget._CreateToolbar();

			ListListItem.Show({
				successCallback: function( template, json, status, xhr, errors ) {
					var newElement = $( $.mustache( template, json.list_item ) );

					newElement.data( 'data', json );

					newElement.bind( 'keydown', 'alt+backspace', function(){
						newElement.trigger( 'back-to-list' );
					});

					newElement.bind( 'back-to-list', function(){
						var data = widget.listItemElement.data( 'data' );
						widget.destroy();
						widget.element.ListItemView( "OpenList", data.list_item );
					});

					if ( $.browser.msie ) {
						newElement.bind( 'click', function() {
							newElement.focus();
							return false;
						});
					}

					newElement.height( widget.element.height() - 60 );

					widget.wrapper.append( newElement );
					newElement.focus();

					widget.listItemElement = newElement;

				},
				lists: widget.options.listItem.list_item.list_id,
				list_items: widget.options.listItem.list_item.id
			});
		},

/*
Options
*/
		options: {
			listItem: null
		},


/*
Public functions
*/

		destroy: function() {
			var widget = this;

			// remove elements
			widget.element.children().remove();
		}
	};
	// register widget
	$.widget("ui.ListItemShow", ListItemShow);
})();
