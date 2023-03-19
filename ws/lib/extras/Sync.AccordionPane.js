Extras.Sync.AccordionPane=Core.extend(Echo.Render.ComponentSync,{$static:{_supportedPartialProperties:{"activeTabId":true,"activeTabIndex":true},_DEFAULTS:{tabBackground:"#cfcfcf",tabBorder:"1px outset #cfcfcf",tabForeground:"#000000",tabInsets:"2px 5px",tabContentInsets:0}},$load:function(){Echo.Render.registerPeer("Extras.AccordionPane",this);},_animationTime:0,div:null,_activeTabId:null,_newImagesLoaded:null,_pendingRenderDisplay:false,rotation:null,tabs:null,resetOverflowForAnimation:false,_tabSelectListenerRef:null,imageMonitorRef:null,$construct:function(){this.tabs=[];this.resetOverflowForAnimation=Core.Web.Env.ENGINE_GECKO||Core.Web.Env.ENGINE_MSHTML;this._tabSelectListenerRef=Core.method(this,this._tabSelectListener);this.imageMonitorRef=Core.method(this,this._imageMonitor);},_getTabById:function(a){for(var b=0;b<this.tabs.length;++b){var c=this.tabs[b];if(c.childComponent.renderId==a){return c;}}return null;},getTabHeight:function(c,d){if(d==null||d<c){throw new Error("Invalid indices: begin="+c+",end="+d);
}else{var b=0;for(var a=c;a<d;++a){b+=this.tabs[a].tabDiv.offsetHeight;}return b;}},_imageMonitor:function(){if(this._newImagesLoaded){return;}this._newImagesLoaded=true;Core.Web.Scheduler.run(Core.method(this,function(){if(this.client&&!this._pendingRenderDisplay){this.redrawTabs(false);}this._newImagesLoaded=false;}));},_processRollover:function(a){return !this.rotation;},redrawTabs:function(a){if(this.rotation){this.rotation.abort();}if(this._activeTabId==null||this._getTabById(this._activeTabId)==null){if(this.tabs.length>0){this._activeTabId=this.tabs[0].childComponent.renderId;}else{this._activeTabId=null;}}var b=false;for(var c=0;c<this.tabs.length;++c){if(b){this.tabs[c].tabDiv.style.top="";this.tabs[c].tabDiv.style.bottom=this.getTabHeight(c+1,this.tabs.length)+"px";}else{this.tabs[c].tabDiv.style.bottom="";this.tabs[c].tabDiv.style.top=this.getTabHeight(0,c)+"px";}this.tabs[c].containerDiv.style.height="";if(this._activeTabId==this.tabs[c].childComponent.renderId){b=true;this.tabs[c].containerDiv.style.display="block";
this.tabs[c].containerDiv.style.top=this.getTabHeight(0,c+1)+"px";this.tabs[c].containerDiv.style.bottom=this.getTabHeight(c+1,this.tabs.length)+"px";this.tabs[c].contentDiv.style.top=0;this.tabs[c].contentDiv.style.bottom=0;this.tabs[c].contentDiv.style.height="";Core.Web.VirtualPosition.redraw(this.tabs[c].contentDiv);}else{this.tabs[c].containerDiv.style.display="none";}}if(a){Echo.Render.notifyResize(this.component);this.renderDisplayTabs();}},renderAdd:function(g,a){this.component.addListener("tabSelect",this._tabSelectListenerRef);this._animationTime=this.component.render("animationTime",Extras.AccordionPane.DEFAULT_ANIMATION_TIME);this._activeTabId=this.component.get("activeTabId");this.div=document.createElement("div");this.div.id=this.component.renderId;this.div.style.cssText="position:absolute;width:100%;height:100%;";Echo.Sync.renderComponentDefaults(this.component,this.div);var e=Core.method(this,this._processRollover);Core.Web.Event.add(this.div,"mouseover",e,true);Core.Web.Event.add(this.div,"mouseout",e,true);
var b=this.component.getComponentCount();for(var c=0;c<b;++c){var f=this.component.getComponent(c);var d=new Extras.Sync.AccordionPane.Tab(f,this);this.tabs.push(d);d.render(g);this.div.appendChild(d.tabDiv);this.div.appendChild(d.containerDiv);}a.appendChild(this.div);this._pendingRenderDisplay=true;},renderDisplay:function(){this._pendingRenderDisplay=false;if(!this.rotation){this.redrawTabs(false);}this.renderDisplayTabs();},renderDisplayTabs:function(){for(var a=0;a<this.tabs.length;++a){this.tabs[a].renderDisplay();}},renderDispose:function(b){Core.Web.Event.removeAll(this.div);this.component.removeListener("tabSelect",this._tabSelectListenerRef);if(this.rotation){this.rotation.abort();}this._activeTabId=null;for(var a=0;a<this.tabs.length;a++){this.tabs[a].dispose();}this.tabs=[];this.div=null;},renderUpdate:function(d){var b;if(d.hasUpdatedLayoutDataChildren()||d.hasAddedChildren()||d.hasRemovedChildren()){b=true;}else{if(d.isUpdatedPropertySetIn(Extras.Sync.AccordionPane._supportedPartialProperties)&&d.getUpdatedProperty("activeTabId")){this._selectTab(d.getUpdatedProperty("activeTabId").newValue);
b=false;}else{b=true;}}if(b){var a=this.div;var c=a.parentNode;Echo.Render.renderComponentDispose(d,d.parent);c.removeChild(a);this.renderAdd(d,c);}return b;},_rotateTabs:function(d,a){var b=this._getTabById(d);if(b==null){this.redrawTabs(true);return;}if(this.rotation){this.rotation.abort();this.redrawTabs(true);}else{var c=this._getTabById(a);this.rotation=new Extras.Sync.AccordionPane.Rotation(this,b,c);this.rotation.runTime=this._animationTime;this.rotation.start();}},_selectTab:function(a){if(a==this._activeTabId){return;}var b=this._activeTabId;this._activeTabId=a;if(b!=null&&this._animationTime>0){this._rotateTabs(b,a);}else{this.redrawTabs(true);}},_tabSelectListener:function(a){this._selectTab(a.tab.renderId);}});Extras.Sync.AccordionPane.Tab=Core.extend({tabDiv:null,_parent:null,containerDiv:null,contentDiv:null,childComponent:null,$construct:function(a,b){this.childComponent=a;this._parent=b;},_addEventListeners:function(){Core.Web.Event.add(this.tabDiv,"click",Core.method(this,this._processClick),false);
if(this._parent.component.render("tabRolloverEnabled",true)){Core.Web.Event.add(this.tabDiv,Core.Web.Env.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED?"mouseenter":"mouseover",Core.method(this,this._processEnter),false);Core.Web.Event.add(this.tabDiv,Core.Web.Env.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED?"mouseleave":"mouseout",Core.method(this,this._processExit),false);}Core.Web.Event.Selection.disable(this.tabDiv);},dispose:function(){Core.Web.Event.removeAll(this.tabDiv);this._parent=null;this.childComponent=null;this.tabDiv=null;this.containerDiv=null;},getContentInsets:function(){if(this.childComponent.pane){return 0;}else{var a=this._parent.component.render("defaultContentInsets");return a?a:Extras.Sync.AccordionPane._DEFAULTS.tabContentInsets;}},_processClick:function(a){if(!this._parent||!this._parent.client||!this._parent.client.verifyInput(this._parent.component)){return;}this._parent.component.doTabSelect(this.childComponent.renderId);},_processEnter:function(a){if(!this._parent||!this._parent.client||!this._parent.client.verifyInput(this._parent.component)){return;
}this._renderState(true);},_processExit:function(a){if(!this._parent||!this._parent.client||!this._parent.client.verifyInput(this._parent.component)){return;}this._renderState(false);},render:function(c){var b=this.childComponent.render("layoutData")||{};this.tabDiv=document.createElement("div");this.tabDiv.id=this._parent.component.renderId+"_tab_"+this.childComponent.renderId;this.tabDiv.style.cssText="cursor:pointer;position:absolute;left:0;right:0;overflow:hidden;";Echo.Sync.Insets.render(this._parent.component.render("tabInsets",Extras.Sync.AccordionPane._DEFAULTS.tabInsets),this.tabDiv,"padding");if(b.icon){var a=document.createElement("img");Echo.Sync.ImageReference.renderImg(b.icon,a);a.style.paddingRight="3px";this.tabDiv.appendChild(a);Core.Web.Image.monitor(this.tabDiv,this._parent.imageMonitorRef);}this.tabDiv.appendChild(document.createTextNode(b.title?b.title:"\u00a0"));this.containerDiv=document.createElement("div");this.containerDiv.style.cssText="display:none;position:absolute;left:0;right:0;overflow:hidden;";
this.contentDiv=document.createElement("div");this.contentDiv.style.cssText="position:absolute;left:0;right:0;overflow:auto;";Echo.Sync.Insets.render(this.getContentInsets(),this.contentDiv,"padding");Echo.Render.renderComponentAdd(c,this.childComponent,this.contentDiv);this.containerDiv.appendChild(this.contentDiv);this._renderState(false);this._addEventListeners();},_renderState:function(j){var g=this.tabDiv,c=this._parent.component.render("tabBorder",Extras.Sync.AccordionPane._DEFAULTS.tabBorder),i,d,a=this._parent.component.render("tabBackground",Extras.Sync.AccordionPane._DEFAULTS.tabBackground);if(j){var b=this._parent.component.render("tabRolloverBackground");if(a&&!b){b=Echo.Sync.Color.adjust(a,20,20,20);}Echo.Sync.Color.render(b,g,"backgroundColor");var h=this._parent.component.render("tabRolloverBackgroundImage");if(h){g.style.backgroundImage="";g.style.backgroundPosition="";g.style.backgroundRepeat="";Echo.Sync.FillImage.render(h,g,null);}var f=this._parent.component.render("tabRolloverForeground");
if(f){Echo.Sync.Color.render(f,g,"color");}Echo.Sync.Font.render(this._parent.component.render("tabRolloverFont"),g);var e=this._parent.component.render("tabRolloverBorder");if(!e){e=c;if(Echo.Sync.Border.isMultisided(e)){i=Echo.Sync.Border.parse(e.top);d=Echo.Sync.Border.parse(e.bottom);if(i&&d&&i.color&&d.color){e={top:Echo.Sync.Border.compose(i.size,i.style,Echo.Sync.Color.adjust(i.color,20,20,20)),bottom:Echo.Sync.Border.compose(d.size,d.style,Echo.Sync.Color.adjust(d.color,20,20,20))};}}else{i=Echo.Sync.Border.parse(e);if(i){e=Echo.Sync.Border.compose(i.size,i.style,Echo.Sync.Color.adjust(i.color,20,20,20));}}}}else{Echo.Sync.Color.render(a,g,"backgroundColor");Echo.Sync.Color.render(this._parent.component.render("tabForeground",Extras.Sync.AccordionPane._DEFAULTS.tabForeground),g,"color");Echo.Sync.Font.renderClear(this._parent.component.render("tabFont"),g);g.style.backgroundImage="";g.style.backgroundPosition="";g.style.backgroundRepeat="";Echo.Sync.FillImage.render(this._parent.component.render("tabBackgroundImage"),g);
}if(Echo.Sync.Border.isMultisided(c)){Echo.Sync.Border.render(c.top,g,"borderTop");Echo.Sync.Border.render(c.bottom,g,"borderBottom");}else{Echo.Sync.Border.render(c,g,"borderTop");Echo.Sync.Border.render(c,g,"borderBottom");}},renderDisplay:function(){Core.Web.VirtualPosition.redraw(this.tabDiv);Core.Web.VirtualPosition.redraw(this.containerDiv);Core.Web.VirtualPosition.redraw(this.contentDiv);}});Extras.Sync.AccordionPane.Rotation=Core.extend(Extras.Sync.Animation,{_parent:null,_oldTab:null,_newTab:null,_oldTabIndex:null,_newTabIndex:null,_directionDown:null,_rotatingTabCount:null,_regionHeight:null,_numberOfTabsAbove:null,_numberOfTabsBelow:null,_startPosition:null,_animationDistance:null,$construct:function(a,b,c){this._parent=a;this._oldTab=b;this._newTab=c;this._regionHeight=this._parent.div.offsetHeight;this._oldTabIndex=Core.Arrays.indexOf(this._parent.tabs,this._oldTab);this._newTabIndex=Core.Arrays.indexOf(this._parent.tabs,this._newTab);this._rotatingTabCount=Math.abs(this._newTabIndex-this._oldTabIndex);
this._directionDown=this._newTabIndex<this._oldTabIndex;if(this._directionDown){this._numberOfTabsAbove=this._newTabIndex+1;this._numberOfTabsBelow=this._parent.tabs.length-1-this._newTabIndex;this._startPosition=this._parent.getTabHeight(0,this._newTabIndex+1);this._animationDistance=this._regionHeight-this._parent.getTabHeight(this._newTabIndex+1,this._parent.tabs.length)-this._startPosition;}else{this._numberOfTabsAbove=this._newTabIndex;this._numberOfTabsBelow=this._parent.tabs.length-1-this._newTabIndex;this._startPosition=this._parent.getTabHeight(this._newTabIndex+1,this._parent.tabs.length);this._animationDistance=this._regionHeight-this._parent.getTabHeight(0,this._newTabIndex+1)-this._startPosition;}},complete:function(){this._parent.rotation=null;var a=this._parent;if(this._parent.resetOverflowForAnimation){this._oldTab.contentDiv.style.overflow="auto";this._newTab.contentDiv.style.overflow="auto";}var b=this._parent.component.renderId;this._parent=null;this._oldTab=null;this._newTab=null;
a.redrawTabs(true);},init:function(){this._newTab.containerDiv.style.height="";if(this._directionDown){this._oldTab.containerDiv.style.bottom="";this._newTab.containerDiv.style.top=this._parent.getTabHeight(0,this._newTabIndex+1)+"px";}else{this._newTab.containerDiv.style.top="";this._newTab.containerDiv.style.bottom=this._parent.getTabHeight(this._newTabIndex+1,this._parent.tabs.length)+"px";}this._newTab.containerDiv.style.display="block";var e=this._parent.div.offsetHeight-this._parent.getTabHeight(0,this._parent.tabs.length);var c=Echo.Sync.Insets.toPixels(this._oldTab.getContentInsets());var b=Echo.Sync.Insets.toPixels(this._newTab.getContentInsets());var d=e-c.top-c.bottom;var a=e-b.top-b.bottom;d=d>0?d:0;a=a>0?a:0;if(this._parent.resetOverflowForAnimation){this._oldTab.contentDiv.style.overflow="hidden";this._newTab.contentDiv.style.overflow="hidden";}this._oldTab.contentDiv.style.bottom="";this._newTab.contentDiv.style.bottom="";this._oldTab.contentDiv.style.height=d+"px";this._newTab.contentDiv.style.height=a+"px";
},step:function(b){var d,c,f,e=Math.round(b*this._animationDistance);if(this._directionDown){for(d=this._oldTabIndex;d>this._newTabIndex;--d){this._parent.tabs[d].tabDiv.style.top=(e+this._startPosition+this._parent.getTabHeight(this._newTabIndex+1,d))+"px";}f=e;if(f<0){f=0;}this._newTab.containerDiv.style.height=f+"px";var a=e+this._startPosition+this._parent.getTabHeight(this._newTabIndex+1,this._oldTabIndex+1);this._oldTab.containerDiv.style.top=a+"px";c=this._regionHeight-this._parent.getTabHeight(this._newTabIndex,this._oldTabIndex);if(c<0){c=0;}this._oldTab.containerDiv.style.height=c+"px";}else{for(d=this._oldTabIndex+1;d<=this._newTabIndex;++d){this._parent.tabs[d].tabDiv.style.bottom=(e+this._startPosition+this._parent.getTabHeight(d+1,this._newTabIndex+1))+"px";}c=this._regionHeight-e-this._parent.getTabHeight(this._oldTabIndex,this._newTabIndex);if(c<0){c=0;}this._oldTab.containerDiv.style.height=c+"px";f=e;if(f<0){f=0;}this._newTab.containerDiv.style.height=f+"px";}}});