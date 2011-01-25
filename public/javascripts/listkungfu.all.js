// Global Application Object

var ListKungFu = {
	LayoutWest: $("#mainlayout-west"),
	LayoutNorth: $("#mainlayout-north"),
	LayoutEast: $("#mainlayout-east"),
	LayoutSouth: $("#mainlayout-south"),
	LayoutCenter: $("#mainlayout-center")
};

/*
	Helpers
*/


jQuery.expr[':'].Contains = function(a,i,m){
     return jQuery(a).text().toLowerCase().indexOf(m[3].toLowerCase())>=0;
};

/*
	Main Layout
*/

$(document).ready(function () {
	ListKungFu.MainLayout = $('body').layout({
		defaults: {
			contentSelector: ".ui-layout-content",
			contentIgnoreSelector: ".ui-layout-ignore"
		},

		north: {
			maxSize: 92,
			minSize: 92
		},

		south: {
			minSize: 50
		},

		west: {
			minSize: 300
		},

		east: {
			minSize: 100,
			initClosed: true
		},

		center: {
			minSize: 300
		}
	});

	/*
		Initialize Views
	*/

	ListKungFu.LayoutSouth.StatusBar();

	ListKungFu.LayoutCenter.ListItemView({
		SelectLastList: function( event, data ) {
			ListKungFu.LayoutWest.ListView( "SelectList" );
		},
		ContentDimensionsChanged: function(){
			ListKungFu.MainLayout.resizeContent("center");
		},
		ReinitPanes: function(){
			ListKungFu.MainLayout.reinitPane();
		}
	});

	ListKungFu.LayoutWest.ListView({
		ContentDimensionsChanged: function(){
			ListKungFu.MainLayout.resizeContent( "west" );
		},
		OpenList: function( event, data ) {
			ListKungFu.LayoutCenter.Dashboard( "Hide" );
			ListKungFu.LayoutCenter.ListItemView( "OpenList", data.selectedList );
		},
		CloseList: function( event, data ) {
			ListKungFu.LayoutCenter.ListItemView( "RemoveList" );
		},
		SelectListItem: function( event, data ) {
			ListKungFu.LayoutCenter.ListItemView( "SelectListItem" );
		}
	});

	ListKungFu.LayoutCenter.Dashboard( {
		ContentDimensionsChanged: function(){
			ListKungFu.MainLayout.resizeContent("center");
		},
		ReinitPanes: function(){
			ListKungFu.MainLayout.reinitPane();
		},
		OpenList: function( event, data ) {
			ListKungFu.LayoutCenter.Dashboard( "Hide" );
			ListKungFu.LayoutCenter.ListItemView( "OpenList", data.selectedList );
		}
	});

	// bind "Dashboard"-link
	$( "#dashboard" ).bind( "click", function() {
		ListKungFu.LayoutCenter.ListItemView( "RemoveList" );
		ListKungFu.LayoutCenter.Dashboard( "Show" );
		return false;
	});

	// show Dashboard by default after login
	$( "#dashboard" ).trigger( "click" );
});



var Controller = function(spec, my) {
	var that = {};

	my = my || {};

	var GetDefaultBaseUrl = function() {
		var protocol = document.location.protocol + "//";
		var hostname = document.location.hostname;
		var port = document.location.port !== '' ? ":" + document.location.port : "";

		return protocol + hostname + port + "/";
	};

	var ConstructErrorObj = function( errors ) {
		var errorObj = $( errors ).length > 0 ? {} : false;

		$( errors ).each(function( index, error ){
			var model = $( error ).attr( "model" );
			var field = $( error ).attr( "field" );
			var message = $( error ).text();

			// init model
			errorObj[ model ] = errorObj[ model ] || {};

			// init field
			errorObj[ model ][ field ] = errorObj[ model ][ field ] || [];

			// push current error message
			errorObj[ model ][ field ].push( message );

		});

		return errorObj;
	};

	that.ClearFlash = function() {
		that.flash = {
			notice: "",
			error: "",
			warning: "",
			message: ""
		}
	};

	// initialize flash
	that.ClearFlash();

	that.SetFlash = function( xhr ) {
		that.flash.notice = xhr.getResponseHeader("X-Flash-Notice") || "";
		that.flash.error = xhr.getResponseHeader("X-Flash-Error") || "";
		that.flash.warning = xhr.getResponseHeader("X-Flash-Warning") || "";
		that.flash.message = xhr.getResponseHeader("X-Flash-Message") || "";

		if ( typeof( spec.onFlashUpdate ) === 'function' ) {
			if ( that.flash.notice !== "" || that.flash.error !== "" ||
					that.flash.warning !== "" ||  that.flash.message !== "" ) {
				spec.onFlashUpdate( that.flash.notice, that.flash.error, that.flash.warning, that.flash.message );
			}
		}

	};



	that.baseURL = spec.base_url || GetDefaultBaseUrl();
	that.route = spec.route;

	that.DefaultCallback = function( callback, data, status, xhr ) {
		that.SetFlash( xhr );

		var json = $.parseJSON( $( data ).find( 'JSON' ).text() );
		var template = $( data ).find( 'Template' ).text();
		var errors = ConstructErrorObj( $( data ).find( 'Error' ) );


		if ( typeof( callback ) === 'function' ) {
			callback( template, json , status, xhr, errors );
		}

		that.ClearFlash();
	};

	that.DefaultErrorCallback = function( xhr, errorType, exception ) {
		$('<div id="dialog-confirm"> \
			<span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"> \
			</span>Something went wrong :-( Either try again or reload the page!</div>').dialog({

			resizable: false,
			modal: true,
			buttons: {
				"Try again": function() {
					$( this ).dialog( "close" );
				},
				"Reload": function() {
					window.location.reload();
				}
			}
		});

	};

	that.ConstructRoute = function( params ) {
		var constructedRoute = "";
		var id = "";
		for ( var i = 0; i < that.route.length; i++ ) {
			constructedRoute += that.route[ i ];

		 	id = params[ that.route[ i ] ] || "";

			if ( id !== "" ) {
				constructedRoute += "/" + id;
			}
			id = "";

			// if this is not the last part of the route, add a slash
			if ( i !== that.route.length - 1 ) {
				constructedRoute +=  "/";
			}
		}

		return constructedRoute;
	};

	// By default
	// sending JSON
	// receiving XML

	that.Index = function( setup ) {
		var successCallback = setup.successCallback || null;
		var route = that.ConstructRoute( setup );
		var data = setup.send;

		var result = $.ajax({
			url: that.baseURL + route,
			dataType: "xml",
			type: "GET",
			processData: true,
			contentType: "application/json",
			data: data,
			success: function ( data, status, xhr ) {
				that.DefaultCallback( successCallback, data, status, xhr );
			},
			error: function( xhr, errorType, exception ) {
				that.DefaultErrorCallback( xhr, errorType, exception );
			}
		});
	};

	that.Show = function( setup ) {
		var successCallback = setup.successCallback || null;
		var route = that.ConstructRoute( setup );

		$.ajax({
			url: that.baseURL + route,
			dataType: "xml",
			type: "GET",
			processData: false,
			contentType: "application/json",
			success: function( data, status, xhr ) {
				that.DefaultCallback( successCallback, data, status, xhr );
			},
			error: function( xhr, errorType, exception ) {
				that.DefaultErrorCallback( xhr, errorType, exception );
			}
		});
	};

	that.New = function( setup ) {
		var successCallback = setup.successCallback || null;
		var route = that.ConstructRoute( setup );

		$.ajax({
			url: that.baseURL + route + "/new",
			dataType: "xml",
			type: "GET",
			processData: false,
			contentType: "application/json",
			success: function( data, status, xhr ) {
				that.DefaultCallback( successCallback, data, status, xhr );
			},
			error: function( xhr, errorType, exception ) {
				that.DefaultErrorCallback( xhr, errorType, exception );
			}
		});
	};

	that.Create = function( setup ) {
		var successCallback = setup.successCallback || null;
		var route = that.ConstructRoute( setup );
		var send = setup.send;
		var data = JSON.stringify( send );

		$.ajax({
			url: that.baseURL + route,
			dataType: "xml",
			type: "POST",
			processData: false,
			contentType: "application/json",
			data: data,
			success: function( data, status, xhr ) {
				that.DefaultCallback( successCallback, data, status, xhr );
			},
			error: function( xhr, errorType, exception ) {
				that.DefaultErrorCallback( xhr, errorType, exception );
			}
		});
	};

	that.Edit = function( setup ) {
		var successCallback = setup.successCallback || null;
		var route = that.ConstructRoute( setup );

		$.ajax({
			url: that.baseURL + route + "/edit",
			dataType: "xml",
			type: "GET",
			parseData: false,
			contentType: "application/json",
			success: function( data, status, xhr ) {
				that.DefaultCallback( successCallback, data, status, xhr );
			},
			error: function( xhr, errorType, exception ) {
				that.DefaultErrorCallback( xhr, errorType, exception );
			}
		});
	};

	that.Update = function( setup ) {
		var successCallback = setup.successCallback || null;
		var route = that.ConstructRoute( setup );
		var send = setup.send;
		var data = JSON.stringify( send );

		// correct line breaks for firefox
		data = data.replace( /\\u000a/g, "\\n");

		$.ajax({
			url: that.baseURL + route,
			dataType: "xml",
			type: "POST",
			processData: false,
			contentType: "application/json",
			data: data,
			beforeSend: function( xhr )
			{
				xhr.setRequestHeader("X-Http-Method-Override", "PUT");
			},
			success: function( data, status, xhr ) {
				that.DefaultCallback( successCallback, data, status, xhr );
			},
			error: function( xhr, errorType, exception ) {
				that.DefaultErrorCallback( xhr, errorType, exception );
			}
		});
	};

	that.Destroy = function( setup ) {
		var successCallback = setup.successCallback || null;
		var route = that.ConstructRoute( setup );

		$.ajax({
			url: that.baseURL + route,
			dataType: "xml",
			type: "POST",
			processData: false,
			contentType: "application/json",
			beforeSend: function(xhr)
			{
				xhr.setRequestHeader("X-Http-Method-Override", "DELETE");
			},
			success: function( data, status, xhr ){
				that.DefaultCallback( successCallback, data, status, xhr );
			},
			error: function( xhr, errorType, exception ) {
				that.DefaultErrorCallback( xhr, errorType, exception );
			}
		});

	};

	return that;
};

