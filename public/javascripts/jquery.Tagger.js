(function(){
	var Tagger = function(){

		var widget = null;

		var _GetTag = function( data, template ) {
			var tag = $( $.mustache( template, data.tag ) );

			tag.data('data', data);
			tag.find( '.tag-menu' ).hide();

			tag.find( '.color-selector' ).bind( 'click', function(){
				var menu = tag.find( '.tag-menu' );

				if ( menu.data( 'visible' ) === true ) {
					menu.hide( 'fast' );
					menu.data( 'visible', false );
				} else {
					menu.show( 'fast' );
					menu.css({
						left: tag.position().left,
						top: tag.position().top - 90
					});
					menu.data( 'visible', true );
				}

				tag.find( '.color' ).bind( 'click', function( e ) {
					var $target = $( e.target );
					var colorClass = $target.attr( 'data-colorclass' );
					var json = tag.data( 'data' );
					var oldColorClass = json.tag.color_class;
					json.tag.color_class = colorClass;

					Tag.Update({

						send: json,
						successCallback: function( template, json, status, xhr, errors ){
							var colorSelector = tag.find( '.color-selector' );

							tag.removeClass( oldColorClass);
							tag.addClass( colorClass );
							colorSelector.removeClass( oldColorClass );
							colorSelector.addClass( colorClass );
							tag.find( '.tag-menu' ).hide( 'fast' );
						},
						tags: json.tag.id
					});

				});

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

				Tag.Index( {
					successCallback: function( template, json, status, xhr, errors ) {

						for ( var i = 0; i < json.length; i++ ) {
							widget.tagList.append( _GetTag( json[ i ], template ) ) ;
						}

					}
				} );


			},

			destroy: function() {
				widget.element.children().remove();
			}
		};
	}();
	// register widget
	$.widget("ui.Tagger", Tagger);
})();
