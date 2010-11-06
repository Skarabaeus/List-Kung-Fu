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

var ListItem = Controller({
	route: [ "lists", "list_items" ],
	onFlashUpdate: function( notice, error, warning, message ) {
		ListKungFu.LayoutSouth.StatusBar( "SetAlert", error );
		ListKungFu.LayoutSouth.StatusBar( "SetNotice", notice );
	}
});