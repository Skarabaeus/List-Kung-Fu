(function(){
	var ListView = function(){

		var _myPrivateFunction = function() {
		};


		var template = '<div>{{title}}</div>';
		

		

		// put all private functions in here
		// that improves minification. See http://blog.project-sierra.de/archives/1622

		return {
			// default options
			options: {

			},


			selectedList: null,

			// required function. Automatically called when widget is created
			_create: function() {
				var widget = this;
				
				
				var toolbar = $('<div id="list-toolbar"> \
					<button id="list-new">Create</button> \
					<button id="list-delete">Delete</button> \
					</div>')
				
				widget.element.find("div.header").append(toolbar);
				
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
				
				toolbar.find("#list-delete").bind('click', { widget: widget }, function( e ) {
					var widget = e.data.widget;
					if ( widget.selectedList !== null ) {
						List.Destroy(widget.selectedList.data.list.id, function(){
							widget.selectedList.element.fadeOut(function(){
								$(this).remove();
							});
						});
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
				
				List.Index(function( data, status, xhr ) {
					
					for ( var i = 0; i < data.length; i++ ) {
						var newElement = $( $.mustache( template, data[ i ].list ) );
						
						newElement.attr('tabindex', i);						
						newElement.data('data', data[ i ]);
						newElement.addClass('row');
						
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
							toolbar.find( "#list-delete" ).trigger('click').effect('puff', {}, 300, function(){ $(this).show(); });
						});
					
						widget.element.find('div.ui-layout-content').append( newElement );
					}


				});
			},

			destroy: function() {

			},
		};
	}();
	// register widget
	$.widget("ui.ListView", ListView);
})();
