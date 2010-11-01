(function(){
	var ListItemView = function(){

		var _AddListItem = function( widget, listItem, template ) {
			var newElement = $( $.mustache( template, listItem.list_item ) );

			newElement.data( "data", listItem );

			widget.listItemList.append (newElement);

			newElement.find( ".completed" ).bind( 'click', { element: newElement }, function( e ){
				var data = e.data.element.data( "data" );
				var $element = $( e.data.element );

				_MarkCompleted( $element, data );

			});
		};

		var _MarkCompleted = function( element, listItem ) {
			// set item completed
			listItem.list_item.completed = true;

			// update item server side
			ListItem.Update({
				successCallback: function(){
					var queueName = "list-item-undo-" + listItem.list_item.id;

					// hide the main content of the list item and instead,
					// display the UNDO button.
					element.find( ".list-item-wrapper" ).hide('slow', function(){
						var $undo = $( '<div class="undo clickable"><img src="/images/undo-icon.gif"/>Undo</div>' );
						$undo.bind( "click", function() {
							_MarkUncompleted( element, listItem, queueName );
						});

						element.append( $undo );

						$undo.delay( 5000, queueName ).queue( queueName, function(){
							element.hide('slow', function(){
								element.remove();
							});
						}).dequeue( queueName );

					});
				},
				lists: listItem.list_item.list_id,
				list_items: listItem.list_item.id,
				send: listItem
			});
		};

		var _MarkUncompleted = function( element, listItem, queueName ) {
			if ( queueName !== "" ) {
				element.clearQueue( queueName );
			}

			// set item completed
			listItem.list_item.completed = false;

			// update item server side
			ListItem.Update({
				successCallback: function(){
					element.find( ".undo" ).hide('slow', function(){
						$( this ).remove();
					});
					element.find( ".list-item-wrapper" ).show('slow');
				},
				lists: listItem.list_item.list_id,
				list_items: listItem.list_item.id,
				send: listItem
			});
		};

		// put all private functions in here
		// that improves minification. See http://blog.project-sierra.de/archives/1622

		return {
			// default options
			options: {

			},

			_create: function() {
				var widget = this;

				widget.wrapper = widget.element.find('div#list-item-wrapper');
				widget.listItemList = $( '<div id="list-item-list"></div>');

				widget.wrapper.append( widget.listItemList );

			},

			destroy: function() {

			},

			OpenList: function( data ) {
				var widget = this;

				// remove all children
				widget.listItemList.find("*").remove();

				ListItem.Index( {
					successCallback: function( template, json, status, xhr, errors ) {
						$.each( json, function( index, listItem ) {
							_AddListItem( widget, listItem, template )
						});

					},
					lists: data.list.id
				} );
			}
		};
	}();
	// register widget
	$.widget("ui.ListItemView", ListItemView);
})();
