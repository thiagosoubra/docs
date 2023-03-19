Echo.Sync.Composite=Core.extend(Echo.Render.ComponentSync,{$load:function(){Echo.Render.registerPeer("Composite",this);},div:null,contentDiv:null,$virtual:{renderStyle:function(){Echo.Sync.renderComponentDefaults(this.component,this.div);}},renderAdd:function(b,a){this.div=this.contentDiv=document.createElement("div");this.div.id=this.component.renderId;if(this.component.children.length!==0){this.renderStyle();Echo.Render.renderComponentAdd(b,this.component.children[0],this.contentDiv);}a.appendChild(this.div);},renderDispose:function(a){this.contentDiv=null;this.div=null;},renderUpdate:function(c){var a=this.div;var b=a.parentNode;Echo.Render.renderComponentDispose(c,c.parent);b.removeChild(a);this.renderAdd(c,b);return true;}});Echo.Sync.Panel=Core.extend(Echo.Sync.Composite,{$load:function(){Echo.Render.registerPeer("Panel",this);},renderDisplay:function(){if(this._imageBorder){Echo.Sync.FillImageBorder.renderContainerDisplay(this.div);}},renderStyle:function(){this._imageBorder=this.component.render("imageBorder");
var e=this.component.children.length!==0?this.component.children[0]:null;var b=this.component.render("width");var a=this.component.render("height");if(Echo.Sync.Extent.isPercent(a)){a=null;}if(e&&e.pane){this.div.style.position="relative";if(!a){a="10em";}}if(b||a){this.contentDiv.style.overflow="hidden";if(a&&this._imageBorder){var d=Echo.Sync.Insets.toPixels(this._imageBorder.contentInsets);var c=Echo.Sync.Extent.toPixels(a)-d.top-d.bottom;if(!e||!e.pane){d=Echo.Sync.Insets.toPixels(this.component.render("insets"));c-=d.top+d.bottom;}this.contentDiv.style.height=c+"px";}}if(this._imageBorder){this.div=Echo.Sync.FillImageBorder.renderContainer(this._imageBorder,{child:this.contentDiv});}else{Echo.Sync.Border.render(this.component.render("border"),this.contentDiv);}Echo.Sync.renderComponentDefaults(this.component,this.contentDiv);if(!e||!e.pane){Echo.Sync.Insets.render(this.component.render("insets"),this.contentDiv,"padding");}Echo.Sync.Alignment.render(this.component.render("alignment"),this.contentDiv,true,this.component);
Echo.Sync.FillImage.render(this.component.render("backgroundImage"),this.contentDiv);Echo.Sync.Extent.render(b,this.div,"width",true,true);Echo.Sync.Extent.render(a,this.div,"height",false,false);}});