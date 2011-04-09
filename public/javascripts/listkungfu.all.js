// Global Application Object

var ListKungFu = {
	LayoutWest: $("#mainlayout-west"),
	LayoutNorth: $("#mainlayout-north"),
	LayoutEast: $("#mainlayout-east"),
	LayoutSouth: $("#mainlayout-south"),
	LayoutCenter: $("#mainlayout-center")
};

ListKungFu.TinyMceInitAutoFocus = function( instance ) {
	tinyMCE.execCommand( 'mceFocus', false, instance.editorId );
}

ListKungFu.TinyMCEDefaultOptions = {
	// General options
	theme : "advanced",
	plugins : "style,table,advhr,advimage,advlink,inlinepopups,searchreplace,print,contextmenu,paste,fullscreen,noneditable,nonbreaking,xhtmlxtras",

	// Theme options
	theme_advanced_buttons1 : "bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,|,styleselect,formatselect,fontselect,fontsizeselect",
	theme_advanced_buttons2 : "cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo,|,link,unlink,anchor,image,cleanup,code,|,forecolor,backcolor",
	theme_advanced_buttons3 : "tablecontrols,|,hr,removeformat,visualaid,|,sub,sup,|,cite,abbr,acronym|,advhr,|,print,|,fullscreen",
	theme_advanced_toolbar_location : "top",
	theme_advanced_toolbar_align : "left",
	theme_advanced_statusbar_location : "bottom",
	theme_advanced_resizing : false,
	init_instance_callback : ListKungFu.TinyMceInitAutoFocus,
	width:'100%',
	setup : function( ed ) {
		var altPressed = false;
		ed.onKeyUp.add(function(ed, e) {

			// 18 = alt
			if ( e.keyCode === 18 ) {
				altPressed = false;
				return false;
			}
		});
		ed.onKeyDown.add(function(ed, e) {

			// 27 = esc
			if (e.keyCode === 27 ) {
				ListKungFu.LayoutCenter.ListItemView( "CloseEditor" );
				return false;
			}

			// 18 = alt
			if ( e.keyCode === 18 ) {
				altPressed = true;
				return false;
			}

			// 83 = s
			if ( altPressed === true && e.keyCode === 83 ) {
				e.preventDefault();
				ListKungFu.LayoutCenter.ListItemView( "FocusElement", "saveButton" );
				return false;
			}
		});
	}

}

/*
	Helpers
*/


jQuery.expr[':'].Contains = function(a,i,m){
	return jQuery(a).text().toLowerCase().indexOf(m[3].toLowerCase()) >= 0;
};

