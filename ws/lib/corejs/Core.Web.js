Core.Web={dragInProgress:false,init:function(){if(Core.Web.initialized){return;}Core.Web.Env._init();Core.Web.Measure._calculateExtentSizes();Core.Web.Measure.Bounds._initMeasureContainer();if(Core.Web.Env.QUIRK_CSS_POSITIONING_ONE_SIDE_ONLY){Core.Web.VirtualPosition._init();}if(Core.Web.Env.ENGINE_MSHTML){Core.Web.DOM.addEventListener(document,"selectstart",Core.Web._selectStartListener,false);Core.Web.DOM.addEventListener(document,"dragstart",Core.Web._selectStartListener,false);}Core.Web.initialized=true;},_selectStartListener:function(a){a=a?a:window.event;if(Core.Web.dragInProgress){Core.Web.DOM.preventEventDefault(a);}}};Core.Web.DOM={_focusPendingElement:null,_focusRunnable:null,addEventListener:function(d,c,b,a){if(d.addEventListener){d.addEventListener(c,b,a);}else{if(d.attachEvent){d.attachEvent("on"+c,b);}}},createDocument:function(a,d){if(document.implementation&&document.implementation.createDocument){var e;if(Core.Web.Env.BROWSER_FIREFOX&&Core.Web.Env.BROWSER_VERSION_MAJOR==3&&Core.Web.Env.BROWSER_VERSION_MINOR===0){e=new DOMParser().parseFromString("<?xml version='1.0' encoding='UTF-8'?><"+d+"/>","application/xml");
}else{e=document.implementation.createDocument(a,d,null);}if(!e.documentElement){e.appendChild(e.createElement(d));}return e;}else{if(window.ActiveXObject){var b=new ActiveXObject("Microsoft.XMLDOM");var c=b.createElement(d);b.appendChild(c);return b;}else{throw new Error("XML DOM creation not supported by browser environment.");}}},focusElement:function(a){if(!this._focusRunnable){this._focusRunnable=new (Core.extend(Core.Web.Scheduler.Runnable,{repeat:true,attempt:0,timeInterval:25,run:function(){a=Core.Web.DOM._focusPendingElement;var b=false;if(Core.Web.DOM.isDisplayed(a)){b=true;try{a.focus();}catch(c){}}b|=this.attempt>25;++this.attempt;if(b){Core.Web.DOM._focusPendingElement=null;Core.Web.Scheduler.remove(this);}}}))();}if(!(a&&a.focus&&Core.Web.DOM.isAncestorOf(document.body,a))){Core.Web.DOM._focusPendingElement=null;Core.Web.Scheduler.remove(this._focusRunnable);return;}this._focusPendingElement=a;this._focusRunnable.attempt=0;Core.Web.Scheduler.add(this._focusRunnable);},getChildElementByTagName:function(a,c){var b=a.firstChild;
while(b){if(b.nodeType==1&&b.nodeName==c){return b;}b=b.nextSibling;}return null;},getChildElementsByTagName:function(a,c){var d=[];var b=a.firstChild;while(b){if(b.nodeType==1&&b.nodeName==c){d.push(b);}b=b.nextSibling;}return d;},getEventOffset:function(b){if(typeof b.offsetX=="number"){return{x:b.offsetX,y:b.offsetY};}else{var a=new Core.Web.Measure.Bounds(this.getEventTarget(b));return{x:b.clientX-a.left,y:b.clientY-a.top};}},getEventTarget:function(a){return a.target?a.target:a.srcElement;},getEventRelatedTarget:function(a){return a.relatedTarget?a.relatedTarget:a.toElement;},isAncestorOf:function(a,c){var b=c;while(b!=null){if(b==a){return true;}b=b.parentNode;}return false;},isDisplayed:function(a){while(a!=null){if(a.nodeType==1){if(a.style){if(a.style.visibility=="hidden"){return false;}if(a.style.display=="none"){return false;}}}if(a==document.body){return true;}a=a.parentNode;}return false;},preventEventDefault:function(a){if(a.preventDefault){a.preventDefault();}else{a.returnValue=false;
}},removeAllChildren:function(a){while(a.firstChild){a.removeChild(a.firstChild);}},removeEventListener:function(d,c,b,a){if(d.removeEventListener){d.removeEventListener(c,b,a);}else{if(d.detachEvent){d.detachEvent("on"+c,b);}}},removeNode:function(b){var a=b.parentNode;if(!a){return;}if(Core.Web.Env.QUIRK_PERFORMANCE_LARGE_DOM_REMOVE){this._removeNodeRecursive(b);}else{a.removeChild(b);}},_removeNodeRecursive:function(c){var b=c.firstChild;while(b){var a=b.nextSibling;this._removeNodeRecursive(b);b=a;}c.parentNode.removeChild(c);},stopEventPropagation:function(a){if(a.stopPropagation){a.stopPropagation();}else{a.cancelBubble=true;}}};Core.Web.Env={ENGINE_PRESTO:null,ENGINE_WEBKIT:null,ENGINE_KHTML:null,ENGINE_MSHTML:null,ENGINE_GECKO:null,BROWSER_MOZILLA:null,BROWSER_OPERA:null,BROWSER_KONQUEROR:null,BROWSER_FIREFOX:null,BROWSER_INTERNET_EXPLORER:null,BROWSER_CHROME:null,BROWSER_VERSION_MAJOR:null,BROWSER_VERSION_MINOR:null,ENGINE_VERSION_MAJOR:null,ENGINE_VERSION_MINOR:null,DECEPTIVE_USER_AGENT:null,CSS_FLOAT:"cssFloat",MEASURE_OFFSET_EXCLUDES_BORDER:null,NOT_SUPPORTED_CSS_OPACITY:null,NOT_SUPPORTED_RELATIVE_COLUMN_WIDTHS:null,NOT_SUPPORTED_INPUT_SELECTION:null,NOT_SUPPORTED_RANGE:null,PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED:null,PROPRIETARY_EVENT_SELECT_START_SUPPORTED:null,PROPRIETARY_IE_OPACITY_FILTER_REQUIRED:null,PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED:null,PROPRIETARY_IE_RANGE:null,QUIRK_KEY_CODE_IS_CHAR_CODE:null,QUIRK_KEY_PRESS_FIRED_FOR_SPECIAL_KEYS:null,QUIRK_KEY_DOWN_NOT_FIRED_FOR_SPECIAL_KEYS:null,QUIRK_CSS_BORDER_COLLAPSE_INSIDE:null,QUIRK_CSS_POSITIONING_ONE_SIDE_ONLY:null,QUIRK_DELAYED_FOCUS_REQUIRED:null,QUIRK_IE_BLANK_SCREEN:null,QUIRK_IE_HAS_LAYOUT:null,QUIRK_IE_SELECT_LIST_DOM_UPDATE:null,QUIRK_IE_SELECT_PERCENT_WIDTH:null,QUIRK_IE_SELECT_Z_INDEX:null,QUIRK_IE_SECURE_ITEMS:null,QUIRK_IE_TABLE_PERCENT_WIDTH_SCROLLBAR_ERROR:null,QUIRK_MEASURE_OFFSET_HIDDEN_BORDER:null,QUIRK_OPERA_CSS_POSITIONING:null,QUIRK_PERFORMANCE_LARGE_DOM_REMOVE:null,QUIRK_WEBKIT_DOM_TEXT_ESCAPE:null,QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING:null,QUIRK_UNLOADED_IMAGE_HAS_SIZE:null,_ua:null,_uaAlpha:null,_init:function(){var b=null,c=null,a=false;
this._ua=navigator.userAgent.toLowerCase();this._uaAlpha="/"+this._ua.replace(/[^a-z]+/g,"/")+"/";if(this._testUAString("opera")){this.BROWSER_OPERA=a=this.ENGINE_PRESTO=true;b=this._parseVersionInfo("opera/");}else{if(this._testUAString("chrome")){this.BROWSER_CHROME=a=this.ENGINE_WEBKIT=true;b=this._parseVersionInfo("chrome/");}else{if(this._testUAString("safari")){this.BROWSER_SAFARI=a=this.ENGINE_WEBKIT=true;b=this._parseVersionInfo("version/");}else{if(this._testUAString("konqueror")){this.BROWSER_KONQUEROR=a=this.ENGINE_KHTML=true;b=this._parseVersionInfo("konqueror/");}else{if(this._testUAString("firefox")){this.BROWSER_FIREFOX=this.BROWSER_MOZILLA=a=this.ENGINE_GECKO=true;b=this._parseVersionInfo("firefox/");}else{if(this._testUAString("msie")){this.BROWSER_INTERNET_EXPLORER=a=this.ENGINE_MSHTML=true;c=b=this._parseVersionInfo("msie ");}}}}}}if(!a){if(this._testUAString("presto")){this.ENGINE_PRESTO=true;}else{if(this._testUAString("webkit")){this.ENGINE_WEBKIT=true;}else{if(this._testUAString("khtml")){this.ENGINE_KHTML=true;
}else{if(this._testUAString("trident")){this.ENGINE_MSHTML=true;}else{if(this._testUAString("gecko")){this.BROWSER_MOZILLA=this.ENGINE_GECKO=true;}}}}}}if(!c){if(this.ENGINE_PRESTO){c=this._parseVersionInfo("presto/");}else{if(this.ENGINE_WEBKIT){c=this._parseVersionInfo("webkit/");}else{if(this.ENGINE_GECKO){c=this._parseVersionInfo("rv:");if(!b){b=c;}}}}}if(b){this.BROWSER_VERSION_MAJOR=b.major;this.BROWSER_VERSION_MINOR=b.minor;}if(c){this.ENGINE_VERSION_MAJOR=c.major;this.ENGINE_VERSION_MINOR=c.minor;}this.DECEPTIVE_USER_AGENT=this.BROWSER_OPERA||this.BROWSER_SAFARI||this.BROWSER_CHROME||this.BROWSER_KONQUEROR;this.MEASURE_OFFSET_EXCLUDES_BORDER=false;if(this.BROWSER_INTERNET_EXPLORER){this.CSS_FLOAT="styleFloat";this.QUIRK_KEY_CODE_IS_CHAR_CODE=true;this.QUIRK_IE_SECURE_ITEMS=true;this.NOT_SUPPORTED_RANGE=true;this.NOT_SUPPORTED_INPUT_SELECTION=true;this.PROPRIETARY_IE_RANGE=true;this.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED=true;this.PROPRIETARY_EVENT_SELECT_START_SUPPORTED=true;
this.QUIRK_DELAYED_FOCUS_REQUIRED=true;this.QUIRK_UNLOADED_IMAGE_HAS_SIZE=true;this.MEASURE_OFFSET_EXCLUDES_BORDER=true;this.QUIRK_IE_BLANK_SCREEN=true;this.QUIRK_IE_HAS_LAYOUT=true;this.NOT_SUPPORTED_CSS_OPACITY=true;this.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED=true;if(this.BROWSER_VERSION_MAJOR&&this.BROWSER_VERSION_MAJOR<8){this.QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING=true;this.NOT_SUPPORTED_RELATIVE_COLUMN_WIDTHS=true;this.QUIRK_CSS_BORDER_COLLAPSE_INSIDE=true;this.QUIRK_IE_TABLE_PERCENT_WIDTH_SCROLLBAR_ERROR=true;this.QUIRK_IE_SELECT_PERCENT_WIDTH=true;if(this.BROWSER_VERSION_MAJOR<7){this.QUIRK_IE_SELECT_LIST_DOM_UPDATE=true;this.QUIRK_CSS_POSITIONING_ONE_SIDE_ONLY=true;this.PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED=true;this.QUIRK_IE_SELECT_Z_INDEX=true;Core.Arrays.LargeMap.garbageCollectEnabled=true;}}}else{if(this.ENGINE_GECKO){this.QUIRK_KEY_PRESS_FIRED_FOR_SPECIAL_KEYS=true;this.MEASURE_OFFSET_EXCLUDES_BORDER=true;this.QUIRK_MEASURE_OFFSET_HIDDEN_BORDER=true;if(this.BROWSER_FIREFOX){if(this.BROWSER_VERSION_MAJOR<2){this.QUIRK_DELAYED_FOCUS_REQUIRED=true;
}}else{this.QUIRK_PERFORMANCE_LARGE_DOM_REMOVE=true;this.QUIRK_DELAYED_FOCUS_REQUIRED=true;}}else{if(this.ENGINE_PRESTO){this.QUIRK_KEY_CODE_IS_CHAR_CODE=true;this.QUIRK_TABLE_CELL_WIDTH_EXCLUDES_PADDING=true;if(this.BROWSER_VERSION_MAJOR==9&&this.BROWSER_VERSION_MINOR>=50){this.QUIRK_OPERA_CSS_POSITIONING=true;}this.NOT_SUPPORTED_RELATIVE_COLUMN_WIDTHS=true;}else{if(this.ENGINE_WEBKIT){this.MEASURE_OFFSET_EXCLUDES_BORDER=true;if(this.ENGINE_VERSION_MAJOR<526||(this.ENGINE_VERSION_MAJOR==526&&this.ENGINE_VERSION_MINOR<8)){this.QUIRK_WEBKIT_DOM_TEXT_ESCAPE=true;}}}}}},_parseVersionInfo:function(e){var d={};var b=this._ua.indexOf(e);if(b==-1){return;}var a=this._ua.indexOf(".",b);var h=this._ua.length;if(a==-1){a=this._ua.length;}else{for(var f=a+1;f<this._ua.length;f++){var g=this._ua.charAt(f);if(isNaN(g)){h=f;break;}}}d.major=parseInt(this._ua.substring(b+e.length,a),10);if(a==this._ua.length){d.minor=0;}else{d.minor=parseInt(this._ua.substring(a+1,h),10);}return d;},_testUAString:function(a){return this._uaAlpha.indexOf("/"+a+"/")!=-1;
}};Core.Web.Event={Selection:{disable:function(a){Core.Web.Event.add(a,"mousedown",Core.Web.Event.Selection._disposeEvent,false);if(Core.Web.Env.PROPRIETARY_EVENT_SELECT_START_SUPPORTED){Core.Web.Event.add(a,"selectstart",Core.Web.Event.Selection._disposeEvent,false);}},_disposeEvent:function(a){Core.Web.DOM.preventEventDefault(a);},enable:function(a){Core.Web.Event.remove(a,"mousedown",Core.Web.Event.Selection._disposeEvent,false);if(Core.Web.Env.PROPRIETARY_EVENT_SELECT_START_SUPPORTED){Core.Web.Event.remove(a,"selectstart",Core.Web.Event.Selection._disposeEvent,false);}}},_nextId:0,_listenerCount:0,debugListenerCount:false,_capturingListenerMap:new Core.Arrays.LargeMap(),_bubblingListenerMap:new Core.Arrays.LargeMap(),add:function(c,b,d,a){if(!c.__eventProcessorId){c.__eventProcessorId=++Core.Web.Event._nextId;}var f;if(c.__eventProcessorId==Core.Web.Event._lastId&&a==Core.Web.Event._lastCapture){f=Core.Web.Event._lastListenerList;}else{var e=a?Core.Web.Event._capturingListenerMap:Core.Web.Event._bubblingListenerMap;
f=e.map[c.__eventProcessorId];if(!f){f=new Core.ListenerList();e.map[c.__eventProcessorId]=f;}Core.Web.Event._lastId=c.__eventProcessorId;Core.Web.Event._lastCapture=a;Core.Web.Event._lastListenerList=f;}if(!f.hasListeners(b)){Core.Web.DOM.addEventListener(c,b,Core.Web.Event._processEvent,false);++Core.Web.Event._listenerCount;}f.addListener(b,d);},_processEvent:function(d){if(Core.Web.Event.debugListenerCount){Core.Debug.consoleWrite("Core.Web.Event listener count: "+Core.Web.Event._listenerCount);}d=d?d:window.event;if(!d.target&&d.srcElement){d.target=d.srcElement;}var f=[];var b=d.target;while(b){if(b.__eventProcessorId){f.push(b);}b=b.parentNode;}var g,c,a=true;for(c=f.length-1;c>=0;--c){g=Core.Web.Event._capturingListenerMap.map[f[c].__eventProcessorId];if(g){d.registeredTarget=f[c];if(!g.fireEvent(d)){a=false;break;}}}if(a){for(c=0;c<f.length;++c){g=Core.Web.Event._bubblingListenerMap.map[f[c].__eventProcessorId];if(g){d.registeredTarget=f[c];if(!g.fireEvent(d)){break;}}}}Core.Web.DOM.stopEventPropagation(d);
},remove:function(c,b,d,a){Core.Web.Event._lastId=null;if(!c.__eventProcessorId){return;}var e=a?Core.Web.Event._capturingListenerMap:Core.Web.Event._bubblingListenerMap;var f=e.map[c.__eventProcessorId];if(f){f.removeListener(b,d);if(f.isEmpty()){e.remove(c.__eventProcessorId);}if(!f.hasListeners(b)){Core.Web.DOM.removeEventListener(c,b,Core.Web.Event._processEvent,false);--Core.Web.Event._listenerCount;}}},removeAll:function(a){Core.Web.Event._lastId=null;if(!a.__eventProcessorId){return;}Core.Web.Event._removeAllImpl(a,Core.Web.Event._capturingListenerMap);Core.Web.Event._removeAllImpl(a,Core.Web.Event._bubblingListenerMap);},_removeAllImpl:function(c,d){var e=d.map[c.__eventProcessorId];if(!e){return;}var b=e.getListenerTypes();for(var a=0;a<b.length;++a){Core.Web.DOM.removeEventListener(c,b[a],Core.Web.Event._processEvent,false);--Core.Web.Event._listenerCount;}d.remove(c.__eventProcessorId);},toString:function(){return"Capturing: "+Core.Web.Event._capturingListenerMap+"\n"+"Bubbling: "+Core.Web.Event._bubblingListenerMap;
}};Core.Web.HttpConnection=Core.extend({_url:null,_contentType:null,_method:null,_messageObject:null,_listenerList:null,_disposed:false,_xmlHttpRequest:null,_requestHeaders:null,$construct:function(a,d,b,c){this._url=a;this._contentType=c;this._method=d;if(Core.Web.Env.QUIRK_WEBKIT_DOM_TEXT_ESCAPE&&b instanceof Document){this._preprocessWebkitDOM(b.documentElement);}this._messageObject=b;this._listenerList=new Core.ListenerList();},_preprocessWebkitDOM:function(a){if(a.nodeType==3){var b=a.data;b=b.replace(/&/g,"&amp;");b=b.replace(/</g,"&lt;");b=b.replace(/>/g,"&gt;");a.data=b;}else{var c=a.firstChild;while(c){this._preprocessWebkitDOM(c);c=c.nextSibling;}}},addResponseListener:function(a){this._listenerList.addListener("response",a);},connect:function(){var b=false;if(window.XMLHttpRequest){this._xmlHttpRequest=new XMLHttpRequest();}else{if(window.ActiveXObject){b=true;this._xmlHttpRequest=new ActiveXObject("Microsoft.XMLHTTP");}else{throw"Connect failed: Cannot create XMLHttpRequest.";
}}var a=this;this._xmlHttpRequest.onreadystatechange=function(){if(!a){return;}try{a._processReadyStateChange();}finally{if(a._disposed){a=null;}}};this._xmlHttpRequest.open(this._method,this._url,true);if(this._requestHeaders&&(b||this._xmlHttpRequest.setRequestHeader)){for(var c in this._requestHeaders){try{this._xmlHttpRequest.setRequestHeader(c,this._requestHeaders[c]);}catch(d){throw new Error('Failed to set header "'+c+'"');}}}if(this._contentType&&(b||this._xmlHttpRequest.setRequestHeader)){this._xmlHttpRequest.setRequestHeader("Content-Type",this._contentType);}this._xmlHttpRequest.send(this._messageObject?this._messageObject:null);},dispose:function(){this._listenerList=null;this._messageObject=null;this._xmlHttpRequest=null;this._disposed=true;this._requestHeaders=null;},getResponseHeader:function(a){return this._xmlHttpRequest?this._xmlHttpRequest.getResponseHeader(a):null;},getAllResponseHeaders:function(){return this._xmlHttpRequest?this._xmlHttpRequest.getAllResponseHeaders():null;
},getStatus:function(){return this._xmlHttpRequest?this._xmlHttpRequest.status:null;},getResponseText:function(){return this._xmlHttpRequest?this._xmlHttpRequest.responseText:null;},getResponseXml:function(){return this._xmlHttpRequest?this._xmlHttpRequest.responseXML:null;},_processReadyStateChange:function(){if(this._disposed){return;}if(this._xmlHttpRequest.readyState==4){var c;try{var b=!this._xmlHttpRequest.status||(this._xmlHttpRequest.status>=200&&this._xmlHttpRequest.status<=299);c={type:"response",source:this,valid:b};}catch(a){c={type:"response",source:this,valid:false,exception:a};}Core.Web.Scheduler.run(Core.method(this,function(){this._listenerList.fireEvent(c);this.dispose();}));}},removeResponseListener:function(a){this._listenerList.removeListener("response",a);},setRequestHeader:function(b,a){if(!this._requestHeaders){this._requestHeaders={};}this._requestHeaders[b]=a;}});Core.Web.Image={_EXPIRE_TIME:5000,_Monitor:Core.extend({_processImageLoadRef:null,_runnable:null,_listener:null,_images:null,_count:0,_expiration:null,_imagesLoadedSinceUpdate:false,$construct:function(d,e,a){this._listener=e;
this._processImageLoadRef=Core.method(this,this._processImageLoad);this._runnable=new Core.Web.Scheduler.MethodRunnable(Core.method(this,this._updateProgress),a||250,true);var b=d.getElementsByTagName("img");this._images=[];for(var c=0;c<b.length;++c){if(!b[c].complete&&(Core.Web.Env.QUIRK_UNLOADED_IMAGE_HAS_SIZE||(!b[c].height&&!b[c].style.height))){this._images.push(b[c]);Core.Web.Event.add(b[c],"load",this._processImageLoadRef,false);}}this._count=this._images.length;if(this._count>0){this._expiration=new Date().getTime()+Core.Web.Image._EXPIRE_TIME;Core.Web.Scheduler.add(this._runnable);}},_processImageLoad:function(b){b=b?b:window.event;var a=Core.Web.DOM.getEventTarget(b);this._imagesLoadedSinceUpdate=true;Core.Web.Event.remove(a,"load",this._processImageLoadRef,false);Core.Arrays.remove(this._images,a);--this._count;if(this._count===0){this._stop();this._notify();}},_notify:function(){Core.Web.Scheduler.run(Core.method(this,function(){this._listener({source:this,type:"imageLoad",expired:this._expired,complete:this._expired||this._count===0});
}));},_stop:function(){Core.Web.Scheduler.remove(this._runnable);this._runnable=null;for(var a=0;a<this._images.length;++a){Core.Web.Event.remove(this._images[a],"load",this._processImageLoadRef,false);}},_updateProgress:function(){if(new Date().getTime()>this._expiration){this._expired=true;this._stop();this._notify();return;}if(this._imagesLoadedSinceUpdate){this._imagesLoadedSinceUpdate=false;this._notify();}}}),monitor:function(d,b,c){var a=new Core.Web.Image._Monitor(d,b,c);return a._count>0;}};Core.Web.Key={_KEY_TABLES:{GECKO:{59:186,61:187,109:189},MAC_GECKO:{},PRESTO:{59:186,61:187,44:188,45:189,46:190,47:191,96:192,91:219,92:220,93:221,39:222},WEBKIT:{}},_keyTable:null,_loadKeyTable:function(){if(Core.Web.Env.ENGINE_GECKO){this._keyTable=this._KEY_TABLES.GECKO;}else{if(Core.Web.Env.ENGINE_PRESTO){this._keyTable=this._KEY_TABLES.PRESTO;}else{this._keyTable={};}}},translateKeyCode:function(a){if(!this._keyTable){this._loadKeyTable();}return this._keyTable[a]||a;}};Core.Web.Library={_loadedLibraries:{},evalLine:null,Group:Core.extend({_listenerList:null,_libraries:null,_loadedCount:0,_totalCount:0,$construct:function(){this._listenerList=new Core.ListenerList();
this._libraries=[];},add:function(b){if(Core.Web.Library._loadedLibraries[b]){return;}var a=new Core.Web.Library._Item(this,b);this._libraries.push(a);},addLoadListener:function(a){this._listenerList.addListener("load",a);},hasNewLibraries:function(){return this._libraries.length>0;},_install:function(){for(var b=0;b<this._libraries.length;++b){try{this._libraries[b]._install();}catch(a){var c={type:"load",source:this,success:false,ex:a,url:this._libraries[b]._url,cancel:false};try{this._listenerList.fireEvent(c);}finally{if(!c.cancel){throw new Error('Exception installing library "'+this._libraries[b]._url+'"; '+a);}}}}this._listenerList.fireEvent({type:"load",source:this,success:true});},_notifyRetrieved:function(){++this._loadedCount;if(this._loadedCount==this._totalCount){this._install();}},load:function(){this._totalCount=this._libraries.length;for(var a=0;a<this._libraries.length;++a){this._libraries[a]._retrieve();}},removeLoadListener:function(a){this._listenerList.removeListener("load",a);
}}),_Item:Core.extend({_url:null,_group:null,_content:null,$construct:function(b,a){this._url=a;this._group=b;},_retrieveListener:function(a){if(!a.valid){throw new Error('Invalid HTTP response retrieving library "'+this._url+'", received status: '+a.source.getStatus());}this._content=a.source.getResponseText();this._group._notifyRetrieved();},_install:function(){if(Core.Web.Library._loadedLibraries[this._url]){return;}Core.Web.Library._loadedLibraries[this._url]=true;if(this._content==null){throw new Error("Attempt to install library when no content has been loaded.");}Core.Web.Library.evalLine=new Error().lineNumber+1;eval(this._content);},_retrieve:function(){var a=new Core.Web.HttpConnection(this._url,"GET");a.addResponseListener(Core.method(this,this._retrieveListener));a.connect();}}),exec:function(b,c){var d=null;for(var a=0;a<b.length;++a){if(!Core.Web.Library._loadedLibraries[b[a]]){if(d==null){d=new Core.Web.Library.Group();}d.add(b[a]);}}if(d==null){Core.Web.Scheduler.run(c);
return;}d.addLoadListener(c);d.load();}};Core.Web.Measure={_scrollElements:["div","body"],_hInch:96,_vInch:96,_hEx:7,_vEx:7,_hEm:13.3333,_vEm:13.3333,SCROLL_WIDTH:17,SCROLL_HEIGHT:17,_PARSER:/^(-?\d+(?:\.\d+)?)(.+)?$/,extentToPixels:function(d,a){var f=this._PARSER.exec(d);if(!f){throw new Error("Invalid Extent: "+d);}var e=parseFloat(f[1]);var b=f[2]?f[2]:"px";if(!b||b=="px"){return e;}var c=a?Core.Web.Measure._hInch:Core.Web.Measure._vInch;switch(b){case"%":return null;case"in":return e*(a?Core.Web.Measure._hInch:Core.Web.Measure._vInch);case"cm":return e*(a?Core.Web.Measure._hInch:Core.Web.Measure._vInch)/2.54;case"mm":return e*(a?Core.Web.Measure._hInch:Core.Web.Measure._vInch)/25.4;case"pt":return e*(a?Core.Web.Measure._hInch:Core.Web.Measure._vInch)/72;case"pc":return e*(a?Core.Web.Measure._hInch:Core.Web.Measure._vInch)/6;case"em":return e*(a?Core.Web.Measure._hEm:Core.Web.Measure._vEm);case"ex":return e*(a?Core.Web.Measure._hEx:Core.Web.Measure._vEx);}},_calculateExtentSizes:function(){var h=document.getElementsByTagName("body")[0];
var f=document.createElement("div");f.style.width="4in";f.style.height="4in";h.appendChild(f);Core.Web.Measure._hInch=f.offsetWidth/4;Core.Web.Measure._vInch=f.offsetHeight/4;h.removeChild(f);var b=document.createElement("div");b.style.width="24em";b.style.height="24em";h.appendChild(b);Core.Web.Measure._hEm=b.offsetWidth/24;Core.Web.Measure._vEm=b.offsetHeight/24;h.removeChild(b);var a=document.createElement("div");a.style.width="24ex";a.style.height="24ex";h.appendChild(a);Core.Web.Measure._hEx=a.offsetWidth/24;Core.Web.Measure._vEx=a.offsetHeight/24;h.removeChild(a);var g=document.createElement("div");g.style.cssText="width:500px;height:100px;overflow:auto;";var d=document.createElement("div");d.style.cssText="width:100px;height:200px;";g.appendChild(d);var e=document.createElement("div");e.style.cssText="width:100%;height:10px;";g.appendChild(e);h.appendChild(g);var c=500-e.offsetWidth;if(c){Core.Web.Measure.SCROLL_WIDTH=Core.Web.Measure.SCROLL_HEIGHT=c;}h.removeChild(g);},_getScrollOffset:function(b){var a=0,c=0;
do{if(b.scrollLeft||b.scrollTop){a+=b.scrollTop||0;c+=b.scrollLeft||0;}b=b.offsetParent;}while(b);return{left:c,top:a};},_getCumulativeOffset:function(b){var a=0,d=0,e=true;do{a+=b.offsetTop||0;d+=b.offsetLeft||0;if(!e&&Core.Web.Env.MEASURE_OFFSET_EXCLUDES_BORDER){if(b.style.borderLeftWidth&&b.style.borderLeftStyle!="none"){var c=Core.Web.Measure.extentToPixels(b.style.borderLeftWidth,true);d+=c;if(Core.Web.Env.QUIRK_MEASURE_OFFSET_HIDDEN_BORDER&&b.style.overflow=="hidden"){d+=c;}}if(b.style.borderTopWidth&&b.style.borderTopStyle!="none"){var f=Core.Web.Measure.extentToPixels(b.style.borderTopWidth,false);a+=f;if(Core.Web.Env.QUIRK_MEASURE_OFFSET_HIDDEN_BORDER&&b.style.overflow=="hidden"){a+=f;}}}e=false;b=b.offsetParent;}while(b);return{left:d,top:a};},Bounds:Core.extend({$static:{FLAG_MEASURE_DIMENSION:1,FLAG_MEASURE_POSITION:2,_initMeasureContainer:function(){this._offscreenDiv=document.createElement("div");this._offscreenDiv.style.cssText="position: absolute; top: -1300px; left: -1700px; width: 1600px; height: 1200px;";
document.body.appendChild(this._offscreenDiv);}},width:null,height:null,top:null,left:null,$construct:function(g,e){var b=(e&&e.flags)||(Core.Web.Measure.Bounds.FLAG_MEASURE_DIMENSION|Core.Web.Measure.Bounds.FLAG_MEASURE_POSITION);if(g===document.body){return{x:0,y:0,height:window.innerHeight||document.documentElement.clientHeight,width:window.innerWidth||document.documentElement.clientWidth};}var a=g;while(a&&a!=document){a=a.parentNode;}var c=a==document;var i,f;if(b&Core.Web.Measure.Bounds.FLAG_MEASURE_DIMENSION){if(!c){i=g.parentNode;f=g.nextSibling;if(i){i.removeChild(g);}if(e){if(e.width){Core.Web.Measure.Bounds._offscreenDiv.width=e.width;}if(e.height){Core.Web.Measure.Bounds._offscreenDiv.height=e.height;}}Core.Web.Measure.Bounds._offscreenDiv.appendChild(g);if(e){Core.Web.Measure.Bounds._offscreenDiv.width="1600px";Core.Web.Measure.Bounds._offscreenDiv.height="1200px";}}this.width=g.offsetWidth;this.height=g.offsetHeight;if(!c){Core.Web.Measure.Bounds._offscreenDiv.removeChild(g);
if(i){i.insertBefore(g,f);}}}if(c&&(b&Core.Web.Measure.Bounds.FLAG_MEASURE_POSITION)){var d=Core.Web.Measure._getCumulativeOffset(g);var h=Core.Web.Measure._getScrollOffset(g);this.top=d.top-h.top;this.left=d.left-h.left;}},toString:function(){return(this.left!=null?(this.left+","+this.top+" : "):"")+(this.width!=null?("["+this.width+"x"+this.height+"]"):"");}})};Core.Web.Scheduler={_runnables:[],_threadHandle:null,_nextExecution:null,add:function(a){Core.Arrays.remove(Core.Web.Scheduler._runnables,a);a._nextExecution=new Date().getTime()+(a.timeInterval?a.timeInterval:0);Core.Web.Scheduler._runnables.push(a);Core.Web.Scheduler._setTimeout(a._nextExecution);},_execute:function(){Core.Web.Scheduler._threadHandle=null;var d=new Date().getTime();var f=Number.MAX_VALUE;var c,e;for(c=0;c<Core.Web.Scheduler._runnables.length;++c){e=Core.Web.Scheduler._runnables[c];if(e&&e._nextExecution&&e._nextExecution<=d){e._nextExecution=null;try{e.run();}catch(b){throw (b);}}}var g=[];for(c=0;c<Core.Web.Scheduler._runnables.length;
++c){e=Core.Web.Scheduler._runnables[c];if(e==null){continue;}if(e._nextExecution){g.push(e);var a=e._nextExecution-d;if(a<f){f=a;}continue;}if(e.timeInterval!=null&&e.repeat){e._nextExecution=d+e.timeInterval;g.push(e);if(e.timeInterval<f){f=e.timeInterval;}}}Core.Web.Scheduler._runnables=g;if(f<Number.MAX_VALUE){Core.Web.Scheduler._setTimeout(d+f);}},remove:function(b){var a=Core.Arrays.indexOf(Core.Web.Scheduler._runnables,b);Core.Web.Scheduler._runnables[a]=null;},run:function(d,a,c){var b=new Core.Web.Scheduler.MethodRunnable(d,a,c);Core.Web.Scheduler.add(b);return b;},_setTimeout:function(c){if(Core.Web.Scheduler._threadHandle!=null&&Core.Web.Scheduler._nextExecution<c){return;}if(Core.Web.Scheduler._threadHandle!=null){window.clearTimeout(Core.Web.Scheduler._threadHandle);}var a=new Date().getTime();Core.Web.Scheduler._nextExecution=c;var b=c-a>0?c-a:0;Core.Web.Scheduler._threadHandle=window.setTimeout(Core.Web.Scheduler._execute,b);},update:function(c){if(Core.Arrays.indexOf(Core.Web.Scheduler._runnables,c)==-1){return;
}var b=new Date().getTime();var a=c.timeInterval?c.timeInterval:0;c._nextExecution=b+a;Core.Web.Scheduler._setTimeout(c._nextExecution);}};Core.Web.Scheduler.Runnable=Core.extend({_nextExecution:null,$virtual:{timeInterval:null,repeat:false},$abstract:{run:function(){}}});Core.Web.Scheduler.MethodRunnable=Core.extend(Core.Web.Scheduler.Runnable,{f:null,$construct:function(c,a,b){if(!a&&b){throw new Error("Cannot create repeating runnable without time delay:"+c);}this.f=c;this.timeInterval=a;this.repeat=!!b;},$virtual:{run:function(){this.f();}}});Core.Web.VirtualPosition={_OFFSETS_VERTICAL:["paddingTop","paddingBottom","marginTop","marginBottom","borderTopWidth","borderBottomWidth"],_OFFSETS_HORIZONTAL:["paddingLeft","paddingRight","marginLeft","marginRight","borderLeftWidth","borderRightWidth"],enabled:false,_calculateOffsets:function(e,b){var c=0;for(var a=0;a<e.length;++a){var d=b[e[a]];if(d){if(d.toString().indexOf("px")==-1){return -1;}c+=parseInt(d,10);}}return c;},_init:function(){this.enabled=true;
},redraw:function(c){if(!this.enabled){return;}if(!c||!c.parentNode){return;}var f;if(this._verifyPixelValue(c.style.top)&&this._verifyPixelValue(c.style.bottom)){var b=c.parentNode.offsetHeight;if(!isNaN(b)){f=this._calculateOffsets(this._OFFSETS_VERTICAL,c.style);if(f!=-1){var e=b-parseInt(c.style.top,10)-parseInt(c.style.bottom,10)-f;if(e<=0){c.style.height=0;}else{if(c.style.height!=e+"px"){c.style.height=e+"px";}}}}}if(this._verifyPixelValue(c.style.left)&&this._verifyPixelValue(c.style.right)){var d=c.parentNode.offsetWidth;if(!isNaN(d)){f=this._calculateOffsets(this._OFFSETS_HORIZONTAL,c.style);if(f!=-1){var a=d-parseInt(c.style.left,10)-parseInt(c.style.right,10)-f;if(a<=0){c.style.width=0;}else{if(c.style.width!=a+"px"){c.style.width=a+"px";}}}}}},_verifyPixelValue:function(b){if(b==null||b===""){return false;}var a=b.toString();return a=="0"||a.indexOf("px")!=-1;}};