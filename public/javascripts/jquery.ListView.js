(function(){
	var ListView = {

		/**
		*
		* Private Functions Start
		*
		**/

		_ReplaceList: function( oldElement, data, template ) {
			var widget = this;

			var ele = widget._GetListElement( data, template );
			oldElement.replaceWith( ele );
			widget._AdjustHeight();
			widget._triggerResize();
			ele.focus();
		},

		_DroppableConfigTags: function() {
			var widget = this;

			return {
				activeClass: "ui-state-default",
				hoverClass: "ui-state-hover",
				accept: ".tag",
				drop: function( event, ui ) {
					var listElement = $( this );
					if ( listElement.position().top < widget.wrapper.height() ) {
						var tagData = ui.draggable.data( 'data' );
						var listData = listElement.data( 'data' );

						listData.list.tag_id = tagData.tag.id;

						List.Update({

							send: listData,
							successCallback: function( template, json, status, xhr, errors ){
								widget._ReplaceList( listElement, json, template );
							},
							lists: listData.list.id
						});
					}
				}
			}
		},

		_DroppableConfigListItems: function( newElement ) {
			var widget = this;

			return {
				activeClass: "ui-state-default",
				hoverClass: "ui-state-hover",
				accept: ".list-item",
				drop: function( event, ui ) {
					if ( $(this).position().top < widget.wrapper.height() ) {
						var originalListItem = ui.draggable.data( "data" );
						var dropList = $( this ).data( "data" );

						var data = {
							list_item: {
								body: originalListItem.list_item.body.replace(/\n/g, "\n\n")
							}
						};

						ListListItem.Create({
							send: data,
							successCallback: function( template, json, status, xhr, errors ) {

								$( event.target ).find(".fake-drop").remove();
								newElement.effect( 'highlight', {}, 3000 );
							},
							lists: dropList.list.id
						});
					}
				},
				over: function(event, ui) {
					var wrapper = $('<div class="fake-drop"></div>');
					wrapper.html( '<p>' + ui.helper.text() + '</p>' );
					$(event.target).append( wrapper );
				},
				out: function( event, ui ) {
					$(event.target).find(".fake-drop").remove();
				}

			};
		},

		_IsNewList: function( element ) {
			var widget = this;

			if ( widget.selectedList === null || widget.selectedList.data.list.id !== element.list.id ) {
				return true;
			} else {
				return false;
			}
		},

		_HighlightFormErrors: function( form, errors ) {
			for ( var model in errors ) {
				var currentModel = errors[ model ];

				for ( var field in currentModel ) {
					var currentField = currentModel[ field ];

					var errorExplanation = $( '<div class="error_explanation"><ul></ul></div>' );
					var errorList = errorExplanation.find( "ul" );

					var name = model + "[" + field + "]";
					var input = form.find( "*[name=" + name + "]" );

					for (var i = 0; i < currentField.length; i++ ) {
						input.parent( ".field" ).addClass( "field_with_errors" );
						errorList.append( '<li>' + currentField[ i ] + '</li>' );
					}

					input.parent( ".field" ).append( errorExplanation );
				}
			}
		},

		_ClearFormErrors: function( form ) {
			form.find( ".field" ).removeClass( "field_with_errors" );
			form.find( ".error_explanation" ).remove();
		},

		_DeleteList: function( delay ) {
			var widget = this;

			var nextItem = widget.selectedList.element.next();
			var prevItem = widget.selectedList.element.prev();
			delay = delay || 0;

			List.Destroy({
				successCallback: function( template, json, status, xhr, errors ){
					widget.selectedList.element.delay( delay ).fadeOut(function(){
						$(this).remove();
						nextItem.length > 0 ? nextItem.focus() : prevItem.focus();
					});
					widget._trigger( "CloseList", 0, {} );
				},
				lists: widget.selectedList.data.list.id
			});
		},

		_CreateToolbar: function() {
			var widget = this;

			var toolbar = $('<div id="list-toolbar"> \
				<button id="list-new">Create [shift+return]</button> \
				<button id="list-delete">Delete [del]</button> \
				<button id="list-edit">Edit [space]</button> \
				<input type="text" id="search-list" /> \
				<div id="list-search-cancel">&nbsp;</div> \
				</div>')

			widget.element.find("div.header").append(toolbar);

			// add buttons to toolbar.

			toolbar.find("#list-new").button({
				text: false,
				icons: {
					primary: 'ui-icon-plusthick'
				}
			});

			toolbar.find("#list-delete").button({
				text: false,
				icons: {
					primary: 'ui-icon-trash'
				}
			});

			toolbar.find( "#list-edit" ).button({
				text: false,
				icons: {
					primary: 'ui-icon-pencil'
				}
			});

			// bind toolbar events.

			toolbar.find("#list-delete").bind('click', function( e ) {
				if ( widget.selectedList !== null ) {


					if ( typeof(widget.deleteDialog) === 'undefined' ) {
						var deleteFunc = function() {
							if ( widget.listForm !== null ) {
								widget.listForm.bind( "FormHidden", function() {
									widget._DeleteList( 1000 );
								});
								widget._HideForm();
							} else {
								widget._DeleteList();
							}
						}

						widget.deleteDialog = $.confirmationDialog( "Delete List", deleteFunc, "Cancel", "Do you really want to delete?" );
					}
					widget.deleteDialog.dialog("open");
				} else {
					$("#notice").text("Select the list which you want to delete").fadeIn().delay(5000).fadeOut();
				}

				$( e.target ).blur();

				return false;
			});

			toolbar.find("#list-new").bind('click', function( e ) {

				widget.listlist.hide('slide', { direction: 'left'}, 'slow', function(){

					// remove eventual old occurances
					if ( widget.listForm != null ) {
						widget.listForm.remove();
						widget.listForm = null;
					}

					// create fresh form
					widget.listForm = $('<div class="ui-layout-content" id="list-form"></div>');
					widget.wrapper.append( widget.listForm );

					// triggers /lists/id/edit and calls this.DisplayForm with the
					// HTML of the form.
					List.New({
						successCallback: function( template, json, status, xhr, errors ) {
							widget.listForm.append( template );
							widget.listForm.show('slide', { direction: 'left' }, 'slow', function(){
								widget.listForm.find('#list_title').first().focus();
							});

							widget._trigger( "CloseList", 0, {} );

							widget.listForm.find( "#list-back-button" ).bind( 'click', function(){
								widget._HideForm();
							});

							widget.listForm.find( '#list_title' ).bind( 'keydown', 'esc', function( e ) {
								widget._HideForm();
							});

							widget.listForm.bind( "submit", function( e ){
								e.preventDefault();

								var data = json;
								var serializedForm = $(this).find("form").serializeForm();
								json.list = serializedForm.list;

								List.Create({
									send: data,
									successCallback: function( template, json, status, xhr, errors ) {
										widget._ClearFormErrors( widget.listForm );

										if ( errors === false ) {
											widget._HideForm( json, template );

											// clear searchfield
											widget.toolbar.find( '#search-list' ).trigger( 'ClearValue' );
										} else {
											widget._HighlightFormErrors( widget.listForm, errors );
										}
									}
								});
								return false;
							});

							widget.selectedList = null;
						}
					});
				});


				$( e.target ).blur();
				return false;
			});

			toolbar.find("#search-list").bind( 'keyup', function ( e ) {
				var filtervalue = $(this).val();

        if (filtervalue === '') {
					widget.listlist.find( ".row" ).show();
        } else {
					widget.listlist.find( ".row:not(:Contains('" + filtervalue + "'))").hide();
					widget.listlist.find( ".row:Contains('" + filtervalue + "')").show();
        }
				widget._AdjustHeight();
				widget._triggerResize();
			});

			toolbar.find( "#list-search-cancel" ).bind( 'click', function() {
				toolbar.find( "#search-list" ).val("").trigger( "keyup" );
			});

			toolbar.find("#search-list").bind( 'ClearValue', function( e ){
				$( e.target ).val("");
				widget.listlist.find( ".row" ).show();
			});

			toolbar.find( "#list-edit" ).bind( 'click', function( e ) {
				widget.listlist.hide('slide', { direction: 'left'}, 'slow', function(){

					// remove eventual old occurances
					if ( widget.listForm != null ) {
						widget.listForm.remove();
						widget.listForm = null;
					}

					// create fresh form
					widget.listForm = $('<div class="ui-layout-content" id="list-form"></div>');
					widget.wrapper.append( widget.listForm );

					// triggers /lists/id/edit and calls this.DisplayForm with the
					// HTML of the form.
					List.Edit({
						successCallback: function( template, json, status, xhr, errors ) {
							widget.listForm.append( template );
							widget.listForm.show('slide', { direction: 'left' }, 'slow', function(){
								widget.listForm.find( '#list_title' ).first().focus();
							});

							widget.listForm.find( "#list-back-button" ).bind( 'click', function(){
								widget._HideForm();
							});

							widget.listForm.find( '#list_title' ).bind( 'keydown', 'esc', function( e ) {
								widget._HideForm();
							});

							widget.listForm.bind( "submit", function(e){
								e.preventDefault();

								var serializedForm = $(this).find("form").serializeForm();

								List.Update({

									send: serializedForm,
									successCallback: function( template, json, status, xhr, errors ){
										widget._ClearFormErrors( widget.listForm );

										if ( errors === false ) {
											widget._HideForm( json, template );
										} else {
											widget._HighlightFormErrors( widget.listForm, errors );
										}
									},
									lists: widget.selectedList.data.list.id
								});

								return false;
							});
						},
						lists: widget.selectedList.data.list.id
					});
				});
			});

			// return toolbar

			return toolbar
		},

		_GetListElement: function( data, template ) {
			var widget = this;

			// get HTML for single List representation
			var newElement = $( $.mustache( template, data.list ) );

			// add tabindex so that list is focusable
			// it looks like for the purpose of being focusable
			// it's not required that the tabindex is different for each element
			newElement.attr('tabindex', 0);

			// save List data directly in DOM element
			newElement.data('data', data);

			// add CSS class
			newElement.addClass('row');

			/////////////////////////////
			//	bind Events for new List DOM
			/////////////////////////////

			if ( $.browser.msie ) {
				newElement.bind( 'click', function(){
					newElement.focus();
					return false;
				});
			}

			newElement.bind('keydown', 'down', function( e ){
				e.preventDefault();
				$( e.target ).nextAll( 'div:visible' ).first().focus();
				return false;
			});

			newElement.bind('keydown', 'up', function( e ){
				e.preventDefault();
				$( e.target ).prevAll( 'div:visible' ).first().focus();
				return false;
			});

			newElement.bind('focus', function(e){
				var target = $( e.target );

				widget.selectedList = {
					element: target,
					data: target.data("data")
				};

				// remove selection from all rows
				widget.listlist.find('.row').removeClass('selected-row');

				// add it to the selected row.
				target.addClass('selected-row');

				// show tags of selected list and hide tags of all the others
				widget.listlist.find( '.assigned-tags' ).hide();
				target.find( '.assigned-tags' ).show();
				widget._AdjustHeight();
			});

			newElement.bind( 'keydown dblclick', 'return', function(){
				widget._trigger( "OpenList", 0, { selectedList: newElement.data("data") } );
			});

			newElement.bind( 'keydown', 'right', function( e ){
				widget._trigger( "SelectListItem", 0, {} );
			});

			newElement.bind( 'keydown', 'shift+return', function( e ){
				widget.toolbar.find( "#list-new" ).effect('puff', {}, 300, function(){
					$(this).show();
					$(this).trigger('click') });
				return false;
			});

			newElement.bind( 'keydown', 'del', function(e){
				widget.toolbar.find( "#list-delete" ).effect('puff', {}, 300, function(){
					$(this).show();
				}).trigger('click');
			});

			newElement.bind( 'keydown', 'space', function(){
				widget.toolbar.find( "#list-edit" ).effect('puff', {}, 300, function(){
					$(this).show();
					$(this).trigger('click') });
				return false;
			});

			newElement.droppable( widget._DroppableConfigListItems( newElement ) );

			newElement.find( '.assigned-tag-delete' ).bind( 'click', function( e ){
				var tagElement = $( e.target ).parent( '.assigned-tag' );
				var tagId = tagElement.attr( 'data-id' );
				var listData = newElement.data( 'data' );

				listData.list.tag_id = tagId;
				listData.list.tag_action = 'remove';

				List.Update({

					send: listData,
					successCallback: function( template, json, status, xhr, errors ){
						tagElement.hide( 'slow', function(){
							tagElement.remove();
							widget._ReplaceList( newElement, json, template );

							// rerun tag filter
							widget._FilterByTags();
						});
					},
					lists: listData.list.id
				});
			});

			newElement.find( '.assigned-tags' ).hide();
			return newElement;
		},

		_triggerResize: function() {
			var widget = this;
			widget._trigger("ContentDimensionsChanged", 0, {} );
		},

		_AdjustHeight: function() {
			var widget = this;
			widget.listlist.find( '.row' ).each(function(){
				var that = $(this);
				var listTag = that.find( ".list-tag" );
				var listName = that.find( ".list-name" );

				listTag.height( listName.height() + 10 + "px" );
			});
		},

		_AddListToDOM: function( data, template ) {
			var widget = this;

			widget.listlist = $( '<div id="list-list"></div>' );
			widget.wrapper.append( widget.listlist );
			var toolbar = widget.toolbar;

			for ( var i = 0; i < data.length; i++ ) {
				widget.listlist.append( widget._GetListElement( data[ i ], template ) ) ;
			}
			widget._AdjustHeight();
			widget._triggerResize();
		},

		_SelectLastList: function() {
			var widget = this;
			var effect = "highlight";

			if ( widget.selectedList ) {
				widget.selectedList.element.effect( effect, {}, 300, function(){
					$(this).show();
					$(this).focus();
				});
			} else {
				widget.listlist.find( '.row' ).first().effect( effect, {}, 300, function(){
					$(this).show();
					$(this).focus();
				});
			}
		},

		_RegisterGlobalKeyboardShortcuts: function() {
			var widget = this;

			// select list
			$(document).bind( 'keydown', 'ctrl+l', function(e) {
				widget._SelectLastList();
			});

			$(document).bind( 'keydown', 'ctrl+f', function(e){
				widget.toolbar.find( "#search-list" ).focus();
			});

			// since ctrl+f does not work in MS windows, adding shift+f as additional
			// keyboard shortcut
			$(document).bind( 'keydown', 'shift+f', function(e) {
				widget.toolbar.find( "#search-list" ).focus();
				return false;
			})
		},

		_ShowListView: function( updatedElement, template ) {
			var widget = this;

			widget.listlist.show( 'slide', { direction: 'left'}, 'slow', function(){
				if ( updatedElement ) {

					var newElement = widget._GetListElement( updatedElement, template );

					if ( widget._IsNewList( updatedElement ) ) {
						widget.listlist.prepend( newElement );
					} else {
						widget.selectedList.element.replaceWith( newElement );
					}

					widget._AdjustHeight();

					widget.selectedList =  {
						data: updatedElement,
						element: newElement
					};
				}
				if ( widget.selectedList ) {
					widget.selectedList.element.focus();
				}
			});

		},

		_HideForm: function( updatedElement, template ) {
			var widget = this;

			widget.listForm.hide('slide', { direction: 'left' }, 'slow', function(){
				widget._ShowListView( updatedElement, template );
				widget.listForm.trigger( "FormHidden" );
				if ( widget.selectedList ) {
					widget.selectedList.element.focus();
				} else {
					widget.listlist.find( '.row' ).first().focus();
				}
				widget.listForm.remove();
				widget.listForm = null;
			});
		},

		_FilterByTags: function() {
			var widget = this;

			// apply text filter
			widget.toolbar.find( "#search-list" ).trigger( "keyup" );

			widget.listlist.find( '.row:visible' ).each(function(){
				var that = $(this);
				var data = that.data( 'data' );
				var tagsFound = 0;

				if ( widget.selectedTags.length > 0 ) {
					for ( var i = 0; i < data.list.tags.length; i++ ) {
						for ( var j = 0; j < widget.selectedTags.length; j++ ){
							if ( widget.selectedTags[ j ] === data.list.tags[ i ].id ) {
								tagsFound++;
							}
						}
					}

					if ( tagsFound === widget.selectedTags.length ) {
						that.show();
					} else {
						that.hide();
					}
				}
			});
		},

		_create: function() {
			var widget = this;
			widget.selectedList = null;
			widget.wrapper = widget.element.find('div#list-wrapper');
			widget.toolbar = widget._CreateToolbar();
			widget.listForm = null;
			widget.selectedTags = [];

			// retrieve Lists from server and add them to DOM.
			List.Index( {
				successCallback: function( template, json, status, xhr, errors ) {

					// remove all existing rows
					widget.wrapper.find(".row").remove();

					// add newly received Lists to DOM
					widget._AddListToDOM( json, template );

					// focus first list
					widget.listlist.find( '.row' ).first().focus();
				}
			} );

			// register global keyboard shortcuts
			widget._RegisterGlobalKeyboardShortcuts();
		},

		/**
		*
		* Private Functions End
		*
		**/

		/**
		*
		* Default Options Start
		*
		**/
		options: {

		},
		/**
		*
		* Default Options End
		*
		**/

		/**
		*
		* Public Functions Start
		*
		**/

		SetupDroppable: function( dragType ) {
			var widget = this;

			widget.listlist.find( '.row' ).each(function(){
				var list = $(this)
				list.droppable( "destroy");
				switch( dragType ) {
				case 'listitem':
					list.droppable( widget._DroppableConfigListItems( list ) );
					break;
				case 'tag':
					list.droppable( widget._DroppableConfigTags() );
					break;
				}

			});
		},

		ReloadLists: function() {
			var widget = this;

			List.Index( {
				successCallback: function( template, json, status, xhr, errors ) {

					// remove all existing rows
					widget.wrapper.find(".row").remove();

					// add newly received Lists to DOM
					widget._AddListToDOM( json, template );
					widget.toolbar.find( "#search-list" ).trigger( "keyup" );
					widget._FilterByTags();
				}
			} );
		},

		SelectList: function() {
			widget._SelectLastList();
		},

		FilterByTags: function( selectedTagsArray ) {
			var widget = this;

			widget.selectedTags = selectedTagsArray;
			widget._FilterByTags();
		},

		destroy: function() {
			var widget = this;
			widget.toolbar.remove();
			widget.listForm.remove();
			widget.wrapper.find(".row").remove();
		}
		/**
		*
		* Public Functions End
		*
		**/

	};


	// register widget
	$.widget("ui.ListView", ListView);
})();