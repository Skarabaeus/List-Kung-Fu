(function(){
	var Tagger = function(){

		var widget = null;

		var _GetTag = function( data, template ) {
			var tag = $( $.mustache( template, data.tag ) );
			tag.find( '.tag-menu' ).hide();
			
			tag.find( '.color-selector' ).bind( 'click', function(){
				var menu = tag.find( '.tag-menu' );
				
				if ( menu.data( 'visible' ) === true ) {
					menu.hide( 'fast' );
					menu.data( 'visible', false );
				} else {
					menu.show( 'fast' );
					menu.data( 'visible', true );
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
