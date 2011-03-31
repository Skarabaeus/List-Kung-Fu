(function(){
	var ListItemShow = {



		_create: function() {
			this._init();

		},


		_init: function() {
			var widget = this;

			ListListItem.Show({
				successCallback: function( template, json, status, xhr, errors ) {
					var newElement = $( $.mustache( template, json.list_item ) );

					widget.element.append( newElement );
				},
				lists: widget.options.listItem.list_item.list_id,
				list_items: widget.options.listItem.list_item.id
			});
		},

/*
Options
*/
		options: {
			listItem: null
		},


/*
Public functions
*/

		destroy: function() {
			var widget = this;

			// remove elements
			widget.element.children().remove();
		}
	};
	// register widget
	$.widget("ui.ListItemShow", ListItemShow);
})();
