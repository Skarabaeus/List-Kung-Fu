(function(){
	var TagView = {


		/**
		*
		* Private Functions Start
		*
		**/

		_GetTag: function( data, template ) {
			var widget = this;

			var tag = $( $.mustache( template, data.tag ) );

			tag.data('data', data);

			if (!widget.tagMenu) {
				widget.tagMenu = tag.find( '.tag-menu' );
				widget.tagMenu.hide();
			}
			tag.find( '.tag-menu' ).remove();

			tag.find( '.color-selector' ).bind( 'click', function(e){
				var menu = widget.tagMenu;
				var target = $( e.target );
				var json = target.parent( '.tag' ).data( 'data' );

				if ( menu.data( 'visible' ) === true && menu.data( 'tagId' ) === data.tag.id ) {
					menu.hide( 'fast' );
					menu.data( 'visible', false );
					menu.data( 'tagId', null );
					menu.data( 'tag', null );
					menu.data( 'target', null );
				} else {
					menu.show( 'fast' );
					menu.css({
						left: tag.position().left,
						top: tag.position().top - 100
					});
					menu.data( 'visible', true );
					menu.data( 'tagId', json.tag.id );
					menu.data( 'tag', json );
					menu.data( 'target', target );
				}
				return false; // prevent bubbling
			});


			if ( ListKungFu && ListKungFu.LayoutWest ) {
				tag.draggable( {
					helper: 'clone',
					appendTo: ListKungFu.LayoutWest,
					revert: 'invalid',
					containment: ListKungFu.LayoutWest,
					start: function( event, ui ) {
						// disable the ability to select text.
						// this is a hack for chrome and safari.
						document.onselectstart = function () { return false; };

						widget._trigger( "StartedDraggingTag", 0, { dragType: "tag" } );
					},
					stop: function ( event, ui ) {
						document.onselectstart = null;
					}
				});
			}

			tag.bind( 'click', function(e){
				var data = tag.data( 'data' );
				var selected = tag.data( 'selected' );

				if ( selected ) {
					widget._RemoveSelectedTag( data.tag.id );
					tag.removeClass( 'tag-selected' );
					tag.data( 'selected', false );
				} else {
					widget._AddSelectedTag( data.tag.id );
					tag.addClass( 'tag-selected' );
					tag.data( 'selected', true );
				}

				widget._trigger( "TagSelected", 0, widget.selectedTags );
				return false;
			});


			return tag;
		},

		_AddSelectedTag: function( tagId ) {
			this.selectedTags.push( tagId );
			this.selectedTags = jQuery.unique( widget.selectedTags );
		},

		_RemoveSelectedTag: function( tagId ) {
			var widget = this;
			var newArray = [];

			for ( var i = 0; i < widget.selectedTags.length; i++ ) {
				if ( widget.selectedTags[ i ] !== tagId ) {
					newArray.push( widget.selectedTags[ i ] );
				}
			}

			widget.selectedTags = newArray;
		},

		_CreateToolbar: function() {

			widget.tagList.append( widget.tagMenu );

			// bind events for tag menu

			// color selection
			widget.tagMenu.find( '.color' ).bind( 'click', function( e ) {
				var $target = $( e.target );
				var colorClass = $target.attr( 'data-colorclass' );
				var json = widget.tagMenu.data( 'tag' );
				var oldColorClass = json.tag.color_class;
				var target = widget.tagMenu.data( 'target' );

				json.tag.color_class = colorClass;

				Tag.Update({

					send: json,
					successCallback: function( template, json, status, xhr, errors ){
						// Lists need to be reloaded because tag_color_helper will have changed
						widget._trigger( "AfterColorChanged", 0, {} );

						var colorSelector = target;

						// update view
						target.parent( '.tag' ).removeClass( oldColorClass);
						target.parent( '.tag' ).addClass( colorClass );
						colorSelector.removeClass( oldColorClass );
						colorSelector.addClass( colorClass );

						// hide the tag menu
						widget.tagMenu.hide( 'fast' );
						widget.tagMenu.data( 'visible', false );
						widget.tagMenu.data( 'tagId', null );
						widget.tagMenu.data( 'tag', null );
						widget.tagMenu.data( 'target', null );

						// update data object
						target.data( 'data', json );
					},
					tags: json.tag.id
				});
			});

			// delete label
			widget.tagMenu.find( '.delete-label' ).bind( 'click', function(){
				// hide the tag menu
				widget.tagMenu.hide( 'fast' );
				widget.tagMenu.data( 'visible', false );


				var cancelFunc = function(){
					widget.tagMenu.data( 'tagId', null );
					widget.tagMenu.data( 'tag', null );
					widget.tagMenu.data( 'target', null );
				};

				var deleteFunc = function(){
					var data = widget.tagMenu.data( 'tag' );
					var target = widget.tagMenu.data( 'target' );

					Tag.Destroy({
						successCallback: function( template, json, status, xhr, errors ){
							target.hide( 'fast', function(){
								target.parent( '.tag' ).remove();

								widget.tagMenu.data( 'tagId', null );
								widget.tagMenu.data( 'tag', null );
								widget.tagMenu.data( 'target', null );
							});
						},
						tags: data.tag.id
					});
				};

				if ( typeof( widget.deleteDialog ) === 'undefined' ) {
					widget.deleteDialog = $.confirmationDialog( "Delete Tag", deleteFunc, "Cancel"
						, "Delete Tag and remove it from all lists?", cancelFunc );
				}

				widget.deleteDialog.dialog("open");

				return false;
			});
		},

		_create: function() {
			widget = this;
			widget.toolbar = $( '<div id="tag-toolbar"></div>' );
			widget.addTagInput = $( '<input type="text" value="" id="add-tag"/>' );
			widget.addTagButton = $( '<button id="tag-new">Create Tag</button>' );
			widget.tagList = $( '<div class="tags"></div>' );

			widget.element.append( widget.toolbar );
			widget.toolbar.append( widget.addTagInput );
			widget.toolbar.append( widget.addTagButton );
			widget.element.append( widget.tagList );

			widget.addTagButton.button({
				text: false,
				icons: {
					primary: 'ui-icon-plusthick'
				}
			});

			widget.selectedTags = [];

			// retrieve all tags and display them
			Tag.Index( {
				successCallback: function( template, json, status, xhr, errors ) {

					for ( var i = 0; i < json.length; i++ ) {
						widget.tagList.append( widget._GetTag( json[ i ], template ) ) ;
					}

					if ( widget.tagMenu ) {
						widget._CreateToolbar();
					}
				}
			});

			widget.addTagButton.bind( 'click', function(e){
				if ( $.trim( widget.addTagInput.val() ) !== '' &&
					widget.tagList.find( ".tag-name:HasExactValue('" + $.trim( widget.addTagInput.val() ) + "')").length === 0 ) {

					var data = {};
					data.tag = {
						name: widget.addTagInput.val(),
						color_class: "c1"
					};

					Tag.Create({
						send: data,
						successCallback: function( template, json, status, xhr, errors ) {
							var newTag = widget._GetTag( json, template );
							widget.tagList.prepend( newTag );
							widget.addTagInput.val( '' );
							widget.addTagInput.trigger( 'keyup' );

							if ( widget.tagMenu ) {
								widget._CreateToolbar();
							}
						}
					});

					return false;
				}
			});

			widget.addTagInput.bind( 'keyup', 'return', function(){
				widget.addTagButton.trigger( 'click' );
			});

			widget.addTagInput.bind( 'keyup', function ( e ) {
				var filtervalue = $(this).val();

        if (filtervalue === '') {
					widget.tagList.find( ".tag" ).show();
        } else {
					widget.tagList.find( ".tag:not(:Contains('" + filtervalue + "'))").hide();
					widget.tagList.find( ".tag:Contains('" + filtervalue + "')").show();
        }

				// if this tag already exists, disable the "add"-button
				if ( widget.tagList.find( ".tag-name:HasExactValue('" + $.trim( filtervalue ) + "')").length > 0 ) {
					widget.addTagButton.button( "option", "disabled", true );
				} else {
					widget.addTagButton.button( "option", "disabled", false );
				}
			});


		},

		/**
		*
		* Private Functions End
		*
		**/
		options: {

		},

		destroy: function() {
			widget.element.children().remove();
		}
	};
	// register widget
	$.widget("ui.TagView", TagView);
})();