jQuery.expr[':'].HasExactValue = function(a,i,m){
	return jQuery.trim(jQuery(a).text().toLowerCase()) === m[3].toLowerCase();
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
			maxSize: 72,
			minSize: 72
		},

		south: {
			minSize: 30
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
		},
		StartedDraggingListItem: function( event, data ) {
			ListKungFu.LayoutWest.ListView( "SetupDroppable", data.dragType );
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

	ListKungFu.LayoutWest.find( '#tags' ).TagView({
		StartedDraggingTag: function( event, data ) {
			ListKungFu.LayoutWest.ListView( "SetupDroppable", data.dragType );
		},
		AfterColorChanged: function( event, data ) {
			ListKungFu.LayoutWest.ListView( "ReloadLists" );
		},
		AfterTagDeleted: function( event, data ) {
			ListKungFu.LayoutWest.ListView( "ReloadLists" );
		},
		TagSelected: function( event, selectedTagsArray ) {
			ListKungFu.LayoutWest.ListView( "Filter", selectedTagsArray, null );
		}
	});

	ListKungFu.LayoutNorth.find( '#ultimate-search-widget' ).UltimateSearch({
		OnFilterChanged: function( event, filter ) {
			var filterDashboard = filter.searchOptions.searchDashboard;
			var filterLists = filter.searchOptions.searchLists;
			var filterListItems = filter.searchOptions.searchListItems;

			if ( filterDashboard ) {
				ListKungFu.LayoutCenter.Dashboard( "Filter", filter.searchText );
			}

			if ( filterLists ) {
				ListKungFu.LayoutWest.ListView( "Filter", null, filter.searchText );
			}

			if ( filterListItems ) {
				ListKungFu.LayoutCenter.ListItemView( "Filter", filter.searchText );
			}
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
			beforeSend: function( xhr )
			{
				xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
			},
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
			beforeSend: function( xhr )
			{
				xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
			},
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
			beforeSend: function( xhr )
			{
				xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
			},
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
			beforeSend: function( xhr )
			{
				xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
			},
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
			beforeSend: function( xhr )
			{
				xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
			},
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
				xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
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
				xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
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
});

var Tag = Controller({
	route: [ "tags" ],
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

	$.confirmationDialog = function( confButtonText, confButtonFunction, cancelButtonText, confirmationText, cancelButtonFunction ) {

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
			if ( typeof( cancelButtonFunction ) === 'function' ) {
				cancelButtonFunction();
			}
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
	var Dashboard = {

		/**
		*
		* Private Functions Start
		*
		**/

		_TriggerResize: function() {
			this._trigger("ContentDimensionsChanged", 0, {} );
		},

		_NothingToDoText: function() {
			return '<p class="nothing-todo">no items scheduled</p>';
		},

		_TriggerReinitOfPanes: function() {
			this._trigger("ReinitPanes", 0, {} );
		},

		_SetupCustomDeadlinePicker: function( listItemDom ) {
			var widget = this;
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
										parent.append( widget._NothingToDoText() );
									}
								});
								widget._CreateDashboardItem( json, template, {
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
		},

		_AppendToDashboard: function( target, item, options ) {
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
		},

		_CreateDashboardItem: function( listItem, template, options ) {
			var widget = this;

			var $listItemHtml = $( $.mustache( template, listItem.list_item ) );

			switch( listItem.list_item.deadline_category ) {
				case 'today':
					widget._AppendToDashboard( widget.today, $listItemHtml, options );
					break;
				case 'tomorrow':
					widget._AppendToDashboard( widget.tomorrow, $listItemHtml, options );
					break;
				case 'this week':
					widget._AppendToDashboard( widget.thisweek, $listItemHtml, options );
					break;
				case 'next week':
					widget._AppendToDashboard( widget.nextweek, $listItemHtml, options );
					break;
				default:
					widget._AppendToDashboard( widget.later, $listItemHtml, options );
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

			$listItemHtml.find( '.full-content' ).bind( 'dblclick', function(){
				widget._trigger( "OpenList", 0, { selectedList: listItem.list_item } );
			});

			$listItemHtml.find( '.shortend-content' ).bind( 'dblclick', function(){
				widget._trigger( "OpenList", 0, { selectedList: listItem.list_item } );
			});

			$listItemHtml.find( '.full-content' ).bind( 'click', function( e ) {
				$(this).hide();
				$listItemHtml.find( '.shortend-content' ).show();
			});

			$listItemHtml.find( '.shortend-content' ).bind( 'click', function( e ) {
				$(this).hide();
				$listItemHtml.find( '.full-content' ).show();
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

			widget._SetupCustomDeadlinePicker( $listItemHtml );

			$listItemHtml.find( '.dashboard-list-item-deadline' ).bind( 'click', function(){
				$listItemHtml.find( '.dashboard-list-item-deadline' ).parent().find( '.dashboard-list-item-deadline-hidden' ).datepicker( "show" );
			});

			return $listItemHtml;
		},

		_Filter: function() {
			var widget = this;
			var filtervalue = widget.selectedText;

      if ( filtervalue === '' ) {
				widget.wrapper.find( ".dashboard-item" ).show();
      } else {
				widget.wrapper.find( ".dashboard-item:not(:Contains('" + filtervalue + "'))").hide();
				widget.wrapper.find( ".dashboard-item:Contains('" + filtervalue + "')").show();
      }
		},

		_create: function() {
		},
		/**
		*
		* Private Functions End
		*
		**/

		/**
		*
		* Options Start
		*
		**/
		options: {

		},
		/**
		*
		* Options End
		*
		**/

		/**
		*
		* Public Functions Start
		*
		**/
		Show: function() {
			var widget = this;
			widget.Hide();

			widget.header = $( '<div id="dashboard-header" class="header"><h1>Dashboard</h1></div>')
			widget.wrapper = $( '<div class="ui-layout-content" id="dashboard-view"></div>' );
			widget.today = $( '<div id="today" class="schedule-column"><h1>Today</h1><div data-type="scheduleColumn"></div></div>' );
			widget.tomorrow = $( '<div id="tomorrow" class="schedule-column"><h1>Tomorrow</h1><div data-type="scheduleColumn"></div></div>' );
			widget.thisweek = $( '<div id="thisweek" class="schedule-column"><h1>This Week</h1><div data-type="scheduleColumn"></div></div>' );
			widget.nextweek = $( '<div id="nextweek" class="schedule-column"><h1>Next Week</h1><div data-type="scheduleColumn"></div></div>' );
			widget.later = $( '<div id="later"><h1>Later</h1><div data-type="scheduleColumn"></div></div>' );

			widget.element.append( widget.header );
			widget.element.append( widget.wrapper );

			widget.wrapper.append( widget.today );
			widget.wrapper.append( widget.tomorrow );
			widget.wrapper.append( widget.thisweek );
			widget.wrapper.append( widget.nextweek );
			widget.nextweek.append( widget.later );
			widget.wrapper.append( '<div style="clear:both;">&nbsp;</div>' );



			// Load scheduled items
			ListItem.Index( {
				successCallback: function( template, json, status, xhr, errors ) {

					$.each( json, function( index, listItem ) {
						widget._CreateDashboardItem( listItem, template );
					});

					$( 'div[data-type="scheduleColumn"]' ).each(function(){
						if ( $( this ).children( '.dashboard-item' ).length === 0 ) {
							$( this ).append( widget._NothingToDoText() );
						}
					});

					widget._TriggerReinitOfPanes();
					widget._TriggerResize();
				},
				send: { show: "dashboard" }
			});
		},

		Hide: function() {
			this.element.children().remove();
		},

		destroy: function() {
		},

		Filter: function( selectedText ) {
			this.selectedText = selectedText;
			this._Filter();
		}
		/**
		*
		* Public Functions End
		*
		**/
	};
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
	var ListItemView = {

		/**
		*
		* Private Functions Start
		*
		**/

		_SetSelectedListItem: function( elem, obj ) {
			this.selectedListItem = {
				element: elem,
				data: obj
			};
		},

		_Filter: function() {
			var widget = this;
			var filtervalue = widget.selectedText;

      if ( filtervalue === '' ) {
				widget.listItemList.find( ".row" ).show();
      } else {
				widget.listItemList.find( ".row:not(:Contains('" + filtervalue + "'))").hide();
				widget.listItemList.find( ".row:Contains('" + filtervalue + "')").show();
      }
		},

		_SetupDeadlineButton: function( $parentItem ) {
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
		},

		_SetupCustomDeadlinePicker: function() {
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
		},

		_TriggerReinitOfPanes: function() {
			this._trigger("ReinitPanes", 0, {} );
		},

		_TriggerResize: function() {
			this._trigger("ContentDimensionsChanged", 0, {} );
		},

		_AddListItem: function( listItem, template, isFirst ) {
			var widget = this;

			var newElement = $( $.mustache( template, listItem.list_item ) );
			newElement.data( "data", listItem );

			if ( isFirst ) {
				widget.listItemList.prepend(newElement);
			} else {
				widget.listItemList.append(newElement);
			}

			newElement.find( ".handle" ).height( newElement.height() );

			newElement.bind( 'keyup', 'space', function( e ){
				widget.toolbar.find( "#list-item-completed" ).effect('puff', {}, 300, function(){
					$( this ).show();

					if ( newElement.find( ".undo" ).length === 0 ) {
						widget.toolbar.find( "#list-item-completed" ).trigger( "click" );
					} else {
						newElement.find( ".undo" ).trigger( "click" );
					}
				});
				return false;
			});

			newElement.bind( 'keydown', 'del', function(){
				widget.toolbar.find( "#list-item-delete" ).effect('puff', {}, 300, function(){
					$( this ).show();
					widget.toolbar.find( "#list-item-delete" ).trigger( 'click' );
				});
				return false;
			});

			newElement.bind( 'focus', function( e ) {

				if ( $( e.target ).hasClass( 'row' ) ) {

					// remove selection from all rows
					widget.listItemList.find('.row').removeClass('selected-row');

					// add it to the selected row.
					$( e.target ).addClass('selected-row');

					var data = $( e.target ).data( "data" );

					widget._SetSelectedListItem( $( e.target ), data );

				}
			});

			if ( $.browser.msie ) {

				// disable ability to select text
				newElement.get( 0 ).onselectstart = function () { return false; };

				newElement.bind( 'click', function() {
					newElement.focus();
					return false;
				});
			}

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

			newElement.bind( 'keydown', 'e', function(){
				newElement.trigger( 'edit' );
			});

			newElement.bind( 'beforeEdit', function(){
				// hide all rows
				widget.listItemList.find( '.row' ).hide();

				// show only the row which the user wants to edit
				widget.selectedListItem.element.show();

				// hide content of selected list item
				widget.selectedListItem.element.find( ".list-item-content" ).hide();
				widget.selectedListItem.element.find( '.list-item-info' ).hide();

				// remove select-row class; will be added again automatically
				// once element gets back focus
				widget.selectedListItem.element.removeClass( "selected-row" );

				// hide drag and drop handle
				widget.selectedListItem.element.find( ".handle" ).hide();
			});

			newElement.bind( 'afterEdit', function( e, json ) {
				// show drag and drop handle
				widget.selectedListItem.element.find( ".handle" ).show();

				if ( json ) {
					// update list item content
					newElement.find( '.list-item-content' ).html( json.list_item.body );

					// update deadline
					newElement.find( '.list-item-deadline' ).html( json.list_item.deadline_in_words );

					widget._SetSelectedListItem( newElement, json );
					newElement.data( "data", json );
				}

				// correct height of drag and drop handle
				newElement.find( ".handle" ).height( newElement.find( '.list-item-content' ).height() );

				newElement.find( '.list-item-content' ).show();
				newElement.find( '.list-item-info' ).show();

				// show all the rows again (considering the filter of cause)
				widget._Filter();
				widget._CorrectHeight( newElement );
				newElement.focus();
			});

			newElement.bind( 'edit', function(){
				// if we display already the form for this element,
				// just exit.
				if ( newElement.find( "form" ).length > 0 ) {
					return false;
				}

				widget.toolbar.find( "#list-item-edit" ).effect('puff', {}, 300, function(){
					$( this ).show();
				});

				// close all open forms
				//widget.listItemList.find( ".row" ).find( "form" ).remove();
				widget.listItemList.find( ".row" ).ListItemEdit( "destroy" );

				widget.selectedListItem.element.ListItemEdit({
					height: widget.element.find( "#list-item-wrapper" ).height() - 110,
					listId: widget.selectedListItem.data.list_item.list_id,
					listItemId: widget.selectedListItem.data.list_item.id
				});



			});

			newElement.bind( 'keydown', 'left', function( e ){
				widget._trigger( "SelectLastList", 0, {} );
			});

			newElement.bind( 'keydown', 'shift+return', function( e ){
				widget.toolbar.find( "#list-item-new" ).effect('puff', {}, 300, function(){
					$( this ).show();
					widget._AddNewListItem();
				});
			});

			newElement.bind( 'keydown', 'return', function(){
				newElement.trigger( 'show' );
				return false;
			});

			newElement.bind( 'dblclick', function(){
				newElement.trigger( 'show' );
				return false;
			});

			newElement.bind( 'show', function(){
				var anchor = widget.element;
				var listItem = widget.selectedListItem.data;

				// remove the list item view.
				widget.RemoveList();

				// show single list item.
				anchor.ListItemShow( {
					listItem: listItem
				});

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

						widget._trigger( "StartedDraggingListItem", 0, { dragType: "listitem" } );
					},
					stop: function ( event, ui ) {
						document.onselectstart = null;
					}
				});
			}

			widget._CorrectHeight( newElement );
		},

		_CorrectHeight: function( element ) {
			var widget = this;
			if ( element.height() > 150 ) {
				element.height( 150 );
			} else {
				element.height( "auto" );
			}
			widget._TriggerResize();
		},

		_DeleteListItem: function( element, listItem ) {
			var widget = this;
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
					});
				},
				lists: listItem.list_item.list_id,
				list_items: listItem.list_item.id
			});
		},

		_MarkCompleted: function( element, listItem ) {
			var widget = this;
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
							widget._MarkUncompleted( element, listItem, queueName );
						});

						element.append( $undo );

						widget._CorrectHeight( element );

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
							widget._ToggleCompleted( true );
						}

						// select list item
						element.focus();
					});

				},
				lists: listItem.list_item.list_id,
				list_items: listItem.list_item.id,
				send: listItem
			});
		},

		_MarkUncompleted: function( element, listItem, queueName ) {
			var widget = this;
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
						widget._CorrectHeight( element );
					});

					// in case completed items are displayed, update them:
					if ( widget.toolbar && widget.toolbar.find( "#showCompleted" ).get( 0 ).
						checked === true ) {
						widget._ToggleCompleted( true );
					}

					widget._Filter();
				},
				lists: listItem.list_item.list_id,
				list_items: listItem.list_item.id,
				send: listItem
			});
		},

		_ToggleCompleted: function(  doShow ) {
			var widget = this;
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
							widget.completedList.append("<div>" + listItem.list_item.body + "</div>");
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
		},

		_CreateToolbar: function() {
			var widget = this;
			// empty header
			widget.header.html("");

			// build new header
		 	var toolbarArr = ['<div id="list-item-toolbar">',
				'<div id="list-title"></div><div id="list-item-toolbar-buttons">',
				'<button id="list-item-completed">Completed [space]</button>',
				'<button id="list-item-new">Create [shift+return]</button>',
				'<button id="list-item-delete">Delete [del]</button>',
				'<button id="list-item-edit">Edit [return]</button>',
				'<input type="checkbox" id="showCompleted"/>',
				'<label for="showCompleted">Show Completed Items</label>',
				'</div></div>'];

			widget.toolbar = $( toolbarArr.join('') );

			widget.listName = widget.toolbar.find( "#list-title" );

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

			// bind events

			widget.toolbar.find( "#list-item-new" ).bind( 'click', function( e ){
				widget._AddNewListItem();
			});

			widget.toolbar.find( "#showCompleted" ).bind( "change", function( e ){
				widget._ToggleCompleted( e.target.checked );
				widget.selectedListItem.element.focus();
			});

			widget.toolbar.find( "#list-item-completed" ).bind( 'click', function( e ) {
				var data = widget.selectedListItem.data;
				var $element = widget.selectedListItem.element;

				widget._MarkCompleted( $element, data );
			});

			widget.toolbar.find( "#list-item-delete" ).bind( 'click', function( e ) {

				var deleteFunc = function() {
					widget._DeleteListItem( widget.selectedListItem.element, widget.selectedListItem.data );
				};

				if ( typeof( widget.deleteDialog ) === 'undefined' ) {
					widget.deleteDialog = $.confirmationDialog( "Delete List Item", deleteFunc, "Cancel"
						, "Do you really want to delete?" );
				}

				widget.deleteDialog.dialog("open");
			});

			widget.toolbar.find( "#list-item-edit" ).bind( 'click', function( e ) {
				widget.selectedListItem.element.trigger( 'edit' );
			});

			widget.header.append( widget.toolbar );
		},

		_AddNewListItem: function() {
			var widget = this;
			var data = widget.element.data( "data-list" );

			// only show one "new list item" form
			if ( widget.listItemList.find( '#new_list_item' ).length > 0 ) {
				return false;
			}

			ListListItem.New( {
				successCallback: function( template, json, status, xhr, errors ) {
					if ( $.browser.msie && widget.listItemList.find( '#new_list_item' ).length > 0 ) {
						return false;
					}

					var $form = $( template );
					widget.listItemList.prepend( $form );

					widget._SetupDeadlineButton( $form );
					widget._SetupCustomDeadlinePicker();

					var mySettings = ListKungFu.TinyMCEDefaultOptions;
					mySettings.height = widget.listItemList.parent( "#list-item-wrapper" ).height() - 150;

					$form.find( "textarea.editorarea" ).tinymce( mySettings );

					// hide existing rows when adding new item
					widget.listItemList.find( '.row' ).hide();

					$form.find( "#cancel-edit" ).bind( 'click', function( e ){
						e.preventDefault();
						$form.hide( 'slow', function(){
							$( this ).remove();
							widget.listItemList.find( '.row' ).show();
							widget.listItemList.find( '.row' ).first().focus();

							// msie needs the click for focusing the element
							if ( $.browser.msie ) {
								widget.listItemList.find( '.row' ).first().click();
							}
						});
					});

					$form.find( ".deadline-button" ).bind( 'click', function( e ) {
						e.preventDefault();
						var serializedForm = $form.serializeForm();

						// add deadline indicator based on deadline type
						serializedForm.list_item.deadlineType = $( e.target ).attr( 'data-deadline' );
						serializedForm.list_item.customDeadlineValue = $( '#custom-deadline-value' ).val();

						ListListItem.Create({
							send: serializedForm,
							successCallback: function( template, json, status, xhr, errors ) {
								$form.hide( 'slow', function(){
									widget._AddListItem( json, template, true );
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

				},
				lists: data.list.id
			} );
		},

		_create: function() {
			var widget = this;

			widget.wrapper = $( '<div class="ui-layout-content" id="list-item-wrapper"></div>' );
			widget.listItemList = $( '<div id="list-item-list"></div>');
			widget.header = $( '<div class="list-item-header"></div>' );

			widget.element.append( widget.header );
			widget.element.append( widget.wrapper );
			widget.wrapper.append( widget.listItemList );

			widget.selectedText = '';

			widget._TriggerResize();

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
		/**
		*
		* Private Functions End
		*
		**/

		/**
		*
		* Options Start
		*
		**/
		options: {

		},
		/**
		*
		* Options End
		*
		**/

		/**
		*
		* Public Functions Start
		*
		**/
		RemoveList: function() {
			var widget = this;

			// remove elements
			widget.element.children().remove();

			// unbind global events
			$( document ).unbind( "keydown" , "c" )
									 .unbind( "keyup", "f" );
		},

		destroy: function() {
			var widget = this;

			// remove elements
			widget.element.children().remove();

			// unbind global events
			$( document ).unbind( "keydown" , "c" )
				.unbind( "keyup", "f" );
		},

		OpenList: function( data ) {
			var widget = this;
			widget.RemoveList();
			widget.element.ListItemShow( "destroy" );

			widget._create();

			widget.element.data( "data-list", data );
			widget.selectedListItem = null;

			ListListItem.Index( {
				successCallback: function( template, json, status, xhr, errors ) {
					widget._CreateToolbar();

					$.each( json, function( index, listItem ) {
						widget._AddListItem( listItem, template )
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
					}

					if ( widget.listItemList.find( '.row' ).length === 0 ) {
						widget._AddNewListItem();
					}

					// set list name
					widget.listName.text( data.list.title );
				},
				lists: data.list.id
			});

			widget._TriggerReinitOfPanes();
		},

		SelectListItem: function() {
			var widget = this;
			var effect = "highlight";

			if ( widget.selectedListItem ) {
				widget.selectedListItem.element.effect( effect, {}, 300 ).focus();
			} else {
				widget.listItemList.find( '.row' ).first().effect( effect, {}, 300 ).focus();
			}
		},

		Filter: function( selectedText ) {
			this.selectedText = selectedText;
			this._Filter();
		},

		FocusElement: function( element ) {
			switch( element ) {
				case "saveButton":
					$( "#save-whenever" ).focus(); // new dialog
					$( "#keepit" ).focus(); // edit dialog
					break;
			}
		},

		CloseEditor: function() {
			$( "#cancel-edit" ).click();
		}
		/**
		*
		* Public Functions End
		*
		**/

	};
	// register widget
	$.widget("ui.ListItemView", ListItemView);
})();
(function(){
	var ListView = {

		/**
		*
		* Private Functions Start
		*
		**/

		_ReplaceList: function( oldElement, data, template ) {
			var widget = this;

			var ele = widget._GetListElement( data, template );
			oldElement.replaceWith( ele );
			widget._AdjustHeight();
			widget._triggerResize();
			ele.focus();
		},

		_DroppableConfigTags: function() {
			var widget = this;

			return {
				activeClass: "ui-state-default",
				hoverClass: "ui-state-hover",
				accept: ".tag",
				drop: function( event, ui ) {
					var listElement = $( this );
					if ( listElement.position().top < widget.wrapper.height() ) {
						var tagData = ui.draggable.data( 'data' );
						var listData = listElement.data( 'data' );

						listData.list.tag_id = tagData.tag.id;

						List.Update({

							send: listData,
							successCallback: function( template, json, status, xhr, errors ){
								widget._ReplaceList( listElement, json, template );
							},
							lists: listData.list.id
						});
					}
				}
			}
		},

		_DroppableConfigListItems: function( newElement ) {
			var widget = this;

			return {
				activeClass: "ui-state-default",
				hoverClass: "ui-state-hover",
				accept: ".list-item",
				drop: function( event, ui ) {
					if ( $(this).position().top < widget.wrapper.height() ) {
						var originalListItem = ui.draggable.data( "data" );
						var dropList = $( this ).data( "data" );

						ListListItem.Create({
							send: originalListItem,
							successCallback: function( template, json, status, xhr, errors ) {

								$( event.target ).find(".fake-drop").remove();
								$( event.target ).find(".list-name").show();
								$( event.target ).find(".list-tag").show();
								newElement.effect( 'highlight', {}, 3000 );
							},
							lists: dropList.list.id
						});
					}
				},
				over: function(event, ui) {
					$( event.target ).find(".list-name").hide();
					$( event.target ).find(".list-tag").hide();

					var wrapper = $('<div class="fake-drop"></div>');
					wrapper.html( '<p>' + ui.helper.text() + '</p>' );
					$(event.target).append( wrapper );
				},
				out: function( event, ui ) {
					$(event.target).find(".fake-drop").remove();
					$( event.target ).find(".list-name").show();
					$( event.target ).find(".list-tag").show();
				}

			};
		},

		_IsNewList: function( element ) {
			var widget = this;

			if ( widget.selectedList === null || widget.selectedList.data.list.id !== element.list.id ) {
				return true;
			} else {
				return false;
			}
		},

		_HighlightFormErrors: function( form, errors ) {
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
		},

		_ClearFormErrors: function( form ) {
			form.find( ".field" ).removeClass( "field_with_errors" );
			form.find( ".error_explanation" ).remove();
		},

		_DeleteList: function( delay ) {
			var widget = this;

			var nextItem = widget.selectedList.element.next();
			var prevItem = widget.selectedList.element.prev();
			delay = delay || 0;

			List.Destroy({
				successCallback: function( template, json, status, xhr, errors ){
					widget.selectedList.element.delay( delay ).fadeOut(function(){
						$(this).remove();
						nextItem.length > 0 ? nextItem.focus() : prevItem.focus();
						widget._ToggleEmptyListImage();
					});
					widget._trigger( "CloseList", 0, {} );
				},
				lists: widget.selectedList.data.list.id
			});
		},

		_CreateToolbar: function() {
			var widget = this;

			var toolbarArr = ['<div id="list-toolbar">',
				'<button id="list-new">Create [shift+return]</button>',
				'<button id="list-delete">Delete [del]</button>',
				'<button id="list-edit">Edit [space]</button>',
				'</div>'];

			var toolbar = $( toolbarArr.join('') );

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

			toolbar.find("#list-delete").bind('click', function( e ) {
				if ( widget.selectedList !== null ) {


					if ( typeof(widget.deleteDialog) === 'undefined' ) {
						var deleteFunc = function() {
							if ( widget.listForm !== null ) {
								widget.listForm.bind( "FormHidden", function() {
									widget._DeleteList( 1000 );
								});
								widget._HideForm();
							} else {
								widget._DeleteList();
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

			toolbar.find("#list-new").bind('click', function( e ) {

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
							widget.emptyListImage.hide();
							widget.listForm.append( template );
							widget.listForm.show('slide', { direction: 'left' }, 'slow', function(){
								widget.listForm.find('#list_title').first().focus();
							});

							widget._trigger( "CloseList", 0, {} );

							widget.listForm.find( "#list-back-button" ).bind( 'click', function(){
								widget._HideForm();
							});

							widget.listForm.find( '#list_title' ).bind( 'keydown', 'esc', function( e ) {
								widget._HideForm();
							});

							widget.listForm.bind( "submit", function( e ){
								e.preventDefault();

								var data = json;
								var serializedForm = $(this).find("form").serializeForm();
								json.list = serializedForm.list;

								List.Create({
									send: data,
									successCallback: function( template, json, status, xhr, errors ) {
										widget._ClearFormErrors( widget.listForm );

										if ( errors === false ) {
											widget._HideForm( json, template );
										} else {
											widget._HighlightFormErrors( widget.listForm, errors );
										}
									}
								});
								return false;
							});

							widget.selectedList = null;
						}
					});
				});


				$( e.target ).blur();
				return false;
			});


			toolbar.find( "#list-edit" ).bind( 'click', function( e ) {
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
								widget._HideForm();
								return false;
							});

							widget.listForm.find( '#list_title' ).bind( 'keydown', 'esc', function( e ) {
								widget._HideForm();
								return false;
							});

							widget.listForm.bind( "submit", function(e){
								e.preventDefault();

								var serializedForm = $(this).find("form").serializeForm();

								List.Update({

									send: serializedForm,
									successCallback: function( template, json, status, xhr, errors ){
										widget._ClearFormErrors( widget.listForm );

										if ( errors === false ) {
											widget._HideForm( json, template );
										} else {
											widget._HighlightFormErrors( widget.listForm, errors );
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
		},

		_GetListElement: function( data, template ) {
			var widget = this;

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


			if ( $.browser.msie ) {
				// disable ability to select text
				newElement.get( 0 ).onselectstart = function () { return false; };

				newElement.bind( 'click', function(){
					newElement.focus();
					return false;
				});
			}

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

			newElement.bind('focus', function(e){
				var target = $( e.target );

				widget.selectedList = {
					element: target,
					data: target.data("data")
				};

				// remove selection from all rows
				widget.listlist.find('.row').removeClass('selected-row');

				// add it to the selected row.
				target.addClass('selected-row');

				// show tags of selected list and hide tags of all the others
				widget.listlist.find( '.assigned-tags' ).hide();
				target.find( '.assigned-tags' ).show();
				widget._AdjustHeight();
			});

			newElement.bind( 'keydown dblclick', 'return', function(){
				widget._trigger( "OpenList", 0, { selectedList: newElement.data("data") } );
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

			newElement.bind( 'keydown', 'del', function(e){
				widget.toolbar.find( "#list-delete" ).effect('puff', {}, 300, function(){
					$(this).show();
				}).trigger('click');
			});

			newElement.bind( 'keydown', 'e', function(){
				widget.toolbar.find( "#list-edit" ).effect('puff', {}, 300, function(){
					$(this).show();
					$(this).trigger('click') });
				return false;
			});

			newElement.droppable( widget._DroppableConfigListItems( newElement ) );

			newElement.find( '.assigned-tag-delete' ).bind( 'click', function( e ){
				var tagElement = $( e.target ).parent( '.assigned-tag' );
				var tagId = tagElement.attr( 'data-id' );
				var listData = newElement.data( 'data' );

				listData.list.tag_id = tagId;
				listData.list.tag_action = 'remove';

				List.Update({

					send: listData,
					successCallback: function( template, json, status, xhr, errors ){
						tagElement.hide( 'slow', function(){
							tagElement.remove();
							widget._ReplaceList( newElement, json, template );

							// rerun tag filter
							widget._Filter();
						});
					},
					lists: listData.list.id
				});
			});

			newElement.find( '.assigned-tags' ).hide();
			return newElement;
		},

		_triggerResize: function() {
			var widget = this;
			widget._trigger("ContentDimensionsChanged", 0, {} );
		},

		_AdjustHeight: function() {
			var widget = this;
			widget.listlist.find( '.row' ).each(function(){
				var that = $(this);
				var listTag = that.find( ".list-tag" );
				var listName = that.find( ".list-name" );

				listTag.height( listName.height() + 10 + "px" );
			});
		},

		_AddListToDOM: function( data, template ) {
			var widget = this;

			widget.listlist = $( '<div id="list-list"></div>' );
			widget.wrapper.append( widget.listlist );
			var toolbar = widget.toolbar;

			for ( var i = 0; i < data.length; i++ ) {
				widget.listlist.append( widget._GetListElement( data[ i ], template ) ) ;
			}
			widget._AdjustHeight();
			widget._triggerResize();
		},

		_SelectLastList: function() {
			var widget = this;
			var effect = "highlight";

			if ( widget.selectedList ) {
				widget.selectedList.element.effect( effect, {}, 300 ).show().focus();
			} else {
				widget.listlist.find( '.row' ).first().effect( effect, {}, 300 ).show().focus();
			}
		},

		_RegisterGlobalKeyboardShortcuts: function() {
			var widget = this;

			// select list
			$(document).bind( 'keydown', 'ctrl+l', function(e) {
				widget._SelectLastList();
			});
		},

		_ShowListView: function( updatedElement, template ) {
			var widget = this;

			widget.listlist.show( 'slide', { direction: 'left'}, 'slow', function(){
				if ( updatedElement ) {

					var newElement = widget._GetListElement( updatedElement, template );

					if ( widget._IsNewList( updatedElement ) ) {
						widget.listlist.prepend( newElement );
					} else {
						widget.selectedList.element.replaceWith( newElement );
					}

					widget._AdjustHeight();
					widget._ToggleEmptyListImage();

					widget.selectedList =  {
						data: updatedElement,
						element: newElement
					};
				}
				if ( widget.selectedList ) {
					widget.selectedList.element.focus();
				}
			});

		},

		_HideForm: function( updatedElement, template ) {
			var widget = this;

			widget.listForm.hide('slide', { direction: 'left' }, 'slow', function(){
				widget._ShowListView( updatedElement, template );
				widget.listForm.trigger( "FormHidden" );
				widget._ToggleEmptyListImage();
				if ( widget.selectedList ) {
					widget.selectedList.element.focus();
				} else {
					widget.listlist.find( '.row' ).first().focus();
				}
				widget.listForm.remove();
				widget.listForm = null;
			});
		},

		_Filter: function() {
			this._FilterBySearchText();
			this._FilterByTags();
		},

		_FilterBySearchText: function() {
			var widget = this;
			var filtervalue = widget.selectedText;

			widget.listlist.find( ".row" ).show();

      if ( filtervalue ) {
				widget.listlist.find( ".row:visible:not(:Contains('" + filtervalue + "'))").hide();
				widget.listlist.find( ".row:visible:Contains('" + filtervalue + "')").show();
      }
			widget._AdjustHeight();
			widget._triggerResize();
		},

		_FilterByTags: function() {
			var widget = this;

			widget.listlist.find( '.row:visible' ).each(function(){
				var that = $(this);
				var data = that.data( 'data' );
				var tagsFound = 0;

				if ( widget.selectedTags.length > 0 ) {
					for ( var i = 0; i < data.list.tags.length; i++ ) {
						for ( var j = 0; j < widget.selectedTags.length; j++ ){
							if ( widget.selectedTags[ j ] === data.list.tags[ i ].id ) {
								tagsFound++;
							}
						}
					}

					if ( tagsFound === widget.selectedTags.length ) {
						that.show();
					} else {
						that.hide();
					}
				}
			});
		},

		_create: function() {
			var widget = this;
			widget.selectedList = null;
			widget.wrapper = widget.element.find('div#list-wrapper');
			widget.toolbar = widget._CreateToolbar();
			widget.listForm = null;
			widget.selectedTags = [];

			var date = new Date();
			var seconds = Date.UTC( date.getFullYear(), date.getMonth(), date.getDay(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());

			widget.emptyListImage = $('<img src="/images/empty/list.jpg?' + seconds + '"/>');
			widget.emptyListImage.css({
				position: 'absolute',
				top: '45px',
				left:'15px'
			});
			widget.emptyListImage.hide();
			widget.toolbar.append( widget.emptyListImage );

			// retrieve Lists from server and add them to DOM.
			List.Index( {
				successCallback: function( template, json, status, xhr, errors ) {

					// remove all existing rows
					widget.wrapper.find(".row").remove();

					// add newly received Lists to DOM
					widget._AddListToDOM( json, template );

					// check if there are any lists. If not, show a help screen.
					// Otherwise select the first row.
					widget._ToggleEmptyListImage();
				}


			} );

			// register global keyboard shortcuts
			widget._RegisterGlobalKeyboardShortcuts();
		},

		_ToggleEmptyListImage: function() {
			var widget = this;
			if ( widget.listlist.find( '.row' ).length > 0 ) {
				widget.emptyListImage.hide();
				widget.listlist.find( '.row' ).first().focus();
			} else {
				widget.emptyListImage.show();
			}
		},

		/**
		*
		* Private Functions End
		*
		**/

		/**
		*
		* Default Options Start
		*
		**/
		options: {

		},
		/**
		*
		* Default Options End
		*
		**/

		/**
		*
		* Public Functions Start
		*
		**/

		SetupDroppable: function( dragType ) {
			var widget = this;

			widget.listlist.find( '.row' ).each( function(){
				var list = $(this)
				list.droppable( "destroy" );
				switch( dragType ) {
				case 'listitem':
					list.droppable( widget._DroppableConfigListItems( list ) );
					break;
				case 'tag':
					list.droppable( widget._DroppableConfigTags() );
					break;
				}

			});
		},

		ReloadLists: function() {
			var widget = this;

			List.Index( {
				successCallback: function( template, json, status, xhr, errors ) {

					// remove all existing rows
					widget.wrapper.find(".row").remove();

					// add newly received Lists to DOM
					widget._AddListToDOM( json, template );
					widget._Filter();

					widget._ToggleEmptyListImage();
				}
			} );
		},

		SelectList: function() {
			this._SelectLastList();
		},

		Filter: function( selectedTagsArray, selectedText ) {
			if ( selectedTagsArray ) {
				this.selectedTags = selectedTagsArray;
			}

			if ( !( selectedText == null || typeof( selectedText ) === 'undefined' ) ) {
				this.selectedText = selectedText;
			}
			this._Filter();
		},

		destroy: function() {
			var widget = this;
			widget.toolbar.remove();
			widget.listForm.remove();
			widget.wrapper.find(".row").remove();
		}
		/**
		*
		* Public Functions End
		*
		**/

	};


	// register widget
	$.widget("ui.ListView", ListView);
})();(function( $ ) {

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
	var StatusBar = {

		options: {
		},

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

			widget.notice.text( notice )
								   .fadeIn()
								   .delay( 2000 )
								   .fadeOut(function(){
				$(this).text("");
			});
		},

		SetAlert: function( alert ) {
			var widget = this;

			widget.alert.text( alert );
			widget.alert.fadeIn().delay( 2000 ).fadeOut(function(){
				$(this).text("");
			});
		},

		destroy: function() {
			widget.ajaxLoader.remove();
			widget.notice.remove();
			widget.alert.remove();
		}
	};
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

/*
 * jquery.layout 1.2.0
 *
 * Copyright (c) 2008 
 *   Fabrizio Balliano (http://www.fabrizioballiano.net)
 *   Kevin Dalman (http://allpro.net)
 *
 * Dual licensed under the GPL (http://www.gnu.org/licenses/gpl.html)
 * and MIT (http://www.opensource.org/licenses/mit-license.php) licenses.
 *
 * $Date: 2008-12-27 02:17:22 +0100 (sab, 27 dic 2008) $
 * $Rev: 203 $
 * 
 * NOTE: For best code readability, view this with a fixed-space font and tabs equal to 4-chars
 */
(function($) {

$.fn.layout = function (opts) {

/*
 * ###########################
 *   WIDGET CONFIG & OPTIONS
 * ###########################
 */

	// DEFAULTS for options
	var 
		prefix = "ui-layout-" // prefix for ALL selectors and classNames
	,	defaults = { //	misc default values
			paneClass:				prefix+"pane"		// ui-layout-pane
		,	resizerClass:			prefix+"resizer"	// ui-layout-resizer
		,	togglerClass:			prefix+"toggler"	// ui-layout-toggler
		,	togglerInnerClass:		prefix+""			// ui-layout-open / ui-layout-closed
		,	buttonClass:			prefix+"button"		// ui-layout-button
		,	contentSelector:		"."+prefix+"content"// ui-layout-content
		,	contentIgnoreSelector:	"."+prefix+"ignore"	// ui-layout-mask 
		}
	;

	// DEFAULT PANEL OPTIONS - CHANGE IF DESIRED
	var options = {
		name:						""			// FUTURE REFERENCE - not used right now
	,	scrollToBookmarkOnLoad:		true		// after creating a layout, scroll to bookmark in URL (.../page.htm#myBookmark)
	,	defaults: { // default options for 'all panes' - will be overridden by 'per-pane settings'
			applyDefaultStyles: 	false		// apply basic styles directly to resizers & buttons? If not, then stylesheet must handle it
		,	closable:				true		// pane can open & close
		,	resizable:				true		// when open, pane can be resized 
		,	slidable:				true		// when closed, pane can 'slide' open over other panes - closes on mouse-out
		//,	paneSelector:			[ ]			// MUST be pane-specific!
		,	contentSelector:		defaults.contentSelector	// INNER div/element to auto-size so only it scrolls, not the entire pane!
		,	contentIgnoreSelector:	defaults.contentIgnoreSelector	// elem(s) to 'ignore' when measuring 'content'
		,	paneClass:				defaults.paneClass		// border-Pane - default: 'ui-layout-pane'
		,	resizerClass:			defaults.resizerClass	// Resizer Bar		- default: 'ui-layout-resizer'
		,	togglerClass:			defaults.togglerClass	// Toggler Button	- default: 'ui-layout-toggler'
		,	buttonClass:			defaults.buttonClass	// CUSTOM Buttons	- default: 'ui-layout-button-toggle/-open/-close/-pin'
		,	resizerDragOpacity:		1			// option for ui.draggable
		//,	resizerCursor:			""			// MUST be pane-specific - cursor when over resizer-bar
		,	maskIframesOnResize:	true		// true = all iframes OR = iframe-selector(s) - adds masking-div during resizing/dragging
		//,	size:					100			// inital size of pane - defaults are set 'per pane'
		,	minSize:				0			// when manually resizing a pane
		,	maxSize:				0			// ditto, 0 = no limit
		,	spacing_open:			6			// space between pane and adjacent panes - when pane is 'open'
		,	spacing_closed:			6			// ditto - when pane is 'closed'
		,	togglerLength_open:		50			// Length = WIDTH of toggler button on north/south edges - HEIGHT on east/west edges
		,	togglerLength_closed: 	50			// 100% OR -1 means 'full height/width of resizer bar' - 0 means 'hidden'
		,	togglerAlign_open:		"center"	// top/left, bottom/right, center, OR...
		,	togglerAlign_closed:	"center"	// 1 => nn = offset from top/left, -1 => -nn == offset from bottom/right
		,	togglerTip_open:		"Close"		// Toggler tool-tip (title)
		,	togglerTip_closed:		"Open"		// ditto
		,	resizerTip:				"Resize"	// Resizer tool-tip (title)
		,	sliderTip:				"Slide Open" // resizer-bar triggers 'sliding' when pane is closed
		,	sliderCursor:			"pointer"	// cursor when resizer-bar will trigger 'sliding'
		,	slideTrigger_open:		"click"		// click, dblclick, mouseover
		,	slideTrigger_close:		"mouseout"	// click, mouseout
		,	hideTogglerOnSlide:		false		// when pane is slid-open, should the toggler show?
		,	togglerContent_open:	""			// text or HTML to put INSIDE the toggler
		,	togglerContent_closed:	""			// ditto
		,	showOverflowOnHover:	false		// will bind allowOverflow() utility to pane.onMouseOver
		,	enableCursorHotkey:		true		// enabled 'cursor' hotkeys
		//,	customHotkey:			""			// MUST be pane-specific - EITHER a charCode OR a character
		,	customHotkeyModifier:	"SHIFT"		// either 'SHIFT', 'CTRL' or 'CTRL+SHIFT' - NOT 'ALT'
		//	NOTE: fxSss_open & fxSss_close options (eg: fxName_open) are auto-generated if not passed
		,	fxName:					"slide" 	// ('none' or blank), slide, drop, scale
		,	fxSpeed:				null		// slow, normal, fast, 200, nnn - if passed, will OVERRIDE fxSettings.duration
		,	fxSettings:				{}			// can be passed, eg: { easing: "easeOutBounce", duration: 1500 }
		,	initClosed:				false		// true = init pane as 'closed'
		,	initHidden: 			false 		// true = init pane as 'hidden' - no resizer or spacing
		
		/*	callback options do not have to be set - listed here for reference only
		,	onshow_start:			""			// CALLBACK when pane STARTS to Show	- BEFORE onopen/onhide_start
		,	onshow_end:				""			// CALLBACK when pane ENDS being Shown	- AFTER  onopen/onhide_end
		,	onhide_start:			""			// CALLBACK when pane STARTS to Close	- BEFORE onclose_start
		,	onhide_end:				""			// CALLBACK when pane ENDS being Closed	- AFTER  onclose_end
		,	onopen_start:			""			// CALLBACK when pane STARTS to Open
		,	onopen_end:				""			// CALLBACK when pane ENDS being Opened
		,	onclose_start:			""			// CALLBACK when pane STARTS to Close
		,	onclose_end:			""			// CALLBACK when pane ENDS being Closed
		,	onresize_start:			""			// CALLBACK when pane STARTS to be ***MANUALLY*** Resized
		,	onresize_end:			""			// CALLBACK when pane ENDS being Resized ***FOR ANY REASON***
		*/
		}
	,	north: {
			paneSelector:			"."+prefix+"north" // default = .ui-layout-north
		,	size:					"auto"
		,	resizerCursor:			"n-resize"
		}
	,	south: {
			paneSelector:			"."+prefix+"south" // default = .ui-layout-south
		,	size:					"auto"
		,	resizerCursor:			"s-resize"
		}
	,	east: {
			paneSelector:			"."+prefix+"east" // default = .ui-layout-east
		,	size:					200
		,	resizerCursor:			"e-resize"
		}
	,	west: {
			paneSelector:			"."+prefix+"west" // default = .ui-layout-west
		,	size:					200
		,	resizerCursor:			"w-resize"
		}
	,	center: {
			paneSelector:			"."+prefix+"center" // default = .ui-layout-center
		}

	};


	var effects = { // LIST *PREDEFINED EFFECTS* HERE, even if effect has no settings
		slide:	{
			all:	{ duration:  "fast"	} // eg: duration: 1000, easing: "easeOutBounce"
		,	north:	{ direction: "up"	}
		,	south:	{ direction: "down"	}
		,	east:	{ direction: "right"}
		,	west:	{ direction: "left"	}
		}
	,	drop:	{
			all:	{ duration:  "slow"	} // eg: duration: 1000, easing: "easeOutQuint"
		,	north:	{ direction: "up"	}
		,	south:	{ direction: "down"	}
		,	east:	{ direction: "right"}
		,	west:	{ direction: "left"	}
		}
	,	scale:	{
			all:	{ duration:  "fast"	}
		}
	};


	// STATIC, INTERNAL CONFIG - DO NOT CHANGE THIS!
	var config = {
		allPanes:		"north,south,east,west,center"
	,	borderPanes:	"north,south,east,west"
	,	zIndex: { // set z-index values here
			resizer_normal:	1		// normal z-index for resizer-bars
		,	pane_normal:	2		// normal z-index for panes
		,	mask:			4		// overlay div used to mask pane(s) during resizing
		,	sliding:		100		// applied to both the pane and its resizer when a pane is 'slid open'
		,	resizing:		10000	// applied to the CLONED resizer-bar when being 'dragged'
		,	animation:		10000	// applied to the pane when being animated - not applied to the resizer
		}
	,	resizers: {
			cssReq: {
				position: 	"absolute"
			,	padding: 	0
			,	margin: 	0
			,	fontSize:	"1px"
			,	textAlign:	"left" // to counter-act "center" alignment!
			,	overflow: 	"hidden" // keep toggler button from overflowing
			,	zIndex: 	1
			}
		,	cssDef: { // DEFAULT CSS - applied if: options.PANE.applyDefaultStyles=true
				background: "#DDD"
			,	border:		"none"
			}
		}
	,	togglers: {
			cssReq: {
				position: 	"absolute"
			,	display: 	"block"
			,	padding: 	0
			,	margin: 	0
			,	overflow:	"hidden"
			,	textAlign:	"center"
			,	fontSize:	"1px"
			,	cursor: 	"pointer"
			,	zIndex: 	1
			}
		,	cssDef: { // DEFAULT CSS - applied if: options.PANE.applyDefaultStyles=true
				background: "#AAA"
			}
		}
	,	content: {
			cssReq: {
				overflow:	"auto"
			}
		,	cssDef: {}
		}
	,	defaults: { // defaults for ALL panes - overridden by 'per-pane settings' below
			cssReq: {
				position: 	"absolute"
			,	margin:		0
			,	zIndex: 	2
			}
		,	cssDef: {
				padding:	"10px"
			,	background:	"#FFF"
			,	border:		"1px solid #BBB"
			,	overflow:	"auto"
			}
		}
	,	north: {
			edge:			"top"
		,	sizeType:		"height"
		,	dir:			"horz"
		,	cssReq: {
				top: 		0
			,	bottom: 	"auto"
			,	left: 		0
			,	right: 		0
			,	width: 		"auto"
			//	height: 	DYNAMIC
			}
		}
	,	south: {
			edge:			"bottom"
		,	sizeType:		"height"
		,	dir:			"horz"
		,	cssReq: {
				top: 		"auto"
			,	bottom: 	0
			,	left: 		0
			,	right: 		0
			,	width: 		"auto"
			//	height: 	DYNAMIC
			}
		}
	,	east: {
			edge:			"right"
		,	sizeType:		"width"
		,	dir:			"vert"
		,	cssReq: {
				left: 		"auto"
			,	right: 		0
			,	top: 		"auto" // DYNAMIC
			,	bottom: 	"auto" // DYNAMIC
			,	height: 	"auto"
			//	width: 		DYNAMIC
			}
		}
	,	west: {
			edge:			"left"
		,	sizeType:		"width"
		,	dir:			"vert"
		,	cssReq: {
				left: 		0
			,	right: 		"auto"
			,	top: 		"auto" // DYNAMIC
			,	bottom: 	"auto" // DYNAMIC
			,	height: 	"auto"
			//	width: 		DYNAMIC
			}
		}
	,	center: {
			dir:			"center"
		,	cssReq: {
				left: 		"auto" // DYNAMIC
			,	right: 		"auto" // DYNAMIC
			,	top: 		"auto" // DYNAMIC
			,	bottom: 	"auto" // DYNAMIC
			,	height: 	"auto"
			,	width: 		"auto"
			}
		}
	};


	// DYNAMIC DATA
	var state = {
		// generate random 'ID#' to identify layout - used to create global namespace for timers
		id:			Math.floor(Math.random() * 10000)
	,	container:	{}
	,	north:		{}
	,	south:		{}
	,	east:		{}
	,	west:		{}
	,	center:		{}
	};


	var 
		altEdge = {
			top:	"bottom"
		,	bottom: "top"
		,	left:	"right"
		,	right:	"left"
		}
	,	altSide = {
			north:	"south"
		,	south:	"north"
		,	east: 	"west"
		,	west: 	"east"
		}
	;


/*
 * ###########################
 *  INTERNAL HELPER FUNCTIONS
 * ###########################
 */

	/**
	 * isStr
	 *
	 * Returns true if passed param is EITHER a simple string OR a 'string object' - otherwise returns false
	 */
	var isStr = function (o) {
		if (typeof o == "string")
			return true;
		else if (typeof o == "object") {
			try {
				var match = o.constructor.toString().match(/string/i); 
				return (match !== null);
			} catch (e) {} 
		}
		return false;
	};

	/**
	 * str
	 *
	 * Returns a simple string if the passed param is EITHER a simple string OR a 'string object',
	 *  else returns the original object
	 */
	var str = function (o) {
		if (typeof o == "string" || isStr(o)) return $.trim(o); // trim converts 'String object' to a simple string
		else return o;
	};

	/**
	 * min / max
	 *
	 * Alias for Math.min/.max to simplify coding
	 */
	var min = function (x,y) { return Math.min(x,y); };
	var max = function (x,y) { return Math.max(x,y); };

	/**
	 * transformData
	 *
	 * Processes the options passed in and transforms them into the format used by layout()
	 * Missing keys are added, and converts the data if passed in 'flat-format' (no sub-keys)
	 * In flat-format, pane-specific-settings are prefixed like: north__optName  (2-underscores)
	 * To update effects, options MUST use nested-keys format, with an effects key
	 *
	 * @callers  initOptions()
	 * @params  JSON  d  Data/options passed by user - may be a single level or nested levels
	 * @returns JSON  Creates a data struture that perfectly matches 'options', ready to be imported
	 */
	var transformData = function (d) {
		var json = { defaults:{fxSettings:{}}, north:{fxSettings:{}}, south:{fxSettings:{}}, east:{fxSettings:{}}, west:{fxSettings:{}}, center:{fxSettings:{}} };
		d = d || {};
		if (d.effects || d.defaults || d.north || d.south || d.west || d.east || d.center)
			json = $.extend( json, d ); // already in json format - add to base keys
		else
			// convert 'flat' to 'nest-keys' format - also handles 'empty' user-options
			$.each( d, function (key,val) {
				a = key.split("__");
				json[ a[1] ? a[0] : "defaults" ][ a[1] ? a[1] : a[0] ] = val;
			});
		return json;
	};

	/**
	 * setFlowCallback
	 *
	 * Set an INTERNAL callback to avoid simultaneous animation
	 * Runs only if needed and only if all callbacks are not 'already set'!
	 *
	 * @param String   action  Either 'open' or 'close'
	 * @pane  String   pane    A valid border-pane name, eg 'west'
	 * @pane  Boolean  param   Extra param for callback (optional)
	 */
	var setFlowCallback = function (action, pane, param) {
		var
			cb = action +","+ pane +","+ (param ? 1 : 0)
		,	cP, cbPane
		;
		$.each(c.borderPanes.split(","), function (i,p) {
			if (c[p].isMoving) {
				bindCallback(p); // TRY to bind a callback
				return false; // BREAK
			}
		});

		function bindCallback (p, test) {
			cP = c[p];
			if (!cP.doCallback) {
				cP.doCallback = true;
				cP.callback = cb;
			}
			else { // try to 'chain' this callback
				cpPane = cP.callback.split(",")[1]; // 2nd param is 'pane'
				if (cpPane != p && cpPane != pane) // callback target NOT 'itself' and NOT 'this pane'
					bindCallback (cpPane, true); // RECURSE
			}
		}
	};

	/**
	 * execFlowCallback
	 *
	 * RUN the INTERNAL callback for this pane - if one exists
	 *
	 * @param String   action  Either 'open' or 'close'
	 * @pane  String   pane    A valid border-pane name, eg 'west'
	 * @pane  Boolean  param   Extra param for callback (optional)
	 */
	var execFlowCallback = function (pane) {
		var cP = c[pane];

		// RESET flow-control flaGs
		c.isLayoutBusy = false;
		delete cP.isMoving;
		if (!cP.doCallback || !cP.callback) return;

		cP.doCallback = false; // RESET logic flag

		// EXECUTE the callback
		var
			cb = cP.callback.split(",")
		,	param = (cb[2] > 0 ? true : false)
		;
		if (cb[0] == "open")
			open( cb[1], param  );
		else if (cb[0] == "close")
			close( cb[1], param );

		if (!cP.doCallback) cP.callback = null; // RESET - unless callback above enabled it again!
	};

	/**
	 * execUserCallback
	 *
	 * Executes a Callback function after a trigger event, like resize, open or close
	 *
	 * @param String  pane   This is passed only so we can pass the 'pane object' to the callback
	 * @param String  v_fn  Accepts a function name, OR a comma-delimited array: [0]=function name, [1]=argument
	 */
	var execUserCallback = function (pane, v_fn) {
		if (!v_fn) return;
		var fn;
		try {
			if (typeof v_fn == "function")
				fn = v_fn;	
			else if (typeof v_fn != "string")
				return;
			else if (v_fn.indexOf(",") > 0) {
				// function name cannot contain a comma, so must be a function name AND a 'name' parameter
				var
					args = v_fn.split(",")
				,	fn = eval(args[0])
				;
				if (typeof fn=="function" && args.length > 1)
					return fn(args[1]); // pass the argument parsed from 'list'
			}
			else // just the name of an external function?
				fn = eval(v_fn);

			if (typeof fn=="function")
				// pass data: pane-name, pane-element, pane-state, pane-options, and layout-name
				return fn( pane, $Ps[pane], $.extend({},state[pane]), $.extend({},options[pane]), options.name );
		}
		catch (ex) {}
	};

	/**
	 * cssNum
	 *
	 * Returns the 'current CSS value' for an element - returns 0 if property does not exist
	 *
	 * @callers  Called by many methods
	 * @param jQuery  $Elem  Must pass a jQuery object - first element is processed
	 * @param String  property  The name of the CSS property, eg: top, width, etc.
	 * @returns Variant  Usually is used to get an integer value for position (top, left) or size (height, width)
	 */
	var cssNum = function ($E, prop) {
		var
			val = 0
		,	hidden = false
		,	visibility = ""
		;
		if (!$.browser.msie) { // IE CAN read dimensions of 'hidden' elements - FF CANNOT
			if ($.curCSS($E[0], "display", true) == "none") {
				hidden = true;
				visibility = $.curCSS($E[0], "visibility", true); // SAVE current setting
				$E.css({ display: "block", visibility: "hidden" }); // show element 'invisibly' so we can measure it
			}
		}

		val = parseInt($.curCSS($E[0], prop, true), 10) || 0;

		if (hidden) { // WAS hidden, so put back the way it was
			$E.css({ display: "none" });
			if (visibility && visibility != "hidden")
				$E.css({ visibility: visibility }); // reset 'visibility'
		}

		return val;
	};

	/**
	 * cssW / cssH / cssSize
	 *
	 * Contains logic to check boxModel & browser, and return the correct width/height for the current browser/doctype
	 *
	 * @callers  initPanes(), sizeMidPanes(), initHandles(), sizeHandles()
	 * @param Variant  elem  Can accept a 'pane' (east, west, etc) OR a DOM object OR a jQuery object
	 * @param Integer  outerWidth/outerHeight  (optional) Can pass a width, allowing calculations BEFORE element is resized
	 * @returns Integer  Returns the innerHeight of the elem by subtracting padding and borders
	 *
	 * @TODO  May need to add additional logic to handle more browser/doctype variations?
	 */
	var cssW = function (e, outerWidth) {
		var $E;
		if (isStr(e)) {
			e = str(e);
			$E = $Ps[e];
		}
		else
			$E = $(e);

		// a 'calculated' outerHeight can be passed so borders and/or padding are removed if needed
		if (outerWidth <= 0)
			return 0;
		else if (!(outerWidth>0))
			outerWidth = isStr(e) ? getPaneSize(e) : $E.outerWidth();

		if (!$.boxModel)
			return outerWidth;

		else // strip border and padding size from outerWidth to get CSS Width
			return outerWidth
				- cssNum($E, "paddingLeft")		
				- cssNum($E, "paddingRight")
				- ($.curCSS($E[0], "borderLeftStyle", true) == "none" ? 0 : cssNum($E, "borderLeftWidth"))
				- ($.curCSS($E[0], "borderRightStyle", true) == "none" ? 0 : cssNum($E, "borderRightWidth"))
			;
	};
	var cssH = function (e, outerHeight) {
		var $E;
		if (isStr(e)) {
			e = str(e);
			$E = $Ps[e];
		}
		else
			$E = $(e);

		// a 'calculated' outerHeight can be passed so borders and/or padding are removed if needed
		if (outerHeight <= 0)
			return 0;
		else if (!(outerHeight>0))
			outerHeight = (isStr(e)) ? getPaneSize(e) : $E.outerHeight();

		if (!$.boxModel)
			return outerHeight;

		else // strip border and padding size from outerHeight to get CSS Height
			return outerHeight
				- cssNum($E, "paddingTop")
				- cssNum($E, "paddingBottom")
				- ($.curCSS($E[0], "borderTopStyle", true) == "none" ? 0 : cssNum($E, "borderTopWidth"))
				- ($.curCSS($E[0], "borderBottomStyle", true) == "none" ? 0 : cssNum($E, "borderBottomWidth"))
			;
	};
	var cssSize = function (pane, outerSize) {
		if (c[pane].dir=="horz") // pane = north or south
			return cssH(pane, outerSize);
		else // pane = east or west
			return cssW(pane, outerSize);
	};

	/**
	 * getPaneSize
	 *
	 * Calculates the current 'size' (width or height) of a border-pane - optionally with 'pane spacing' added
	 *
	 * @returns Integer  Returns EITHER Width for east/west panes OR Height for north/south panes - adjusted for boxModel & browser
	 */
	var getPaneSize = function (pane, inclSpace) {
		var 
			$P	= $Ps[pane]
		,	o	= options[pane]
		,	s	= state[pane]
		,	oSp	= (inclSpace ? o.spacing_open : 0)
		,	cSp	= (inclSpace ? o.spacing_closed : 0)
		;
		if (!$P || s.isHidden)
			return 0;
		else if (s.isClosed || (s.isSliding && inclSpace))
			return cSp;
		else if (c[pane].dir == "horz")
			return $P.outerHeight() + oSp;
		else // dir == "vert"
			return $P.outerWidth() + oSp;
	};

	var setPaneMinMaxSizes = function (pane) {
		var 
			d				= cDims
		,	edge			= c[pane].edge
		,	dir				= c[pane].dir
		,	o				= options[pane]
		,	s				= state[pane]
		,	$P				= $Ps[pane]
		,	$altPane		= $Ps[ altSide[pane] ]
		,	paneSpacing		= o.spacing_open
		,	altPaneSpacing	= options[ altSide[pane] ].spacing_open
		,	altPaneSize		= (!$altPane ? 0 : (dir=="horz" ? $altPane.outerHeight() : $altPane.outerWidth()))
		,	containerSize	= (dir=="horz" ? d.innerHeight : d.innerWidth)
		//	limitSize prevents this pane from 'overlapping' opposite pane - even if opposite pane is currently closed
		,	limitSize		= containerSize - paneSpacing - altPaneSize - altPaneSpacing
		,	minSize			= s.minSize || 0
		,	maxSize			= Math.min(s.maxSize || 9999, limitSize)
		,	minPos, maxPos	// used to set resizing limits
		;
		switch (pane) {
			case "north":	minPos = d.offsetTop + minSize;
							maxPos = d.offsetTop + maxSize;
							break;
			case "west":	minPos = d.offsetLeft + minSize;
							maxPos = d.offsetLeft + maxSize;
							break;
			case "south":	minPos = d.offsetTop + d.innerHeight - maxSize;
							maxPos = d.offsetTop + d.innerHeight - minSize;
							break;
			case "east":	minPos = d.offsetLeft + d.innerWidth - maxSize;
							maxPos = d.offsetLeft + d.innerWidth - minSize;
							break;
		}
		// save data to pane-state
		$.extend(s, { minSize: minSize, maxSize: maxSize, minPosition: minPos, maxPosition: maxPos });
	};

	/**
	 * getPaneDims
	 *
	 * Returns data for setting the size/position of center pane. Date is also used to set Height for east/west panes
	 *
	 * @returns JSON  Returns a hash of all dimensions: top, bottom, left, right, (outer) width and (outer) height
	 */
	var getPaneDims = function () {
		var d = {
			top:	getPaneSize("north", true) // true = include 'spacing' value for p
		,	bottom:	getPaneSize("south", true)
		,	left:	getPaneSize("west", true)
		,	right:	getPaneSize("east", true)
		,	width:	0
		,	height:	0
		};

		with (d) {
			width 	= cDims.innerWidth - left - right;
			height 	= cDims.innerHeight - bottom - top;
			// now add the 'container border/padding' to get final positions - relative to the container
			top		+= cDims.top;
			bottom	+= cDims.bottom;
			left	+= cDims.left;
			right	+= cDims.right;
		}

		return d;
	};


	/**
	 * getElemDims
	 *
	 * Returns data for setting size of an element (container or a pane).
	 *
	 * @callers  create(), onWindowResize() for container, plus others for pane
	 * @returns JSON  Returns a hash of all dimensions: top, bottom, left, right, outerWidth, innerHeight, etc
	 */
	var getElemDims = function ($E) {
		var
			d = {} // dimensions hash
		,	e, b, p // edge, border, padding
		;

		$.each("Left,Right,Top,Bottom".split(","), function () {
			e = str(this);
			b = d["border" +e] = cssNum($E, "border"+e+"Width");
			p = d["padding"+e] = cssNum($E, "padding"+e);
			d["offset" +e] = b + p; // total offset of content from outer edge
			// if BOX MODEL, then 'position' = PADDING (ignore borderWidth)
			if ($E == $Container)
				d[e.toLowerCase()] = ($.boxModel ? p : 0); 
		});

		d.innerWidth  = d.outerWidth  = $E.outerWidth();
		d.innerHeight = d.outerHeight = $E.outerHeight();
		if ($.boxModel) {
			d.innerWidth  -= (d.offsetLeft + d.offsetRight);
			d.innerHeight -= (d.offsetTop  + d.offsetBottom);
		}

		return d;
	};


	var setTimer = function (pane, action, fn, ms) {
		var
			Layout = window.layout = window.layout || {}
		,	Timers = Layout.timers = Layout.timers || {}
		,	name = "layout_"+ state.id +"_"+ pane +"_"+ action // UNIQUE NAME for every layout-pane-action
		;
		if (Timers[name]) return; // timer already set!
		else Timers[name] = setTimeout(fn, ms);
	};

	var clearTimer = function (pane, action) {
		var
			Layout = window.layout = window.layout || {}
		,	Timers = Layout.timers = Layout.timers || {}
		,	name = "layout_"+ state.id +"_"+ pane +"_"+ action // UNIQUE NAME for every layout-pane-action
		;
		if (Timers[name]) {
			clearTimeout( Timers[name] );
			delete Timers[name];
			return true;
		}
		else
			return false;
	};


/*
 * ###########################
 *   INITIALIZATION METHODS
 * ###########################
 */

	/**
	 * create
	 *
	 * Initialize the layout - called automatically whenever an instance of layout is created
	 *
	 * @callers  NEVER explicity called
	 * @returns  An object pointer to the instance created
	 */
	var create = function () {
		// initialize config/options
		initOptions();

		// initialize all objects
		initContainer();	// set CSS as needed and init state.container dimensions
		initPanes();		// size & position all panes
		initHandles();		// create and position all resize bars & togglers buttons
		initResizable();	// activate resizing on all panes where resizable=true
		sizeContent("all");	// AFTER panes & handles have been initialized, size 'content' divs

		if (options.scrollToBookmarkOnLoad)
			with (self.location) if (hash) replace( hash ); // scrollTo Bookmark

		// bind hotkey function - keyDown - if required
		initHotkeys();

		// bind resizeAll() for 'this layout instance' to window.resize event
		$(window).resize(function () {
			var timerID = "timerLayout_"+state.id;
			if (window[timerID]) clearTimeout(window[timerID]);
			window[timerID] = null;
			if (true || $.browser.msie) // use a delay for IE because the resize event fires repeatly
				window[timerID] = setTimeout(resizeAll, 100);
			else // most other browsers have a built-in delay before firing the resize event
				resizeAll(); // resize all layout elements NOW!
		});
	};

	/**
	 * initContainer
	 *
	 * Validate and initialize container CSS and events
	 *
	 * @callers  create()
	 */
	var initContainer = function () {
		try { // format html/body if this is a full page layout
			if ($Container[0].tagName == "BODY") {
				$("html").css({
					height:		"100%"
				,	overflow:	"hidden"
				});
				$("body").css({
					position:	"relative"
				,	height:		"100%"
				,	overflow:	"hidden"
				,	margin:		0
				,	padding:	0		// TODO: test whether body-padding could be handled?
				,	border:		"none"	// a body-border creates problems because it cannot be measured!
				});
			}
			else { // set required CSS - overflow and position
				var
					CSS	= { overflow: "hidden" } // make sure container will not 'scroll'
				,	p	= $Container.css("position")
				,	h	= $Container.css("height")
				;
				// if this is a NESTED layout, then outer-pane ALREADY has position and height
				if (!$Container.hasClass("ui-layout-pane")) {
					if (!p || "fixed,absolute,relative".indexOf(p) < 0)
						CSS.position = "relative"; // container MUST have a 'position'
					if (!h || h=="auto")
						CSS.height = "100%"; // container MUST have a 'height'
				}
				$Container.css( CSS );
			}
		} catch (ex) {}

		// get layout-container dimensions (updated when necessary)
		cDims = state.container = getElemDims( $Container ); // update data-pointer too
	};

	/**
	 * initHotkeys
	 *
	 * Bind layout hotkeys - if options enabled
	 *
	 * @callers  create()
	 */
	var initHotkeys = function () {
		// bind keyDown to capture hotkeys, if option enabled for ANY pane
		$.each(c.borderPanes.split(","), function (i,pane) {
			var o = options[pane];
			if (o.enableCursorHotkey || o.customHotkey) {
				$(document).keydown( keyDown ); // only need to bind this ONCE
				return false; // BREAK - binding was done
			}
		});
	};

	/**
	 * initOptions
	 *
	 * Build final CONFIG and OPTIONS data
	 *
	 * @callers  create()
	 */
	var initOptions = function () {
		// simplify logic by making sure passed 'opts' var has basic keys
		opts = transformData( opts );

		// update default effects, if case user passed key
		if (opts.effects) {
			$.extend( effects, opts.effects );
			delete opts.effects;
		}

		// see if any 'global options' were specified
		$.each("name,scrollToBookmarkOnLoad".split(","), function (idx,key) {
			if (opts[key] !== undefined)
				options[key] = opts[key];
			else if (opts.defaults[key] !== undefined) {
				options[key] = opts.defaults[key];
				delete opts.defaults[key];
			}
		});

		// remove any 'defaults' that MUST be set 'per-pane'
		$.each("paneSelector,resizerCursor,customHotkey".split(","),
			function (idx,key) { delete opts.defaults[key]; } // is OK if key does not exist
		);

		// now update options.defaults
		$.extend( options.defaults, opts.defaults );
		// make sure required sub-keys exist
		//if (typeof options.defaults.fxSettings != "object") options.defaults.fxSettings = {};

		// merge all config & options for the 'center' pane
		c.center = $.extend( true, {}, c.defaults, c.center );
		$.extend( options.center, opts.center );
		// Most 'default options' do not apply to 'center', so add only those that DO
		var o_Center = $.extend( true, {}, options.defaults, opts.defaults, options.center ); // TEMP data
		$.each("paneClass,contentSelector,contentIgnoreSelector,applyDefaultStyles,showOverflowOnHover".split(","),
			function (idx,key) { options.center[key] = o_Center[key]; }
		);

		var defs = options.defaults;

		// create a COMPLETE set of options for EACH border-pane
		$.each(c.borderPanes.split(","), function(i,pane) {
			// apply 'pane-defaults' to CONFIG.PANE
			c[pane] = $.extend( true, {}, c.defaults, c[pane] );
			// apply 'pane-defaults' +  user-options to OPTIONS.PANE
			o = options[pane] = $.extend( true, {}, options.defaults, options[pane], opts.defaults, opts[pane] );

			// make sure we have base-classes
			if (!o.paneClass)		o.paneClass		= defaults.paneClass;
			if (!o.resizerClass)	o.resizerClass	= defaults.resizerClass;
			if (!o.togglerClass)	o.togglerClass	= defaults.togglerClass;

			// create FINAL fx options for each pane, ie: options.PANE.fxName/fxSpeed/fxSettings[_open|_close]
			$.each(["_open","_close",""], function (i,n) { 
				var
					sName		= "fxName"+n
				,	sSpeed		= "fxSpeed"+n
				,	sSettings	= "fxSettings"+n
				;
				// recalculate fxName according to specificity rules
				o[sName] =
					opts[pane][sName]		// opts.west.fxName_open
				||	opts[pane].fxName		// opts.west.fxName
				||	opts.defaults[sName]	// opts.defaults.fxName_open
				||	opts.defaults.fxName	// opts.defaults.fxName
				||	o[sName]				// options.west.fxName_open
				||	o.fxName				// options.west.fxName
				||	defs[sName]				// options.defaults.fxName_open
				||	defs.fxName				// options.defaults.fxName
				||	"none"
				;
				// validate fxName to be sure is a valid effect
				var fxName = o[sName];
				if (fxName == "none" || !$.effects || !$.effects[fxName] || (!effects[fxName] && !o[sSettings] && !o.fxSettings))
					fxName = o[sName] = "none"; // effect not loaded, OR undefined FX AND fxSettings not passed
				// set vars for effects subkeys to simplify logic
				var
					fx = effects[fxName]	|| {} // effects.slide
				,	fx_all	= fx.all		|| {} // effects.slide.all
				,	fx_pane	= fx[pane]		|| {} // effects.slide.west
				;
				// RECREATE the fxSettings[_open|_close] keys using specificity rules
				o[sSettings] = $.extend(
					{}
				,	fx_all						// effects.slide.all
				,	fx_pane						// effects.slide.west
				,	defs.fxSettings || {}		// options.defaults.fxSettings
				,	defs[sSettings] || {}		// options.defaults.fxSettings_open
				,	o.fxSettings				// options.west.fxSettings
				,	o[sSettings]				// options.west.fxSettings_open
				,	opts.defaults.fxSettings	// opts.defaults.fxSettings
				,	opts.defaults[sSettings] || {} // opts.defaults.fxSettings_open
				,	opts[pane].fxSettings		// opts.west.fxSettings
				,	opts[pane][sSettings] || {}	// opts.west.fxSettings_open
				);
				// recalculate fxSpeed according to specificity rules
				o[sSpeed] =
					opts[pane][sSpeed]		// opts.west.fxSpeed_open
				||	opts[pane].fxSpeed		// opts.west.fxSpeed (pane-default)
				||	opts.defaults[sSpeed]	// opts.defaults.fxSpeed_open
				||	opts.defaults.fxSpeed	// opts.defaults.fxSpeed
				||	o[sSpeed]				// options.west.fxSpeed_open
				||	o[sSettings].duration	// options.west.fxSettings_open.duration
				||	o.fxSpeed				// options.west.fxSpeed
				||	o.fxSettings.duration	// options.west.fxSettings.duration
				||	defs.fxSpeed			// options.defaults.fxSpeed
				||	defs.fxSettings.duration// options.defaults.fxSettings.duration
				||	fx_pane.duration		// effects.slide.west.duration
				||	fx_all.duration			// effects.slide.all.duration
				||	"normal"				// DEFAULT
				;
				// DEBUG: if (pane=="east") debugData( $.extend({}, {speed: o[sSpeed], fxSettings_duration: o[sSettings].duration}, o[sSettings]), pane+"."+sName+" = "+fxName );
			});
		});
	};

	/**
	 * initPanes
	 *
	 * Initialize module objects, styling, size and position for all panes
	 *
	 * @callers  create()
	 */
	var initPanes = function () {
		// NOTE: do north & south FIRST so we can measure their height - do center LAST
		$.each(c.allPanes.split(","), function() {
			var 
				pane	= str(this)
			,	o		= options[pane]
			,	s		= state[pane]
			,	fx		= s.fx
			,	dir		= c[pane].dir
			//	if o.size is not > 0, then we will use MEASURE the pane and use that as it's 'size'
			,	size	= o.size=="auto" || isNaN(o.size) ? 0 : o.size
			,	minSize	= o.minSize || 1
			,	maxSize	= o.maxSize || 9999
			,	spacing	= o.spacing_open || 0
			,	sel		= o.paneSelector
			,	isIE6	= ($.browser.msie && $.browser.version < 7)
			,	CSS		= {}
			,	$P, $C
			;
			$Cs[pane] = false; // init

			if (sel.substr(0,1)==="#") // ID selector
				// NOTE: elements selected 'by ID' DO NOT have to be 'children'
				$P = $Ps[pane] = $Container.find(sel+":first");
			else { // class or other selector
				$P = $Ps[pane] = $Container.children(sel+":first");
				// look for the pane nested inside a 'form' element
				if (!$P.length) $P = $Ps[pane] = $Container.children("form:first").children(sel+":first");
			}

			if (!$P.length) {
				$Ps[pane] = false; // logic
				return true; // SKIP to next
			}

			// add basic classes & attributes
			$P
				.attr("pane", pane) // add pane-identifier
				.addClass( o.paneClass +" "+ o.paneClass+"-"+pane ) // default = "ui-layout-pane ui-layout-pane-west" - may be a dupe of 'paneSelector'
			;

			// init pane-logic vars, etc.
			if (pane != "center") {
				s.isClosed  = false; // true = pane is closed
				s.isSliding = false; // true = pane is currently open by 'sliding' over adjacent panes
				s.isResizing= false; // true = pane is in process of being resized
				s.isHidden	= false; // true = pane is hidden - no spacing, resizer or toggler is visible!
				s.noRoom	= false; // true = pane 'automatically' hidden due to insufficient room - will unhide automatically
				// create special keys for internal use
				c[pane].pins = [];   // used to track and sync 'pin-buttons' for border-panes
			}

			CSS = $.extend({ visibility: "visible", display: "block" }, c.defaults.cssReq, c[pane].cssReq );
			if (o.applyDefaultStyles) $.extend( CSS, c.defaults.cssDef, c[pane].cssDef ); // cosmetic defaults
			$P.css(CSS); // add base-css BEFORE 'measuring' to calc size & position
			CSS = {};	// reset var

			// set css-position to account for container borders & padding
			switch (pane) {
				case "north": 	CSS.top 	= cDims.top;
								CSS.left 	= cDims.left;
								CSS.right	= cDims.right;
								break;
				case "south": 	CSS.bottom	= cDims.bottom;
								CSS.left 	= cDims.left;
								CSS.right 	= cDims.right;
								break;
				case "west": 	CSS.left 	= cDims.left; // top, bottom & height set by sizeMidPanes()
								break;
				case "east": 	CSS.right 	= cDims.right; // ditto
								break;
				case "center":	// top, left, width & height set by sizeMidPanes()
			}

			if (dir == "horz") { // north or south pane
				if (size === 0 || size == "auto") {
					$P.css({ height: "auto" });
					size = $P.outerHeight();
				}
				size = max(size, minSize);
				size = min(size, maxSize);
				size = min(size, cDims.innerHeight - spacing);
				CSS.height = max(1, cssH(pane, size));
				s.size = size; // update state
				// make sure minSize is sufficient to avoid errors
				s.maxSize = maxSize; // init value
				s.minSize = max(minSize, size - CSS.height + 1); // = pane.outerHeight when css.height = 1px
				// handle IE6
				//if (isIE6) CSS.width = cssW($P, cDims.innerWidth);
				$P.css(CSS); // apply size & position
			}
			else if (dir == "vert") { // east or west pane
				if (size === 0 || size == "auto") {
					$P.css({ width: "auto", 'float': "left" }); // float = FORCE pane to auto-size
					size = $P.outerWidth();
					$P.css({ 'float': "none" }); // RESET
				}
				size = max(size, minSize);
				size = min(size, maxSize);
				size = min(size, cDims.innerWidth - spacing);
				CSS.width = max(1, cssW(pane, size));
				s.size = size; // update state
				s.maxSize = maxSize; // init value
				// make sure minSize is sufficient to avoid errors
				s.minSize = max(minSize, size - CSS.width + 1); // = pane.outerWidth when css.width = 1px
				$P.css(CSS); // apply size - top, bottom & height set by sizeMidPanes
				sizeMidPanes(pane, null, true); // true = onInit
			}
			else if (pane == "center") {
				$P.css(CSS); // top, left, width & height set by sizeMidPanes...
				sizeMidPanes("center", null, true); // true = onInit
			}

			// close or hide the pane if specified in settings
			if (o.initClosed && o.closable) {
				$P.hide().addClass("closed");
				s.isClosed = true;
			}
			else if (o.initHidden || o.initClosed) {
				hide(pane, true); // will be completely invisible - no resizer or spacing
				s.isHidden = true;
			}
			else
				$P.addClass("open");

			// check option for auto-handling of pop-ups & drop-downs
			if (o.showOverflowOnHover)
				$P.hover( allowOverflow, resetOverflow );

			/*
			 *	see if this pane has a 'content element' that we need to auto-size
			 */
			if (o.contentSelector) {
				$C = $Cs[pane] = $P.children(o.contentSelector+":first"); // match 1-element only
				if (!$C.length) {
					$Cs[pane] = false;
					return true; // SKIP to next
				}
				$C.css( c.content.cssReq );
				if (o.applyDefaultStyles) $C.css( c.content.cssDef ); // cosmetic defaults
				// NO PANE-SCROLLING when there is a content-div
				$P.css({ overflow: "hidden" });
			}
		});
	};

	/**
	 * initHandles
	 *
	 * Initialize module objects, styling, size and position for all resize bars and toggler buttons
	 *
	 * @callers  create()
	 */
	var initHandles = function () {
		// create toggler DIVs for each pane, and set object pointers for them, eg: $R.north = north toggler DIV
		$.each(c.borderPanes.split(","), function() {
			var 
				pane	= str(this)
			,	o		= options[pane]
			,	s		= state[pane]
			,	rClass	= o.resizerClass
			,	tClass	= o.togglerClass
			,	$P		= $Ps[pane]
			;
			$Rs[pane] = false; // INIT
			$Ts[pane] = false;

			if (!$P || (!o.closable && !o.resizable)) return; // pane does not exist - skip

			var 
				edge	= c[pane].edge
			,	isOpen	= $P.is(":visible")
			,	spacing	= (isOpen ? o.spacing_open : o.spacing_closed)
			,	_pane	= "-"+ pane // used for classNames
			,	_state	= (isOpen ? "-open" : "-closed") // used for classNames
			,	$R, $T
			;
			// INIT RESIZER BAR
			$R = $Rs[pane] = $("<span></span>");
	
			if (isOpen && o.resizable)
				; // this is handled by initResizable
			else if (!isOpen && o.slidable)
				$R.attr("title", o.sliderTip).css("cursor", o.sliderCursor);
	
			$R
				// if paneSelector is an ID, then create a matching ID for the resizer, eg: "#paneLeft" => "paneLeft-resizer"
				.attr("id", (o.paneSelector.substr(0,1)=="#" ? o.paneSelector.substr(1) + "-resizer" : ""))
				.attr("resizer", pane) // so we can read this from the resizer
				.css(c.resizers.cssReq) // add base/required styles
				// POSITION of resizer bar - allow for container border & padding
				.css(edge, cDims[edge] + getPaneSize(pane))
				// ADD CLASSNAMES - eg: class="resizer resizer-west resizer-open"
				.addClass( rClass +" "+ rClass+_pane +" "+ rClass+_state +" "+ rClass+_pane+_state )
				.appendTo($Container) // append DIV to container
			;
			 // ADD VISUAL STYLES
			if (o.applyDefaultStyles)
				$R.css(c.resizers.cssDef);

			if (o.closable) {
				// INIT COLLAPSER BUTTON
				$T = $Ts[pane] = $("<div></div>");
				$T
					// if paneSelector is an ID, then create a matching ID for the resizer, eg: "#paneLeft" => "paneLeft-toggler"
					.attr("id", (o.paneSelector.substr(0,1)=="#" ? o.paneSelector.substr(1) + "-toggler" : ""))
					.css(c.togglers.cssReq) // add base/required styles
					.attr("title", (isOpen ? o.togglerTip_open : o.togglerTip_closed))
					.click(function(evt){ toggle(pane); evt.stopPropagation(); })
					.mouseover(function(evt){ evt.stopPropagation(); }) // prevent resizer event
					// ADD CLASSNAMES - eg: class="toggler toggler-west toggler-west-open"
					.addClass( tClass +" "+ tClass+_pane +" "+ tClass+_state +" "+ tClass+_pane+_state )
					.appendTo($R) // append SPAN to resizer DIV
				;

				// ADD INNER-SPANS TO TOGGLER
				if (o.togglerContent_open) // ui-layout-open
					$("<span>"+ o.togglerContent_open +"</span>")
						.addClass("content content-open")
						.css("display", s.isClosed ? "none" : "block")
						.appendTo( $T )
					;
				if (o.togglerContent_closed) // ui-layout-closed
					$("<span>"+ o.togglerContent_closed +"</span>")
						.addClass("content content-closed")
						.css("display", s.isClosed ? "block" : "none")
						.appendTo( $T )
					;

				 // ADD BASIC VISUAL STYLES
				if (o.applyDefaultStyles)
					$T.css(c.togglers.cssDef);

				if (!isOpen) bindStartSlidingEvent(pane, true); // will enable if state.PANE.isSliding = true
			}

		});

		// SET ALL HANDLE SIZES & LENGTHS
		sizeHandles("all", true); // true = onInit
	};

	/**
	 * initResizable
	 *
	 * Add resize-bars to all panes that specify it in options
	 *
	 * @dependancies  $.fn.resizable - will abort if not found
	 * @callers  create()
	 */
	var initResizable = function () {
		var
			draggingAvailable = (typeof $.fn.draggable == "function")
		,	minPosition, maxPosition, edge // set in start()
		;

		$.each(c.borderPanes.split(","), function() {
			var 
				pane	= str(this)
			,	o		= options[pane]
			,	s		= state[pane]
			;
			if (!draggingAvailable || !$Ps[pane] || !o.resizable) {
				o.resizable = false;
				return true; // skip to next
			}

			var 
				rClass				= o.resizerClass
			//	'drag' classes are applied to the ORIGINAL resizer-bar while dragging is in process
			,	dragClass			= rClass+"-drag"			// resizer-drag
			,	dragPaneClass		= rClass+"-"+pane+"-drag"	// resizer-north-drag
			//	'dragging' class is applied to the CLONED resizer-bar while it is being dragged
			,	draggingClass		= rClass+"-dragging"		// resizer-dragging
			,	draggingPaneClass	= rClass+"-"+pane+"-dragging" // resizer-north-dragging
			,	draggingClassSet	= false 					// logic var
			,	$P 					= $Ps[pane]
			,	$R					= $Rs[pane]
			;

			if (!s.isClosed)
				$R
					.attr("title", o.resizerTip)
					.css("cursor", o.resizerCursor) // n-resize, s-resize, etc
				;

			$R.draggable({
				containment:	$Container[0] // limit resizing to layout container
			,	axis:			(c[pane].dir=="horz" ? "y" : "x") // limit resizing to horz or vert axis
			,	delay:			200
			,	distance:		1
			//	basic format for helper - style it using class: .ui-draggable-dragging
			,	helper:			"clone"
			,	opacity:		o.resizerDragOpacity
			//,	iframeFix:		o.draggableIframeFix // TODO: consider using when bug is fixed
			,	zIndex:			c.zIndex.resizing

			,	start: function (e, ui) {
					// onresize_start callback - will CANCEL hide if returns false
					// TODO: CONFIRM that dragging can be cancelled like this???
					if (false === execUserCallback(pane, o.onresize_start)) return false;

					s.isResizing = true; // prevent pane from closing while resizing
					clearTimer(pane, "closeSlider"); // just in case already triggered

					$R.addClass( dragClass +" "+ dragPaneClass ); // add drag classes
					draggingClassSet = false; // reset logic var - see drag()

					// SET RESIZING LIMITS - used in drag()
					var resizerWidth = (pane=="east" || pane=="south" ? o.spacing_open : 0);
					setPaneMinMaxSizes(pane); // update pane-state
					s.minPosition -= resizerWidth;
					s.maxPosition -= resizerWidth;
					edge = (c[pane].dir=="horz" ? "top" : "left");

					// MASK PANES WITH IFRAMES OR OTHER TROUBLESOME ELEMENTS
					$(o.maskIframesOnResize === true ? "iframe" : o.maskIframesOnResize).each(function() {					
						$('<div class="ui-layout-mask"/>')
							.css({
								background:	"#fff"
							,	opacity:	"0.001"
							,	zIndex:		9
							,	position:	"absolute"
							,	width:		this.offsetWidth+"px"
							,	height:		this.offsetHeight+"px"
							})
							.css($(this).offset()) // top & left
							.appendTo(this.parentNode) // put div INSIDE pane to avoid zIndex issues
						;
					});
				}

			,	drag: function (e, ui) {
					if (!draggingClassSet) { // can only add classes after clone has been added to the DOM
						$(".ui-draggable-dragging")
							.addClass( draggingClass +" "+ draggingPaneClass ) // add dragging classes
							.children().css("visibility","hidden") // hide toggler inside dragged resizer-bar
						;
						draggingClassSet = true;
						// draggable bug!? RE-SET zIndex to prevent E/W resize-bar showing through N/S pane!
						if (s.isSliding) $Ps[pane].css("zIndex", c.zIndex.sliding);
					}
					// CONTAIN RESIZER-BAR TO RESIZING LIMITS
					if		(ui.position[edge] < s.minPosition) ui.position[edge] = s.minPosition;
					else if (ui.position[edge] > s.maxPosition) ui.position[edge] = s.maxPosition;
				}

			,	stop: function (e, ui) {
					var 
						dragPos	= ui.position
					,	resizerPos
					,	newSize
					;
					$R.removeClass( dragClass +" "+ dragPaneClass ); // remove drag classes
	
					switch (pane) {
						case "north":	resizerPos = dragPos.top; break;
						case "west":	resizerPos = dragPos.left; break;
						case "south":	resizerPos = cDims.outerHeight - dragPos.top - $R.outerHeight(); break;
						case "east":	resizerPos = cDims.outerWidth - dragPos.left - $R.outerWidth(); break;
					}
					// remove container margin from resizer position to get the pane size
					newSize = resizerPos - cDims[ c[pane].edge ];

					sizePane(pane, newSize);

					// UN-MASK PANES MASKED IN drag.start
					$("div.ui-layout-mask").remove(); // Remove iframe masks	

					s.isResizing = false;
				}

			});
		});
	};



/*
 * ###########################
 *       ACTION METHODS
 * ###########################
 */

	/**
	 * hide / show
	 *
	 * Completely 'hides' a pane, including its spacing - as if it does not exist
	 * The pane is not actually 'removed' from the source, so can use 'show' to un-hide it
	 *
	 * @param String  pane   The pane being hidden, ie: north, south, east, or west
	 */
	var hide = function (pane, onInit) {
		var
			o	= options[pane]
		,	s	= state[pane]
		,	$P	= $Ps[pane]
		,	$R	= $Rs[pane]
		;
		if (!$P || s.isHidden) return; // pane does not exist OR is already hidden

		// onhide_start callback - will CANCEL hide if returns false
		if (false === execUserCallback(pane, o.onhide_start)) return;

		s.isSliding = false; // just in case

		// now hide the elements
		if ($R) $R.hide(); // hide resizer-bar
		if (onInit || s.isClosed) {
			s.isClosed = true; // to trigger open-animation on show()
			s.isHidden  = true;
			$P.hide(); // no animation when loading page
			sizeMidPanes(c[pane].dir == "horz" ? "all" : "center");
			execUserCallback(pane, o.onhide_end || o.onhide);
		}
		else {
			s.isHiding = true; // used by onclose
			close(pane, false); // adjust all panes to fit
			//s.isHidden  = true; - will be set by close - if not cancelled
		}
	};

	var show = function (pane, openPane) {
		var
			o	= options[pane]
		,	s	= state[pane]
		,	$P	= $Ps[pane]
		,	$R	= $Rs[pane]
		;
		if (!$P || !s.isHidden) return; // pane does not exist OR is not hidden

		// onhide_start callback - will CANCEL hide if returns false
		if (false === execUserCallback(pane, o.onshow_start)) return;

		s.isSliding = false; // just in case
		s.isShowing = true; // used by onopen/onclose
		//s.isHidden  = false; - will be set by open/close - if not cancelled

		// now show the elements
		if ($R && o.spacing_open > 0) $R.show();
		if (openPane === false)
			close(pane, true); // true = force
		else
			open(pane); // adjust all panes to fit
	};


	/**
	 * toggle
	 *
	 * Toggles a pane open/closed by calling either open or close
	 *
	 * @param String  pane   The pane being toggled, ie: north, south, east, or west
	 */
	var toggle = function (pane) {
		var s = state[pane];
		if (s.isHidden)
			show(pane); // will call 'open' after unhiding it
		else if (s.isClosed)
			open(pane);
		else
			close(pane);
	};

	/**
	 * close
	 *
	 * Close the specified pane (animation optional), and resize all other panes as needed
	 *
	 * @param String  pane   The pane being closed, ie: north, south, east, or west
	 */
	var close = function (pane, force, noAnimation) {
		var 
			$P		= $Ps[pane]
		,	$R		= $Rs[pane]
		,	$T		= $Ts[pane]
		,	o		= options[pane]
		,	s		= state[pane]
		,	doFX	= !noAnimation && !s.isClosed && (o.fxName_close != "none")
		,	edge	= c[pane].edge
		,	rClass	= o.resizerClass
		,	tClass	= o.togglerClass
		,	_pane	= "-"+ pane // used for classNames
		,	_open	= "-open"
		,	_sliding= "-sliding"
		,	_closed	= "-closed"
		// 	transfer logic vars to temp vars
		,	isShowing = s.isShowing
		,	isHiding = s.isHiding
		;
		// now clear the logic vars
		delete s.isShowing;
		delete s.isHiding;

		if (!$P || (!o.resizable && !o.closable)) return; // invalid request
		else if (!force && s.isClosed && !isShowing) return; // already closed

		if (c.isLayoutBusy) { // layout is 'busy' - probably with an animation
			setFlowCallback("close", pane, force); // set a callback for this action, if possible
			return; // ABORT 
		}

		// onclose_start callback - will CANCEL hide if returns false
		// SKIP if just 'showing' a hidden pane as 'closed'
		if (!isShowing && false === execUserCallback(pane, o.onclose_start)) return;

		// SET flow-control flags
		c[pane].isMoving = true;
		c.isLayoutBusy = true;

		s.isClosed = true;
		// update isHidden BEFORE sizing panes
		if (isHiding) s.isHidden = true;
		else if (isShowing) s.isHidden = false;

		// sync any 'pin buttons'
		syncPinBtns(pane, false);

		// resize panes adjacent to this one
		if (!s.isSliding) sizeMidPanes(c[pane].dir == "horz" ? "all" : "center");

		// if this pane has a resizer bar, move it now
		if ($R) {
			$R
				.css(edge, cDims[edge]) // move the resizer bar
				.removeClass( rClass+_open +" "+ rClass+_pane+_open )
				.removeClass( rClass+_sliding +" "+ rClass+_pane+_sliding )
				.addClass( rClass+_closed +" "+ rClass+_pane+_closed )
			;
			// DISABLE 'resizing' when closed - do this BEFORE bindStartSlidingEvent
			if (o.resizable)
				$R
					.draggable("disable")
					.css("cursor", "default")
					.attr("title","")
				;
			// if pane has a toggler button, adjust that too
			if ($T) {
				$T
					.removeClass( tClass+_open +" "+ tClass+_pane+_open )
					.addClass( tClass+_closed +" "+ tClass+_pane+_closed )
					.attr("title", o.togglerTip_closed) // may be blank
				;
			}
			sizeHandles(); // resize 'length' and position togglers for adjacent panes
		}

		// ANIMATE 'CLOSE' - if no animation, then was ALREADY shown above
		if (doFX) {
			lockPaneForFX(pane, true); // need to set left/top so animation will work
			$P.hide( o.fxName_close, o.fxSettings_close, o.fxSpeed_close, function () {
				lockPaneForFX(pane, false); // undo
				if (!s.isClosed) return; // pane was opened before animation finished!
				close_2();
			});
		}
		else {
			$P.hide(); // just hide pane NOW
			close_2();
		}

		// SUBROUTINE
		function close_2 () {
			bindStartSlidingEvent(pane, true); // will enable if state.PANE.isSliding = true

			// onclose callback - UNLESS just 'showing' a hidden pane as 'closed'
			if (!isShowing)	execUserCallback(pane, o.onclose_end || o.onclose);
			// onhide OR onshow callback
			if (isShowing)	execUserCallback(pane, o.onshow_end || o.onshow);
			if (isHiding)	execUserCallback(pane, o.onhide_end || o.onhide);

			// internal flow-control callback
			execFlowCallback(pane);
		}
	};

	/**
	 * open
	 *
	 * Open the specified pane (animation optional), and resize all other panes as needed
	 *
	 * @param String  pane   The pane being opened, ie: north, south, east, or west
	 */
	var open = function (pane, slide, noAnimation) {
		var 
			$P		= $Ps[pane]
		,	$R		= $Rs[pane]
		,	$T		= $Ts[pane]
		,	o		= options[pane]
		,	s		= state[pane]
		,	doFX	= !noAnimation && s.isClosed && (o.fxName_open != "none")
		,	edge	= c[pane].edge
		,	rClass	= o.resizerClass
		,	tClass	= o.togglerClass
		,	_pane	= "-"+ pane // used for classNames
		,	_open	= "-open"
		,	_closed	= "-closed"
		,	_sliding= "-sliding"
		// 	transfer logic var to temp var
		,	isShowing = s.isShowing
		;
		// now clear the logic var
		delete s.isShowing;

		if (!$P || (!o.resizable && !o.closable)) return; // invalid request
		else if (!s.isClosed && !s.isSliding) return; // already open

		// pane can ALSO be unhidden by just calling show(), so handle this scenario
		if (s.isHidden && !isShowing) {
			show(pane, true);
			return;
		}

		if (c.isLayoutBusy) { // layout is 'busy' - probably with an animation
			setFlowCallback("open", pane, slide); // set a callback for this action, if possible
			return; // ABORT
		}

		// onopen_start callback - will CANCEL hide if returns false
		if (false === execUserCallback(pane, o.onopen_start)) return;

		// SET flow-control flags
		c[pane].isMoving = true;
		c.isLayoutBusy = true;

		// 'PIN PANE' - stop sliding
		if (s.isSliding && !slide) // !slide = 'open pane normally' - NOT sliding
			bindStopSlidingEvents(pane, false); // will set isSliding=false

		s.isClosed = false;
		// update isHidden BEFORE sizing panes
		if (isShowing) s.isHidden = false;

		// Container size may have changed - shrink the pane if now 'too big'
		setPaneMinMaxSizes(pane); // update pane-state
		if (s.size > s.maxSize) // pane is too big! resize it before opening
			$P.css( c[pane].sizeType, max(1, cssSize(pane, s.maxSize)) );

		bindStartSlidingEvent(pane, false); // remove trigger event from resizer-bar

		if (doFX) { // ANIMATE
			lockPaneForFX(pane, true); // need to set left/top so animation will work
			$P.show( o.fxName_open, o.fxSettings_open, o.fxSpeed_open, function() {
				lockPaneForFX(pane, false); // undo
				if (s.isClosed) return; // pane was closed before animation finished!
				open_2(); // continue
			});
		}
		else {// no animation
			$P.show();	// just show pane and...
			open_2();	// continue
		}

		// SUBROUTINE
		function open_2 () {
			// NOTE: if isSliding, then other panes are NOT 'resized'
			if (!s.isSliding) // resize all panes adjacent to this one
				sizeMidPanes(c[pane].dir=="vert" ? "center" : "all");

			// if this pane has a toggler, move it now
			if ($R) {
				$R
					.css(edge, cDims[edge] + getPaneSize(pane)) // move the toggler
					.removeClass( rClass+_closed +" "+ rClass+_pane+_closed )
					.addClass( rClass+_open +" "+ rClass+_pane+_open )
					.addClass( !s.isSliding ? "" : rClass+_sliding +" "+ rClass+_pane+_sliding )
				;
				if (o.resizable)
					$R
						.draggable("enable")
						.css("cursor", o.resizerCursor)
						.attr("title", o.resizerTip)
					;
				else
					$R.css("cursor", "default"); // n-resize, s-resize, etc
				// if pane also has a toggler button, adjust that too
				if ($T) {
					$T
						.removeClass( tClass+_closed +" "+ tClass+_pane+_closed )
						.addClass( tClass+_open +" "+ tClass+_pane+_open )
						.attr("title", o.togglerTip_open) // may be blank
					;
				}
				sizeHandles("all"); // resize resizer & toggler sizes for all panes
			}

			// resize content every time pane opens - to be sure
			sizeContent(pane);

			// sync any 'pin buttons'
			syncPinBtns(pane, !s.isSliding);

			// onopen callback
			execUserCallback(pane, o.onopen_end || o.onopen);

			// onshow callback
			if (isShowing) execUserCallback(pane, o.onshow_end || o.onshow);

			// internal flow-control callback
			execFlowCallback(pane);
		}
	};
	

	/**
	 * lockPaneForFX
	 *
	 * Must set left/top on East/South panes so animation will work properly
	 *
	 * @param String  pane  The pane to lock, 'east' or 'south' - any other is ignored!
	 * @param Boolean  doLock  true = set left/top, false = remove
	 */
	var lockPaneForFX = function (pane, doLock) {
		var $P = $Ps[pane];
		if (doLock) {
			$P.css({ zIndex: c.zIndex.animation }); // overlay all elements during animation
			if (pane=="south")
				$P.css({ top: cDims.top + cDims.innerHeight - $P.outerHeight() });
			else if (pane=="east")
				$P.css({ left: cDims.left + cDims.innerWidth - $P.outerWidth() });
		}
		else {
			if (!state[pane].isSliding) $P.css({ zIndex: c.zIndex.pane_normal });
			if (pane=="south")
				$P.css({ top: "auto" });
			else if (pane=="east")
				$P.css({ left: "auto" });
		}
	};


	/**
	 * bindStartSlidingEvent
	 *
	 * Toggle sliding functionality of a specific pane on/off by adding removing 'slide open' trigger
	 *
	 * @callers  open(), close()
	 * @param String  pane  The pane to enable/disable, 'north', 'south', etc.
	 * @param Boolean  enable  Enable or Disable sliding?
	 */
	var bindStartSlidingEvent = function (pane, enable) {
		var 
			o		= options[pane]
		,	$R		= $Rs[pane]
		,	trigger	= o.slideTrigger_open
		;
		if (!$R || !o.slidable) return;
		// make sure we have a valid event
		if (trigger != "click" && trigger != "dblclick" && trigger != "mouseover") trigger = "click";
		$R
			// add or remove trigger event
			[enable ? "bind" : "unbind"](trigger, slideOpen)
			// set the appropriate cursor & title/tip
			.css("cursor", (enable ? o.sliderCursor: "default"))
			.attr("title", (enable ? o.sliderTip : ""))
		;
	};

	/**
	 * bindStopSlidingEvents
	 *
	 * Add or remove 'mouseout' events to 'slide close' when pane is 'sliding' open or closed
	 * Also increases zIndex when pane is sliding open
	 * See bindStartSlidingEvent for code to control 'slide open'
	 *
	 * @callers  slideOpen(), slideClosed()
	 * @param String  pane  The pane to process, 'north', 'south', etc.
	 * @param Boolean  isOpen  Is pane open or closed?
	 */
	var bindStopSlidingEvents = function (pane, enable) {
		var 
			o		= options[pane]
		,	s		= state[pane]
		,	trigger	= o.slideTrigger_close
		,	action	= (enable ? "bind" : "unbind") // can't make 'unbind' work! - see disabled code below
		,	$P		= $Ps[pane]
		,	$R		= $Rs[pane]
		;

		s.isSliding = enable; // logic
		clearTimer(pane, "closeSlider"); // just in case

		// raise z-index when sliding
		$P.css({ zIndex: (enable ? c.zIndex.sliding : c.zIndex.pane_normal) });
		$R.css({ zIndex: (enable ? c.zIndex.sliding : c.zIndex.resizer_normal) });

		// make sure we have a valid event
		if (trigger != "click" && trigger != "mouseout") trigger = "mouseout";

		// when trigger is 'mouseout', must cancel timer when mouse moves between 'pane' and 'resizer'
		if (enable) { // BIND trigger events
			$P.bind(trigger, slideClosed );
			$R.bind(trigger, slideClosed );
			if (trigger = "mouseout") {
				$P.bind("mouseover", cancelMouseOut );
				$R.bind("mouseover", cancelMouseOut );
			}
		}
		else { // UNBIND trigger events
			// TODO: why does unbind of a 'single function' not work reliably?
			//$P[action](trigger, slideClosed );
			$P.unbind(trigger);
			$R.unbind(trigger);
			if (trigger = "mouseout") {
				//$P[action]("mouseover", cancelMouseOut );
				$P.unbind("mouseover");
				$R.unbind("mouseover");
				clearTimer(pane, "closeSlider");
			}
		}

		// SUBROUTINE for mouseout timer clearing
		function cancelMouseOut (evt) {
			clearTimer(pane, "closeSlider");
			evt.stopPropagation();
		}
	};

	var slideOpen = function () {
		var pane = $(this).attr("resizer"); // attr added by initHandles
		if (state[pane].isClosed) { // skip if already open!
			bindStopSlidingEvents(pane, true); // pane is opening, so BIND trigger events to close it
			open(pane, true); // true = slide - ie, called from here!
		}
	};

	var slideClosed = function () {
		var
			$E = $(this)
		,	pane = $E.attr("pane") || $E.attr("resizer")
		,	o = options[pane]
		,	s = state[pane]
		;
		if (s.isClosed || s.isResizing)
			return; // skip if already closed OR in process of resizing
		else if (o.slideTrigger_close == "click")
			close_NOW(); // close immediately onClick
		else // trigger = mouseout - use a delay
			setTimer(pane, "closeSlider", close_NOW, 300); // .3 sec delay

		// SUBROUTINE for timed close
		function close_NOW () {
			bindStopSlidingEvents(pane, false); // pane is being closed, so UNBIND trigger events
			if (!s.isClosed) close(pane); // skip if already closed!
		}
	};


	/**
	 * sizePane
	 *
	 * @callers  initResizable.stop()
	 * @param String  pane   The pane being resized - usually west or east, but potentially north or south
	 * @param Integer  newSize  The new size for this pane - will be validated
	 */
	var sizePane = function (pane, size) {
		// TODO: accept "auto" as size, and size-to-fit pane content
		var 
			edge	= c[pane].edge
		,	dir		= c[pane].dir
		,	o		= options[pane]
		,	s		= state[pane]
		,	$P		= $Ps[pane]
		,	$R		= $Rs[pane]
		;
		// calculate 'current' min/max sizes
		setPaneMinMaxSizes(pane); // update pane-state
		// compare/update calculated min/max to user-options
		s.minSize = max(s.minSize, o.minSize);
		if (o.maxSize > 0) s.maxSize = min(s.maxSize, o.maxSize);
		// validate passed size
		size = max(size, s.minSize);
		size = min(size, s.maxSize);
		s.size = size; // update state

		// move the resizer bar and resize the pane
		$R.css( edge, size + cDims[edge] );
		$P.css( c[pane].sizeType, max(1, cssSize(pane, size)) );

		// resize all the adjacent panes, and adjust their toggler buttons
		if (!s.isSliding) sizeMidPanes(dir=="horz" ? "all" : "center");
		sizeHandles();
		sizeContent(pane);
		execUserCallback(pane, o.onresize_end || o.onresize);
	};

	/**
	 * sizeMidPanes
	 *
	 * @callers  create(), open(), close(), onWindowResize()
	 */
	var sizeMidPanes = function (panes, overrideDims, onInit) {
		if (!panes || panes == "all") panes = "east,west,center";

		var d = getPaneDims();
		if (overrideDims) $.extend( d, overrideDims );

		$.each(panes.split(","), function() {
			if (!$Ps[this]) return; // NO PANE - skip
			var 
				pane	= str(this)
			,	o		= options[pane]
			,	s		= state[pane]
			,	$P		= $Ps[pane]
			,	$R		= $Rs[pane]
			,	hasRoom	= true
			,	CSS		= {}
			;

			if (pane == "center") {
				d = getPaneDims(); // REFRESH Dims because may have just 'unhidden' East or West pane after a 'resize'
				CSS = $.extend( {}, d ); // COPY ALL of the paneDims
				CSS.width  = max(1, cssW(pane, CSS.width));
				CSS.height = max(1, cssH(pane, CSS.height));
				hasRoom = (CSS.width > 1 && CSS.height > 1);
				/*
				 * Extra CSS for IE6 or IE7 in Quirks-mode - add 'width' to NORTH/SOUTH panes
				 * Normally these panes have only 'left' & 'right' positions so pane auto-sizes
				 */
				if ($.browser.msie && (!$.boxModel || $.browser.version < 7)) {
					if ($Ps.north) $Ps.north.css({ width: cssW($Ps.north, cDims.innerWidth) });
					if ($Ps.south) $Ps.south.css({ width: cssW($Ps.south, cDims.innerWidth) });
				}
			}
			else { // for east and west, set only the height
				CSS.top = d.top;
				CSS.bottom = d.bottom;
				CSS.height = max(1, cssH(pane, d.height));
				hasRoom = (CSS.height > 1);
			}

			if (hasRoom) {
				$P.css(CSS);
				if (s.noRoom) {
					s.noRoom = false;
					if (s.isHidden) return;
					else show(pane, !s.isClosed);
					/* OLD CODE - keep until sure line above works right!
					if (!s.isClosed) $P.show(); // in case was previously hidden due to NOT hasRoom
					if ($R) $R.show();
					*/
				}
				if (!onInit) {
					sizeContent(pane);
					execUserCallback(pane, o.onresize_end || o.onresize);
				}
			}
			else if (!s.noRoom) { // no room for pane, so just hide it (if not already)
				s.noRoom = true; // update state
				if (s.isHidden) return;
				if (onInit) { // skip onhide callback and other logic onLoad
					$P.hide();
					if ($R) $R.hide();
				}
				else hide(pane);
			}
		});
	};


	var sizeContent = function (panes) {
		if (!panes || panes == "all") panes = c.allPanes;

		$.each(panes.split(","), function() {
			if (!$Cs[this]) return; // NO CONTENT - skip
			var 
				pane	= str(this)
			,	ignore	= options[pane].contentIgnoreSelector
			,	$P		= $Ps[pane]
			,	$C		= $Cs[pane]
			,	e_C		= $C[0]		// DOM element
			,	height	= cssH($P);	// init to pane.innerHeight
			;
			$P.children().each(function() {
				if (this == e_C) return; // Content elem - skip
				var $E = $(this);
				if (!ignore || !$E.is(ignore))
					height -= $E.outerHeight();
			});
			if (height > 0)
				height = cssH($C, height);
			if (height < 1)
				$C.hide(); // no room for content!
			else
				$C.css({ height: height }).show();
		});
	};


	/**
	 * sizeHandles
	 *
	 * Called every time a pane is opened, closed, or resized to slide the togglers to 'center' and adjust their length if necessary
	 *
	 * @callers  initHandles(), open(), close(), resizeAll()
	 */
	var sizeHandles = function (panes, onInit) {
		if (!panes || panes == "all") panes = c.borderPanes;

		$.each(panes.split(","), function() {
			var 
				pane	= str(this)
			,	o		= options[pane]
			,	s		= state[pane]
			,	$P		= $Ps[pane]
			,	$R		= $Rs[pane]
			,	$T		= $Ts[pane]
			;
			if (!$P || !$R || (!o.resizable && !o.closable)) return; // skip

			var 
				dir			= c[pane].dir
			,	_state		= (s.isClosed ? "_closed" : "_open")
			,	spacing		= o["spacing"+ _state]
			,	togAlign	= o["togglerAlign"+ _state]
			,	togLen		= o["togglerLength"+ _state]
			,	paneLen
			,	offset
			,	CSS = {}
			;
			if (spacing == 0) {
				$R.hide();
				return;
			}
			else if (!s.noRoom && !s.isHidden) // skip if resizer was hidden for any reason
				$R.show(); // in case was previously hidden

			// Resizer Bar is ALWAYS same width/height of pane it is attached to
			if (dir == "horz") { // north/south
				paneLen = $P.outerWidth();
				$R.css({
					width:	max(1, cssW($R, paneLen)) // account for borders & padding
				,	height:	max(1, cssH($R, spacing)) // ditto
				,	left:	cssNum($P, "left")
				});
			}
			else { // east/west
				paneLen = $P.outerHeight();
				$R.css({
					height:	max(1, cssH($R, paneLen)) // account for borders & padding
				,	width:	max(1, cssW($R, spacing)) // ditto
				,	top:	cDims.top + getPaneSize("north", true)
				//,	top:	cssNum($Ps["center"], "top")
				});
				
			}

			if ($T) {
				if (togLen == 0 || (s.isSliding && o.hideTogglerOnSlide)) {
					$T.hide(); // always HIDE the toggler when 'sliding'
					return;
				}
				else
					$T.show(); // in case was previously hidden

				if (!(togLen > 0) || togLen == "100%" || togLen > paneLen) {
					togLen = paneLen;
					offset = 0;
				}
				else { // calculate 'offset' based on options.PANE.togglerAlign_open/closed
					if (typeof togAlign == "string") {
						switch (togAlign) {
							case "top":
							case "left":	offset = 0;
											break;
							case "bottom":
							case "right":	offset = paneLen - togLen;
											break;
							case "middle":
							case "center":
							default:		offset = Math.floor((paneLen - togLen) / 2); // 'default' catches typos
						}
					}
					else { // togAlign = number
						var x = parseInt(togAlign); //
						if (togAlign >= 0) offset = x;
						else offset = paneLen - togLen + x; // NOTE: x is negative!
					}
				}

				var
					$TC_o = (o.togglerContent_open   ? $T.children(".content-open") : false)
				,	$TC_c = (o.togglerContent_closed ? $T.children(".content-closed")   : false)
				,	$TC   = (s.isClosed ? $TC_c : $TC_o)
				;
				if ($TC_o) $TC_o.css("display", s.isClosed ? "none" : "block");
				if ($TC_c) $TC_c.css("display", s.isClosed ? "block" : "none");

				if (dir == "horz") { // north/south
					var width = cssW($T, togLen);
					$T.css({
						width:	max(0, width)  // account for borders & padding
					,	height:	max(1, cssH($T, spacing)) // ditto
					,	left:	offset // TODO: VERIFY that toggler  positions correctly for ALL values
					});
					if ($TC) // CENTER the toggler content SPAN
						$TC.css("marginLeft", Math.floor((width-$TC.outerWidth())/2)); // could be negative
				}
				else { // east/west
					var height = cssH($T, togLen);
					$T.css({
						height:	max(0, height)  // account for borders & padding
					,	width:	max(1, cssW($T, spacing)) // ditto
					,	top:	offset // POSITION the toggler
					});
					if ($TC) // CENTER the toggler content SPAN
						$TC.css("marginTop", Math.floor((height-$TC.outerHeight())/2)); // could be negative
				}


			}

			// DONE measuring and sizing this resizer/toggler, so can be 'hidden' now
			if (onInit && o.initHidden) {
				$R.hide();
				if ($T) $T.hide();
			}
		});
	};


	/**
	 * resizeAll
	 *
	 * @callers  window.onresize(), callbacks or custom code
	 */
	var resizeAll = function () {
		var
			oldW	= cDims.innerWidth
		,	oldH	= cDims.innerHeight
		;
		cDims = state.container = getElemDims($Container); // UPDATE container dimensions

		var
			checkH	= (cDims.innerHeight < oldH)
		,	checkW	= (cDims.innerWidth < oldW)
		,	s, dir
		;

		if (checkH || checkW)
			// NOTE special order for sizing: S-N-E-W
			$.each(["south","north","east","west"], function(i,pane) {
				s = state[pane];
				dir = c[pane].dir;
				if (!s.isClosed && ((checkH && dir=="horz") || (checkW && dir=="vert"))) {
					setPaneMinMaxSizes(pane); // update pane-state
					// shrink pane if 'too big' to fit
					if (s.size > s.maxSize)
						sizePane(pane, s.maxSize);
				}
			});

		sizeMidPanes("all");
		sizeHandles("all"); // reposition the toggler elements
	};


	/**
	 * keyDown
	 *
	 * Capture keys when enableCursorHotkey - toggle pane if hotkey pressed
	 *
	 * @callers  document.keydown()
	 */
	function keyDown (evt) {
		if (!evt) return true;
		var code = evt.keyCode;
		if (code < 33) return true; // ignore special keys: ENTER, TAB, etc

		var
			PANE = {
				38: "north" // Up Cursor
			,	40: "south" // Down Cursor
			,	37: "west"  // Left Cursor
			,	39: "east"  // Right Cursor
			}
		,	isCursorKey = (code >= 37 && code <= 40)
		,	ALT = evt.altKey // no worky!
		,	SHIFT = evt.shiftKey
		,	CTRL = evt.ctrlKey
		,	pane = false
		,	s, o, k, m, el
		;

		if (!CTRL && !SHIFT)
			return true; // no modifier key - abort
		else if (isCursorKey && options[PANE[code]].enableCursorHotkey) // valid cursor-hotkey
			pane = PANE[code];
		else // check to see if this matches a custom-hotkey
			$.each(c.borderPanes.split(","), function(i,p) { // loop each pane to check its hotkey
				o = options[p];
				k = o.customHotkey;
				m = o.customHotkeyModifier; // if missing or invalid, treated as "CTRL+SHIFT"
				if ((SHIFT && m=="SHIFT") || (CTRL && m=="CTRL") || (CTRL && SHIFT)) { // Modifier matches
					if (k && code == (isNaN(k) || k <= 9 ? k.toUpperCase().charCodeAt(0) : k)) { // Key matches
						pane = p;
						return false; // BREAK
					}
				}
			});

		if (!pane) return true; // no hotkey - abort

		// validate pane
		o = options[pane]; // get pane options
		s = state[pane]; // get pane options
		if (!o.enableCursorHotkey || s.isHidden || !$Ps[pane]) return true;

		// see if user is in a 'form field' because may be 'selecting text'!
		el = evt.target || evt.srcElement;
		if (el && SHIFT && isCursorKey && (el.tagName=="TEXTAREA" || (el.tagName=="INPUT" && (code==37 || code==39))))
			return true; // allow text-selection

		// SYNTAX NOTES
		// use "returnValue=false" to abort keystroke but NOT abort function - can run another command afterwards
		// use "return false" to abort keystroke AND abort function
		toggle(pane);
		evt.stopPropagation();
		evt.returnValue = false; // CANCEL key
		return false;
	};


/*
 * ###########################
 *     UTILITY METHODS
 *   called externally only
 * ###########################
 */

	function allowOverflow (elem) {
		if (this && this.tagName) elem = this; // BOUND to element
		var $P;
		if (typeof elem=="string")
			$P = $Ps[elem];
		else {
			if ($(elem).attr("pane")) $P = $(elem);
			else $P = $(elem).parents("div[pane]:first");
		}
		if (!$P.length) return; // INVALID

		var
			pane	= $P.attr("pane")
		,	s		= state[pane]
		;

		// if pane is already raised, then reset it before doing it again!
		// this would happen if allowOverflow is attached to BOTH the pane and an element 
		if (s.cssSaved)
			resetOverflow(pane); // reset previous CSS before continuing

		// if pane is raised by sliding or resizing, or it's closed, then abort
		if (s.isSliding || s.isResizing || s.isClosed) {
			s.cssSaved = false;
			return;
		}

		var
			newCSS	= { zIndex: (c.zIndex.pane_normal + 1) }
		,	curCSS	= {}
		,	of		= $P.css("overflow")
		,	ofX		= $P.css("overflowX")
		,	ofY		= $P.css("overflowY")
		;
		// determine which, if any, overflow settings need to be changed
		if (of != "visible") {
			curCSS.overflow = of;
			newCSS.overflow = "visible";
		}
		if (ofX && ofX != "visible" && ofX != "auto") {
			curCSS.overflowX = ofX;
			newCSS.overflowX = "visible";
		}
		if (ofY && ofY != "visible" && ofY != "auto") {
			curCSS.overflowY = ofX;
			newCSS.overflowY = "visible";
		}

		// save the current overflow settings - even if blank!
		s.cssSaved = curCSS;

		// apply new CSS to raise zIndex and, if necessary, make overflow 'visible'
		$P.css( newCSS );

		// make sure the zIndex of all other panes is normal
		$.each(c.allPanes.split(","), function(i, p) {
			if (p != pane) resetOverflow(p);
		});

	};

	function resetOverflow (elem) {
		if (this && this.tagName) elem = this; // BOUND to element
		var $P;
		if (typeof elem=="string")
			$P = $Ps[elem];
		else {
			if ($(elem).hasClass("ui-layout-pane")) $P = $(elem);
			else $P = $(elem).parents("div[pane]:first");
		}
		if (!$P.length) return; // INVALID

		var
			pane	= $P.attr("pane")
		,	s		= state[pane]
		,	CSS		= s.cssSaved || {}
		;
		// reset the zIndex
		if (!s.isSliding && !s.isResizing)
			$P.css("zIndex", c.zIndex.pane_normal);

		// reset Overflow - if necessary
		$P.css( CSS );

		// clear var
		s.cssSaved = false;
	};


	/**
	* getBtn
	*
	* Helper function to validate params received by addButton utilities
	*
	* @param String   selector 	jQuery selector for button, eg: ".ui-layout-north .toggle-button"
	* @param String   pane 		Name of the pane the button is for: 'north', 'south', etc.
	* @returns  If both params valid, the element matching 'selector' in a jQuery wrapper - otherwise 'false'
	*/
	function getBtn(selector, pane, action) {
		var
			$E = $(selector)
		,	err = "Error Adding Button \n\nInvalid "
		;
		if (!$E.length) // element not found
			alert(err+"selector: "+ selector);
		else if (c.borderPanes.indexOf(pane) == -1) // invalid 'pane' sepecified
			alert(err+"pane: "+ pane);
		else { // VALID
			var btn = options[pane].buttonClass +"-"+ action;
			$E.addClass( btn +" "+ btn +"-"+ pane );
			return $E;
		}
		return false;  // INVALID
	};


	/**
	* addToggleBtn
	*
	* Add a custom Toggler button for a pane
	*
	* @param String   selector 	jQuery selector for button, eg: ".ui-layout-north .toggle-button"
	* @param String   pane 		Name of the pane the button is for: 'north', 'south', etc.
	*/
	function addToggleBtn (selector, pane) {
		var $E = getBtn(selector, pane, "toggle");
		if ($E)
			$E
				.attr("title", state[pane].isClosed ? "Open" : "Close")
				.click(function (evt) {
					toggle(pane);
					evt.stopPropagation();
				})
			;
	};

	/**
	* addOpenBtn
	*
	* Add a custom Open button for a pane
	*
	* @param String   selector 	jQuery selector for button, eg: ".ui-layout-north .open-button"
	* @param String   pane 		Name of the pane the button is for: 'north', 'south', etc.
	*/
	function addOpenBtn (selector, pane) {
		var $E = getBtn(selector, pane, "open");
		if ($E)
			$E
				.attr("title", "Open")
				.click(function (evt) {
					open(pane);
					evt.stopPropagation();
				})
			;
	};

	/**
	* addCloseBtn
	*
	* Add a custom Close button for a pane
	*
	* @param String   selector 	jQuery selector for button, eg: ".ui-layout-north .close-button"
	* @param String   pane 		Name of the pane the button is for: 'north', 'south', etc.
	*/
	function addCloseBtn (selector, pane) {
		var $E = getBtn(selector, pane, "close");
		if ($E)
			$E
				.attr("title", "Close")
				.click(function (evt) {
					close(pane);
					evt.stopPropagation();
				})
			;
	};

	/**
	* addPinBtn
	*
	* Add a custom Pin button for a pane
	*
	* Four classes are added to the element, based on the paneClass for the associated pane...
	* Assuming the default paneClass and the pin is 'up', these classes are added for a west-pane pin:
	*  - ui-layout-pane-pin
	*  - ui-layout-pane-west-pin
	*  - ui-layout-pane-pin-up
	*  - ui-layout-pane-west-pin-up
	*
	* @param String   selector 	jQuery selector for button, eg: ".ui-layout-north .ui-layout-pin"
	* @param String   pane 		Name of the pane the pin is for: 'north', 'south', etc.
	*/
	function addPinBtn (selector, pane) {
		var $E = getBtn(selector, pane, "pin");
		if ($E) {
			var s = state[pane];
			$E.click(function (evt) {
				setPinState($(this), pane, (s.isSliding || s.isClosed));
				if (s.isSliding || s.isClosed) open( pane ); // change from sliding to open
				else close( pane ); // slide-closed
				evt.stopPropagation();
			});
			// add up/down pin attributes and classes
			setPinState ($E, pane, (!s.isClosed && !s.isSliding));
			// add this pin to the pane data so we can 'sync it' automatically
			// PANE.pins key is an array so we can store multiple pins for each pane
			c[pane].pins.push( selector ); // just save the selector string
		}
	};

	/**
	* syncPinBtns
	*
	* INTERNAL function to sync 'pin buttons' when pane is opened or closed
	* Unpinned means the pane is 'sliding' - ie, over-top of the adjacent panes
	*
	* @callers  open(), close()
	* @params  pane   These are the params returned to callbacks by layout()
	* @params  doPin  True means set the pin 'down', False means 'up'
	*/
	function syncPinBtns (pane, doPin) {
		$.each(c[pane].pins, function (i, selector) {
			setPinState($(selector), pane, doPin);
		});
	};

	/**
	* setPinState
	*
	* Change the class of the pin button to make it look 'up' or 'down'
	*
	* @callers  addPinBtn(), syncPinBtns()
	* @param Element  $Pin		The pin-span element in a jQuery wrapper
	* @param Boolean  doPin		True = set the pin 'down', False = set it 'up'
	* @param String   pinClass	The root classname for pins - will add '-up' or '-down' suffix
	*/
	function setPinState ($Pin, pane, doPin) {
		var updown = $Pin.attr("pin");
		if (updown && doPin == (updown=="down")) return; // already in correct state
		var
			root	= options[pane].buttonClass
		,	class1	= root +"-pin"
		,	class2	= class1 +"-"+ pane
		,	UP1		= class1 + "-up"
		,	UP2		= class2 + "-up"
		,	DN1		= class1 + "-down"
		,	DN2		= class2 + "-down"
		;
		$Pin
			.attr("pin", doPin ? "down" : "up") // logic
			.attr("title", doPin ? "Un-Pin" : "Pin")
			.removeClass( doPin ? UP1 : DN1 ) 
			.removeClass( doPin ? UP2 : DN2 ) 
			.addClass( doPin ? DN1 : UP1 ) 
			.addClass( doPin ? DN2 : UP2 ) 
		;
	};


/*
 * ###########################
 * CREATE/RETURN BORDER-LAYOUT
 * ###########################
 */

	// init global vars
	var 
		$Container = $(this).css({ overflow: "hidden" }) // Container elem
	,	$Ps		= {} // Panes x4	- set in initPanes()
	,	$Cs		= {} // Content x4	- set in initPanes()
	,	$Rs		= {} // Resizers x4	- set in initHandles()
	,	$Ts		= {} // Togglers x4	- set in initHandles()
	//	object aliases
	,	c		= config // alias for config hash
	,	cDims	= state.container // alias for easy access to 'container dimensions'
	;

	// create the border layout NOW
	create();

	// return object pointers to expose data & option Properties, and primary action Methods
	return {
		options:		options			// property - options hash
	,	state:			state			// property - dimensions hash
	,	panes:			$Ps				// property - object pointers for ALL panes: panes.north, panes.center
	,	toggle:			toggle			// method - pass a 'pane' ("north", "west", etc)
	,	open:			open			// method - ditto
	,	close:			close			// method - ditto
	,	hide:			hide			// method - ditto
	,	show:			show			// method - ditto
	,	resizeContent:	sizeContent		// method - ditto
	,	sizePane:		sizePane		// method - pass a 'pane' AND a 'size' in pixels
	, reinitPane: initPanes
	,	resizeAll:		resizeAll		// method - no parameters
	,	addToggleBtn:	addToggleBtn	// utility - pass element selector and 'pane'
	,	addOpenBtn:		addOpenBtn		// utility - ditto
	,	addCloseBtn:	addCloseBtn		// utility - ditto
	,	addPinBtn:		addPinBtn		// utility - ditto
	,	allowOverflow:	allowOverflow	// utility - pass calling element
	,	resetOverflow:	resetOverflow	// utility - ditto
	,	cssWidth:		cssW
	,	cssHeight:		cssH
	};

}
})( jQuery );(function(){
	var TagView = {


		/**
		*
		* Private Functions Start
		*
		**/

		_GetTag: function( data, template ) {
			var widget = this;

			var tag = $( $.mustache( template, data.tag ) );

			tag.data('data', data);

			if (!widget.tagMenu) {
				widget.tagMenu = tag.find( '.tag-menu' );
				widget.tagMenu.hide();
			}
			tag.find( '.tag-menu' ).remove();

			tag.find( '.color-selector' ).bind( 'click', function(e){
				var menu = widget.tagMenu;
				var target = $( e.target );
				var json = target.parent( '.tag' ).data( 'data' );

				if ( menu.data( 'visible' ) === true && menu.data( 'tagId' ) === data.tag.id ) {
					menu.hide( 'fast' );
					menu.data( 'visible', false );
					menu.data( 'tagId', null );
					menu.data( 'tag', null );
					menu.data( 'target', null );
				} else {
					menu.show( 'fast' );
					menu.css({
						left: tag.position().left,
						top: tag.position().top - 100
					});
					menu.data( 'visible', true );
					menu.data( 'tagId', json.tag.id );
					menu.data( 'tag', json );
					menu.data( 'target', target );
				}
				return false; // prevent bubbling
			});


			if ( ListKungFu && ListKungFu.LayoutWest ) {
				tag.draggable( {
					helper: 'clone',
					appendTo: ListKungFu.LayoutWest,
					revert: 'invalid',
					containment: ListKungFu.LayoutWest,
					start: function( event, ui ) {
						// disable the ability to select text.
						// this is a hack for chrome and safari.
						document.onselectstart = function () { return false; };

						widget._trigger( "StartedDraggingTag", 0, { dragType: "tag" } );
					},
					stop: function ( event, ui ) {
						document.onselectstart = null;
					}
				});
			}

			tag.bind( 'click', function(e){
				var data = tag.data( 'data' );
				var selected = tag.data( 'selected' );

				if ( selected ) {
					widget._RemoveSelectedTag( data.tag.id );
					tag.removeClass( 'tag-selected' );
					tag.data( 'selected', false );
				} else {
					widget._AddSelectedTag( data.tag.id );
					tag.addClass( 'tag-selected' );
					tag.data( 'selected', true );
				}

				widget._trigger( "TagSelected", 0, widget.selectedTags );
				return false;
			});


			return tag;
		},

		_AddSelectedTag: function( tagId ) {
			this.selectedTags.push( tagId );
			this.selectedTags = jQuery.unique( widget.selectedTags );
		},

		_RemoveSelectedTag: function( tagId ) {
			var widget = this;
			var newArray = [];

			for ( var i = 0; i < widget.selectedTags.length; i++ ) {
				if ( widget.selectedTags[ i ] !== tagId ) {
					newArray.push( widget.selectedTags[ i ] );
				}
			}

			widget.selectedTags = newArray;
		},

		_CreateToolbar: function() {

			widget.tagList.append( widget.tagMenu );

			// bind events for tag menu

			// color selection
			widget.tagMenu.find( '.color' ).bind( 'click', function( e ) {
				var $target = $( e.target );
				var colorClass = $target.attr( 'data-colorclass' );
				var json = widget.tagMenu.data( 'tag' );
				var oldColorClass = json.tag.color_class;
				var target = widget.tagMenu.data( 'target' );

				json.tag.color_class = colorClass;

				Tag.Update({

					send: json,
					successCallback: function( template, json, status, xhr, errors ){
						// Lists need to be reloaded because tag_color_helper will have changed
						widget._trigger( "AfterColorChanged", 0, {} );

						var colorSelector = target;

						// update view
						target.parent( '.tag' ).removeClass( oldColorClass);
						target.parent( '.tag' ).addClass( colorClass );
						colorSelector.removeClass( oldColorClass );
						colorSelector.addClass( colorClass );

						// hide the tag menu
						widget.tagMenu.hide( 'fast' );
						widget.tagMenu.data( 'visible', false );
						widget.tagMenu.data( 'tagId', null );
						widget.tagMenu.data( 'tag', null );
						widget.tagMenu.data( 'target', null );

						// update data object
						target.data( 'data', json );
					},
					tags: json.tag.id
				});
			});

			// delete label
			widget.tagMenu.find( '.delete-label' ).bind( 'click', function(){
				// hide the tag menu
				widget.tagMenu.hide( 'fast' );
				widget.tagMenu.data( 'visible', false );


				var cancelFunc = function(){
					widget.tagMenu.data( 'tagId', null );
					widget.tagMenu.data( 'tag', null );
					widget.tagMenu.data( 'target', null );
				};

				var deleteFunc = function(){
					var data = widget.tagMenu.data( 'tag' );
					var target = widget.tagMenu.data( 'target' );

					Tag.Destroy({
						successCallback: function( template, json, status, xhr, errors ){
							widget._trigger( "AfterTagDeleted", 0, {} );
							target.hide( 'fast', function(){
								target.parent( '.tag' ).remove();

								widget.tagMenu.data( 'tagId', null );
								widget.tagMenu.data( 'tag', null );
								widget.tagMenu.data( 'target', null );
							});
						},
						tags: data.tag.id
					});
				};

				if ( typeof( widget.deleteDialog ) === 'undefined' ) {
					widget.deleteDialog = $.confirmationDialog( "Delete Tag", deleteFunc, "Cancel"
						, "Delete Tag and remove it from all lists?", cancelFunc );
				}

				widget.deleteDialog.dialog("open");

				return false;
			});
		},

		_create: function() {
			widget = this;
			widget.header = $( '<h1 class="subsection-header">Notebook Tags</h1>' );
			widget.toolbar = $( '<div id="tag-toolbar"></div>' );
			widget.addTagInput = $( '<input type="text" value="" id="add-tag"/>' );
			widget.addTagButton = $( '<button id="tag-new">Create Tag</button>' );
			widget.tagList = $( '<div class="tags"></div>' );

			widget.element.append( widget.header );
			widget.element.append( widget.toolbar );
			widget.toolbar.append( widget.addTagInput );
			widget.toolbar.append( widget.addTagButton );
			widget.element.append( widget.tagList );

			widget.addTagButton.button({
				text: false,
				icons: {
					primary: 'ui-icon-plusthick'
				}
			});

			widget.selectedTags = [];

			// retrieve all tags and display them
			Tag.Index( {
				successCallback: function( template, json, status, xhr, errors ) {

					for ( var i = 0; i < json.length; i++ ) {
						widget.tagList.append( widget._GetTag( json[ i ], template ) ) ;
					}

					if ( widget.tagMenu ) {
						widget._CreateToolbar();
					}
				}
			});

			widget.addTagButton.bind( 'click', function(e){
				if ( $.trim( widget.addTagInput.val() ) !== '' &&
					widget.tagList.find( ".tag-name:HasExactValue('" + $.trim( widget.addTagInput.val() ) + "')").length === 0 ) {

					var data = {};
					data.tag = {
						name: widget.addTagInput.val(),
						color_class: "c1"
					};

					Tag.Create({
						send: data,
						successCallback: function( template, json, status, xhr, errors ) {
							var newTag = widget._GetTag( json, template );
							widget.tagList.prepend( newTag );
							widget.addTagInput.val( '' );
							widget.addTagInput.trigger( 'keyup' );

							if ( widget.tagMenu ) {
								widget._CreateToolbar();
							}
						}
					});

					return false;
				}
			});

			widget.addTagInput.bind( 'keyup', 'return', function(){
				widget.addTagButton.trigger( 'click' );
			});

			widget.addTagInput.bind( 'keyup', function ( e ) {
				var filtervalue = $(this).val();

        if (filtervalue === '') {
					widget.tagList.find( ".tag" ).show();
        } else {
					widget.tagList.find( ".tag:not(:Contains('" + filtervalue + "'))").hide();
					widget.tagList.find( ".tag:Contains('" + filtervalue + "')").show();
        }

				// if this tag already exists, disable the "add"-button
				if ( widget.tagList.find( ".tag-name:HasExactValue('" + $.trim( filtervalue ) + "')").length > 0 ) {
					widget.addTagButton.button( "option", "disabled", true );
				} else {
					widget.addTagButton.button( "option", "disabled", false );
				}
			});


		},

		/**
		*
		* Private Functions End
		*
		**/
		options: {

		},

		destroy: function() {
			widget.element.children().remove();
		}
	};
	// register widget
	$.widget("ui.TagView", TagView);
})();
(function(){
	var UltimateSearch = {

		/**
		* Private functions
		* functions starting with a _ are pseudo private.
		* They cannot be access from the outside.
		*/

		// required function. Automatically called when widget is created
		_create: function() {
			var widget = this;
			widget.searchText = $('<div><input type="text" id="ultimate-search-text"/><span id="ultimate-search-text-cancel"></span></div>');
			var searchOptionsArr = [ '<div id="searchOptions">',
				'<input type="checkbox" id="searchLists" class="searchOptionCheckbox" checked /><label for="searchLists" class="searchOptionLabel">Search List</label>',
				'<input type="checkbox" id="searchDashboard" class="searchOptionCheckbox" checked /><label for="searchDashboard" class="searchOptionLabel">Search Dashboard</label>',
				'<input type="checkbox" id="searchListItems" class="searchOptionCheckbox" checked /><label for="searchListItems" class="searchOptionLabel">Search List Items</label>',
				'</div>'
			];
			widget.searchOptions = $( searchOptionsArr.join( '' ) );

			widget.element.append( widget.searchText );
			widget.element.append( widget.searchOptions );

			$( document ).bind( 'keyup', 'ctrl+f', function() {
				widget.searchText.focus();
			});

			// for windows:
			$( document ).bind( 'keyup', 'shift+f', function() {
				widget.searchText.focus();
			});

			widget.searchText.bind( 'keyup', function( e ) {
				var target = $( e.target );
				var value = target.val();

				widget._trigger( "OnFilterChanged", 0, {
					searchOptions: {
						searchLists: widget.searchOptions.find( '#searchLists:checked' ).length > 0 ? true : false,
						searchListItems: widget.searchOptions.find( '#searchListItems:checked' ).length > 0 ? true : false,
						searchDashboard: widget.searchOptions.find( '#searchDashboard:checked' ).length > 0 ? true : false
					},

					searchText: value
				});
			});

			widget.searchText.find( '#ultimate-search-text-cancel' ).bind( 'click', function() {
				widget.searchText.find( '#ultimate-search-text' ).val('').trigger( 'keyup' );
			});

			widget.searchText.bind( 'keyup', 'enter', function() {
				widget.searchText.find( '#ultimate-search-text' ).trigger( 'keyup' );
			});

		},

		// Once the element is created, all other calls to the widget
		// name where the first parameter is not a string will call the _init()
		// method; if options are passed, the .option() method will be called
		// before the _init() method.
		_init: function() {

		},

		options: {
		},


		destroy: function() {

		}
	};
	// register widget
	$.widget("ui.UltimateSearch", UltimateSearch);
})();
(function(){
	var ListItemShow = {

		_CreateToolbar: function() {
			var widget = this;
			// empty header
			widget.header.html("");

			// build new header
		 	var toolbarArr = ['<div id="list-item-show-toolbar">',
				'<button id="back-to-list">Back [Alt+Backspace]</button>',
				'<button id="list-item-edit">Edit [return]</button>',
				'<div style="clear:both">&nbsp;</div>',
				'</div>'];

			widget.toolbar = $( toolbarArr.join('') );

			// create buttons
			widget.toolbar.find( "#back-to-list" ).button({
				text: false,
				icons: {
					primary: 'ui-icon-arrowthick-1-w'
				}
			});

			widget.toolbar.find( "#list-item-edit" ).button({
				text: false,
				icons: {
					primary: 'ui-icon-pencil'
				}
			});

			// bind events

			widget.toolbar.find( '#back-to-list' ).bind( 'click', function( e ){
				widget.listItemElement.trigger( 'back-to-list' );
			});

			widget.toolbar.find( '#list-item-edit' ).bind( 'click', function( e ){
				widget.listItemElement.trigger( 'edit' );
			});

			widget.header.append( widget.toolbar );
		},

		_create: function() {
			// nothing
		},

		_init: function() {
			var widget = this;

			widget.element.children().remove();

			widget.wrapper = $( '<div class="ui-layout-content" id="list-item-show-wrapper"></div>' );
			widget.header = $( '<div id="list-item-show-header"></div>' );

			widget.element.append( widget.header );
			widget.element.append( widget.wrapper );

			widget._CreateToolbar();

			widget.wrapper.bind( 'beforeEdit', function( e ){
				widget.element.find( '#list-item-show-content' ).hide();
			});

			widget.wrapper.bind( 'afterEdit', function( e, json ){
				if ( json ) {
					widget.element.find( '#list-item-show-content' ).html( json.list_item.body );
				}

				widget.element.find( '#list-item-show-content' ).show().focus();
			});

			ListListItem.Show({
				successCallback: function( template, json, status, xhr, errors ) {
					var newElement = $( $.mustache( template, json.list_item ) );

					newElement.data( 'data', json );

					// bind events

					newElement.bind( 'keydown', 'left', function(){
						newElement.trigger( 'back-to-list' );
					});

					newElement.bind( 'keydown', 'return', function(){
						widget.toolbar.find( "#list-item-edit" ).effect( 'puff', {}, 300, function(){
							$( this ).show();
						});
						newElement.trigger( 'edit' );
					});

					newElement.bind( 'dblclick', function(){
						newElement.trigger( 'edit' );
					});

					newElement.bind( 'back-to-list', function(){
						var data = widget.listItemElement.data( 'data' );
						widget.destroy();
						widget.element.ListItemView( "OpenList", data.list_item );
					});

					newElement.bind( 'edit', function(){
						var data = widget.listItemElement.data( 'data' );

						widget.element.find( '#list-item-show-wrapper' ).ListItemEdit({
							height: widget.element.find( "#list-item-show-wrapper" ).height() - 70,
							listId: data.list_item.list_id,
							listItemId: data.list_item.id
						});

					});

					if ( $.browser.msie ) {
						newElement.bind( 'click', function() {
							newElement.focus();
							return false;
						});
					}

					newElement.height( widget.element.height() - 60 );

					widget.wrapper.append( newElement );
					newElement.focus();

					widget.listItemElement = newElement;

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
(function(){
	var ListItemEdit = {

		_SetupDeadlineButton: function( $parentItem ) {
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
		},

		_SetupCustomDeadlinePicker: function() {
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
		},

		_create: function() {
			// nothing
		},


		_init: function() {
			var widget = this;

			widget.destroy();

			ListListItem.Edit({
				successCallback: function( template, json, status, xhr, errors ) {
					widget.element.trigger( 'beforeEdit' );

					var $form = $( template );
					$form.hide();


					widget.element.prepend( $form );
					widget.element.height( "auto" );

					var mySettings = ListKungFu.TinyMCEDefaultOptions;
					mySettings.height = widget.options.height;


					$form.find( "textarea.editorarea" ).tinymce( mySettings );

					widget._SetupDeadlineButton( $form );
					widget._SetupCustomDeadlinePicker();

					$form.show('slow', function(){
						$form.find( "textarea" ).focus();
					});

					$form.find( ".deadline-button" ).bind( "keydown click", 'return', function( e ) {
						e.preventDefault();
						var serializedForm = widget.element.find( "form" ).serializeForm();

						// add deadline indicator based on deadline type
						serializedForm.list_item.deadlineType = $( e.target ).attr( 'data-deadline' );
						serializedForm.list_item.customDeadlineValue = $( '#custom-deadline-value' ).val();

						ListListItem.Update({
							send: serializedForm,
							successCallback: function( template, json, status, xhr, errors ){
								$form.hide( 'slow', function( e ) {
									widget.destroy();

									widget.element.trigger( 'afterEdit', json );
								});
							},
							lists: widget.options.listId,
							list_items: widget.options.listItemId
						});

						return false;
					});

					$form.find( "#cancel-edit" ).bind( "keydown click", 'return', function( e ) {
						e.preventDefault();
						widget.destroy();
						widget.element.trigger( 'afterEdit' );

						return false;
					});

					return false;
				},
				lists: widget.options.listId,
				list_items: widget.options.listItemId
			});
		},

		options: {
			height: "auto",
			listId: null,
			listItemId: null
		},


		destroy: function() {
			var widget = this;

			// remove elements
			widget.element.children( 'form' ).remove();
		}
	};
	// register widget
	$.widget("ui.ListItemEdit", ListItemEdit);
})();
