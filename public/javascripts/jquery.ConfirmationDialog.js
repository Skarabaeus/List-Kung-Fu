(function( $ ) {

	$.confirmationDialog = function( confButtonText, confButtonFunction, cancelButtonText, confirmationText, cancelButtonFunction ) {

		dialog = $('<div id="dialog-confirm"> \
			<span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"> \
			</span>' + confirmationText + '</div>').dialog({

			resizable: false,
			modal: true,
			autoOpen:false,
			width: 400,
			open: function(){
				dialog.parent().find( ".ui-dialog-buttonpane > button" ).first().focus();
			}
		});

		var buttonObj = {};
		buttonObj[ confButtonText ] = function() {
			$( dialog ).dialog( "close" );
			confButtonFunction();
		};
		buttonObj[ cancelButtonText ] = function(){
			$( dialog ).dialog( "close" );
			if ( typeof( cancelButtonFunction ) === 'function' ) {
				cancelButtonFunction();
			}
		};

		dialog.dialog( "option", "buttons", buttonObj );

		// make it possible to use arrow keys to navigate from one button to another
		dialog.parent().find( ".ui-dialog-buttonpane > button" ).bind('keydown', 'right', function( e ) {
			var $target = $( e.target );

			if ( $target.next( 'button' ).length > 0 ) {
				$target.blur();
				$target.next( 'button' ).focus();
			}
			return false;
		});

		dialog.parent().find( ".ui-dialog-buttonpane > button" ).bind('keydown', 'left', function( e ) {
			var $target = $( e.target );

			if ( $target.prev( 'button' ).length > 0 ) {
				$target.blur();
				$target.prev( 'button' ).focus();
			}
			return false;
		});

    return dialog;
  };
})( jQuery );