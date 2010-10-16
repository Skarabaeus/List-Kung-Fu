(function(){
	var ListViewForm = function(){

		var _myPrivateFunction = function() {
		};

		// put all private functions in here
		// that improves minification. See http://blog.project-sierra.de/archives/1622

		return {
			// default options
			options: {
				selectedList: null
			},

			// required function. Automatically called when widget is created
			_create: function() {
				var widget = this;

				// triggers /lists/id/edit and calls this.DisplayForm with the
				// HTML of the form.
				List.Edit( widget.options.selectedList.data.list.id );
				
				
				
				
				widget.element.find( "#list-back-button" ).live('click', function(){
					widget.Hide();
				});
			},
			
			
			
			DisplayForm: function( html ) {
				var widget = this;
				widget.element.append( unescape( html ) );
				widget.element.show('slide', { direction: 'right' }, 'slow', function(){
					widget.element.find('input').first().focus();
				});
			},
			
			Hide: function( updatedElement ) {
				var widget = this;
				
				alert( updatedElement );
				
				
				widget.element.hide('slide', { direction: 'left' }, 'slow', function(){
					widget.element.parent().find('div#list-list').show('slide', { direction: 'right'}, 'slow', function(){
						widget.options.selectedList.element.focus();
					});
				});	
			},			

			destroy: function() {

			},
		};
	}();
	// register widget
	$.widget("ui.ListViewForm", ListViewForm);
})();
