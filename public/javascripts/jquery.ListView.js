(function(){
	var ListView = function(){

		var _IsNewList = function( widget, element ) {
			if ( widget.selectedList === null || widget.selectedList.data.list.id !== element.list.id ) {
				return true;
			} else {
				return false;
			}
		};

		var	_HighlightFormErrors = function( form, errors ) {
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
		};

		var _ClearFormErrors = function( form ) {
			form.find( ".field" ).removeClass( "field_with_errors" );
			form.find( ".error_explanation" ).remove();
		};

		var _DeleteList = function( widget, delay ) {
			var nextItem = widget.selectedList.element.next();
			var prevItem = widget.selectedList.element.prev();
			delay = delay || 0;

			List.Destroy({
				successCallback: function( template, json, status, xhr, errors ){
					widget.selectedList.element.delay( delay ).fadeOut(function(){
						$(this).remove();
						nextItem.length > 0 ? nextItem.focus() : prevItem.focus();
					})
				},
				lists: widget.selectedList.data.list.id
			});
		};

		var _CreateToolbar = function( widget ) {
			var toolbar = $('<div id="list-toolbar"> \
				<button id="list-new">Create</button> \
				<button id="list-delete">Delete</button> \
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

			// bind toolbar events.

			toolbar.find("#list-delete").bind('click', { widget: widget }, function( e ) {
				var widget = e.data.widget;

				if ( widget.selectedList !== null ) {


					if ( typeof(widget.deleteDialog) === 'undefined' ) {
						widget.deleteDialog = $('<div id="dialog-confirm"> \
							<span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"> \
							</span>Do you really want to delete</div>').dialog({

							resizable: false,
							modal: true,
							buttons: {
								"Delete List": function() {
									$( this ).dialog( "close" );

									if ( widget.listForm !== null ) {
										widget.listForm.bind( "FormHidden", function() {
											_DeleteList( widget, 1000 );
										});
										_HideForm( widget );
									} else {
										_DeleteList( widget );
									}
								},
								"Cancel": function() {
									$( this ).dialog( "close" );
								}
							},
							autoOpen:false
						});
					}

					// make it possible to use arrow keys to navigate from one button to another
					$( ".ui-dialog-buttonpane > button" ).bind('keydown', 'right', function(e) {
						var $target = $( e.target );

						if ( $target.next( 'button' ).length > 0 ) {
							$target.blur();
							$target.next( 'button' ).focus();
						}
						return false;
					});

					$( ".ui-dialog-buttonpane > button" ).bind('keydown', 'left', function(e) {
						var $target = $( e.target );

						if ( $target.prev( 'button' ).length > 0 ) {
							$target.blur();
							$target.prev( 'button' ).focus();
						}
						return false;
					});


					widget.deleteDialog.dialog("open");

					// focus first button (which is the "delete button")
					// is there no other way to do this?
					$( ".ui-dialog-buttonpane > button" ).first().focus();

				} else {
					$("#notice").text("Select the list which you want to delete").fadeIn().delay(5000).fadeOut();
				}

				$( e.target ).blur();

				return false;
			});

			toolbar.find("#list-new").bind('click', { widget: widget }, function( e ) {

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
							widget.listForm.show('slide', { direction: 'right' }, 'slow', function(){
								widget.listForm.find('input').first().focus();
							});

							widget.listForm.find( "#list-back-button" ).bind( 'click', function(){
								_HideForm( widget );
							});

							widget.listForm.bind( "submit", function( e ){
								e.preventDefault();
								var data = json;
								json.list.title = widget.listForm.find( "#list_title" ).val();

								var serializedForm = $(this).find("form").serializeForm();
								json.list = serializedForm.list;

								List.Create({
									send: data,
									successCallback: function( template, json, status, xhr, errors ) {
										_ClearFormErrors( widget.listForm );

										if ( errors === false ) {
											_HideForm( widget, json, template );
										} else {
											_HighlightFormErrors( widget.listForm, errors );
										}
									}
								});
							});

							widget.selectedList = null;
						}
					});
				});


				$( e.target ).blur();
				return false;
			});

			// return toolbar

			return toolbar
		};

		var _GetListElement = function( widget, data, template ) {
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
			newElement.bind('keydown', 'down', function( e ){
				e.preventDefault();
				$( e.target ).next().focus();
				return false;
			});

			newElement.bind('keydown', 'up', function( e ){
				e.preventDefault();
				$( e.target ).prev().focus();
				return false;
			});

			newElement.bind('focus', { widget: widget }, function(e){
				var widget = e.data.widget;

				// remove selection from all rows
				widget.listlist.find('.row').removeClass('selected-row');

				// add it to the selected row.
				$( e.target ).addClass('selected-row');

				widget.selectedList = {
					element: $( e.target ),
					data: $( e.target ).data("data")
				};
			});

			newElement.bind( 'keydown dblclick', 'return', function(e){
				alert(JSON.stringify($(e.target).data("data")));
			});

			newElement.bind('keydown', 'del', function(e){
				widget.toolbar.find( "#list-delete" ).effect('puff', {}, 300, function(){
					$(this).show();
				}).trigger('click');
			});

			newElement.bind('keydown', 'right', function(){
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
							widget.listForm.show('slide', { direction: 'right' }, 'slow', function(){
								widget.listForm.find('input').first().focus();
							});

							widget.listForm.find( "#list-back-button" ).bind( 'click', function(){
								_HideForm( widget );
							});

							widget.listForm.bind( "submit", function(e){
								e.preventDefault();

								var serializedForm = $(this).find("form").serializeForm();

								List.Update({

									send: serializedForm,
									successCallback: function( template, json, status, xhr, errors ){
										_ClearFormErrors( widget.listForm );

										if ( errors === false ) {
											_HideForm( widget, json, template );
										} else {
											_HighlightFormErrors( widget.listForm, errors );
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

			return newElement;
		};

		var _triggerResize = function( widget ) {
			widget._trigger("ContentDimensionsChanged", 0, {} );
		};

		var _AddListToDOM = function( widget, data, template ) {
			widget.listlist = $( '<div id="list-list"></div>' );
			widget.wrapper.append( widget.listlist );
			var toolbar = widget.toolbar;

			for ( var i = 0; i < data.length; i++ ) {
				widget.listlist.append( _GetListElement( widget, data[ i ], template ) ) ;
			}
			_triggerResize( widget );
		};

		var _RegisterGlobalKeyboardShortcuts = function( toolbar ) {

			$(document).bind('keydown', 'ctrl+i', function(e){
				toolbar.find( "#list-new" ).effect('puff', {}, 300, function(){
					$(this).show();
					$(this).trigger('click') });
				return false;
			});
		};

		var _ShowListView = function( widget, updatedElement, template ) {

			widget.listlist.show('slide', { direction: 'right'}, 'slow', function(){
				if ( updatedElement ) {

					var newElement = _GetListElement( widget, updatedElement, template );

					if ( _IsNewList( widget, updatedElement ) ) {
						widget.listlist.prepend( newElement );
					} else {
						widget.selectedList.element.replaceWith( newElement );
					}

					widget.selectedList =  {
						data: updatedElement,
						element: newElement
					};
				}
				if ( widget.selectedList ) {
					widget.selectedList.element.focus();
				}
			});

		};

		var _HideForm = function( widget, updatedElement, template ) {

			widget.listForm.hide('slide', { direction: 'left' }, 'slow', function(){
				_ShowListView( widget, updatedElement, template );
				widget.listForm.trigger( "FormHidden" );
				widget.listForm.remove();
				widget.listForm = null;
			});
		};

		return {
			// default options
			options: {

			},

			///////
			//	holds object with selected list:
			//	{
			//		element: jQuery object with the UI element displaying the list
			//		data: the data object (retrieved from server)
			//	}
			//////
			selectedList: null,

			_create: function() {
				var widget = this;
				widget.wrapper = widget.element.find('div#list-wrapper');
				widget.toolbar = _CreateToolbar( widget );
				widget.listForm = null;

				// retrieve Lists from server and add them to DOM.
				List.Index( {
					successCallback: function( template, json, status, xhr, errors ) {

						// remove all existing rows
						widget.wrapper.find(".row").remove();

						// add newly received Lists to DOM
						_AddListToDOM( widget, json, template );
					}
				} );

				// register global keyboard shortcuts
				_RegisterGlobalKeyboardShortcuts( widget.toolbar );
			},

			destroy: function() {
				widget.toolbar.remove();
				widget.listForm.remove();
				widget.wrapper.find(".row").remove();
			}
		};
	}();

	// register widget
	$.widget("ui.ListView", ListView);
})();
