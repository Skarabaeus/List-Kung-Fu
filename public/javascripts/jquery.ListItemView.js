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

			newElement.find( ".delete" ).bind( 'click', { element: newElement }, function( e ) {
				var data = e.data.element.data( "data" );
				var $element = $( e.data.element );

				_DeleteListItem( $element, data );
			});

			newElement.bind( 'focus', function(e){

				if ( $( e.target ).hasClass( 'row' ) ) {

					// remove selection from all rows
					widget.listItemList.find('.row').removeClass('selected-row');

					// add it to the selected row.
					$( e.target ).addClass('selected-row');

					widget.selectedListItem = {
						element: $( e.target ),
						data: $( e.target ).data("data")
					};
				}
			});

			newElement.bind( 'keydown', 'down', function( e ){
				e.preventDefault();
				$( e.target ).nextAll( 'div:visible' ).first().focus();
				return false;
			});

			newElement.bind( 'keydown', 'up', function( e ){
				e.preventDefault();
				$( e.target ).prevAll( 'div:visible' ).first().focus();
				return false;
			});

			newElement.bind( 'keydown', 'space', function( e ){
				if ( newElement.find( ".undo" ).length === 0 ) {
					newElement.find( ".completed" ).trigger( "click" );
				} else {
					newElement.find( ".undo" ).trigger( "click" );
				}
			});

			newElement.bind( 'keydown dblclick', 'return', function( e ){
				// if we display already the form for this element,
				// just exit.
				if ( newElement.find( "form" ).length > 0 ) {
					return false;
				}

				ListItem.Edit({
					successCallback: function( template, json, status, xhr, errors ) {
						var $form = $( template );
						$form.hide();
						widget.selectedListItem.element.prepend( $form );
						$form.show('slow');

						$form.find( "textarea" ).focus();

						$form.find( "textarea" ).bind( "keydown", 'esc', function(){
							$form.find( "#cancel-edit" ).trigger( "click" );
						});

						$form.find( "input[type=submit]" ).bind( "keydown click", 'return', function( e ) {
							e.preventDefault();
							var serializedForm = newElement.find("form").serializeForm();

							ListItem.Update({
								send: serializedForm,
								successCallback: function( template, json, status, xhr, errors ){
									$form.hide( 'slow', function( e ) {
										$( this ).remove();
										newElement.find( '.list-item-content' ).html( json.list_item.body_rendered );
										newElement.focus();
									});
								},
								lists: widget.selectedListItem.data.list_item.list_id,
								list_items: widget.selectedListItem.data.list_item.id
							});

							return false;
						});

						$form.find( "#cancel-edit" ).bind( "keydown click", 'return', function( e ) {
							e.preventDefault();

							$form.hide( 'slow', function() {
								$( this ).remove();
								newElement.focus();
							});

							return false;
						});

						return false;
					},
					lists: widget.selectedListItem.data.list_item.list_id,
					list_items: widget.selectedListItem.data.list_item.id
				});
			});

		};

		var _DeleteListItem = function( element, listItem ) {
			ListItem.Destroy({
				successCallback: function( template, json, status, xhr, errors ){
					element.hide( "slow", function() {
						$( this ).remove();
					});
				},
				lists: listItem.list_item.list_id,
				list_items: listItem.list_item.id
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

					// in case completed items are displayed, update them:
					if ( widget.ShowCompletedCheckbox && widget.ShowCompletedCheckbox.get( 0 ).
						checked === true ) {
						_ToggleCompleted( true );
					}
				},
				lists: listItem.list_item.list_id,
				list_items: listItem.list_item.id,
				send: listItem
			});
		};

		var _ToggleCompleted = function(  doShow ) {
			if ( doShow === true ) {

				if ( widget.completedList ) {
					widget.completedList.remove();
					widget.completedList = null;
				}

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

			RemoveList: function() {
				// remove all children
				if ( widget.listItemList ) {
					widget.listItemList.find( "*" ).remove();
				}

				// remove "completed" list
				if ( widget.completedList ) {
					widget.completedList.remove();
					widget.completedList = null;
				}
			},

			OpenList: function( data ) {
				widget.RemoveList();

				widget.element.data( "data-list", data );

				ListItem.Index( {
					successCallback: function( template, json, status, xhr, errors ) {
						$.each( json, function( index, listItem ) {
							_AddListItem( listItem, template )
						});

						// focus first list item
						widget.listItemList.find( ".row" ).first().focus();

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
