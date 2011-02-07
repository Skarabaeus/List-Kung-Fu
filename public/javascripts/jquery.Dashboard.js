(function(){
	var Dashboard = function(){

		var widget = null;

		var _TriggerResize = function() {
			widget._trigger("ContentDimensionsChanged", 0, {} );
		};

		var _NothingToDoText = '<p class="nothing-todo">no items scheduled</p>';

		var _TriggerReinitOfPanes = function() {
			widget._trigger("ReinitPanes", 0, {} );
		};

		var _SetupCustomDeadlinePicker = function( listItemDom ) {
			var dateFormat = 'yy,mm,dd';
			var that = $(this);
			var element = listItemDom.find( '.dashboard-list-item-deadline-hidden' );
			var listItem = listItemDom.data( 'data' );

			var dateArr = listItem.list_item.deadline_date.split("-");
			var year = dateArr[0];
			var month = dateArr[1];
			var day = dateArr[2];

			element.datepicker( {
					minDate: new Date(), // choosing deadline in the past wouldn't make much sense
					dateFormat: dateFormat,
					beforeShow: function(input, inst) {
						inst.input.datepicker( 'setDate', year + "," + month + "," + day );
					},
					onSelect: function( dateText, inst ) {
						var listItemObj = listItem;

						// set new date
						listItem.list_item.deadlineType = 'customdeadline';
						listItem.list_item.customDeadlineValue = dateText;

						listItem.list_item.template = 'dashboard';

						// update item server side
						ListListItem.Update({
							successCallback: function( template, json, status, xhr, errors ){
								var parent = listItemDom.parent();

								listItemDom.hide( 'slow', function(){
									listItemDom.remove();
									if ( parent.find( '.dashboard-item' ).length === 0 ) {
										parent.append( _NothingToDoText );
									}
								});
								_CreateDashboardItem( json, template, {
									highlightCategory: true,
									addType: 'prepend'
								});

							},
							lists: listItem.list_item.list_id,
							list_items: listItem.list_item.id,
							send: listItem
						});
						that.datepicker("hide");
					}
			});
		};

		var _AppendToDashboard = function( target, item, options ) {
			options = options || {};

			target.find( '.nothing-todo' ).remove();

			if ( options.addType === 'prepend' ) {
				target.find( 'div[data-type=scheduleColumn]' ).first().prepend( item );
			} else {
				target.find( 'div[data-type=scheduleColumn]' ).first().append( item );
			}

			if ( options.highlightCategory === true ) {
				item.effect( 'highlight', {}, 2000 );
			}
		};

		var _CreateDashboardItem = function( listItem, template, options ) {
			var $listItemHtml = $( $.mustache( template, listItem.list_item ) );

			switch( listItem.list_item.deadline_category ) {
				case 'today':
					_AppendToDashboard( widget.today, $listItemHtml, options );
					break;
				case 'tomorrow':
					_AppendToDashboard( widget.tomorrow, $listItemHtml, options );
					break;
				case 'this week':
					_AppendToDashboard( widget.thisweek, $listItemHtml, options );
					break;
				case 'next week':
					_AppendToDashboard( widget.nextweek, $listItemHtml, options );
					break;
				default:
					_AppendToDashboard( widget.later, $listItemHtml, options );
					break;
			}

			$listItemHtml.data( 'data', listItem );

			// bind events
			$listItemHtml.find( '.dashboard-list-item-title' ).bind( 'click', function( e ){
				widget._trigger( "OpenList", 0, { selectedList: listItem.list_item } );
			});

			$listItemHtml.find( '.dashboard-item-more' ).bind( 'click', function( e ){
				widget._trigger( "OpenList", 0, { selectedList: listItem.list_item } );
			});

			$listItemHtml.find( '.dashboard-item-completed' ).bind( 'click', function( e ){
				$that = $( this );
				// remove existing confirmation divs
				$that.find( '.confirmation-completed' ).remove();

				// add new confirmation div
				var $confirmationHtml = $( '<div class="confirmation-completed">Completed? \
					<span class="yes">Yes</span> / <span class="no">NO</span></div>' );
				$that.append( $confirmationHtml );
				$that.animate( { width: '100%', paddingLeft: '14px' }, 200 );

				// bind event for "yes"
				$confirmationHtml.find( '.yes' ).bind( 'click', function(){

					// set item completed
					listItem.list_item.completed = true;

					// update item server side
					ListListItem.Update({
						successCallback: function(){
							$listItemHtml.stop( true, true ).hide( 'slow', function(){
								$listItemHtml.remove();
							});
						},
						lists: listItem.list_item.list_id,
						list_items: listItem.list_item.id,
						send: listItem
					});

					// close the confirmation
					$confirmationHtml.find( '.no' ).trigger( 'click' );

					return false; // prevent bubbling
				});

				// bind event for "no"
				$confirmationHtml.find( '.no' ).bind( 'click', function(){
					$that.animate( { width: '12px', paddingLeft: '0' }, 200, function(){
						$confirmationHtml.remove();
					});
					return false; // prevent bubbling
				});
			});

			$listItemHtml.find( '.dashboard-item-more' ).bind( "click", function(){
				widget._trigger( "OpenList", 0, { selectedList: listItem.list_item } );
			});

			_SetupCustomDeadlinePicker( $listItemHtml );

			$listItemHtml.find( '.dashboard-list-item-deadline' ).bind( 'click', function(){
				$listItemHtml.find( '.dashboard-list-item-deadline' ).parent().find( '.dashboard-list-item-deadline-hidden' ).datepicker( "show" );
			});

			return $listItemHtml;
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
				widget.today = $( '<div id="today" class="schedule-column"><h1>Today</h1><div data-type="scheduleColumn"></div></div>' );
				widget.tomorrow = $( '<div id="tomorrow" class="schedule-column"><h1>Tomorrow</h1><div data-type="scheduleColumn"></div></div>' );
				widget.thisweek = $( '<div id="thisweek" class="schedule-column"><h1>This Week</h1><div data-type="scheduleColumn"></div></div>' );
				widget.nextweek = $( '<div id="nextweek" class="schedule-column"><h1>Next Week</h1><div data-type="scheduleColumn"></div></div>' );
				widget.later = $( '<div id="later"><h1>Later</h1><div data-type="scheduleColumn"></div></div>' );

				widget.element.append( widget.header );
				widget.header.append( widget.toolbar );
				widget.element.append( widget.wrapper );

				widget.wrapper.append( widget.today );
				widget.wrapper.append( widget.tomorrow );
				widget.wrapper.append( widget.thisweek );
				widget.wrapper.append( widget.nextweek );
				widget.nextweek.append( widget.later );
				widget.wrapper.append( '<div style="clear:both;">&nbsp;</div>' );

				widget.toolbar.append( '<div id="dashboard-search-cancel">&nbsp;</div><div style="clear:both;">&nbsp;</div>' );

				// Load scheduled items
				ListItem.Index( {
					successCallback: function( template, json, status, xhr, errors ) {

						$.each( json, function( index, listItem ) {
							_CreateDashboardItem( listItem, template );
						});

						$( 'div[data-type="scheduleColumn"]' ).each(function(){
							if ( $( this ).children( '.dashboard-item' ).length === 0 ) {
								$( this ).append( _NothingToDoText );
							}
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

			}
		};
	}();
	// register widget
	$.widget("ui.Dashboard", Dashboard);
})();
