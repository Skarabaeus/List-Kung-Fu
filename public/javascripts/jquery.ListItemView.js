(function(){
	var ListItemView = {

		/**
		*
		* Private Functions Start
		*
		**/

		_SetSelectedListItem: function( elem, obj ) {
			this.selectedListItem = {
				element: elem,
				data: obj
			};
		},

		_Filter: function() {
			var widget = this;
			var filtervalue = widget.selectedText;

      if ( filtervalue === '' ) {
				widget.listItemList.find( ".row" ).show();
      } else {
				widget.listItemList.find( ".row:not(:Contains('" + filtervalue + "'))").hide();
				widget.listItemList.find( ".row:Contains('" + filtervalue + "')").show();
      }
		},

		_SetupDeadlineButton: function( $parentItem ) {
			// prevent default for save-deadline button
			var deadlineSettings = $parentItem.find( "#deadline-settings-wrapper" );
			var saveDeadlineButton = $parentItem.find( "#save-deadline" );

			saveDeadlineButton.bind( 'click keydown', 'return', function( e ){
				if ( !saveDeadlineButton.data( 'settings-visible') ) {
					deadlineSettings.show( 'fast', function(){
						deadlineSettings.find( '.deadline-button' ).first().focus();
						saveDeadlineButton.data( 'settings-visible', true );
					});
				} else {
					deadlineSettings.hide( 'fast', function(){
						deadlineSettings.find( '.deadline-button' ).first();
						saveDeadlineButton.data( 'settings-visible', false );
					});
				}
				return false;
			});
		},

		_SetupCustomDeadlinePicker: function() {
			var altFormat = 'yy,mm,dd';
			var dateFormat = 'dd.mm.yy';

			$( "#custom-deadline-display" ).datepicker( {
					minDate: new Date(), // choosing deadline in the past wouldn't make much sense
					altField: '#custom-deadline-value',
					altFormat: altFormat,
					dateFormat: dateFormat
			});

			$( '#custom-deadline-value' ).val( $.datepicker.formatDate( altFormat, new Date() ) );
			$( '#custom-deadline-display' ).val( $.datepicker.formatDate( dateFormat, new Date() ) );
		},

		_TriggerReinitOfPanes: function() {
			this._trigger("ReinitPanes", 0, {} );
		},

		_TriggerResize: function() {
			this._trigger("ContentDimensionsChanged", 0, {} );
		},

		_AddListItem: function( listItem, template, isFirst ) {
			var widget = this;

			var newElement = $( $.mustache( template, listItem.list_item ) );
			newElement.data( "data", listItem );
			newElement.data( "isFullsize", false );

			if ( isFirst ) {
				widget.listItemList.prepend(newElement);
			} else {
				widget.listItemList.append(newElement);
			}

			newElement.find( ".handle" ).height( newElement.height() );

			newElement.bind( 'keyup', 'space', function( e ){
				widget.toolbar.find( "#list-item-completed" ).effect('puff', {}, 300, function(){
					$( this ).show();

					if ( newElement.find( ".undo" ).length === 0 ) {
						widget.toolbar.find( "#list-item-completed" ).trigger( "click" );
					} else {
						newElement.find( ".undo" ).trigger( "click" );
					}
				});
				return false;
			});

			newElement.bind( 'keydown', 'del', function(){
				widget.toolbar.find( "#list-item-delete" ).effect('puff', {}, 300, function(){
					$( this ).show();
					widget.toolbar.find( "#list-item-delete" ).trigger( 'click' );
				});
				return false;
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
							widget.toolbar.find( "#list-item-fullsize" ).button( "option", "icons"
								, { primary:'ui-icon-zoomout' } );
						} else {
							widget.toolbar.find( "#list-item-fullsize" ).button( "option", "icons"
								, { primary:'ui-icon-zoomin' } );
						}
					}

					widget._SetSelectedListItem( $( e.target ), $( e.target ).data( "data" ) );
				}
			});

			if ( $.browser.msie ) {
				newElement.bind( 'click ', function() {
					newElement.focus();
					return false;
				});
			}

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

			newElement.bind( 'keydown dblclick', 'return', function(){
				// if we display already the form for this element,
				// just exit.
				if ( newElement.find( "form" ).length > 0 ) {
					return false;
				}

				widget.toolbar.find( "#list-item-edit" ).effect('puff', {}, 300, function(){
					$( this ).show();
				});

				// close all open forms
				widget.listItemList.find( ".row" ).find( "form" ).remove();

				ListListItem.Edit({
					successCallback: function( template, json, status, xhr, errors ) {
						if ( $.browser.msie && newElement.find( "form" ).length > 0 ) {
							return false;
						}

						var $form = $( template );
						var elementAlreadyFullsize = newElement.data( "isFullsize" );

						// hide all rows
						widget.listItemList.find( '.row' ).hide();
						// show only the row which the user wants to edit
						widget.selectedListItem.element.show();

						$form.hide();
						widget.selectedListItem.element.prepend( $form );
						$form.find( "textarea" ).markItUp( mySettings );
						widget._SetupDeadlineButton( $form );
						widget._SetupCustomDeadlinePicker();

						// only toggleFullsize if not already fullsize (when opening the editing dialog)
						if ( elementAlreadyFullsize === false ) {
							widget._ToggleFullsize( newElement );
						}

						// hide drag and drop handle
						widget.selectedListItem.element.find( ".handle" ).hide();

						$form.show('slow', function(){
							$form.find( "textarea" ).focus();
						});

						$form.find( "textarea" ).bind( "keydown", 'esc', function(){
							$form.find( "#cancel-edit" ).trigger( "click" );
						});

						$form.find( ".deadline-button" ).bind( "keydown click", 'return', function( e ) {
							e.preventDefault();
							var serializedForm = newElement.find("form").serializeForm();

							// add deadline indicator based on deadline type
							serializedForm.list_item.deadlineType = $( e.target ).attr( 'data-deadline' );
							serializedForm.list_item.customDeadlineValue = $( '#custom-deadline-value' ).val();

							ListListItem.Update({
								send: serializedForm,
								successCallback: function( template, json, status, xhr, errors ){
									$form.hide( 'slow', function( e ) {
										$( this ).remove();

										// show drag and drop handle
										widget.selectedListItem.element.find( ".handle" ).show();

										// update list item content
										newElement.find( '.list-item-content' ).html( json.list_item.body_rendered );

										// update deadline
										newElement.find( '.list-item-deadline' ).html( json.list_item.deadline_in_words );

										// correct height of drag and drop handle
										newElement.find( ".handle" ).height( newElement.find( '.list-item-content' ).height() );

										// only toggleFullsize if not already fullsize (when saving item)
										if ( elementAlreadyFullsize === false ) {
											widget._ToggleFullsize( newElement );
										}

										widget._SetSelectedListItem( newElement, json );
										newElement.data( "data", json );

										// show all the rows again
										widget._Filter();

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

							// show drag and drop handle
							widget.selectedListItem.element.find( ".handle" ).show();

							$form.hide( 'slow', function() {
								$( this ).remove();

								// only toggleFullsize if not already fullsize (when canceling edit)
								if ( elementAlreadyFullsize === false ) {
									widget._ToggleFullsize( newElement );
								}

								// show again all other rows
								widget._Filter();

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
				widget.toolbar.find( "#list-item-new" ).effect('puff', {}, 300, function(){
					$( this ).show();
					widget._AddNewListItem();
				});
			});

			newElement.bind( 'keydown', 'l', function( e ) {
				widget.toolbar.find( "#list-item-fullsize" ).effect('puff', {}, 300, function(){
					widget.toolbar.find( '#list-item-fullsize' ).trigger( 'click' );
					$( this ).show();
				});
				return false;
			});

			// code for drag and drop of item to new list.
			if ( ListKungFu && ListKungFu.LayoutCenter ) {
				newElement.draggable( {
					helper: function(){ return $('<div class="list-item-drag-helper">'+newElement.find(".list-item-content").text().substring(0, 20)+' . . .'+'</div>').get(0) },
					appendTo: ListKungFu.LayoutCenter,
					revert: "invalid",
					handle: ".handle",
					cursorAt: { top: 10, left: 10 },
					iframeFix: true,
					start: function( event, ui ) {
						// disable the ability to select text.
						// this is a hack for chrome and safari.
						document.onselectstart = function () { return false; };

						widget._trigger( "StartedDraggingListItem", 0, { dragType: "listitem" } );
					},
					stop: function ( event, ui ) {
						document.onselectstart = null;
					}
				});
			}

			widget._CorrectHeight( newElement );
		},

		_ToggleFullsize: function ( element ) {
			var widget = this;
			if ( element.data( "isFullsize" ) === true ) {
				widget._CorrectHeight( element, false );
				element.data( "isFullsize", false );
				widget.toolbar.find( "#list-item-fullsize" ).button( "option", "icons"
					, { primary:'ui-icon-zoomin' } );
			} else {
				widget._CorrectHeight( element, true );
				element.data( "isFullsize", true );
				widget.toolbar.find( "#list-item-fullsize" ).button( "option", "icons"
					, { primary:'ui-icon-zoomout' } );
			}
		},

		_CorrectHeight: function( element, setToFullSize ) {
			var widget = this;
			if ( element.height() > 150 && !setToFullSize ) {
				element.height( 150 );
			} else {
				element.height( "auto" );
			}
			widget._TriggerResize();
		},

		_DeleteListItem: function( element, listItem ) {
			var widget = this;
			ListListItem.Destroy({
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
		},

		_MarkCompleted: function( element, listItem ) {
			var widget = this;
			// set item completed
			listItem.list_item.completed = true;

			// update item server side
			ListListItem.Update({
				successCallback: function(){
					var queueName = "list-item-undo-" + listItem.list_item.id;

					// hide the main content of the list item and instead,
					// display the UNDO button.
					element.find( ".list-item-wrapper" ).hide('slow', function(){
						var $undo = $( '<div class="undo clickable"><img src="/images/undo-icon.gif"/>Undo</div>' );

						$undo.bind( "click", function() {
							widget._MarkUncompleted( element, listItem, queueName );
						});

						element.append( $undo );

						widget._CorrectHeight( element );

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
							widget._ToggleCompleted( true );
						}

						// select list item
						element.focus();
					});

				},
				lists: listItem.list_item.list_id,
				list_items: listItem.list_item.id,
				send: listItem
			});
		},

		_MarkUncompleted: function( element, listItem, queueName ) {
			var widget = this;
			if ( queueName !== "" ) {
				element.clearQueue( queueName );
			}

			// set item completed
			listItem.list_item.completed = false;

			// update item server side
			ListListItem.Update({
				successCallback: function(){
					element.find( ".undo" ).hide('slow', function(){
						$( this ).remove();
					});
					element.find( ".list-item-wrapper" ).show('slow', function(){
						widget._CorrectHeight( element );
					});

					// in case completed items are displayed, update them:
					if ( widget.toolbar && widget.toolbar.find( "#showCompleted" ).get( 0 ).
						checked === true ) {
						widget._ToggleCompleted( true );
					}
				},
				lists: listItem.list_item.list_id,
				list_items: listItem.list_item.id,
				send: listItem
			});
		},

		_ToggleCompleted: function(  doShow ) {
			var widget = this;
			if ( doShow === true ) {

				if ( widget.completedList ) {
					widget.completedList.remove();
					widget.completedList = null;
				}

				widget.completedList = $( '<div id="completedList"></div>' );

				var data = widget.element.data( "data-list" );
				ListListItem.Index( {
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
		},

		_CreateToolbar: function() {
			var widget = this;
			// empty header
			widget.header.html("");

			// build new header
		 	var toolbarArr = ['<div id="list-item-toolbar">',
				'<div id="list-name"></div><div id="list-item-toolbar-buttons">',
				'<button id="list-item-completed">Completed [space]</button>',
				'<button id="list-item-new">Create [shift+return]</button>',
				'<button id="list-item-delete">Delete [del]</button>',
				'<button id="list-item-edit">Edit [return]</button>',
				'<button id="list-item-fullsize">Fullsize [l]</button>',
				'<input type="checkbox" id="showCompleted"/>',
				'<label for="showCompleted">Show Completed Items</label>',
				'</div></div>'];

			widget.toolbar = $( toolbarArr.join('') );

			widget.listName = widget.toolbar.find( "#list-name" );

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
					primary: 'ui-icon-trash'
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
				widget._AddNewListItem();
			});

			widget.toolbar.find( "#showCompleted" ).bind( "change", function( e ){
				widget._ToggleCompleted( e.target.checked );
				widget.selectedListItem.element.focus();
			});

			widget.toolbar.find( "#list-item-completed" ).bind( 'click', function( e ) {
				var data = widget.selectedListItem.data;
				var $element = widget.selectedListItem.element;

				widget._MarkCompleted( $element, data );
			});

			widget.toolbar.find( "#list-item-delete" ).bind( 'click', function( e ) {

				var deleteFunc = function() {
					widget._DeleteListItem( widget.selectedListItem.element, widget.selectedListItem.data );
				};

				if ( typeof( widget.deleteDialog ) === 'undefined' ) {
					widget.deleteDialog = $.confirmationDialog( "Delete List Item", deleteFunc, "Cancel"
						, "Do you really want to delete?" );
				}

				widget.deleteDialog.dialog("open");
			});

			widget.toolbar.find( "#list-item-edit" ).bind( 'click', function( e ) {
				widget.selectedListItem.element.trigger( 'dblclick' );
			});

			widget.toolbar.find( "#list-item-fullsize" ).bind( 'click', function( e ) {
				widget._ToggleFullsize( widget.selectedListItem.element );
			});

			widget.header.append( widget.toolbar );
		},

		_AddNewListItem: function() {
			var widget = this;
			var data = widget.element.data( "data-list" );

			// only show one "new list item" form
			if ( widget.listItemList.find( '#new_list_item' ).length > 0 ) {
				return false;
			}

			ListListItem.New( {
				successCallback: function( template, json, status, xhr, errors ) {
					if ( $.browser.msie && widget.listItemList.find( '#new_list_item' ).length > 0 ) {
						return false;
					}

					var $form = $( template );
					widget.listItemList.prepend( $form );

					widget._SetupDeadlineButton( $form );
					widget._SetupCustomDeadlinePicker();
					$form.find( "textarea" ).markItUp( mySettings );
					$form.find( "textarea" ).focus();


					// hide existing rows when adding new item
					widget.listItemList.find( '.row' ).hide();

					$form.find( "#cancel-edit" ).bind( 'click', function( e ){
						e.preventDefault();
						$form.hide( 'slow', function(){
							$( this ).remove();
							widget.listItemList.find( '.row' ).show();
							widget.listItemList.find( '.row' ).first().focus();
						});
					});

					$form.find( ".deadline-button" ).bind( 'click', function( e ) {
						e.preventDefault();
						var serializedForm = $form.serializeForm();

						// hacky hack hack. no idea why I have to do this
						// when creating an list item.
						// When editing an item, line breaks are sent correctly.
						serializedForm.list_item.body = serializedForm.list_item.body.replace(/\n/g, "\n\n");

						// add deadline indicator based on deadline type
						serializedForm.list_item.deadlineType = $( e.target ).attr( 'data-deadline' );
						serializedForm.list_item.customDeadlineValue = $( '#custom-deadline-value' ).val();

						ListListItem.Create({
							send: serializedForm,
							successCallback: function( template, json, status, xhr, errors ) {
								$form.hide( 'slow', function(){
									widget._AddListItem( json, template, true );
									$( this ).remove();
									widget.toolbar.find( "#list-item-search" ).trigger( "ClearValue" );
									widget.listItemList.find( ".row" ).show();
									widget.listItemList.find( ".row" ).first().focus();
									widget.listItemList.find( ".row" ).first().find( ".handle" ).height( widget.listItemList.find( ".row" ).first().find( ".list-item-content" ).height() );
								});
							},
							lists: data.list.id
						});
						return false;
					});

					$form.find( "textarea" ).bind( 'keydown', 'esc', function( e ){
						$form.find( "#cancel-edit" ).trigger( 'click' );
					});
				},
				lists: data.list.id
			} );
		},

		_create: function() {
			var widget = this;

			widget.wrapper = $( '<div class="ui-layout-content" id="list-item-wrapper"></div>' );
			widget.listItemList = $( '<div id="list-item-list"></div>');
			widget.header = $( '<div class="header"></div>' );

			widget.element.append( widget.header );
			widget.element.append( widget.wrapper );
			widget.wrapper.append( widget.listItemList );

			widget._TriggerResize();

			// bind global events

			$( document ).bind( "keydown", "c", function( e ) {
				var $completedInput = widget.toolbar.find( "#showCompleted" );

					if ( $completedInput.length > 0 ) {
					if ( $completedInput.get( 0 ).checked === true ) {
						$completedInput.get( 0 ).checked = false;
					} else {
						$completedInput.get( 0 ).checked = true;
					}

					$completedInput.trigger( "change" );
				}
			});

			$( document ).bind( "keyup", "f", function( e ) {
				widget.toolbar.find( "#list-item-search" ).focus();
			});


		},
		/**
		*
		* Private Functions End
		*
		**/

		/**
		*
		* Options Start
		*
		**/
		options: {

		},
		/**
		*
		* Options End
		*
		**/

		/**
		*
		* Public Functions Start
		*
		**/
		RemoveList: function() {
			var widget = this;

			// remove elements
			widget.element.children().remove();

			// unbind global events
			$( document ).unbind( "keydown" , "c" )
									 .unbind( "keyup", "f" );
		},

		OpenList: function( data ) {
			var widget = this;
			widget.RemoveList();
			widget._create();

			widget.element.data( "data-list", data );

			ListListItem.Index( {
				successCallback: function( template, json, status, xhr, errors ) {
					widget._CreateToolbar();

					$.each( json, function( index, listItem ) {
						widget._AddListItem( listItem, template )
					});

					// if we have a list_item id, select the list item with that id
					// otherwise just select the first.
					if ( data.id ) {
						widget.listItemList.find( ".row" ).each(function() {
							var tempListItem = $( this );
							var d = tempListItem.data( "data" );

							if ( d.list_item.id === data.id ) {
								tempListItem.focus();

								// if item found, return false in order to exit the loop
								return false;
							}
						});
					} else {
						widget.listItemList.find( ".row" ).first().focus();
					}

					if ( widget.listItemList.find( '.row' ).length === 0 ) {
						widget._AddNewListItem();
					}

					// set list name
					widget.listName.text( data.list.title );
				},
				lists: data.list.id
			});

			widget._TriggerReinitOfPanes();
		},

		SelectListItem: function() {
			var widget = this;
			var effect = "highlight";

			if ( widget.selectedListItem ) {
				widget.selectedListItem.element.effect( effect, {}, 300, function(){
					$( this ).show().focus();
				});
			} else {
				widget.listItemList.find( '.row' ).first().effect( effect, {}, 300, function(){
					$( this ).show().focus();
				});
			}
		},

		destroy: function() {
			var widget = this;

			// remove elements
			widget.element.children().remove();

			// unbind global events
			$( document ).unbind( "keydown" , "c" )
				.unbind( "keyup", "f" );
		},

		Filter: function( selectedText ) {
			this.selectedText = selectedText;
			this._Filter();
		}
		/**
		*
		* Public Functions End
		*
		**/

	};
	// register widget
	$.widget("ui.ListItemView", ListItemView);
})();
