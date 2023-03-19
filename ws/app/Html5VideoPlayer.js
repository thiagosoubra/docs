WS.Html5VideoPlayerWindow=Core.extend(WS.VideoPlayerWindow,{$construct:function(a){WS.VideoPlayerWindow.call(this,a);},isFlash:function(){return false;},loadVideo:function(){this.content.add(new WS.Html5VideoDisplay({video:this._url,events:{load:Core.method(this,this.processLoad),start:Core.method(this,this.processStart),error:Core.method(this,this.processError)}}));}});WS.Html5VideoDisplay=Core.extend(Echo.Component,{$load:function(){Echo.ComponentFactory.registerType("WS.Html5VideoDisplay",this);},componentType:"WS.Html5VideoDisplay",doError:function(a){this.fireEvent({source:this,type:"error",domEvent:a});},doLoad:function(){this.fireEvent({source:this,type:"load"});},doStart:function(){this.fireEvent({source:this,type:"start"});}});WS.Html5VideoDisplay.Sync=Core.extend(Echo.Render.ComponentSync,{_started:false,_loaded:false,$load:function(){Echo.Render.registerPeer("WS.Html5VideoDisplay",this);},_processStart:function(a){if(this._started){return;}this._started=true;this.component.doStart();
},_processError:function(a){this.component.doError(a);},renderAdd:function(b,a){this._div=document.createElement("div");this._div.style.cssText="width:100%;height:100%;";this._video=document.createElement("video");this._video.controls="controls";this._video.autoplay="autoplay";this._video.src=this.component.get("video");this._video.style.cssText="display:block;width:100%;height:100%;";Core.Web.Event.add(this._video,"error",Core.method(this,this._processError),false);Core.Web.Event.add(this._video,"play",Core.method(this,this._processStart),false);this._div.appendChild(this._video);a.appendChild(this._div);},renderDisplay:function(){if(this._loaded){return;}this._loaded=true;this.component.doLoad();},renderDispose:function(a){if(this._video){Core.Web.Event.removeAll(this._video);this._video=null;}this._started=false;this._loaded=false;this._div=null;},renderUpdate:function(c){var a=this._div;var b=a.parentNode;Echo.Render.renderComponentDispose(c,c.parent);b.removeChild(a);this.renderAdd(c,b);
return true;}});