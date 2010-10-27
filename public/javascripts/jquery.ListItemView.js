(function(){
	var ListItemView = function(){

		var _AddListItem = function( widget, listItem, template ) {
			var newElement = $( $.mustache( template, listItem.list_item ) );

			newElement.data( "data", listItem );

			widget.listItemList.append (newElement);

			newElement.find( ".complete-button" ).bind( 'click', { element: newElement }, function( e ){
				var data = e.data.element.data( "data" );
				var $that = $( this );

				// set item completed
				data.list_item.completed = true;

				ListItem.Update({
					successCallback: function(){
						$that.hide();
					},
					lists: data.list_item.list_id,
					list_items: data.list_item.id,
					send: data
				});

			});
		};

		// put all private functions in here
		// that improves minification. See http://blog.project-sierra.de/archives/1622

		return {
			// default options
			options: {

			},

			_create: function() {
				var widget = this;

				widget.wrapper = widget.element.find('div#list-item-wrapper');
				widget.listItemList = $( '<div id="list-item-list"></div>');

				widget.wrapper.append( widget.listItemList );

			},

			destroy: function() {

			},

			OpenList: function( data ) {
				var widget = this;

				// remove all children
				widget.listItemList.find("*").remove();

				ListItem.Index( {
					successCallback: function( template, json, status, xhr, errors ) {
						$.each( json, function( index, listItem ) {
							_AddListItem( widget, listItem, template )
						});

					},
					lists: data.list.id
				} );
			}
		};
	}();
	// register widget
	$.widget("ui.ListItemView", ListItemView);
})();
