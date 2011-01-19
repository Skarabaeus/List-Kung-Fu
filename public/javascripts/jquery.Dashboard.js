(function(){
	var Dashboard = function(){

		var widget = null;

		var _TriggerResize = function() {
			widget._trigger("ContentDimensionsChanged", 0, {} );
		};

		return {
			// default options
			options: {

			},

			Show: function() {
				widget.Hide();

				widget.header = $( '<div id="dashboard-header" class="header">Dashboard</div>')
				widget.wrapper = $( '<div class="ui-layout-content" id="dashboard-view"></div>' );
				widget.today = $( '<div id="today" class="schedule-column"><h1>Today</h1></div>' );
				widget.tomorrow = $( '<div id="tomorrow" class="schedule-column"><h1>Tomorrow</h1></div>' );
				widget.nextweek = $( '<div id="nextweek" class="schedule-column"><h1>Next Week</h1></div>' );
				widget.later = $( '<div id="later" class="schedule-column"><h1>Later</h1></div>' );

				widget.element.append( widget.header );
				widget.element.append( widget.wrapper );

				widget.wrapper.append( widget.today );
				widget.wrapper.append( widget.tomorrow );
				widget.wrapper.append( widget.nextweek );
				widget.wrapper.append( widget.later );
				widget.wrapper.append( '<div style="clear:both;">&nbsp;</div>' );

				ListItem.Index( {
					successCallback: function( template, json, status, xhr, errors ) {

						$.each( json, function( index, listItem ) {
							$listItemHtml = $( '<div class="dashboard-list-item list-item-content">' + listItem.list_item.body_rendered + '</div>' );
							$listItemHtml.append( '<div class="dashboard-list-item-title">(' + listItem.list_item.list.title + ')</div>' );

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

						});


					},
					send: { show: "dashboard" }
				});

				_TriggerResize();
			},

			Hide: function() {
				if ( widget.wrapper ) {
					widget.wrapper.remove();
					widget.header.remove();
				}
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
