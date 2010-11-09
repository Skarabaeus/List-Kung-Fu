(function(){
	var ListItemView = function(){

		var widget = null;

		_SetSelectedListItem = function( elem, obj ) {
			widget.selectedListItem = {
				element: elem,
				data: obj
			};
		};

		var _AddListItem = function( listItem, template, isFirst ) {
			var newElement = $( $.mustache( template, listItem.list_item ) );

			newElement.data( "data", listItem );

			if ( isFirst ) {
				widget.listItemList.prepend(newElement);
			} else {
				widget.listItemList.append(newElement);
			}

			newElement.bind( 'keydown', 'space', function( e ){
				if ( newElement.find( ".undo" ).length === 0 ) {
					widget.toolbar.find( "#list-item-completed" ).trigger( "click" );
				} else {
					newElement.find( ".undo" ).trigger( "click" );
				}
			});

			newElement.bind( 'keydown', 'del', function(){
				widget.toolbar.find( "#list-item-delete" ).trigger( 'click' );
			});

			newElement.bind( 'focus', function(e){

				if ( $( e.target ).hasClass( 'row' ) ) {

					// remove selection from all rows
					widget.listItemList.find('.row').removeClass('selected-row');

					// add it to the selected row.
					$( e.target ).addClass('selected-row');

					var data = $( e.target ).data( "data" );

					if ( widget.toolbar ) {
						if ( $( e.target ).data("isFullsize") === true ) {
							widget.toolbar.find( "#list-item-fullsize" ).button( "option", "icons", { primary:'ui-icon-zoomout' } );
						} else {
							widget.toolbar.find( "#list-item-fullsize" ).button( "option", "icons", { primary:'ui-icon-zoomin' } );
						}
					}

					_SetSelectedListItem( $( e.target ), $( e.target ).data( "data" ) );
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

			newElement.bind( 'keydown dblclick', 'return', function( e ){
				// if we display already the form for this element,
				// just exit.
				if ( newElement.find( "form" ).length > 0 ) {
					return false;
				}

				// close all open forms
				widget.listItemList.find( ".row" ).find( "form" ).hide( "slow", function() {
					$( this ).remove();
				});

				ListItem.Edit({
					successCallback: function( template, json, status, xhr, errors ) {
						var $form = $( template );
						$form.hide();
						widget.selectedListItem.element.prepend( $form );
						$form.find( "textarea" ).markItUp( mySettings );

						if ( !newElement.isFullsize ) {
							_ToggleFullsize( newElement );
						}

						$form.show('slow', function(){
							$form.find( "textarea" ).focus();
						});

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
										_ToggleFullsize( newElement );
										_SetSelectedListItem( newElement, json );
										newElement.data( "data", json );
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
								_ToggleFullsize( newElement );
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

			newElement.bind( 'keydown', 'left', function( e ){
				widget._trigger( "SelectLastList", 0, {} );
			});

			newElement.bind( 'keydown', 'shift+return', function( e ){
				_AddNewListItem();
			});

			newElement.bind( 'keydown', 'f', function( e ) {
				widget.toolbar.find( '#list-item-fullsize' ).trigger( 'click' );
			});

			_CorrectHeight( newElement );
		};

		var _ToggleFullsize = function ( element ) {
			if ( element.data( "isFullsize" ) === true ) {
				_CorrectHeight( element, false );
				element.data( "isFullsize", false );
				widget.toolbar.find( "#list-item-fullsize" ).button( "option", "icons", { primary:'ui-icon-zoomin' } );
			} else {
				_CorrectHeight( element, true );
				element.data( "isFullsize", true );
				widget.toolbar.find( "#list-item-fullsize" ).button( "option", "icons", { primary:'ui-icon-zoomout' } );
			}
		};

		var _CorrectHeight = function( element, setToFullSize ) {
			if ( element.height() > 150 && !setToFullSize ) {
				element.height( 150 );
				element.css( "overflow-x", "hidden" );
				element.css( "overflow-y", "auto" );
			} else {
				element.height( "auto" );
				element.css( "overflow-x", "hidden" );
				element.css( "overflow-y", "auto" );
			}
		};

		var _DeleteListItem = function( element, listItem ) {
			ListItem.Destroy({
				successCallback: function( template, json, status, xhr, errors ){
					element.hide( "slow", function() {
						var item = element.next( ".row" );
						if ( item.length > 0 ) {
							item.focus();
						} else {
							item = element.prev( ".row" );
							item.focus();
						}
						element.remove();
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

						_CorrectHeight( element );

						// hide complete element after 5 seconds. In case the user
						// clicks "undo", the queue will be cleared and the element
						// won't be hidden.
						$undo.delay( 5000, queueName ).queue( queueName, function(){
							element.hide('slow', function(){
								element.remove();
							});
						}).dequeue( queueName );

						// in case completed items are displayed, update them:
						if ( widget.toolbar && widget.toolbar.find( "#showCompleted" ).get( 0 ).
							checked === true ) {
							_ToggleCompleted( true );
						}

						// select list item
						element.focus();
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
					element.find( ".list-item-wrapper" ).show('slow', function(){
						_CorrectHeight( element );
					});

					// in case completed items are displayed, update them:
					if ( widget.toolbar && widget.toolbar.find( "#list-item-new" ).get( 0 ).
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
							widget.completedList.append("<div>" + listItem.list_item.body_rendered + "</div>");
						});

						if ( json.length === 0 ) {
							widget.completedList.append("<div>No completed items</div>")
						}

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
			widget.toolbar = $( '<div id="list-item-toolbar"><button id="list-item-completed">Completed</button> \
				<button id="list-item-new">Create</button> \
				<button id="list-item-delete">Delete</button> \
				<button id="list-item-edit">Edit</button> \
				<button id="list-item-fullsize">Fullsize</button> \
				<input type="checkbox" id="showCompleted"/> \
				<label for="showCompleted">Show Completed Items</label></div>' );

			// create buttons

			widget.toolbar.find( "#list-item-new" ).button({
				text: false,
				icons: {
					primary: 'ui-icon-plusthick'
				}
			});

			widget.toolbar.find( "#list-item-edit" ).button({
				text: false,
				icons: {
					primary: 'ui-icon-pencil'
				}
			});

			widget.toolbar.find( "#list-item-completed" ).button({
				text: false,
				icons: {
					primary: 'ui-icon-check'
				}
			});

			widget.toolbar.find( "#list-item-delete" ).button({
				text: false,
				icons: {
					primary: 'ui-icon-closethick'
				}
			});

			widget.toolbar.find( "#list-item-fullsize" ).button({
				text: false,
				icons: {
					primary: 'ui-icon-zoomin'
				}
			});

			// bind events

			widget.toolbar.find( "#list-item-new" ).bind( 'click', function( e ){
				_AddNewListItem();
			});

			widget.toolbar.find( "#showCompleted" ).bind( "change", function( e ){
				_ToggleCompleted( e.target.checked );
				widget.selectedListItem.element.focus();
			});

			widget.toolbar.find( "#list-item-completed" ).bind( 'click', function( e ) {
				var data = widget.selectedListItem.data;
				var $element = widget.selectedListItem.element;

				_MarkCompleted( $element, data );
			});

			widget.toolbar.find( "#list-item-delete" ).bind( 'click', function( e ) {

				var deleteFunc = function() {
					_DeleteListItem( widget.selectedListItem.element, widget.selectedListItem.data );
				};

				if ( typeof( widget.deleteDialog ) === 'undefined' ) {
					widget.deleteDialog = $.confirmationDialog( "Delete List Item", deleteFunc, "Cancel", "Do you really want to delete?" );
				}

				widget.deleteDialog.dialog("open");
			});

			widget.toolbar.find( "#list-item-fullsize" ).bind( 'click', function( e ) {
				_ToggleFullsize( widget.selectedListItem.element );
			});

			widget.header.append( widget.toolbar );

		};

		var _AddNewListItem = function() {
			var data = widget.element.data( "data-list" );

			ListItem.New( {
				successCallback: function( template, json, status, xhr, errors ) {
					widget.listItemList.prepend( $( template ) );
					var $form = widget.listItemList.find( '#new_list_item' );
					$form.find( "textarea" ).markItUp( mySettings ).focus();
					widget.listItemList.find( '.row' ).hide();

					$form.find( "#cancel-edit" ).bind( 'click', function( e ){
						e.preventDefault();
						$form.hide( 'slow', function(){
							$( this ).remove();
							widget.listItemList.find( '.row' ).show();
							widget.listItemList.find( '.row' ).first().focus();
						});
					});

					$form.find( "input[type=submit]" ).bind( 'click', function( e ) {
						e.preventDefault();

						var serializedForm = $form.serializeForm();
						json.list_item = serializedForm.list_item;

						ListItem.Create({
							send: json,
							successCallback: function( template, json, status, xhr, errors ) {
								$form.hide( 'slow', function(){
									_AddListItem( json, template, true );
									$( this ).remove();
									widget.listItemList.find( ".row" ).show();
									widget.listItemList.find( ".row" ).first().focus();
								});
							},
							lists: data.list.id
						});
					});

					$form.find( "textarea" ).bind( 'keydown', 'esc', function( e ){
						$form.find( "#cancel-edit" ).trigger( 'click' );
					});
				},
				lists: data.list.id
			} );
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

						if ( widget.listItemList.find( '.row' ).length === 0 ) {
							_AddNewListItem();
						}
					},
					lists: data.list.id
				});
			},

			SelectListItem: function() {
				var effect = "highlight";

				if ( widget.selectedListItem ) {
					widget.selectedListItem.element.effect( effect, {}, 300, function(){
						$( this ).show();
						$( this ).focus();
					});
				} else {
					widget.listItemList.find( '.row' ).first().effect( effect, {}, 300, function(){
						$( this ).show();
						$( this ).focus();
					});
				}

			}
		};
	}();
	// register widget
	$.widget("ui.ListItemView", ListItemView);
})();
