(function(){
	var Dashboard = function(){

		var widget = null;

		var _TriggerResize = function() {
			widget._trigger("ContentDimensionsChanged", 0, {} );
		};

		var _TriggerReinitOfPanes = function() {
			widget._trigger("ReinitPanes", 0, {} );
		};

		return {
			// default options
			options: {

			},

			Show: function() {
				widget.Hide();

				widget.header = $( '<div id="dashboard-header" class="header"><h1>Dashboard</h1></div>')
				widget.toolbar = $( '<div id="dashboard-toolbar"><input type="text" id="dashboard-search" value=""/></div>');
				widget.wrapper = $( '<div class="ui-layout-content" id="dashboard-view"></div>' );
				widget.today = $( '<div id="today" class="schedule-column"><h1>Today</h1></div>' );
				widget.tomorrow = $( '<div id="tomorrow" class="schedule-column"><h1>Tomorrow</h1></div>' );
				widget.nextweek = $( '<div id="nextweek" class="schedule-column"><h1>Next Week</h1></div>' );
				widget.later = $( '<div id="later" class="schedule-column"><h1>Later</h1></div>' );

				widget.element.append( widget.header );
				widget.header.append( widget.toolbar );
				widget.element.append( widget.wrapper );

				widget.wrapper.append( widget.today );
				widget.wrapper.append( widget.tomorrow );
				widget.wrapper.append( widget.nextweek );
				widget.wrapper.append( widget.later );
				widget.wrapper.append( '<div style="clear:both;">&nbsp;</div>' );

				widget.toolbar.append( '<div id="dashboard-search-cancel">&nbsp;</div>' );

				// Load scheduled items
				ListItem.Index( {
					successCallback: function( template, json, status, xhr, errors ) {

						$.each( json, function( index, listItem ) {
							var $listItemHtml = $( $.mustache( template, listItem.list_item ) );

							switch( listItem.list_item.deadline_category ) {
								case 'today':
									widget.today.append( $listItemHtml );
									break;
								case 'tomorrow':
									widget.tomorrow.append( $listItemHtml );
									break;
								case 'next week':
									widget.nextweek.append( $listItemHtml );
									break;
								default:
									widget.later.append( $listItemHtml );
									break;
							}

							// bind events
							$listItemHtml.find( '.dashboard-list-item-title' ).bind( 'click', function( e ){
								widget._trigger( "OpenList", 0, { selectedList: listItem.list_item } );
							});

						});
						_TriggerReinitOfPanes();
						_TriggerResize();
					},
					send: { show: "dashboard" }
				});

				// bind events

				widget.toolbar.find( '#dashboard-search' ).bind( 'keyup', function( e ){
					var filtervalue = $( this ).val();

	        if ( filtervalue === '' ) {
						widget.wrapper.find( ".dashboard-item" ).show();
	        } else {
						widget.wrapper.find( ".dashboard-item:not(:Contains('" + filtervalue + "'))").hide();
						widget.wrapper.find( ".dashboard-item:Contains('" + filtervalue + "')").show();
	        }
				});

				widget.toolbar.find( '#dashboard-search-cancel' ).bind( 'click', function(){
					widget.toolbar.find("#dashboard-search").val("").trigger('keyup');
				});

				_TriggerResize();
			},

			Hide: function() {
				// clean up
				widget.element.children().remove();
			},

			// required function. Automatically called when widget is created
			_create: function() {
				widget = this;
			},

			destroy: function() {

			},
		};
	}();
	// register widget
	$.widget("ui.Dashboard", Dashboard);
})();
