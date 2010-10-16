(function(){
	var ListView = function(){

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
					var nextItem = widget.selectedList.element.next();
					var prevItem = widget.selectedList.element.prev();

					if ( typeof(widget.deleteDialog) === 'undefined' ) {
						widget.deleteDialog = $('<div id="dialog-confirm"> \
							<span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"> \
							</span>Do you really want to delete</div>').dialog({

							resizable: false,
							modal: true,
							buttons: {
								"Delete List": function() {
									$( this ).dialog( "close" );

									List.Destroy(widget.selectedList.data.list.id, function(){
										widget.selectedList.element.fadeOut(function(){
											$(this).remove();
											nextItem.length > 0 ? nextItem.focus() : prevItem.focus();
										});

									});
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
				alert("create new list");
				$( e.target ).blur();
				return false;
			});

			// return toolbar

			return toolbar
		};

		var _AddListToDOM = function( widget, toolbar, data ) {
			for ( var i = 0; i < data.length; i++ ) {

			/*
					Create new List DOM element
				*/

				// get HTML for single List representation
				var newElement = $( $.mustache( template, data[ i ].list ) );

				// add tabindex so that list is focusable
				newElement.attr('tabindex', i);

				// save List data directly in DOM element
				newElement.data('data', data[ i ]);

				// add CSS class
				newElement.addClass('row');

				/*
					bind Events for new List DOM
				*/
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
					widget.element.find('.row').removeClass('selected-row');

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
					toolbar.find( "#list-delete" ).effect('puff', {}, 300, function(){ $(this).show(); }).trigger('click');
				});

				newElement.bind('keydown', 'right', function(){
					widget.element.find('div#list-list').hide('slide', { direction: 'left'}, 'slow', function(){
						// remove eventual old occurances
						if ( widget.listForm != null ) {
							widget.listForm.ListViewForm("destroy");
							widget.listForm.remove();
						}
						
						// create fresh form
						widget.listForm = $('<div class="ui-layout-content" id="list-form"></div>');
						widget.element.append( widget.listForm );
						widget.listForm.ListViewForm( {  selectedList: widget.selectedList } );
					});
				});


				/*
					add the element to content area of west layout.
				*/

				widget.element.find('div#list-list').append( newElement );
			}
		};

		var _RegisterGlobalKeyboardShortcuts = function( toolbar ) {

			$(document).bind('keydown', 'ctrl+i', function(e){
				toolbar.find( "#list-new" ).effect('puff', {}, 300, function(){ $(this).show(); $(this).trigger('click') });
				return false;
			});

		};

		var template = '<div>{{title}}</div>';


		return {
			// default options
			options: {

			},

			/*
				holds object with selected list:
				{
					element: jQuery object with the UI element displaying the list
					data: the data object (retrieved from server)
				}
			*/
			selectedList: null,

			// required function. Automatically called when widget is created
			_create: function() {
				var widget = this;

				widget.toolbar = _CreateToolbar( widget );
				widget.listForm = null;

				// retrieve Lists from server and add them to DOM.
				List.Index( function( data, status, xhr ) {

					// remove all existing rows
					widget.element.find(".row").remove();

					// add newly received Lists to DOM
					_AddListToDOM( widget, widget.toolbar, data );
				});

				// register global keyboard shortcuts
				_RegisterGlobalKeyboardShortcuts( widget.toolbar );
			},
			
			GetListFormElement: function() {
				return this.listForm;
			},

			destroy: function() {
				widget.toolbar.remove();
				widget.listForm.ListViewForm("destroy");
				widget.listForm.remove();
				widget.element.find(".row").remove();
			}
		};
	}();

	// register widget
	$.widget("ui.ListView", ListView);
})();
