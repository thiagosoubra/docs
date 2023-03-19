WS.VideoPlayerWindow=Core.extend(Echo.WindowPane,{$static:{TIMEOUT:5000,activeWindow:null,setActiveWindow:function(a){if(this.activeWindow){if(this.activeWindow.parent){this.activeWindow.parent.remove(this.activeWindow);this.activeWindow=null;}}this.activeWindow=a;}},$abstract:{isFlash:true,loadVideo:true},_url:null,_r:null,_touchRunnable:null,$construct:function(a){WS.VideoPlayerWindow.setActiveWindow(this);this._touchRunnable=new Core.Web.Scheduler.MethodRunnable(Core.method(this,this._touch),15000,true);var b=this.isFlash();this._url=a;this._r=WS.getResources();Echo.WindowPane.call(this,{styleName:"Default",openAnimationTime:0,closeAnimationTime:0,closable:true,maximizeEnabled:true,modal:true,title:this._r.m["MediaPlayerWindow.Title"],icon:this._r.i["MediaPlayerWindow.Icon"],contentWidth:"75%",contentHeight:"75%",events:{init:Core.method(this,function(c){this.loadVideo();Core.Web.Scheduler.add(this._touchRunnable);}),close:Core.method(this,function(c){Core.Web.Scheduler.remove(this._touchRunnable);
this.parent.remove(this);})},children:[new Echo.SplitPane({styleName:"ControlPane.SplitBottom",children:[new Echo.Row({styleName:"ControlPane",children:[new Echo.Button({styleName:"ControlPane",icon:this._r.i["MediaPlayerWindow.Download"],text:this._r.m["MediaPlayerWindow.Download"],events:{action:Core.method(this,function(c){this.fireEvent({source:this,type:"download"});})}}),new Echo.RadioButton({styleName:"ControlPane",selected:!b,group:"MediaPlayerWindow.Mode",text:this._r.m["MediaPlayerWindow.HTML5"],events:{action:Core.method(this,function(c){this._doSwitch(false);})}}),new Echo.RadioButton({styleName:"ControlPane",selected:b,group:"MediaPlayerWindow.Mode",text:this._r.m["MediaPlayerWindow.Flash"],events:{action:Core.method(this,function(c){this._doSwitch(true);})}})]}),this._contentSplit=new Echo.SplitPane({autoPositioned:true,separatorPosition:0,orientation:Echo.SplitPane.ORIENTATION_VERTICAL_BOTTOM_TOP,children:[new Echo.Label({layoutData:{background:"#7f1f1f",insets:"1ex"},foreground:"#ffffff",text:this._r.m["MediaPlayerWindow.TimeoutMessage"],formatWhitespace:true}),this.content=new Echo.ContentPane({background:"#5f5f5f"})]})]})]});
},_doSwitch:function(a){if(this.isFlash()==a){return;}if(this.parent){this.parent.remove(this);}this.fireEvent({source:this,type:a?"switchToFlash":"switchToHtml5"});},processError:function(a){this.content.removeAll();this.content.add(new Echo.Panel({insets:"1ex 1em",children:[new Echo.Label({foreground:"#ffffff",text:this._r.m["MediaPlayerWindow.ErrorInvalid"]})]}));this._r=WS.getResources();this._warningClear();},processLoad:function(){this._timeoutRunnable=Core.Web.Scheduler.run(Core.method(this,this._processTimeout),WS.VideoPlayerWindow.TIMEOUT);},processStart:function(){this._warningClear();},_processTimeout:function(){this._contentSplit.set("separatorPosition",null);},_touch:function(){WS.accessMonitor.touch(true);},_warningClear:function(){if(this._timeoutRunnable){Core.Web.Scheduler.remove(this._timeoutRunnable);}this._contentSplit.set("separatorPosition",0);}});