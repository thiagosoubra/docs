Echo.Sync.TextComponent=Core.extend(Echo.Render.ComponentSync,{$abstract:true,$virtual:{getSupportedPartialProperties:function(){return["text","editable","selectionStart","selectionEnd"];},processBlur:function(a){this._focused=false;this._storeSelection();this._storeValue();return true;},processFocus:function(a){this._focused=true;if(this.client){if(this.component.isActive()){this.client.application.setFocusedComponent(this.component);}else{this._resetFocus();}}return false;},sanitizeInput:function(){var a=this.component.render("maximumLength",-1);if(a>=0){if(this.input.value&&this.input.value.length>a){this.input.value=this.input.value.substring(0,a);}}}},input:null,container:null,_focused:false,_lastProcessedValue:null,percentWidth:false,_selectionStart:0,_selectionEnd:0,_renderStyle:function(){if(this.component.isRenderEnabled()){Echo.Sync.renderComponentDefaults(this.component,this.input);Echo.Sync.Border.render(this.component.render("border"),this.input);Echo.Sync.FillImage.render(this.component.render("backgroundImage"),this.input);
}else{Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(),this.input);Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component,"foreground","disabledForeground",true),this.input,"color");Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component,"background","disabledBackground",true),this.input,"backgroundColor");Echo.Sync.Border.render(Echo.Sync.getEffectProperty(this.component,"border","disabledBorder",true),this.input);Echo.Sync.Font.render(Echo.Sync.getEffectProperty(this.component,"font","disabledFont",true),this.input);Echo.Sync.FillImage.render(Echo.Sync.getEffectProperty(this.component,"backgroundImage","disabledBackgroundImage",true),this.input);}Echo.Sync.Alignment.render(this.component.render("alignment"),this.input,false,null);Echo.Sync.Insets.render(this.component.render("insets"),this.input,"padding");var d=this.component.render("focusEffectEnabled",true);if(!d){this.input.style.outline="none";}var b=this.component.render("width");this.percentWidth=Echo.Sync.Extent.isPercent(b);
if(b){if(this.percentWidth){this.input.style.width="5px";}else{this.input.style.width=Echo.Sync.Extent.toCssValue(b,true);}}var a=this.component.render("height");if(a){this.input.style.height=Echo.Sync.Extent.toCssValue(a,false);}var c=this.component.render("toolTipText");if(c){this.input.title=c;}},_addEventHandlers:function(){Core.Web.Event.add(this.input,"keydown",Core.method(this,this._processKeyDown),false);Core.Web.Event.add(this.input,"click",Core.method(this,this._processClick),false);Core.Web.Event.add(this.input,"focus",Core.method(this,this.processFocus),false);Core.Web.Event.add(this.input,"blur",Core.method(this,this.processBlur),false);},_adjustPercentWidth:function(a,d,b){var c=(100-(100*d/b))*a/100;return c>0?c:0;},clientKeyDown:function(a){this._storeValue(a);if(this.client&&this.component.isActive()){if(!this.component.doKeyDown(a.keyCode)){Core.Web.DOM.preventEventDefault(a.domEvent);}}return true;},clientKeyPress:function(a){this._storeValue(a);if(this.client&&this.component.isActive()){if(!this.component.doKeyPress(a.keyCode,a.charCode)){Core.Web.DOM.preventEventDefault(a.domEvent);
}}return true;},clientKeyUp:function(a){this._storeSelection();this._storeValue(a);return true;},_processClick:function(a){if(!this.client||!this.component.isActive()){Core.Web.DOM.preventEventDefault(a);return true;}this.client.application.setFocusedComponent(this.component);this._storeSelection();return false;},_processKeyDown:function(a){if(!this.component.isActive()){Core.Web.DOM.preventEventDefault(a);}return true;},_processRestrictionsClear:function(){if(!this.client){return;}if(!this.client.verifyInput(this.component)||this.input.readOnly){this.input.value=this.component.get("text");return;}this.component.set("text",this.input.value,true);},_resetFocus:function(){var b=document.createElement("div");b.style.cssText="position:absolute;width:0;height:0;overflow:hidden;";var a=document.createElement("input");a.type="text";b.appendChild(a);document.body.appendChild(b);a.focus();document.body.removeChild(b);b=null;a=null;this.client.forceRedraw();Echo.Render.updateFocus(this.client);},renderAddToParent:function(a){if(Core.Web.Env.ENGINE_MSHTML&&this.percentWidth){this.container=document.createElement("div");
this.container.appendChild(this.input);a.appendChild(this.container);}else{a.appendChild(this.input);}},renderDisplay:function(){var d=this.component.render("width");if(d&&Echo.Sync.Extent.isPercent(d)&&this.input.parentNode.offsetWidth){var b=this.component.render("border");var c=b?(Echo.Sync.Border.getPixelSize(b,"left")+Echo.Sync.Border.getPixelSize(b,"right")):4;var a=this.component.render("insets");if(a){var e=Echo.Sync.Insets.toPixels(a);c+=e.left+e.right;}if(Core.Web.Env.ENGINE_MSHTML){c+=1;if(this.container){this.container.style.width=this._adjustPercentWidth(100,Core.Web.Measure.SCROLL_WIDTH,this.input.parentNode.offsetWidth)+"%";}else{c+=Core.Web.Measure.SCROLL_WIDTH;}}else{if(Core.Web.Env.BROWSER_CHROME&&this.input.nodeName.toLowerCase()=="textarea"){c+=3;}else{if(Core.Web.Env.BROWSER_SAFARI&&this.input.nodeName.toLowerCase()=="input"){c+=1;}else{if(Core.Web.Env.ENGINE_PRESTO){c+=1;}}}}this.input.style.width=this._adjustPercentWidth(parseInt(d,10),c,this.input.parentNode.offsetWidth)+"%";
}},renderDispose:function(a){Core.Web.Event.removeAll(this.input);this._focused=false;this.input=null;this.container=null;},renderFocus:function(){if(this._focused){return;}this._focused=true;Core.Web.DOM.focusElement(this.input);},renderUpdate:function(g){var c=!Core.Arrays.containsAll(this.getSupportedPartialProperties(),g.getUpdatedPropertyNames(),true);if(c){var a=this.container?this.container:this.input;var f=a.parentNode;this.renderDispose(g);f.removeChild(a);this.renderAdd(g,f);}else{if(g.hasUpdatedProperties()){var e=g.getUpdatedProperty("text");if(e){var d=e.newValue==null?"":e.newValue;if(d!=this._lastProcessedValue){this.input.value=d;this._lastProcessedValue=d;}}var b=g.getUpdatedProperty("editable");if(b!=null){this.input.readOnly=!b.newValue;}}}return false;},_storeSelection:function(){var a,b;if(!this.component){return;}if(!Core.Web.Env.NOT_SUPPORTED_INPUT_SELECTION){this._selectionStart=this.input.selectionStart;this._selectionEnd=this.input.selectionEnd;}else{if(Core.Web.Env.PROPRIETARY_IE_RANGE){a=document.selection.createRange();
if(a.parentElement()!=this.input){return;}b=a.duplicate();if(this.input.nodeName.toLowerCase()=="textarea"){b.moveToElementText(this.input);}else{b.expand("textedit");}b.setEndPoint("EndToEnd",a);this._selectionStart=b.text.length-a.text.length;this._selectionEnd=this._selectionStart+a.text.length;}else{return;}}this.component.set("selectionStart",this._selectionStart,true);this.component.set("selectionEnd",this._selectionEnd,true);},_storeValue:function(a){if(!this.client||!this.component.isActive()){if(a){Core.Web.DOM.preventEventDefault(a);}return;}this.sanitizeInput();if(!this.client.verifyInput(this.component)){this.client.registerRestrictionListener(this.component,Core.method(this,this._processRestrictionsClear));return;}this.component.set("text",this.input.value,true);this._lastProcessedValue=this.input.value;if(a&&a.keyCode==13&&a.type=="keydown"){this.component.doAction();}}});Echo.Sync.TextArea=Core.extend(Echo.Sync.TextComponent,{$load:function(){Echo.Render.registerPeer("TextArea",this);
},renderAdd:function(b,a){this.input=document.createElement("textarea");this.input.id=this.component.renderId;if(!this.component.render("editable",true)){this.input.readOnly=true;}this._renderStyle(this.input);this.input.style.overflow="auto";this._addEventHandlers(this.input);if(this.component.get("text")){this.input.value=this.component.get("text");}this.renderAddToParent(a);}});Echo.Sync.TextField=Core.extend(Echo.Sync.TextComponent,{$load:function(){Echo.Render.registerPeer("TextField",this);},$virtual:{_type:"text"},getFocusFlags:function(){return Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_UP|Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_DOWN;},renderAdd:function(c,a){this.input=document.createElement("input");this.input.id=this.component.renderId;if(!this.component.render("editable",true)){this.input.readOnly=true;}this.input.type=this._type;var b=this.component.render("maximumLength",-1);if(b>=0){this.input.maxLength=b;}this._renderStyle(this.input);this._addEventHandlers(this.input);
if(this.component.get("text")){this.input.value=this.component.get("text");}this.renderAddToParent(a);},sanitizeInput:function(){}});Echo.Sync.PasswordField=Core.extend(Echo.Sync.TextField,{$load:function(){Echo.Render.registerPeer("PasswordField",this);},_type:"password"});