var List = Controller({
	route: [ "lists" ],
	onFlashUpdate: function( notice, error, warning, message ) {
		ListKungFu.LayoutSouth.StatusBar( "SetAlert", error );
		ListKungFu.LayoutSouth.StatusBar( "SetNotice", notice );
	}
});

var ListListItem = Controller({
	route: [ "lists", "list_items" ],
	onFlashUpdate: function( notice, error, warning, message ) {
		ListKungFu.LayoutSouth.StatusBar( "SetAlert", error );
		ListKungFu.LayoutSouth.StatusBar( "SetNotice", notice );
	}
});

var ListItem = Controller({
	route: [ "list_items" ],
	onFlashUpdate: function( notice, error, warning, message ) {
		ListKungFu.LayoutSouth.StatusBar( "SetAlert", error );
		ListKungFu.LayoutSouth.StatusBar( "SetNotice", notice );
	}
});/*
 * jquery-ujs
 *
 * http://github.com/rails/jquery-ujs/blob/master/src/rails.js
 *
 * This rails.js file supports jQuery 1.4.3 and 1.4.4 .
 *
 */

jQuery(function ($) {
    var csrf_token = $('meta[name=csrf-token]').attr('content'),
        csrf_param = $('meta[name=csrf-param]').attr('content');

    $.fn.extend({
        /**
         * Triggers a custom event on an element and returns the event result
         * this is used to get around not being able to ensure callbacks are placed
         * at the end of the chain.
         *
         * TODO: deprecate with jQuery 1.4.2 release, in favor of subscribing to our
         *       own events and placing ourselves at the end of the chain.
         */
        triggerAndReturn: function (name, data) {
            var event = new $.Event(name);
            this.trigger(event, data);

            return event.result !== false;
        },

        /**
         * Handles execution of remote calls. Provides following callbacks:
         *
         * - ajax:before   - is execute before the whole thing begings
         * - ajax:loading  - is executed before firing ajax call
         * - ajax:success  - is executed when status is success
         * - ajax:complete - is execute when status is complete
         * - ajax:failure  - is execute in case of error
         * - ajax:after    - is execute every single time at the end of ajax call
         */
        callRemote: function () {
            var el      = this,
                method  = el.attr('method') || el.attr('data-method') || 'GET',
                url     = el.attr('action') || el.attr('href'),
                dataType  = el.attr('data-type')  || "script";//($.ajaxSettings && $.ajaxSettings.dataType);

            if (url === undefined) {
                throw "No URL specified for remote call (action or href must be present).";
            } else {
                if (el.triggerAndReturn('ajax:before')) {
                    var data = el.is('form') ? el.serializeArray() : [];
                    $.ajax({
                        url: url,
                        data: data,
                        dataType: dataType,
                        type: method.toUpperCase(),
                        beforeSend: function (xhr) {
                            el.trigger('ajax:loading', xhr);
                        },
                        success: function (data, status, xhr) {
                            el.trigger('ajax:success', [data, status, xhr]);
                        },
                        complete: function (xhr) {
                            el.trigger('ajax:complete', xhr);
                        },
                        error: function (xhr, status, error) {
                            el.trigger('ajax:failure', [xhr, status, error]);
                        }
                    });
                }

                el.trigger('ajax:after');
            }
        }
    });

    /**
     *  confirmation handler
     */

    $('body').delegate('a[data-confirm], button[data-confirm], input[data-confirm]', 'click.rails', function () {
        var el = $(this);
        if (el.triggerAndReturn('confirm')) {
            if (!confirm(el.attr('data-confirm'))) {
                return false;
            }
        }
    });



    /**
     * remote handlers
     */
    $('form[data-remote]').live('submit.rails', function (e) {
        $(this).callRemote();
        e.preventDefault();
    });

    $('a[data-remote],input[data-remote]').live('click.rails', function (e) {
        $(this).callRemote();
        e.preventDefault();
    });

    $('a[data-method]:not([data-remote])').live('click.rails', function (e){
        var link = $(this),
            href = link.attr('href'),
            method = link.attr('data-method'),
            form = $('<form method="post" action="'+href+'"></form>'),
            metadata_input = '<input name="_method" value="'+method+'" type="hidden" />';

        if (csrf_param !== undefined && csrf_token !== undefined) {
            metadata_input += '<input name="'+csrf_param+'" value="'+csrf_token+'" type="hidden" />';
        }

        form.hide()
            .append(metadata_input)
            .appendTo('body');

        e.preventDefault();
        form.submit();
    });

    /**
     * disable-with handlers
     */
    var disable_with_input_selector           = 'input[data-disable-with]',
        disable_with_form_remote_selector     = 'form[data-remote]:has('       + disable_with_input_selector + ')',
        disable_with_form_not_remote_selector = 'form:not([data-remote]):has(' + disable_with_input_selector + ')';

    var disable_with_input_function = function () {
        $(this).find(disable_with_input_selector).each(function () {
            var input = $(this);
            input.data('enable-with', input.val())
                .attr('value', input.attr('data-disable-with'))
                .attr('disabled', 'disabled');
        });
    };

    $(disable_with_form_remote_selector).live('ajax:before.rails', disable_with_input_function);
    $(disable_with_form_not_remote_selector).live('submit.rails', disable_with_input_function);

    $(disable_with_form_remote_selector).live('ajax:complete.rails', function () {
        $(this).find(disable_with_input_selector).each(function () {
            var input = $(this);
            input.removeAttr('disabled')
                 .val(input.data('enable-with'));
        });
    });

    var jqueryVersion = $().jquery;

    if ( (jqueryVersion === '1.4') || (jqueryVersion === '1.4.1') || (jqueryVersion === '1.4.2') ){
        alert('This rails.js does not support the jQuery version you are using. Please read documentation.');
    }

});
(function( $ ) {

	$.confirmationDialog = function( confButtonText, confButtonFunction, cancelButtonText, confirmationText) {

		dialog = $('<div id="dialog-confirm"> \
			<span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"> \
			</span>' + confirmationText + '</div>').dialog({

			resizable: false,
			modal: true,
			autoOpen:false,
			width: 400,
			open: function(){
				dialog.parent().find( ".ui-dialog-buttonpane > button" ).first().focus();
			}
		});

		var buttonObj = {};
		buttonObj[ confButtonText ] = function() {
			$( dialog ).dialog( "close" );
			confButtonFunction();
		};
		buttonObj[ cancelButtonText ] = function(){
			$( dialog ).dialog( "close" );
		};

		dialog.dialog( "option", "buttons", buttonObj );

		// make it possible to use arrow keys to navigate from one button to another
		dialog.parent().find( ".ui-dialog-buttonpane > button" ).bind('keydown', 'right', function( e ) {
			var $target = $( e.target );

			if ( $target.next( 'button' ).length > 0 ) {
				$target.blur();
				$target.next( 'button' ).focus();
			}
			return false;
		});

		dialog.parent().find( ".ui-dialog-buttonpane > button" ).bind('keydown', 'left', function( e ) {
			var $target = $( e.target );

			if ( $target.prev( 'button' ).length > 0 ) {
				$target.blur();
				$target.prev( 'button' ).focus();
			}
			return false;
		});

    return dialog;
  };
})( jQuery );(function(){
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
				widget.today = $( '<div id="today" class="schedule-column" data-type="scheduleColumn"><h1>Today</h1></div>' );
				widget.tomorrow = $( '<div id="tomorrow" class="schedule-column" data-type="scheduleColumn"><h1>Tomorrow</h1></div>' );
				widget.thisweek = $( '<div id="thisweek" class="schedule-column" data-type="scheduleColumn"><h1>This Week</h1></div>' );
				widget.nextweek = $( '<div id="nextweek" class="schedule-column" data-type="scheduleColumn"><h1>Next Week</h1></div>' );
				widget.later = $( '<div id="later" data-type="scheduleColumn"><h1>Later</h1></div>' );

				widget.element.append( widget.header );
				widget.header.append( widget.toolbar );
				widget.element.append( widget.wrapper );

				widget.wrapper.append( widget.today );
				widget.wrapper.append( widget.tomorrow );
				widget.wrapper.append( widget.thisweek );
				widget.wrapper.append( widget.nextweek );
				widget.nextweek.append( widget.later );
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
								case 'this week':
									widget.thisweek.append( $listItemHtml );
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

						});

						$( 'div[data-type~="scheduleColumn"]' ).each(function(){
							if ( $( this ).children( '.dashboard-item' ).length === 0 ) {
								$( this ).children( 'h1' ).after( '<p class="nothing-todo">no items scheduled</p>' );
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

			}
		};
	}();
	// register widget
	$.widget("ui.Dashboard", Dashboard);
})();
/*
 * jQuery Hotkeys Plugin
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Based upon the plugin by Tzury Bar Yochay:
 * http://github.com/tzuryby/hotkeys
 *
 * Original idea by:
 * Binny V A, http://www.openjs.com/scripts/events/keyboard_shortcuts/
*/

