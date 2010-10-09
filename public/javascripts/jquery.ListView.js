(function(){
	var ListView = function(){

		var _myPrivateFunction = function() {
		};


		var template = 'Template: {{title}}';
		

		

		// put all private functions in here
		// that improves minification. See http://blog.project-sierra.de/archives/1622

		return {
			// default options
			options: {

			},

			// required function. Automatically called when widget is created
			_create: function() {
				var widget = this;
				
				List.index(function( data, status, xhr ) {

					var ui = uki({ view: 'Box'
						, rect: '0 0 300 400'
						, anchors: 'top left right'
						, background: '#CCC'
						, name: 'ListViewBox'

						, childViews: { view: 'List'
							, rect: '0 0 300 400'
							, anchors: 'top left right'
							, rowHeight: 30
							, name: 'ListViewList'
							, throttle: 0
							, multiselect: true
							, textSelectable: true 
						}
					});
					
					uki( '#' + widget.element.get(0).id, mainUI ).childViews( ui );

					
					for (var i = 0; i < data.length; i++ ) {
						uki( 'List[name=ListViewList]', ui.parent() ).addRow( 0, $.mustache( template, data[i].list ) );
					}

					uki( 'List[name=ListViewList]', ui.parent() ).resizeToContents('height');
					uki( 'Box[name=ListViewBox]', ui.parent() ).resizeToContents('height');	


				});
			},

			destroy: function() {

			},
		};
	}();
	// register widget
	$.widget("ui.ListView", ListView);
})();
