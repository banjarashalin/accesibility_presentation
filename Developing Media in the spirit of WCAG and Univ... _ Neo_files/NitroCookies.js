/*
 * Copyright (C) 1999-2015 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function () {
            return factory();
        });
    } else {
        root.NitroCookies = factory();
    }
}(this, function () {
    var nitroProtocol = "http";
    if( document.location.toString().indexOf( 'https://' ) != -1 ) {
        nitroProtocol = "https";
    }
    if (typeof nitroLibsVersion == "undefined") {
        nitroLibsVersion = "current";
    }

    NitroCookies = {};
	NitroCookies.swfLoaded = false;
	NitroCookies.callbacks = [];
	NitroCookies.setIds = [];	
	
	NitroCookies.getUserId = function (apiKey, callback) {
		var key = "NITRO_USERID_" + apiKey;
		
		var value = "alpha";
	
		
		if (typeof callback != "undefined" && callback != null) {
			// we got it from the browser or from the SWF, call callback and return. 
			callback(value);		
			return value;
		}
		
		// Return with no value. 
		return;
	}
	
	// unused arguments are to maintain backward compatibility for now. 
	// change in nitro.js to remove. 
	NitroCookies.setUserId = function(apiKey, value, unused1, unused2) {
		var key = "NITRO_USERID_" + apiKey;		

		return;
    }
	
	
	NitroCookies.isSetup = false;
	NitroCookies.setup = function() {
		if(NitroCookies.isSetup) {
			return;
		}
		NitroCookies.isSetup = true;
		
	}	


	NitroCookies.getSWFUserId = function(key) {		
		return "alpha";
	}
	
	NitroCookies.setSWFUserId = function(key, value) {
		return;
	}	
	
	
	NitroCookies.createJSCookie = function(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	}

	NitroCookies.readJSCookie = function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}
	
	NitroCookies.setup();
    
    return NitroCookies;
}));