(function(jQuery){
	
	jQuery.hotkeys = {
		version: "0.8",

		specialKeys: {
			8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
			20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
			37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del", 
			96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
			104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/", 
			112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 
			120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 191: "/", 224: "meta"
		},
	
		shiftNums: {
			"`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&", 
			"8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ": ", "'": "\"", ",": "<", 
			".": ">",  "/": "?",  "\\": "|"
		}
	};

	function keyHandler( handleObj ) {
		// Only care when a possible input has been specified
		if ( typeof handleObj.data !== "string" ) {
			return;
		}
		
		var origHandler = handleObj.handler,
			keys = handleObj.data.toLowerCase().split(" ");
	
		handleObj.handler = function( event ) {
			// Don't fire in text-accepting inputs that we didn't directly bind to
			if ( this !== event.target && (/textarea|select/i.test( event.target.nodeName ) ||
				 event.target.type === "text") ) {
				return;
			}
			
			// Keypress represents characters, not special keys
			var special = event.type !== "keypress" && jQuery.hotkeys.specialKeys[ event.which ],
				character = String.fromCharCode( event.which ).toLowerCase(),
				key, modif = "", possible = {};

			// check combinations (alt|ctrl|shift+anything)
			if ( event.altKey && special !== "alt" ) {
				modif += "alt+";
			}

			if ( event.ctrlKey && special !== "ctrl" ) {
				modif += "ctrl+";
			}
			
			// TODO: Need to make sure this works consistently across platforms
			if ( event.metaKey && !event.ctrlKey && special !== "meta" ) {
				modif += "meta+";
			}

			if ( event.shiftKey && special !== "shift" ) {
				modif += "shift+";
			}

			if ( special ) {
				possible[ modif + special ] = true;

			} else {
				possible[ modif + character ] = true;
				possible[ modif + jQuery.hotkeys.shiftNums[ character ] ] = true;

				// "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
				if ( modif === "shift+" ) {
					possible[ jQuery.hotkeys.shiftNums[ character ] ] = true;
				}
			}

			for ( var i = 0, l = keys.length; i < l; i++ ) {
				if ( possible[ keys[i] ] ) {
					return origHandler.apply( this, arguments );
				}
			}
		};
	}

	jQuery.each([ "keydown", "keyup", "keypress" ], function() {
		jQuery.event.special[ this ] = { add: keyHandler };
	});

})( jQuery );(function(){
	var ListItemView = function(){

		var widget = null;

		var _TriggerResize = function() {
			widget._trigger("ContentDimensionsChanged", 0, {} );
		};

		var _TriggerReinitOfPanes = function() {
			widget._trigger("ReinitPanes", 0, {} );
		};

		var _SetSelectedListItem = function( elem, obj ) {
			widget.selectedListItem = {
				element: elem,
				data: obj
			};
		};

		var _SetupDeadlineButton = function( $parentItem ) {
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
		}

		var _SetupCustomDeadlinePicker = function() {
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
		}

		var _AddListItem = function( listItem, template, isFirst ) {
			var newElement = $( $.mustache( template, listItem.list_item ) );

			newElement.data( "data", listItem );
			newElement.data( "isFullsize", false );

			if ( isFirst ) {
				widget.listItemList.prepend(newElement);
			} else {
				widget.listItemList.append(newElement);
			}

			newElement.find( ".handle" ).height( newElement.height() );

			newElement.bind( 'keydown', 'space', function( e ){
				widget.toolbar.find( "#list-item-completed" ).effect('puff', {}, 300, function(){
					$( this ).show();

					if ( newElement.find( ".undo" ).length === 0 ) {
						widget.toolbar.find( "#list-item-completed" ).trigger( "click" );
					} else {
						newElement.find( ".undo" ).trigger( "click" );
					}
				});
			});

			newElement.bind( 'keydown', 'del', function(){
				widget.toolbar.find( "#list-item-delete" ).effect('puff', {}, 300, function(){
					widget.toolbar.find( "#list-item-delete" ).trigger( 'click' );
				});
			});

			newElement.bind( 'focus', function(e){

				if ( $( e.target ).hasClass( 'row' ) ) {

					// remove selection from all rows
					widget.listItemList.find('.row').removeClass('selected-row');

					// add it to the selected row.
					$( e.target ).addClass('selected-row');

					var data = $( e.target ).data( "data" );

					if ( widget.toolbar ) {
						if ( $( e.target ).data("isFullsize") === true ) {
							widget.toolbar.find( "#list-item-fullsize" ).button( "option", "icons"
								, { primary:'ui-icon-zoomout' } );
						} else {
							widget.toolbar.find( "#list-item-fullsize" ).button( "option", "icons"
								, { primary:'ui-icon-zoomin' } );
						}
					}

					_SetSelectedListItem( $( e.target ), $( e.target ).data( "data" ) );
				}
			});

			newElement.bind( 'keydown', 'down', function( e ){
				e.preventDefault();
				$( e.target ).nextAll( 'div:visible' ).first().focus();
				return false;
			});

			newElement.bind( 'keydown', 'up', function( e ){
				e.preventDefault();
				$( e.target ).prevAll( 'div:visible' ).first().focus();
				return false;
			});

			newElement.bind( 'keydown dblclick', 'return', function( e ){
				// if we display already the form for this element,
				// just exit.
				if ( newElement.find( "form" ).length > 0 ) {
					return false;
				}

				widget.toolbar.find( "#list-item-edit" ).effect('puff', {}, 300, function(){
					$( this ).show();
				});

				// close all open forms
				widget.listItemList.find( ".row" ).find( "form" ).hide( "slow", function() {
					$( this ).remove();
				});

				ListListItem.Edit({
					successCallback: function( template, json, status, xhr, errors ) {
						var $form = $( template );
						var elementAlreadyFullsize = newElement.data( "isFullsize" );

						$form.hide();
						widget.selectedListItem.element.prepend( $form );
						$form.find( "textarea" ).markItUp( mySettings );
						_SetupDeadlineButton( $form );
						_SetupCustomDeadlinePicker();

						// only toggleFullsize if not already fullsize (when opening the editing dialog)
						if ( elementAlreadyFullsize === false ) {
							_ToggleFullsize( newElement );
						}

						// hide drag and drop handle
						widget.selectedListItem.element.find( ".handle" ).hide();

						$form.show('slow', function(){
							$form.find( "textarea" ).focus();
						});

						$form.find( "textarea" ).bind( "keydown", 'esc', function(){
							$form.find( "#cancel-edit" ).trigger( "click" );
						});

						$form.find( ".deadline-button" ).bind( "keydown click", 'return', function( e ) {
							e.preventDefault();
							var serializedForm = newElement.find("form").serializeForm();

							// add deadline indicator based on deadline type
							serializedForm.list_item.deadlineType = $( e.target ).attr( 'data-deadline' );
							serializedForm.list_item.customDeadlineValue = $( '#custom-deadline-value' ).val();

							ListListItem.Update({
								send: serializedForm,
								successCallback: function( template, json, status, xhr, errors ){
									$form.hide( 'slow', function( e ) {
										$( this ).remove();

										// show drag and drop handle
										widget.selectedListItem.element.find( ".handle" ).show();

										// update list item content
										newElement.find( '.list-item-content' ).html( json.list_item.body_rendered );

										// update deadline
										newElement.find( '.list-item-deadline' ).html( json.list_item.deadline_in_words );

										// correct height of drag and drop handle
										newElement.find( ".handle" ).height( newElement.find( '.list-item-content' ).height() );

										// only toggleFullsize if not already fullsize (when saving item)
										if ( elementAlreadyFullsize === false ) {
											_ToggleFullsize( newElement );
										}

										_SetSelectedListItem( newElement, json );
										newElement.data( "data", json );
										newElement.focus();
									});
								},
								lists: widget.selectedListItem.data.list_item.list_id,
								list_items: widget.selectedListItem.data.list_item.id
							});

							return false;
						});

						$form.find( "#cancel-edit" ).bind( "keydown click", 'return', function( e ) {
							e.preventDefault();

							// show drag and drop handle
							widget.selectedListItem.element.find( ".handle" ).show();

							$form.hide( 'slow', function() {
								$( this ).remove();

								// only toggleFullsize if not already fullsize (when canceling edit)
								if ( elementAlreadyFullsize === false ) {
									_ToggleFullsize( newElement );
								}
								newElement.focus();
							});

							return false;
						});

						return false;
					},
					lists: widget.selectedListItem.data.list_item.list_id,
					list_items: widget.selectedListItem.data.list_item.id
				});
			});

			newElement.bind( 'keydown', 'left', function( e ){
				widget._trigger( "SelectLastList", 0, {} );
			});

			newElement.bind( 'keydown', 'shift+return', function( e ){
				widget.toolbar.find( "#list-item-new" ).effect('puff', {}, 300, function(){
					$( this ).show();
					_AddNewListItem();
				});
			});

			newElement.bind( 'keydown', 'l', function( e ) {
				widget.toolbar.find( "#list-item-fullsize" ).effect('puff', {}, 300, function(){
					widget.toolbar.find( '#list-item-fullsize' ).trigger( 'click' );
					$( this ).show();
				});
				return false;
			});


			// code for drag and drop of item to new list.
			if ( ListKungFu && ListKungFu.LayoutCenter ) {
				newElement.draggable( {
					helper: function(){ return $('<div class="list-item-drag-helper">'+newElement.find(".list-item-content").text().substring(0, 20)+' . . .'+'</div>').get(0) },
					appendTo: ListKungFu.LayoutCenter,
					revert: "invalid",
					handle: ".handle",
					cursorAt: { top: 10, left: 10 },
					iframeFix: true,
					start: function( event, ui ) {
						// disable the ability to select text.
						// this is a hack for chrome and safari.
						document.onselectstart = function () { return false; };
					},
					stop: function ( event, ui ) {
						document.onselectstart = null;
					}
				});
			}


			_CorrectHeight( newElement );
		};

		var _ToggleFullsize = function ( element ) {
			if ( element.data( "isFullsize" ) === true ) {
				_CorrectHeight( element, false );
				element.data( "isFullsize", false );
				widget.toolbar.find( "#list-item-fullsize" ).button( "option", "icons"
					, { primary:'ui-icon-zoomin' } );
			} else {
				_CorrectHeight( element, true );
				element.data( "isFullsize", true );
				widget.toolbar.find( "#list-item-fullsize" ).button( "option", "icons"
					, { primary:'ui-icon-zoomout' } );
			}
		};

		var _CorrectHeight = function( element, setToFullSize ) {
			if ( element.height() > 150 && !setToFullSize ) {
				element.height( 150 );
			} else {
				element.height( "auto" );
			}
			_TriggerResize();
		};

		var _DeleteListItem = function( element, listItem ) {
			ListListItem.Destroy({
				successCallback: function( template, json, status, xhr, errors ){
					element.hide( "slow", function() {
						var item = element.next( ".row" );
						if ( item.length > 0 ) {
							item.focus();
						} else {
							item = element.prev( ".row" );
							item.focus();
						}
						element.remove();
						widget.toolbar.find( "#list-item-search" ).trigger( "ClearValue" );
					});
				},
				lists: listItem.list_item.list_id,
				list_items: listItem.list_item.id
			});
		};

		var _MarkCompleted = function( element, listItem ) {
			// set item completed
			listItem.list_item.completed = true;

			// update item server side
			ListListItem.Update({
				successCallback: function(){
					var queueName = "list-item-undo-" + listItem.list_item.id;

					// hide the main content of the list item and instead,
					// display the UNDO button.
					element.find( ".list-item-wrapper" ).hide('slow', function(){
						var $undo = $( '<div class="undo clickable"><img src="/images/undo-icon.gif"/>Undo</div>' );

						$undo.bind( "click", function() {
							_MarkUncompleted( element, listItem, queueName );
						});

						element.append( $undo );

						_CorrectHeight( element );

						// hide complete element after 5 seconds. In case the user
						// clicks "undo", the queue will be cleared and the element
						// won't be hidden.
						$undo.delay( 5000, queueName ).queue( queueName, function(){
							element.hide('slow', function(){
								element.remove();
							});
						}).dequeue( queueName );

						// in case completed items are displayed, update them:
						if ( widget.toolbar && widget.toolbar.find( "#showCompleted" ).get( 0 ).
							checked === true ) {
							_ToggleCompleted( true );
						}

						// select list item
						element.focus();
					});

				},
				lists: listItem.list_item.list_id,
				list_items: listItem.list_item.id,
				send: listItem
			});
		};

		var _MarkUncompleted = function( element, listItem, queueName ) {
			if ( queueName !== "" ) {
				element.clearQueue( queueName );
			}

			// set item completed
			listItem.list_item.completed = false;

			// update item server side
			ListListItem.Update({
				successCallback: function(){
					element.find( ".undo" ).hide('slow', function(){
						$( this ).remove();
					});
					element.find( ".list-item-wrapper" ).show('slow', function(){
						_CorrectHeight( element );
					});

					// in case completed items are displayed, update them:
					if ( widget.toolbar && widget.toolbar.find( "#showCompleted" ).get( 0 ).
						checked === true ) {
						_ToggleCompleted( true );
					}
				},
				lists: listItem.list_item.list_id,
				list_items: listItem.list_item.id,
				send: listItem
			});
		};

		var _ToggleCompleted = function(  doShow ) {
			if ( doShow === true ) {

				if ( widget.completedList ) {
					widget.completedList.remove();
					widget.completedList = null;
				}

				widget.completedList = $( '<div id="completedList"></div>' );

				var data = widget.element.data( "data-list" );
				ListListItem.Index( {
					successCallback: function( template, json, status, xhr, errors ) {

						$.each( json, function( index, listItem ) {
							widget.completedList.append("<div>" + listItem.list_item.body_rendered + "</div>");
						});

						if ( json.length === 0 ) {
							widget.completedList.append("<div>No completed items</div>")
						}

						widget.wrapper.prepend( widget.completedList );
					},
					send: { show: "completed" },
					lists: data.list.id
				});
			} else {
				widget.completedList.remove();
				widget.completedList = null;
			}
		}

		var _CreateToolbar = function() {
			// empty header
			widget.header.html("");

			// build new header
			widget.toolbar = $( '<div id="list-item-toolbar"> \
				<div id="list-name"></div><div id="list-item-toolbar-buttons"> \
				<button id="list-item-completed">Completed [space]</button> \
				<button id="list-item-new">Create [shift+return]</button> \
				<button id="list-item-delete">Delete [del]</button> \
				<button id="list-item-edit">Edit [return]</button> \
				<button id="list-item-fullsize">Fullsize [l]</button> \
				<input type="input" id="list-item-search"/> \
				<input type="checkbox" id="showCompleted"/> \
				<label for="showCompleted">Show Completed Items</label> \
				<div id="list-item-search-cancel">&nbsp;</div> \
				</div></div>' );

			widget.listName = widget.toolbar.find( "#list-name" );

			// create buttons
			widget.toolbar.find( "#list-item-new" ).button({
				text: false,
				icons: {
					primary: 'ui-icon-plusthick'
				}
			});

			widget.toolbar.find( "#list-item-edit" ).button({
				text: false,
				icons: {
					primary: 'ui-icon-pencil'
				}
			});

			widget.toolbar.find( "#list-item-completed" ).button({
				text: false,
				icons: {
					primary: 'ui-icon-check'
				}
			});

			widget.toolbar.find( "#list-item-delete" ).button({
				text: false,
				icons: {
					primary: 'ui-icon-trash'
				}
			});

			widget.toolbar.find( "#list-item-fullsize" ).button({
				text: false,
				icons: {
					primary: 'ui-icon-zoomin'
				}
			});

			// bind events

			widget.toolbar.find( "#list-item-new" ).bind( 'click', function( e ){
				_AddNewListItem();
			});

			widget.toolbar.find( "#showCompleted" ).bind( "change", function( e ){
				_ToggleCompleted( e.target.checked );
				widget.selectedListItem.element.focus();
			});

			widget.toolbar.find( "#list-item-completed" ).bind( 'click', function( e ) {
				var data = widget.selectedListItem.data;
				var $element = widget.selectedListItem.element;

				_MarkCompleted( $element, data );
			});

			widget.toolbar.find( "#list-item-delete" ).bind( 'click', function( e ) {

				var deleteFunc = function() {
					_DeleteListItem( widget.selectedListItem.element, widget.selectedListItem.data );
				};

				if ( typeof( widget.deleteDialog ) === 'undefined' ) {
					widget.deleteDialog = $.confirmationDialog( "Delete List Item", deleteFunc, "Cancel"
						, "Do you really want to delete?" );
				}

				widget.deleteDialog.dialog("open");
			});

			widget.toolbar.find( "#list-item-edit" ).bind( 'click', function( e ) {
				widget.selectedListItem.element.trigger( 'dblclick' );
			});

			widget.toolbar.find( "#list-item-fullsize" ).bind( 'click', function( e ) {
				_ToggleFullsize( widget.selectedListItem.element );
			});

			widget.toolbar.find("#list-item-search").bind( 'keyup', function ( e ) {
				var filtervalue = $(this).val();

        if ( filtervalue === '' ) {
					widget.listItemList.find( ".row" ).show();
        } else {
					widget.listItemList.find( ".row:not(:Contains('" + filtervalue + "'))").hide();
					widget.listItemList.find( ".row:Contains('" + filtervalue + "')").show();
        }
			});

			widget.toolbar.find( "#list-item-search-cancel" ).bind( 'click', function(){
				widget.toolbar.find("#list-item-search").val("").trigger('keyup');
			});

			widget.toolbar.find( "#list-item-search" ).bind( 'ClearValue', function( e ){
				$( e.target ).val("");
				widget.listItemList.find( ".row" ).show();
			});

			widget.header.append( widget.toolbar );

		};

		var _AddNewListItem = function() {
			var data = widget.element.data( "data-list" );

			ListListItem.New( {
				successCallback: function( template, json, status, xhr, errors ) {
					var $form = $( template );
					widget.listItemList.prepend( $form );

					_SetupDeadlineButton( $form );
					_SetupCustomDeadlinePicker();
					$form.find( "textarea" ).markItUp( mySettings );
					$form.find( "textarea" ).focus();


					// hide existing rows when adding new item
					widget.listItemList.find( '.row' ).hide();

					$form.find( "#cancel-edit" ).bind( 'click', function( e ){
						e.preventDefault();
						$form.hide( 'slow', function(){
							$( this ).remove();
							widget.listItemList.find( '.row' ).show();
							widget.listItemList.find( '.row' ).first().focus();
						});
					});

					$form.find( ".deadline-button" ).bind( 'click', function( e ) {
						e.preventDefault();
						var serializedForm = $form.serializeForm();

						// hacky hack hack. no idea why I have to do this
						// when creating an list item.
						// When editing an item, line breaks are sent correctly.
						serializedForm.list_item.body = serializedForm.list_item.body.replace(/\n/g, "\n\n");

						// add deadline indicator based on deadline type
						serializedForm.list_item.deadlineType = $( e.target ).attr( 'data-deadline' );
						serializedForm.list_item.customDeadlineValue = $( '#custom-deadline-value' ).val();

						ListListItem.Create({
							send: serializedForm,
							successCallback: function( template, json, status, xhr, errors ) {
								$form.hide( 'slow', function(){
									_AddListItem( json, template, true );
									$( this ).remove();
									widget.toolbar.find( "#list-item-search" ).trigger( "ClearValue" );
									widget.listItemList.find( ".row" ).show();
									widget.listItemList.find( ".row" ).first().focus();
									widget.listItemList.find( ".row" ).first().find( ".handle" ).height( widget.listItemList.find( ".row" ).first().find( ".list-item-content" ).height() );
								});
							},
							lists: data.list.id
						});
						return false;
					});

					$form.find( "textarea" ).bind( 'keydown', 'esc', function( e ){
						$form.find( "#cancel-edit" ).trigger( 'click' );
					});
				},
				lists: data.list.id
			} );
		};

		return {
			// default options
			options: {

			},

			_create: function() {
				widget = this;

				widget.wrapper = $( '<div class="ui-layout-content" id="list-item-wrapper"></div>' );
				widget.listItemList = $( '<div id="list-item-list"></div>');
				widget.header = $( '<div class="header"></div>' );

				widget.element.append( widget.header );
				widget.element.append( widget.wrapper );
				widget.wrapper.append( widget.listItemList );

				_TriggerResize();

				// bind global events

				$( document ).bind( "keydown", "c", function( e ) {
					var $completedInput = widget.toolbar.find( "#showCompleted" );

						if ( $completedInput.length > 0 ) {
						if ( $completedInput.get( 0 ).checked === true ) {
							$completedInput.get( 0 ).checked = false;
						} else {
							$completedInput.get( 0 ).checked = true;
						}

						$completedInput.trigger( "change" );
					}
				});

				$( document ).bind( "keyup", "f", function( e ) {
					widget.toolbar.find( "#list-item-search" ).focus();
				});


			},

			destroy: function() {
				// remove elements
				widget.children().remove();

				// unbind global events
				$( document ).unbind( "keydown" , "c" );
				$( document ).unbind( "keyup", "f" );
			},

			RemoveList: function() {
				// remove elements
				widget.wrapper.remove();
				widget.header.remove();

				// unbind global events
				$( document ).unbind( "keydown" , "c" );
				$( document ).unbind( "keyup", "f" );
			},

			OpenList: function( data ) {
				widget.RemoveList();
				widget._create();

				widget.element.data( "data-list", data );

				ListListItem.Index( {
					successCallback: function( template, json, status, xhr, errors ) {
						_CreateToolbar();

						$.each( json, function( index, listItem ) {
							_AddListItem( listItem, template )
						});

						// if we have a list_item id, select the list item with that id
						// otherwise just select the first.
						if ( data.id ) {
							widget.listItemList.find( ".row" ).each(function() {
								var tempListItem = $( this );
								var d = tempListItem.data( "data" );

								if ( d.list_item.id === data.id ) {
									tempListItem.focus();

									// if item found, return false in order to exit the loop
									return false;
								}
							});
						} else {
							widget.listItemList.find( ".row" ).first().focus();
						}

						if ( widget.listItemList.find( '.row' ).length === 0 ) {
							_AddNewListItem();
						}

						// set list name
						widget.listName.text( data.list.title );
					},
					lists: data.list.id
				});

				_TriggerReinitOfPanes();
			},

			SelectListItem: function() {
				var effect = "highlight";

				if ( widget.selectedListItem ) {
					widget.selectedListItem.element.effect( effect, {}, 300, function(){
						$( this ).show();
						$( this ).focus();
					});
				} else {
					widget.listItemList.find( '.row' ).first().effect( effect, {}, 300, function(){
						$( this ).show();
						$( this ).focus();
					});
				}

			}
		};
	}();
	// register widget
	$.widget("ui.ListItemView", ListItemView);
})();
(function(){
	var ListView = function(){

		var _IsNewList = function( widget, element ) {
			if ( widget.selectedList === null || widget.selectedList.data.list.id !== element.list.id ) {
				return true;
			} else {
				return false;
			}
		};

		var	_HighlightFormErrors = function( form, errors ) {
			for ( var model in errors ) {
				var currentModel = errors[ model ];

				for ( var field in currentModel ) {
					var currentField = currentModel[ field ];

					var errorExplanation = $( '<div class="error_explanation"><ul></ul></div>' );
					var errorList = errorExplanation.find( "ul" );

					var name = model + "[" + field + "]";
					var input = form.find( "*[name=" + name + "]" );

					for (var i = 0; i < currentField.length; i++ ) {
						input.parent( ".field" ).addClass( "field_with_errors" );
						errorList.append( '<li>' + currentField[ i ] + '</li>' );
					}

					input.parent( ".field" ).append( errorExplanation );
				}
			}
		};

		var _ClearFormErrors = function( form ) {
			form.find( ".field" ).removeClass( "field_with_errors" );
			form.find( ".error_explanation" ).remove();
		};

		var _DeleteList = function( widget, delay ) {
			var nextItem = widget.selectedList.element.next();
			var prevItem = widget.selectedList.element.prev();
			delay = delay || 0;

			List.Destroy({
				successCallback: function( template, json, status, xhr, errors ){
					widget.selectedList.element.delay( delay ).fadeOut(function(){
						$(this).remove();
						nextItem.length > 0 ? nextItem.focus() : prevItem.focus();
					});
					widget._trigger( "CloseList", 0, {} );
				},
				lists: widget.selectedList.data.list.id
			});
		};

		var _CreateToolbar = function( widget ) {
			var toolbar = $('<div id="list-toolbar"> \
				<button id="list-new">Create [shift+return]</button> \
				<button id="list-delete">Delete [del]</button> \
				<button id="list-edit">Edit [space]</button> \
				<input type="text" id="search-list" /> \
				<div id="list-search-cancel">&nbsp;</div> \
				</div>')

			widget.element.find("div.header").append(toolbar);

			// add buttons to toolbar.

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

			toolbar.find( "#list-edit" ).button({
				text: false,
				icons: {
					primary: 'ui-icon-pencil'
				}
			});

			// bind toolbar events.

			toolbar.find("#list-delete").bind('click', { widget: widget }, function( e ) {
				var widget = e.data.widget;

				if ( widget.selectedList !== null ) {


					if ( typeof(widget.deleteDialog) === 'undefined' ) {
						var deleteFunc = function() {
							if ( widget.listForm !== null ) {
								widget.listForm.bind( "FormHidden", function() {
									_DeleteList( widget, 1000 );
								});
								_HideForm( widget );
							} else {
								_DeleteList( widget );
							}
						}

						widget.deleteDialog = $.confirmationDialog( "Delete List", deleteFunc, "Cancel", "Do you really want to delete?" );
					}
					widget.deleteDialog.dialog("open");
				} else {
					$("#notice").text("Select the list which you want to delete").fadeIn().delay(5000).fadeOut();
				}

				$( e.target ).blur();

				return false;
			});

			toolbar.find("#list-new").bind('click', { widget: widget }, function( e ) {

				widget.listlist.hide('slide', { direction: 'left'}, 'slow', function(){

					// remove eventual old occurances
					if ( widget.listForm != null ) {
						widget.listForm.remove();
						widget.listForm = null;
					}

					// create fresh form
					widget.listForm = $('<div class="ui-layout-content" id="list-form"></div>');
					widget.wrapper.append( widget.listForm );

					// triggers /lists/id/edit and calls this.DisplayForm with the
					// HTML of the form.
					List.New({
						successCallback: function( template, json, status, xhr, errors ) {
							widget.listForm.append( template );
							widget.listForm.show('slide', { direction: 'left' }, 'slow', function(){
								widget.listForm.find('#list_title').first().focus();
							});

							widget._trigger( "CloseList", 0, {} );

							widget.listForm.find( "#list-back-button" ).bind( 'click', function(){
								_HideForm( widget );
							});

							widget.listForm.find( '#list_title' ).bind( 'keydown', 'esc', function( e ) {
								_HideForm( widget );
							});

							widget.listForm.bind( "submit", function( e ){
								e.preventDefault();

								var data = json;
								var serializedForm = $(this).find("form").serializeForm();
								json.list = serializedForm.list;

								List.Create({
									send: data,
									successCallback: function( template, json, status, xhr, errors ) {
										_ClearFormErrors( widget.listForm );

										if ( errors === false ) {
											_HideForm( widget, json, template );

											// clear searchfield
											widget.toolbar.find( '#search-list' ).trigger( 'ClearValue' );
										} else {
											_HighlightFormErrors( widget.listForm, errors );
										}
									}
								});
							});

							widget.selectedList = null;
						}
					});
				});


				$( e.target ).blur();
				return false;
			});

			toolbar.find("#search-list").bind( 'keyup', function ( e ) {
				var filtervalue = $(this).val();

        if (filtervalue === '') {
					widget.listlist.find( ".row" ).show();
        } else {
					widget.listlist.find( ".row:not(:Contains('" + filtervalue + "'))").hide();
					widget.listlist.find( ".row:Contains('" + filtervalue + "')").show();
        }
			});

			toolbar.find( "#list-search-cancel" ).bind( 'click', function() {
				toolbar.find( "#search-list" ).val("").trigger( "keyup" );
			});

			toolbar.find("#search-list").bind( 'ClearValue', function( e ){
				$( e.target ).val("");
				widget.listlist.find( ".row" ).show();
			});

			toolbar.find( "#list-edit" ).bind( 'click', { widget: widget }, function( e ) {
				var widget = e.data.widget;

				widget.listlist.hide('slide', { direction: 'left'}, 'slow', function(){

					// remove eventual old occurances
					if ( widget.listForm != null ) {
						widget.listForm.remove();
						widget.listForm = null;
					}

					// create fresh form
					widget.listForm = $('<div class="ui-layout-content" id="list-form"></div>');
					widget.wrapper.append( widget.listForm );

					// triggers /lists/id/edit and calls this.DisplayForm with the
					// HTML of the form.
					List.Edit({
						successCallback: function( template, json, status, xhr, errors ) {
							widget.listForm.append( template );
							widget.listForm.show('slide', { direction: 'left' }, 'slow', function(){
								widget.listForm.find( '#list_title' ).first().focus();
							});

							widget.listForm.find( "#list-back-button" ).bind( 'click', function(){
								_HideForm( widget );
							});

							widget.listForm.find( '#list_title' ).bind( 'keydown', 'esc', function( e ) {
								_HideForm( widget );
							});

							widget.listForm.bind( "submit", function(e){
								e.preventDefault();

								var serializedForm = $(this).find("form").serializeForm();

								List.Update({

									send: serializedForm,
									successCallback: function( template, json, status, xhr, errors ){
										_ClearFormErrors( widget.listForm );

										if ( errors === false ) {
											_HideForm( widget, json, template );
										} else {
											_HighlightFormErrors( widget.listForm, errors );
										}
									},
									lists: widget.selectedList.data.list.id
								});

								return false;
							});
						},
						lists: widget.selectedList.data.list.id
					});
				});
			});

			// return toolbar

			return toolbar
		};

		var _GetListElement = function( widget, data, template ) {
			// get HTML for single List representation
			var newElement = $( $.mustache( template, data.list ) );

			// add tabindex so that list is focusable
			// it looks like for the purpose of being focusable
			// it's not required that the tabindex is different for each element
			newElement.attr('tabindex', 0);

			// save List data directly in DOM element
			newElement.data('data', data);

			// add CSS class
			newElement.addClass('row');

			/////////////////////////////
			//	bind Events for new List DOM
			/////////////////////////////
			newElement.bind('keydown', 'down', function( e ){
				e.preventDefault();
				$( e.target ).nextAll( 'div:visible' ).first().focus();
				return false;
			});

			newElement.bind('keydown', 'up', function( e ){
				e.preventDefault();
				$( e.target ).prevAll( 'div:visible' ).first().focus();
				return false;
			});

			newElement.bind('focus', { widget: widget }, function(e){
				var widget = e.data.widget;

				// remove selection from all rows
				widget.listlist.find('.row').removeClass('selected-row');

				// add it to the selected row.
				$( e.target ).addClass('selected-row');

				widget.selectedList = {
					element: $( e.target ),
					data: $( e.target ).data("data")
				};
			});

			newElement.bind( 'keydown dblclick', 'return', function( e ){
				widget._trigger( "OpenList", 0, { selectedList: $(e.target).data("data") } );
			});

			newElement.bind( 'keydown', 'right', function( e ){
				widget._trigger( "SelectListItem", 0, {} );
			});

			newElement.bind( 'keydown', 'shift+return', function( e ){
				widget.toolbar.find( "#list-new" ).effect('puff', {}, 300, function(){
					$(this).show();
					$(this).trigger('click') });
				return false;
			});

			newElement.bind('keydown', 'del', function(e){
				widget.toolbar.find( "#list-delete" ).effect('puff', {}, 300, function(){
					$(this).show();
				}).trigger('click');
			});

			newElement.bind('keydown', 'space', function(){
				widget.toolbar.find( "#list-edit" ).effect('puff', {}, 300, function(){
					$(this).show();
					$(this).trigger('click') });
				return false;
			});

			newElement.droppable( {
				activeClass: "ui-state-default",
				hoverClass: "ui-state-hover",
				accept: ".list-item",
				drop: function( event, ui ) {
					var originalListItem = ui.draggable.data( "data" );
					var dropList = $( this ).data( "data" );

					var data = {
						list_item: {
							body: originalListItem.list_item.body.replace(/\n/g, "\n\n")
						}
					};

					ListListItem.Create({
						send: data,
						successCallback: function( template, json, status, xhr, errors ) {

							$( event.target ).find(".fake-drop").hide( 'slow', function() {
								$(this).remove();
								newElement.effect( 'highlight', {}, 3000 );
							});
						},
						lists: dropList.list.id
					});
				},
				over: function(event, ui) {
					var wrapper = $('<div class="fake-drop"></div>');
					wrapper.html( '<p>' + ui.helper.text() + '</p>' );
					$(event.target).append( wrapper );
				},
				out: function( event, ui ) {
					$(event.target).find(".fake-drop").remove();
				}

			} );

			return newElement;
		};

		var _triggerResize = function( widget ) {
			widget._trigger("ContentDimensionsChanged", 0, {} );
		};

		var _AddListToDOM = function( widget, data, template ) {
			widget.listlist = $( '<div id="list-list"></div>' );
			widget.wrapper.append( widget.listlist );
			var toolbar = widget.toolbar;

			for ( var i = 0; i < data.length; i++ ) {
				widget.listlist.append( _GetListElement( widget, data[ i ], template ) ) ;
			}
			_triggerResize( widget );
		};

		var _SelectLastList = function( widget ) {
			var effect = "highlight";

			if ( widget.selectedList ) {
				widget.selectedList.element.effect( effect, {}, 300, function(){
					$(this).show();
					$(this).focus();
				});
			} else {
				widget.listlist.find( '.row' ).first().effect( effect, {}, 300, function(){
					$(this).show();
					$(this).focus();
				});
			}

		};

		var _RegisterGlobalKeyboardShortcuts = function( w ) {
			var widget = w;

			// select list
			$(document).bind( 'keydown', 'ctrl+l', function(e) {
				_SelectLastList( w );
			});

			$(document).bind( 'keydown', 'ctrl+f', function(e){
				widget.toolbar.find( "#search-list" ).focus();
			});

			// since ctrl+f does not work in MS windows, adding shift+f as additional
			// keyboard shortcut
			$(document).bind( 'keydown', 'shift+f', function(e) {
				widget.toolbar.find( "#search-list" ).focus();
				return false;
			})
		};

		var _ShowListView = function( widget, updatedElement, template ) {

			widget.listlist.show('slide', { direction: 'left'}, 'slow', function(){
				if ( updatedElement ) {

					var newElement = _GetListElement( widget, updatedElement, template );

					if ( _IsNewList( widget, updatedElement ) ) {
						widget.listlist.prepend( newElement );
					} else {
						widget.selectedList.element.replaceWith( newElement );
					}

					widget.selectedList =  {
						data: updatedElement,
						element: newElement
					};
				}
				if ( widget.selectedList ) {
					widget.selectedList.element.focus();
				}
			});

		};

		var _HideForm = function( widget, updatedElement, template ) {

			widget.listForm.hide('slide', { direction: 'left' }, 'slow', function(){
				_ShowListView( widget, updatedElement, template );
				widget.listForm.trigger( "FormHidden" );
				if ( widget.selectedList ) {
					widget.selectedList.element.focus();
				} else {
					widget.listlist.find( '.row' ).first().focus();
				}
				widget.listForm.remove();
				widget.listForm = null;
			});
		};

		return {
			// default options
			options: {

			},

			///////
			//	holds object with selected list:
			//	{
			//		element: jQuery object with the UI element displaying the list
			//		data: the data object (retrieved from server)
			//	}
			//////
			selectedList: null,

			_create: function() {
				var widget = this;
				widget.wrapper = widget.element.find('div#list-wrapper');
				widget.toolbar = _CreateToolbar( widget );
				widget.listForm = null;

				// retrieve Lists from server and add them to DOM.
				List.Index( {
					successCallback: function( template, json, status, xhr, errors ) {

						// remove all existing rows
						widget.wrapper.find(".row").remove();

						// add newly received Lists to DOM
						_AddListToDOM( widget, json, template );

						// focus first list
						widget.listlist.find( '.row' ).first().focus();
					}
				} );

				// register global keyboard shortcuts
				_RegisterGlobalKeyboardShortcuts( widget );
			},

			SelectList: function() {
				_SelectLastList( this );
			},

			destroy: function() {
				widget.toolbar.remove();
				widget.listForm.remove();
				widget.wrapper.find(".row").remove();
			}
		};
	}();

	// register widget
	$.widget("ui.ListView", ListView);
})();
(function( $ ) {

	$.fn.serializeForm = function() {
		
		// select all elements with a name attribute that contains a closing square bracket.
		// this takes advantage of Rails' conventions that set the name to something like
		// list[title]
		var fields = $( this ).find( '*[name*="]"]' );
		
		var objects = {};
		
		$.each( fields, function( index, field ) {
			var $field = $( field );
			
			var model = $field.get( 0 ).name.split( "[" )[0];
			var currentField = $field.get( 0 ).name.split( "[" )[1];
			currentField = currentField.replace( "]", "" );
			var value = $field.val();			
			
			objects[ model ] = objects[ model ] || {};
			
			objects[ model ][ currentField ] = value;

		});
    
    return objects;
  };
})( jQuery );(function(){
	var StatusBar = function(){

		var _myPrivateFunction = function() {
		};

		// put all private functions in here
		// that improves minification. See http://blog.project-sierra.de/archives/1622

		return {
			// default options
			options: {

			},

			// required function. Automatically called when widget is created
			_create: function() {
				var widget = this;

				widget.ajaxLoader = $('<div id="ajax-indicator"> \
						<img src="/images/ajax-loader.gif" class="ajax-indicator" /> Loading ... \
						</div>');

				widget.notice = $('<p id="notice"></p>');
				widget.alert = $('<p id="alert"></p>');

				widget.element.append( widget.ajaxLoader );
				widget.element.append( widget.notice );
				widget.element.append( widget.alert );

				widget.notice.hide(function( e ){
					$( e.target ).html("");
				});
				widget.alert.hide(function( e ){
					$( e.target ).html("");
				});

				widget.ajaxLoader.bind("ajaxSend", function(){
				  $(this).show();
				}).bind("ajaxComplete", function(){
				  $(this).hide();
				});

			},

			SetNotice: function( notice ) {
				var widget = this;

				widget.notice.text( notice );
				widget.notice.fadeIn().delay( 5000 ).fadeOut(function(){
					$(this).text("");
				});
			},

			SetAlert: function( alert ) {
				var widget = this;

				widget.alert.text( alert );
				widget.alert.fadeIn().delay( 5000 ).fadeOut(function(){
					$(this).text("");
				});
			},

			destroy: function() {
				widget.ajaxLoader.remove();
				widget.notice.remove();
				widget.alert.remove();
			}
		};
	}();
	// register widget
	$.widget("ui.StatusBar", StatusBar);
})();
// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
/*
  mustache.js — Logic-less templates in JavaScript

  See http://mustache.github.com/ for more info.
*/

