/*
 * Copyright (C) 1999-2015 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['./NitroCookies'], function(NitroCookies) {
            return root.NitroJSConnector = factory(NitroCookies);
        });
    } else {
        root.NitroJSConnector = factory(root.NitroCookies);
    }
}(this, function(NitroCookies) {
    var nitroProtocol = "http";
    if( document.location.toString().indexOf( 'https://' ) != -1 ) {
        nitroProtocol = "https";
    }
    if (typeof nitroLibsVersion == "undefined") {
        nitroLibsVersion = "current";
    }

    function NitroJSConnector(connectionParams) {
		this.connectionParams = connectionParams;
		if (typeof NitroJSConnector.counter == "undefined") {
			NitroJSConnector.counter = 0;
		}
		this.counterId = NitroJSConnector.counter ++;
		if(typeof this.connectionParams.autoLogin == "undefined") {
			this.connectionParams.autoLogin = true;
		}
		
		this.tryLogin = function() {
			if (this.connectionParams.userId == null) {
				if (typeof NitroCookies != "undefined") {
					// wait for callback before proceeding. 
					NitroCookies.getUserId(this.connectionParams.apiKey, NitroJSConnector.gotUserId);
					return;
				}
			}
			
			if(!this.connectionParams.autoLogin && this.connectionParams.userId.indexOf('NITRO_USER_') == 0) {
				NitroCookies.createJSCookie("anonymous",true,365);
				this.connectionParams.userId = null;
			}
			
			// If we have the session key stored in a cookie, use it.  Otherwise, we need to login.
			if (NitroCookies.readJSCookie("NITRO_SESSION_" + this.connectionParams.apiKey + "_" + this.connectionParams.userId)) {
				this.connectionParams.sessionKey = NitroCookies.readJSCookie("NITRO_SESSION_" + this.connectionParams.apiKey + "_" + this.connectionParams.userId);
				this.connectionParams.abTestGroup = NitroCookies.readJSCookie("NITRO_AB_" + this.connectionParams.apiKey + "_" + this.connectionParams.userId);
			}
			else if (this.connectionParams.autoLogin && this.connectionParams.anonymous) {	//creates a new random user
				NitroCookies.createJSCookie("anonymous",true,365);//explicit anonymous call
				this.callAPI("method=user.anonymousLogin&apiKey=" + this.connectionParams.apiKey, "NitroJSConnector.processLogin", this.counterId, false, true);
			} else if (this.connectionParams.autoLogin && typeof this.connectionParams.timeStamp == "undefined") {	//low security
				this.callAPI("method=user.login&apiKey=" + this.connectionParams.apiKey, "NitroJSConnector.processLogin", this.counterId, true, true);
			} else if(this.connectionParams.userId) {	//medium+ security
				//we were given a userId
				NitroCookies.createJSCookie("anonymous",false,365);
				this.callAPI("method=user.login&apiKey=" + this.connectionParams.apiKey +  
							 "&ts=" + this.connectionParams.timeStamp + "&sig=" + this.connectionParams.signature, 
							 "NitroJSConnector.processLogin", this.counterId, true, true);
			}
			else {
				this.connectionParams.noLogin = true;
				
				if (NitroJSConnector.toolbarArgs) {
					nitroToolbar.show(NitroJSConnector.toolbarArgs);
					NitroJSConnector.toolbarArgs = null;
				}
			}
		}
		
		NitroJSConnector.gotUserId = function(userId) {
			NitroJSConnector.userId = userId;
			for (var i = 0; i < NitroJSConnector.instances.length; i++) {
				NitroJSConnector.instances[i].connectionParams.userId = userId;
				if(userId.indexOf('NITRO_USER_') == 0) {
					//we were not given a user id and we created one ourselves
					NitroCookies.createJSCookie("anonymous",true,365);
				}
				NitroJSConnector.instances[i].tryLogin();
			}
						
		}
		
		this.callAPI = function (params, callback, asyncToken, addUserId, noSessionKey) {
		  var fullUrl = this.connectionParams.server + "?" + params;
		  if (callback != null) {
			fullUrl = fullUrl + "&jsCallback=" + callback;  
		  }
		  if (asyncToken != null) {
			fullUrl = fullUrl + "&jsAsyncToken=" + asyncToken;  
		  }
		  if (this.connectionParams.userId && addUserId != null && addUserId == true) {
			fullUrl = fullUrl + "&userId=" + this.connectionParams.userId;  
		  }
		  
		  if (noSessionKey == null || noSessionKey == false) {
			  if (this.connectionParams.sessionKey == null) {
				 if (this.retryTries > 0) {
					 this.retryTries--;
					 var _self = this;
					 setTimeout(function(){
						 _self.callAPI(params, callback, asyncToken, addUserId, noSessionKey);
					 }, this.retryCallInterval);
				 }
				 return;  
			  }
			  
			  fullUrl = fullUrl + "&sessionKey=" + this.connectionParams.sessionKey;
		  }else {
			  fullUrl = fullUrl + "&apiKey=" + this.connectionParams.apiKey;		  
		  }
		  
		  if (this.connectionParams.abTestGroup == "no") {
			  // don't make any nitro calls for the "no" group
			  return;
		  }		  
		  var obj=new JSONscriptRequest(fullUrl);     
		  obj.buildScriptTag(); // Build the script tag     
		  obj.addScriptTag(); // Execute (add) the script tag
		}
		
		NitroJSConnector.processLogin = function(data,token) {
			if (data == null) {
				if (NitroJSConnector.debug) {
					alert ('Error');
				}
				return;
			}
			if (data.Nitro.res == "err") {
				if (NitroJSConnector.debug) {
					alert (data.Nitro.Error.Message);
				}
				return;
			}
			
			for (var i = 0; i < NitroJSConnector.instances.length; i++) {
				if (NitroJSConnector.instances[i].counterId == token) {
					var cp = NitroJSConnector.instances[i].connectionParams;
					
					if(data.Nitro.Login.userId)
						cp.userId = data.Nitro.Login.userId;
					
					cp.sessionKey = data.Nitro.Login.sessionKey;
					NitroCookies.createJSCookie("NITRO_SESSION_" + cp.apiKey + "_" + cp.userId, data.Nitro.Login.sessionKey, 1/72);
					
					if (typeof data.Nitro.Login.TestGroup != "undefined") {
						cp.abTestGroup = data.Nitro.Login.TestGroup.abTestGroup;
						NitroCookies.createJSCookie("NITRO_AB_" + cp.apiKey + "_" + cp.userId, data.Nitro.Login.TestGroup.abTestGroup, 1/72);
					}
					else {
						cp.abTestGroup = null;
					}
					
					break;
				}
			}
			
			if (NitroJSConnector.toolbarArgs) {
				nitroToolbar.show(NitroJSConnector.toolbarArgs);
				NitroJSConnector.toolbarArgs = null;
			}
		}
		
		if (typeof NitroJSConnector.instances == "undefined") {
			NitroJSConnector.instances = new Array();
		}
		NitroJSConnector.instances.push(this);
		if (typeof this.connectionParams.debug == "undefined") {
			this.connectionParams.debug = false;
		}
		if (typeof this.connectionParams.userId == "undefined" || this.connectionParams.userId == null || this.connectionParams.userId == "") {
			this.connectionParams.userId = null;
		}		
		if (typeof this.connectionParams.sessionKey == "undefined" || this.connectionParams.sessionKey == null || this.connectionParams.sessionKey == "") {
			this.connectionParams.sessionKey = null;
		}		
		NitroJSConnector.debug = this.connectionParams.debug;
		this.retryLoginInterval = 10;
		this.retryCallInterval = 10;
		this.retryTries = 50000;
		if (this.connectionParams.sessionKey == null) {
			this.tryLogin();
		}
	}
	
	function JSONscriptRequest(fullUrl,dontAddNoCacheParam) {
		// REST request path
		this.fullUrl = fullUrl; 
		// Keep IE from caching requests
		this.noCacheIE = '&noCacheIE=' + (new Date()).getTime();
		// Get the DOM location to put the script tag
		this.headLoc = document.getElementsByTagName("head").item(0);
		// Generate a unique script tag id
		this.scriptId = 'YJscriptId' + JSONscriptRequest.scriptCounter++;
		
		// buildScriptTag method
		//
		this.buildScriptTag = function () {
			if (typeof JSONscriptRequest.scriptCounter == "undefined") {
				JSONscriptRequest.scriptCounter = 1;
			}
			// Create the script tag
			this.scriptObj = document.createElement("script");
			
			// Add script object attributes
			this.scriptObj.setAttribute("type", "text/javascript");
			this.scriptObj.setAttribute("src", encodeURI(this.fullUrl + (dontAddNoCacheParam ? '' : this.noCacheIE)));
			this.scriptObj.setAttribute("id", this.scriptId);
		}
		 
		// removeScriptTag method
		// 
		this.removeScriptTag = function () {
			// Destroy the script tag
			this.headLoc.removeChild(this.scriptObj);  
		}
		
		// addScriptTag method
		//
		this.addScriptTag = function () {
			// Create the script tag
			this.headLoc.appendChild(this.scriptObj);
		}
	
	}
    
    return NitroJSConnector;
}));
