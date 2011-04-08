(function(){
	var ListItemShow = {

		_CreateToolbar: function() {
			var widget = this;
			// empty header
			widget.header.html("");

			// build new header
		 	var toolbarArr = ['<div id="list-item-show-toolbar">',
				'<button id="back-to-list">Back [Alt+Backspace]</button>',
				'<button id="list-item-edit">Edit [return]</button>',
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

			widget.toolbar.find( "#list-item-edit" ).button({
				text: false,
				icons: {
					primary: 'ui-icon-pencil'
				}
			});

			// bind events

			widget.toolbar.find( '#back-to-list' ).bind( 'click', function( e ){
				widget.listItemElement.trigger( 'back-to-list' );
			});

			widget.toolbar.find( '#list-item-edit' ).bind( 'click', function( e ){
				widget.listItemElement.trigger( 'edit' );
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

			widget.wrapper.bind( 'beforeEdit', function( e ){
				widget.element.find( '#list-item-show-content' ).hide();
			});

			widget.wrapper.bind( 'afterEdit', function( e, json ){
				if ( json ) {
					widget.element.find( '#list-item-show-content' ).html( json.list_item.body );
				}

				widget.element.find( '#list-item-show-content' ).show().focus();
			});

			ListListItem.Show({
				successCallback: function( template, json, status, xhr, errors ) {
					var newElement = $( $.mustache( template, json.list_item ) );

					newElement.data( 'data', json );

					// bind events

					newElement.bind( 'keydown', 'left', function(){
						newElement.trigger( 'back-to-list' );
					});

					newElement.bind( 'keydown', 'return', function(){
						widget.toolbar.find( "#list-item-edit" ).effect( 'puff', {}, 300, function(){
							$( this ).show();
						});
						newElement.trigger( 'edit' );
					});

					newElement.bind( 'dblclick', function(){
						newElement.trigger( 'edit' );
					});

					newElement.bind( 'back-to-list', function(){
						var data = widget.listItemElement.data( 'data' );
						widget.destroy();
						widget.element.ListItemView( "OpenList", data.list_item );
					});

					newElement.bind( 'edit', function(){
						var data = widget.listItemElement.data( 'data' );

						widget.element.find( '#list-item-show-wrapper' ).ListItemEdit({
							height: widget.element.find( "#list-item-show-wrapper" ).height() - 70,
							listId: data.list_item.list_id,
							listItemId: data.list_item.id
						});

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