var Mustache = function() {
  var Renderer = function() {};

  Renderer.prototype = {
    otag: "{{",
    ctag: "}}",
    pragmas: {},
    buffer: [],
    pragmas_implemented: {
      "IMPLICIT-ITERATOR": true
    },
    context: {},

    render: function(template, context, partials, in_recursion) {
      // reset buffer & set context
      if(!in_recursion) {
        this.context = context;
        this.buffer = []; // TODO: make this non-lazy
      }

      // fail fast
      if(!this.includes("", template)) {
        if(in_recursion) {
          return template;
        } else {
          this.send(template);
          return;
        }
      }

      template = this.render_pragmas(template);
      var html = this.render_section(template, context, partials);
      if(in_recursion) {
        return this.render_tags(html, context, partials, in_recursion);
      }

      this.render_tags(html, context, partials, in_recursion);
    },

    /*
      Sends parsed lines
    */
    send: function(line) {
      if(line != "") {
        this.buffer.push(line);
      }
    },

    /*
      Looks for %PRAGMAS
    */
    render_pragmas: function(template) {
      // no pragmas
      if(!this.includes("%", template)) {
        return template;
      }

      var that = this;
      var regex = new RegExp(this.otag + "%([\\w-]+) ?([\\w]+=[\\w]+)?" +
            this.ctag);
      return template.replace(regex, function(match, pragma, options) {
        if(!that.pragmas_implemented[pragma]) {
          throw({message: 
            "This implementation of mustache doesn't understand the '" +
            pragma + "' pragma"});
        }
        that.pragmas[pragma] = {};
        if(options) {
          var opts = options.split("=");
          that.pragmas[pragma][opts[0]] = opts[1];
        }
        return "";
        // ignore unknown pragmas silently
      });
    },

    /*
      Tries to find a partial in the curent scope and render it
    */
    render_partial: function(name, context, partials) {
      name = this.trim(name);
      if(!partials || partials[name] === undefined) {
        throw({message: "unknown_partial '" + name + "'"});
      }
      if(typeof(context[name]) != "object") {
        return this.render(partials[name], context, partials, true);
      }
      return this.render(partials[name], context[name], partials, true);
    },

    /*
      Renders inverted (^) and normal (#) sections
    */
    render_section: function(template, context, partials) {
      if(!this.includes("#", template) && !this.includes("^", template)) {
        return template;
      }

      var that = this;
      // CSW - Added "+?" so it finds the tighest bound, not the widest
      var regex = new RegExp(this.otag + "(\\^|\\#)\\s*(.+)\\s*" + this.ctag +
              "\n*([\\s\\S]+?)" + this.otag + "\\/\\s*\\2\\s*" + this.ctag +
              "\\s*", "mg");

      // for each {{#foo}}{{/foo}} section do...
      return template.replace(regex, function(match, type, name, content) {
        var value = that.find(name, context);
        if(type == "^") { // inverted section
          if(!value || that.is_array(value) && value.length === 0) {
            // false or empty list, render it
            return that.render(content, context, partials, true);
          } else {
            return "";
          }
        } else if(type == "#") { // normal section
          if(that.is_array(value)) { // Enumerable, Let's loop!
            return that.map(value, function(row) {
              return that.render(content, that.create_context(row),
                partials, true);
            }).join("");
          } else if(that.is_object(value)) { // Object, Use it as subcontext!
            return that.render(content, that.create_context(value),
              partials, true);
          } else if(typeof value === "function") {
            // higher order section
            return value.call(context, content, function(text) {
              return that.render(text, context, partials, true);
            });
          } else if(value) { // boolean section
            return that.render(content, context, partials, true);
          } else {
            return "";
          }
        }
      });
    },

    /*
      Replace {{foo}} and friends with values from our view
    */
    render_tags: function(template, context, partials, in_recursion) {
      // tit for tat
      var that = this;

      var new_regex = function() {
        return new RegExp(that.otag + "(=|!|>|\\{|%)?([^\\/#\\^]+?)\\1?" +
          that.ctag + "+", "g");
      };

      var regex = new_regex();
      var tag_replace_callback = function(match, operator, name) {
        switch(operator) {
        case "!": // ignore comments
          return "";
        case "=": // set new delimiters, rebuild the replace regexp
          that.set_delimiters(name);
          regex = new_regex();
          return "";
        case ">": // render partial
          return that.render_partial(name, context, partials);
        case "{": // the triple mustache is unescaped
          return that.find(name, context);
        default: // escape the value
          return that.escape(that.find(name, context));
        }
      };
      var lines = template.split("\n");
      for(var i = 0; i < lines.length; i++) {
        lines[i] = lines[i].replace(regex, tag_replace_callback, this);
        if(!in_recursion) {
          this.send(lines[i]);
        }
      }

      if(in_recursion) {
        return lines.join("\n");
      }
    },

    set_delimiters: function(delimiters) {
      var dels = delimiters.split(" ");
      this.otag = this.escape_regex(dels[0]);
      this.ctag = this.escape_regex(dels[1]);
    },

    escape_regex: function(text) {
      // thank you Simon Willison
      if(!arguments.callee.sRE) {
        var specials = [
          '/', '.', '*', '+', '?', '|',
          '(', ')', '[', ']', '{', '}', '\\'
        ];
        arguments.callee.sRE = new RegExp(
          '(\\' + specials.join('|\\') + ')', 'g'
        );
      }
      return text.replace(arguments.callee.sRE, '\\$1');
    },

    /*
      find `name` in current `context`. That is find me a value
      from the view object
    */
    find: function(name, context) {
      name = this.trim(name);

      // Checks whether a value is thruthy or false or 0
      function is_kinda_truthy(bool) {
        return bool === false || bool === 0 || bool;
      }

      var value;
      if(is_kinda_truthy(context[name])) {
        value = context[name];
      } else if(is_kinda_truthy(this.context[name])) {
        value = this.context[name];
      }

      if(typeof value === "function") {
        return value.apply(context);
      }
      if(value !== undefined) {
        return value;
      }
      // silently ignore unkown variables
      return "";
    },

    // Utility methods

    /* includes tag */
    includes: function(needle, haystack) {
      return haystack.indexOf(this.otag + needle) != -1;
    },

    /*
      Does away with nasty characters
    */
    escape: function(s) {
      s = String(s === null ? "" : s);
      return s.replace(/&(?!\w+;)|["<>\\]/g, function(s) {
        switch(s) {
        case "&": return "&amp;";
        case "\\": return "\\\\";
        case '"': return '\"';
        case "<": return "&lt;";
        case ">": return "&gt;";
        default: return s;
        }
      });
    },

    // by @langalex, support for arrays of strings
    create_context: function(_context) {
      if(this.is_object(_context)) {
        return _context;
      } else {
        var iterator = ".";
        if(this.pragmas["IMPLICIT-ITERATOR"]) {
          iterator = this.pragmas["IMPLICIT-ITERATOR"].iterator;
        }
        var ctx = {};
        ctx[iterator] = _context;
        return ctx;
      }
    },

    is_object: function(a) {
      return a && typeof a == "object";
    },

    is_array: function(a) {
      return Object.prototype.toString.call(a) === '[object Array]';
    },

    /*
      Gets rid of leading and trailing whitespace
    */
    trim: function(s) {
      return s.replace(/^\s*|\s*$/g, "");
    },

    /*
      Why, why, why? Because IE. Cry, cry cry.
    */
    map: function(array, fn) {
      if (typeof array.map == "function") {
        return array.map(fn);
      } else {
        var r = [];
        var l = array.length;
        for(var i = 0; i < l; i++) {
          r.push(fn(array[i]));
        }
        return r;
      }
    }
  };

  return({
    name: "mustache.js",
    version: "0.3.1-dev",

    /*
      Turns a template and view into HTML
    */
    to_html: function(template, view, partials, send_fun) {
      var renderer = new Renderer();
      if(send_fun) {
        renderer.send = send_fun;
      }
      renderer.render(template, view, partials);
      if(!send_fun) {
        return renderer.buffer.join("\n");
      }
    }
  });
}();

(function($) {
  $.mustache = function(template, view, partials) {
    return Mustache.to_html(template, view, partials);
  };
})(jQuery);

