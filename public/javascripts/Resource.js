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
	
	that.ClearFlash();
	
	that.table = spec.table || null;
	that.model = spec.model || null;
	that.baseURL = spec.base_url || GetDefaultBaseUrl();
	
	that.ClearData = function(){
		that.dataIndex = null;
		that.dataShow = null;
		that.dataNew = null;
		that.dataEdit = null;
	};
	
	that.ClearData();

	that.Index = function( successCallback ) {
		
		var result = $.ajax({
			url: that.baseURL + that.table,
			dataType: "script",
			type: "GET",
			processData: false,
			contentType: "application/json",
			success: function ( data, status, xhr ) {
				that.dataIndex = data;

				if ( typeof( successCallback ) === 'function' ) {
					successCallback( data, status, xhr );
				}
			}
		});
	};
	
	that.Show = function( id, successCallback ) {
		$.ajax({
			url: that.baseURL + that.table + "/" + id,
			dataType: "json",
			type: "GET",
			processData: false,
			contentType: "application/json",
			success: function( data, status, xhr ) {
				that.dataShow = data;
				
				if ( typeof( successCallback ) === 'function' ) {
					successCallback( data, status, xhr );
				}
			}
		});
	};

	that.New = function( successCallback ) {
		$.ajax({
			url: that.baseURL + that.table + "/new",
			dataType: "script",
			type: "GET",
			success: function( data, status, xhr ) {
				if ( typeof( successCallback ) === 'function' ) {
					successCallback( data, status, xhr );
				}
			}
		});
	};

	that.Create = function( obj, successCallback ) {
		var data = JSON.stringify( obj );
		
		$.ajax({
			url: that.baseURL + that.table,
			dataType: "json",
			type: "POST",
			processData: false,
			contentType: "application/json",
			data: data,
			complete: function( xhr, status ) {
				that.flash.notice = xhr.getResponseHeader("X-Flash-Notice");
				that.flash.error = xhr.getResponseHeader("X-Flash-Error");
				that.flash.warning = xhr.getResponseHeader("X-Flash-Warning");
				that.flash.message = xhr.getResponseHeader("X-Flash-Message");
				
				if ( typeof( successCallback ) === 'function' ) {
					successCallback( status, xhr );
				}
			}
		});
	};

	that.Edit = function( id, successCallback ) {
		$.ajax({
			url: that.baseURL + that.table + "/" + id + "/edit",
			dataType: "script",
			type: "GET",
			success: function( data, status, xhr ) {
				if ( typeof( successCallback ) === 'function' ) {
					successCallback( data, status, xhr );
				}
			}
		});
	};

	that.Update = function( obj, successCallback ) {
		var data = JSON.stringify( obj );
		
		$.ajax({
			url: that.baseURL + that.table + "/" + obj[that.model].id,
			dataType: "json",
			type: "POST",
			processData: false,
			contentType: "application/json",
			data: data,
			beforeSend: function(xhr)   
			{
				xhr.setRequestHeader("X-Http-Method-Override", "PUT");
			},
			complete: function( xhr, status ) {
				that.flash.notice = xhr.getResponseHeader("X-Flash-Notice");
				that.flash.error = xhr.getResponseHeader("X-Flash-Error");
				that.flash.warning = xhr.getResponseHeader("X-Flash-Warning");
				that.flash.message = xhr.getResponseHeader("X-Flash-Message");
				
				if ( typeof( successCallback ) === 'function' ) {
					successCallback( status, xhr );
				}
			}
		});
	};

	that.Destroy = function( id, successCallback ) {
		$.ajax({
			url: that.baseURL + that.table + "/" + id,
			dataType: "json",
			type: "POST",
			processData: false,
			contentType: "application/json",
			beforeSend: function(xhr)   
			{
				xhr.setRequestHeader("X-Http-Method-Override", "DELETE");
			},
			complete: function( xhr, status ){
				that.flash.notice = xhr.getResponseHeader("X-Flash-Notice");
				that.flash.error = xhr.getResponseHeader("X-Flash-Error");
				that.flash.warning = xhr.getResponseHeader("X-Flash-Warning");
				that.flash.message = xhr.getResponseHeader("X-Flash-Message");
				
				if ( typeof( successCallback ) === 'function' ) {
					successCallback( status, xhr );
				}
			}
		});

	};

	return that;
};

var List = Controller({
	table: 'lists',
	model: 'list'
});

var ListItem = Controller({
	table: 'list_items',
	model: 'listitem'
});