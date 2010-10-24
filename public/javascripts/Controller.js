var Controller = function(spec, my) {
	var that = {};

	my = my || {};

	var GetDefaultBaseUrl = function() {
		var protocol = document.location.protocol + "//";
		var hostname = document.location.hostname;
		var port = document.location.port !== '' ? ":" + document.location.port : "";

		return protocol + hostname + port + "/";
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
			if ( that.flash.notice !== "" || that.flash.error !== "" || that.flash.warning !== "" ||  that.flash.message !== "" ) {
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

		if ( typeof( callback ) === 'function' ) {
			callback( template, json , status, xhr );
		}

		that.ClearFlash();


	}

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

		var result = $.ajax({
			url: that.baseURL + route,
			dataType: "xml",
			type: "GET",
			processData: false,
			contentType: "application/json",
			success: function ( data, status, xhr ) {
				that.DefaultCallback( successCallback, data, status, xhr );
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
			}
		});
	};

	that.Update = function( setup ) {
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
				xhr.setRequestHeader("X-Http-Method-Override", "PUT");
			},
			success: function( data, status, xhr ) {
				that.DefaultCallback( successCallback, data, status, xhr );
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
	route: [ "lists", "list_items" ]
});