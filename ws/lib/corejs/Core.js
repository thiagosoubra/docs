Core={_copyFunction:function(a){return function(){a.apply(this,arguments);};},_createFunction:function(){return function(){};},extend:function(){var h=arguments.length==1?null:arguments[0];var g=arguments.length==1?arguments[0]:arguments[1];var b,e;if(arguments.length==2){if(typeof(h)!="function"){throw new Error("Base class is not a function, cannot derive.");}}if(!g){throw new Error("Object definition not provided.");}var a;if(g.$construct){a=g.$construct;delete g.$construct;}else{if(h){a=Core._copyFunction(h);}else{a=Core._createFunction();}}a.$virtual={};a.$super=h;if(h){var f=Core._createFunction();f.prototype=h.prototype;a.prototype=new f();}a.prototype.constructor=a;if(g.$abstract){a.$abstract={};if(h&&h.$abstract){for(b in h.$abstract){a.$abstract[b]=h.$abstract[b];}}if(g.$abstract instanceof Object){for(b in g.$abstract){a.$abstract[b]=true;a.$virtual[b]=true;}}delete g.$abstract;}if(h){for(e in h.$virtual){a.$virtual[e]=h.$virtual[e];}}if(g.$virtual){Core._inherit(a.prototype,g.$virtual,a.$virtual);
for(e in g.$virtual){a.$virtual[e]=true;}delete g.$virtual;}if(g.hasOwnProperty("toString")){a.prototype.toString=g.toString;}if(g.hasOwnProperty("valueOf")){a.prototype.valueOf=g.valueOf;}delete g.toString;delete g.valueOf;if(g.$include){var c=g.$include.reverse();Core._processMixins(a,c);delete g.$include;}var d=null;if(g.$load){d=g.$load;delete g.$load;}if(g.$static){Core._inherit(a,g.$static);delete g.$static;}Core._inherit(a.prototype,g,a.$virtual);if(!a.$abstract){this._verifyAbstractImpl(a);}if(d){d.call(a);}return a;},get:function(a,c){for(var b=0;b<c.length;++b){a=a[c[b]];if(!a){return null;}}return a;},_isVirtual:function(b,a){switch(a){case"toString":case"valueOf":return true;}return b[a];},_inherit:function(a,d,c){for(var b in d){if(c&&a[b]!==undefined&&!this._isVirtual(c,b)){throw new Error('Cannot override non-virtual property "'+b+'".');}else{a[b]=d[b];}}},method:function(a,b){return function(){return b.apply(a,arguments);};},_processMixins:function(b,c){for(var d=0;d<c.length;
++d){for(var a in c[d]){if(b.prototype[a]){continue;}b.prototype[a]=c[d][a];}}},set:function(a,e,d){var c=null;for(var b=0;b<e.length-1;++b){c=a;a=a[e[b]];if(!a){a={};c[e[b]]=a;}}a[e[e.length-1]]=d;},_verifyAbstractImpl:function(b){var c=b.$super;if(!c||!c.$abstract||c.$abstract===true){return;}for(var a in c.$abstract){if(b.prototype[a]==null){throw new Error('Concrete class does not provide implementation of abstract method "'+a+'".');}}}};Core.Debug={consoleElement:null,useAlertDialog:false,consoleWrite:function(b){if(Core.Debug.consoleElement){var a=document.createElement("div");a.appendChild(document.createTextNode(b));if(Core.Debug.consoleElement.childNodes.length===0){Core.Debug.consoleElement.appendChild(a);}else{Core.Debug.consoleElement.insertBefore(a,Core.Debug.consoleElement.firstChild);}}else{if(Core.Debug.useAlertDialog){alert("DEBUG:"+b);}}},toString:function(b){var c="";for(var a in b){if(typeof b[a]!="function"){c+=a+":"+b[a]+"\n";}}return c;}};Core.Arrays={containsAll:function(f,d,g){if(g&&f.length<d.length){return false;
}if(d.length===0){return true;}var e,c;for(var b=0;b<d.length;++b){e=false;c=d[b];for(var a=0;a<f.length;++a){if(c==f[a]){e=true;break;}}if(!e){return false;}}return true;},indexOf:function(c,b){for(var a=0;a<c.length;++a){if(b==c[a]){return a;}}return -1;},remove:function(c,b){for(var a=0;a<c.length;++a){if(b==c[a]){c.splice(a,1);return;}}},removeDuplicates:function(c){c.sort();var b=0;for(var a=c.length-1;a>0;--a){if(c[a]==c[a-1]){c[a]=c[c.length-1-b];++b;}}if(b>0){c.length=c.length-b;}}};Core.Arrays.LargeMap=Core.extend({$static:{garbageCollectEnabled:false},_removeCount:0,garbageCollectionInterval:250,map:null,$construct:function(){this.map={};},_garbageCollect:function(){this._removeCount=0;var a={};for(var b in this.map){a[b]=this.map[b];}this.map=a;},remove:function(a){delete this.map[a];if(Core.Arrays.LargeMap.garbageCollectEnabled){++this._removeCount;if(this._removeCount>=this.garbageCollectionInterval){this._garbageCollect();}}},toString:function(){return Core.Debug.toString(this.map);
}});Core.ListenerList=Core.extend({_data:null,$construct:function(){this._data=[];},addListener:function(a,b){this._data.push(a,b);},fireEvent:function(d){if(d.type==null){throw new Error("Cannot fire event, type property not set.");}var a,c=true,b=[];for(a=0;a<this._data.length;a+=2){if(this._data[a]==d.type){b.push(this._data[a+1]);}}for(a=0;a<b.length;++a){c=b[a](d)&&c;}return c;},getListenerTypes:function(){var b=[];for(var a=0;a<this._data.length;a+=2){b.push(this._data[a]);}Core.Arrays.removeDuplicates(b);return b;},getListeners:function(b){var c=[];for(var a=0;a<this._data.length;a+=2){if(this._data[a]==b){c.push(this._data[a+1]);}}return c;},getListenerCount:function(b){var c=0;for(var a=0;a<this._data.length;a+=2){if(this._data[a]==b){++c;}}return c;},hasListeners:function(b){for(var a=0;a<this._data.length;a+=2){if(this._data[a]==b){return true;}}return false;},isEmpty:function(){return this._data.length===0;},removeListener:function(b,d){for(var a=0;a<this._data.length;a+=2){if(this._data[a]==b&&d==this._data[a+1]){var c=this._data.length;
this._data.splice(a,2);return;}}},toString:function(){var a="";for(var b=0;b<this._data.length;b+=2){if(b>0){a+=", ";}a+=this._data[b]+":"+this._data[b+1];}return a;}});Core.ResourceBundle=Core.extend({$static:{getParentLanguageCode:function(a){if(a.indexOf("-")==-1){return null;}else{return a.substring(0,a.indexOf("-"));}}},_sourceMaps:null,_generatedMaps:null,_defaultMap:null,$construct:function(a){this._sourceMaps={};this._generatedMaps={};this._defaultMap=a;},get:function(d){var c=d?this._generatedMaps[d]:this._defaultMap;if(c){return c;}c={};var a;var e=this._sourceMaps[d];if(e){for(a in e){c[a]=e[a];}}var b=Core.ResourceBundle.getParentLanguageCode(d);if(b){e=this._sourceMaps[b];if(e){for(a in e){if(c[a]===undefined){c[a]=e[a];}}}}for(a in this._defaultMap){if(c[a]===undefined){c[a]=this._defaultMap[a];}}this._generatedMaps[d]=c;return c;},set:function(b,a){this._generatedMaps={};this._sourceMaps[b]=a;},toString:function(){var b="ResourceBundle: ";for(var a in this._sourceMaps){b+=" "+a;
}return b;}});