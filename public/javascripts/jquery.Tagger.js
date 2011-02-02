(function(){
	var Tagger = function(){

		var widget = null;

		var _GetTag = function( data, template ) {
			var tag = $( $.mustache( template, data.tag ) );

			tag.data('data', data);
			tag.find( '.tag-menu' ).hide();

			tag.find( '.color-selector' ).bind( 'click', function(e){
				var menu = widget.tagList.find( '.tag-menu' );
				var target = $( e.target );

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
					menu.data( 'tagId', data.tag.id );
					menu.data( 'tag', data );
					menu.data( 'target', target );
				}

			});

			return tag;
		};

		return {
			options: {

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

				// retrieve all tags and display them
				Tag.Index( {
					successCallback: function( template, json, status, xhr, errors ) {

						for ( var i = 0; i < json.length; i++ ) {
							widget.tagList.append( _GetTag( json[ i ], template ) ) ;
						}

						var tagMenu = widget.tagList.find( '.tag-menu' ).first();
						widget.tagList.find( '.tag-menu' ).remove();
						widget.tagList.append( tagMenu );

						// bind events for tag menu

						// color selection
						tagMenu.find( '.color' ).bind( 'click', function( e ) {
							var $target = $( e.target );
							var colorClass = $target.attr( 'data-colorclass' );
							var json = tagMenu.data( 'tag' );
							var oldColorClass = json.tag.color_class;
							var target = tagMenu.data( 'target' );

							json.tag.color_class = colorClass;

							Tag.Update({

								send: json,
								successCallback: function( template, json, status, xhr, errors ){
									var colorSelector = target;

									// update view
									target.parent( '.tag' ).removeClass( oldColorClass);
									target.parent( '.tag' ).addClass( colorClass );
									colorSelector.removeClass( oldColorClass );
									colorSelector.addClass( colorClass );

									// hide the tag menu
									tagMenu.hide( 'fast' );
									tagMenu.data( 'visible', false );
									tagMenu.data( 'tagId', null );
									tagMenu.data( 'tag', null );
									tagMenu.data( 'target', null );

									// update data object
									target.data( 'data', json );
								},
								tags: json.tag.id
							});
						});


						// delete label
						tagMenu.find( '.delete-label' ).bind( 'click', function(){
							var data = tagMenu.data( 'tag' );
							var target = tagMenu.data( 'target' );

							Tag.Destroy({
								successCallback: function( template, json, status, xhr, errors ){
									tagMenu.hide();
									target.hide( 'fast', function(){
										target.parent( '.tag' ).remove();
									});
								},
								tags: data.tag.id
							});

							return false;
						});

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
								var newTag = _GetTag( json, template );
								widget.tagList.prepend( newTag );
								widget.addTagInput.val( '' );
								widget.addTagInput.trigger( 'keyup' );
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

			destroy: function() {
				widget.element.children().remove();
			}
		};
	}();
	// register widget
	$.widget("ui.Tagger", Tagger);
})();
