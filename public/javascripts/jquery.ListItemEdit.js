(function(){
	var ListItemEdit = {

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

		_create: function() {
			// nothing
		},


		_init: function() {
			var widget = this;

			widget.destroy();

			ListListItem.Edit({
				successCallback: function( template, json, status, xhr, errors ) {
					widget.element.trigger( 'beforeEdit' );

					var $form = $( template );
					$form.hide();


					widget.element.prepend( $form );
					widget.element.height( "auto" );

					var mySettings = ListKungFu.TinyMCEDefaultOptions;
					mySettings.height = widget.options.height;


					$form.find( "textarea.editorarea" ).tinymce( mySettings );

					widget._SetupDeadlineButton( $form );
					widget._SetupCustomDeadlinePicker();

					$form.show('slow', function(){
						$form.find( "textarea" ).focus();
					});

					$form.find( ".deadline-button" ).bind( "keydown click", 'return', function( e ) {
						e.preventDefault();
						var serializedForm = widget.element.find( "form" ).serializeForm();

						// add deadline indicator based on deadline type
						serializedForm.list_item.deadlineType = $( e.target ).attr( 'data-deadline' );
						serializedForm.list_item.customDeadlineValue = $( '#custom-deadline-value' ).val();

						ListListItem.Update({
							send: serializedForm,
							successCallback: function( template, json, status, xhr, errors ){
								$form.hide( 'slow', function( e ) {
									widget.destroy();

									widget.element.trigger( 'afterEdit', json );
								});
							},
							lists: widget.options.listId,
							list_items: widget.options.listItemId
						});

						return false;
					});

					$form.find( "#cancel-edit" ).bind( "keydown click", 'return', function( e ) {
						e.preventDefault();
						widget.destroy();
						widget.element.trigger( 'afterEdit' );

						return false;
					});

					return false;
				},
				lists: widget.options.listId,
				list_items: widget.options.listItemId
			});
		},

		options: {
			height: "auto",
			listId: null,
			listItemId: null
		},


		destroy: function() {
			var widget = this;

			// remove elements
			widget.element.children( 'form' ).remove();
		}
	};
	// register widget
	$.widget("ui.ListItemEdit", ListItemEdit);
})();
