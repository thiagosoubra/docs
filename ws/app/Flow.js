WS.Flow=Core.extend(Echo.Component,{$load:function(){Echo.ComponentFactory.registerType("WS.Flow",this);},componentType:"WS.Flow"});WS.Flow.Sync=Core.extend(Echo.Render.ComponentSync,{$load:function(){Echo.Render.registerPeer("WS.Flow",this);},renderAdd:function(e,b){this._div=document.createElement("div");for(var c=0;c<this.component.children.length;++c){var a=document.createElement("div");a.style.cssText="float:left;";a.style.paddingRight=Echo.Sync.Extent.toPixels(this.component.render("horizontalSpacing",0))+"px";a.style.paddingBottom=Echo.Sync.Extent.toPixels(this.component.render("verticalSpacing",0))+"px";Echo.Render.renderComponentAdd(e,this.component.children[c],a);this._div.appendChild(a);}var d=document.createElement("div");d.style.cssText="clear:both;";this._div.appendChild(d);b.appendChild(this._div);},renderDispose:function(a){this._div=null;},renderUpdate:function(c){var a=this._div;var b=a.parentNode;Echo.Render.renderComponentDispose(c,c.parent);b.removeChild(a);this.renderAdd(c,b);
return true;}});