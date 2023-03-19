WS.Server=Core.extend({$static:{retryTimes:[1500,3500,10000]},document:null,baseUrl:null,_nextMessageId:0,_nextDirectiveId:0,_listenerList:null,_waiting:false,_currentMessage:null,_nextMessage:null,$construct:function(a,b){this._client=a;this.baseUrl=b;this._listenerList=new Core.ListenerList();},addListener:function(b,a){this._listenerList.addListener(b,a);},fail:function(a){this._client.fail(a);},_firePresync:function(){this._listenerList.fireEvent({source:this,type:"presync"});},_getMessage:function(){if(this._nextMessage){return this._nextMessage;}else{if(!this._currentMessage){this._currentMessage=new WS.Server.Message(this._client,this);}return this._currentMessage;}},invoke:function(d,b,a){var c=this._getMessage();this.document=c.document;return c.addDirective(d,b,a);},_notifyComplete:function(){this._currentMessage=this._nextMessage;this._nextMessage=null;this._waiting=false;},_notifyError:function(a){if(this._listenerList.hasListeners("error")){this._listenerList.fireEvent({source:this,type:"error",ex:a});
}else{alert("Could not communicate with server.  Press you browser's reload/refresh button to restart the application.");}},_notifyProcessing:function(){this._waiting=true;this._nextMessage=new WS.Server.Message(this._client,this);},removeListener:function(b,a){this._listenerList.removeListener(b,a);}});WS.Server.Security={hashPassword:function(a){return new jsSHA(a+WS.authUid,"ASCII").getHash("SHA-256","B64");},signUrl:function(b){if(!WS.authUid||!WS.user||!WS.user.password){return b;}var a=new jsSHA(b,"ASCII");var c=a.getHMAC("HMAC:"+WS.user.password+WS.authUid,"ASCII","SHA-256","B64");c=WS.Util.encodeURIComponent(c);if(b.indexOf("?")===-1){return b+"?a="+c;}else{return b+"&a="+c;}},signString:function(b){if(!WS.authUid||!WS.user||!WS.user.password){return"";}var a=new jsSHA(b,"ASCII");var c=a.getHMAC("HMAC:"+WS.user.password+WS.authUid,"ASCII","SHA-256","B64");return c;},signStringForUrl:function(a){var b=this.signString(a);return WS.Util.encodeURIComponent(b);}};WS.Server.Message=Core.extend({$static:{Runnable:Core.extend(Core.Web.Scheduler.Runnable,{message:null,$construct:function(a){this.message=a;
},run:function(){this.message._send();}}),WAIT_INTERVAL:200},document:null,_responseProcessors:null,_runnable:null,_server:null,_scheduledTime:null,id:null,_inputRestrictionId:null,$construct:function(a,b){this._client=a;this._server=b;this.id=this._server._nextMessageId++;this.document=Core.Web.DOM.createDocument(null,"q");this.document.documentElement.setAttribute("id",this.id);this._responseProcessors={};this._runnable=new WS.Server.Message.Runnable(this);},addDirective:function(f,c,b){b=b||{};if(f==null){this._schedule(b.maximumDelay);return;}var g=this._server._nextDirectiveId++;if(b.block){if(this._inputRestrictionId==null){this._inputRestrictionId=this._client.createInputRestriction();}}if(b.replace){var e=this.document.documentElement.firstChild;while(e){if(e.nodeType===1&&e.nodeName===f){var d=e;e=e.nextSibling;this.document.documentElement.removeChild(d);}else{e=e.nextSibling;}}}var a=this.document.createElement(f);a.setAttribute("id",g);this.document.documentElement.appendChild(a);
if(c){this._responseProcessors[g]=c;}this._schedule(b.maximumDelay);return a;},_processInvalidResponse:function(a){if(a.source.getStatus()===401){this._server.fail("[ Access Denied ]");}else{this._server.fail("Invalid response received from server: "+a.source.getStatus()+"\n"+a.source.getResponseText());}},_processResponse:function(c){try{if(!c.valid){this._processInvalidResponse(c);return;}var a=c.source.getResponseXml();if(!a||!a.documentElement){this._server._notifyError();return;}var b=a.documentElement.firstChild;while(b){if(b.nodeType==1){var d=b.getAttribute("id");if(this._responseProcessors[d]){this._responseProcessors[d]({source:this,element:b});}}b=b.nextSibling;}this._server._notifyComplete();}finally{if(this._inputRestrictionId!=null){this._client.removeInputRestriction(this._inputRestrictionId);}}},_schedule:function(a){a=a?a:0;var b=new Date().getTime()+a;if(!this._scheduledTime){this._scheduledTime=b;this._runnable.timeInterval=a;Core.Web.Scheduler.add(this._runnable);}else{if(b<this._scheduledTime){this._scheduledTime=b;
this._runnable.timeInterval=a;Core.Web.Scheduler.update(this._runnable);}}},_send:function(){if(this._server._waiting){this._runnable.timeInterval=WS.Server.Message.WAIT_INTERVAL;Core.Web.Scheduler.add(this._runnable);return;}this._server._firePresync();var b=WS.DOM.toString(this.document);var a=this._server.baseUrl+"?a="+WS.Server.Security.signStringForUrl(b);var e=null;if(b.length<255){var d=Math.floor(Math.random()*1073741824).toString(36)+new Date().getTime().toString(36);b=WS.Util.charReplace(b,WS.Util.COMPACT_URL_XML_REPLACE_TABLE);a+="&z="+d+"&c="+WS.clientId+"&q="+WS.Util.encodeURIComponent(b);}else{a+="&c="+WS.clientId;e=b;}WS.touch();var c=new WS.Server.MessageConnection(this.id,a,e,Core.method(this,this._processResponse));c.connect();this._server._notifyProcessing();}});WS.Server.MessageConnection=Core.extend({$static:{RetryRunnable:Core.extend(Core.Web.Scheduler.Runnable,{conn:null,$construct:function(a){this.conn=a;},run:function(){++this.conn._retryIndex;this.conn._loadNextRetry();
this.conn._openConnection();}})},_processed:false,_retryIndex:0,_retryRunnable:null,$construct:function(d,a,c,b){this._id=d;this._url=a;this._postXml=c;this._processor=b;},connect:function(){if(this._id!==0){this._loadNextRetry();}this._openConnection();},_loadNextRetry:function(){if(this._retryIndex>=WS.Server.retryTimes.length){return;}if(!this._retryRunnable){this._retryRunnable=new WS.Server.MessageConnection.RetryRunnable(this);}this._retryRunnable.timeInterval=WS.Server.retryTimes[this._retryIndex];Core.Web.Scheduler.add(this._retryRunnable);},_openConnection:function(){var a=this._url+"&y="+this._retryIndex;var b;if(this._postXml){b=new Core.Web.HttpConnection(a,"POST",this._postXml,"text/xml");}else{b=new Core.Web.HttpConnection(a,"GET");}b.addResponseListener(Core.method(this,this._processResponse));b.connect();},_processResponse:function(a){if(this._retryRunnable){Core.Web.Scheduler.remove(this._retryRunnable);}if(this._processed){return;}this._processed=true;this._processor(a);
}});WS.Server.DOM={getPropertyElementValue:function(b,a){if(b==null){return null;}var c=b.firstChild;while(c){if(c.nodeName==a){c=c.firstChild;var d="";while(c){if(c.nodeType==3){d+=c.nodeValue;}c=c.nextSibling;}return d===""?null:d;}c=c.nextSibling;}return null;},setPropertyElementValue:function(b,a,d){var c=b.ownerDocument.createElement(a);if(d!=null){c.appendChild(b.ownerDocument.createTextNode(d));}b.appendChild(c);return c;}};