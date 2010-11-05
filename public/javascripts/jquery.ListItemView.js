(function(){
	var ListItemView = function(){
		
		var widget = null;

		var _AddListItem = function( listItem, template ) {
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

						// hide complete element after 5 seconds. In case the user
						// clicks "undo", the queue will be cleared and the element
						// won't be hidden.
						$undo.delay( 5000, queueName ).queue( queueName, function(){
							element.hide('slow', function(){
								element.remove();
							});
						}).dequeue( queueName );
						
						// in case completed items are displayed, update them:
						if ( widget.ShowCompletedCheckbox && widget.ShowCompletedCheckbox.get( 0 ).
							checked === true ) {
							_ToggleCompleted( false );
							_ToggleCompleted( true );
						}

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

		var _ToggleCompleted = function(  doShow ) {
			if ( doShow === true ) {
			
				widget.completedList = $( '<div id="completedList"></div>' );
				
				var data = widget.element.data( "data-list" );
				ListItem.Index( {
					successCallback: function( template, json, status, xhr, errors ) {
						
						$.each( json, function( index, listItem ) {
							widget.completedList.append("<div>" + listItem.list_item.body + "</div>");
						});
						
						
						widget.wrapper.prepend( widget.completedList );
					},
					send: { show: "completed" },
					lists: data.list.id
				});
			} else {
				widget.completedList.remove();
				widget.completedList = null;
			}
		}

		var _CreateToolbar = function() {
			// empty header
			widget.header.html("");
			
			// build new header
			widget.ShowCompletedCheckbox = $( '<input type="checkbox" id="showCompleted"/> \
				<label for="showCompleted">Show Completed Items</label>' );
			
			widget.ShowCompletedCheckbox.bind( "change", function( e ){
				_ToggleCompleted( e.target.checked );
			});
			
			widget.header.append( widget.ShowCompletedCheckbox );
		};

		return {
			// default options
			options: {

			},

			_create: function() {
				widget = this;

				widget.wrapper = widget.element.find('div#list-item-wrapper');
				widget.listItemList = $( '<div id="list-item-list"></div>');
				widget.header = widget.element.find( '.header' );
				
				widget.wrapper.append( widget.listItemList );

			},

			destroy: function() {

			},

			OpenList: function( data ) {
				// remove all children
				widget.listItemList.find("*").remove();
				widget.element.data( "data-list", data );
				
				// remove "completed" list
				if ( widget.completedList ) {
					widget.completedList.remove();
					widget.completedList = null;
				}

				ListItem.Index( {
					successCallback: function( template, json, status, xhr, errors ) {
						$.each( json, function( index, listItem ) {
							_AddListItem( listItem, template )
						});
						
						_CreateToolbar();
					},
					lists: data.list.id
				} );
			}
		};
	}();
	// register widget
	$.widget("ui.ListItemView", ListItemView);
})();
