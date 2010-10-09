(function(){
	var ListView = function(){

		var _myPrivateFunction = function() {
		};


		var template = '{{title}}';
		

		

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


					
					for (var i = 0; i < data.length; i++ ) {
						uki( '#ListViewList' )[0].addRow( 0, $.mustache( template, data[i].list ) );	
					}

					uki("#ListViewBox").resizeToContents('height');
					uki("#ListViewList").resizeToContents('height');
					
				});
			},

			destroy: function() {

			},
		};
	}();
	// register widget
	$.widget("ui.ListView", ListView);
})();
