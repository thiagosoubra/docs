Extras.Sync.Viewer={};Extras.Sync.Viewer.ScrollContainer=Core.extend({_accumulator:0,_rowHeight:null,_scrollPosition:0,_barPosition:0,onScroll:null,gain:0.2,$construct:function(a,b,d,c){this.client=a;this.component=b;this._rowHeight=c;this.rootElement=document.createElement("div");this.rootElement.style.cssText="position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;";this._barDiv=document.createElement("div");this._barDiv.style.cssText="position:absolute;top:0;bottom:0;right:0;overflow:scroll;";this._barDiv.style.width=(1+Core.Web.Measure.SCROLL_WIDTH)+"px";this._vScrollContent=document.createElement("div");this._vScrollContent.style.cssText="width:1px;";this._barDiv.appendChild(this._vScrollContent);this.rootElement.appendChild(this._barDiv);this.contentElement=document.createElement("div");this.contentElement.style.cssText="position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;background:white;";this.rootElement.appendChild(this.contentElement);Core.Web.Event.add(this._barDiv,"scroll",Core.method(this,this._processScroll),true);
Core.Web.Event.add(this.rootElement,Core.Web.Env.BROWSER_MOZILLA?"DOMMouseScroll":"mousewheel",Core.method(this,this._processWheel),true);this.setRows(d);this._accumulatorRunnable=new Core.Web.Scheduler.MethodRunnable(Core.method(this,this._accumulatedScroll),10);},_accumulatedScroll:function(){if(this._accumulator){var a=this._accumulator;this._adjustScrollPosition(this.gain*this._accumulator);this._accumulator=0;}},dispose:function(){Core.Web.Event.removeAll(this._barDiv);Core.Web.Event.removeAll(this.rootElement);this.rootElement=null;this.contentElement=null;this._barDiv=null;},_adjustScrollPosition:function(a){this._scrollPosition+=this._height*a;this._scrollPosition=Math.max(0,Math.min(this._scrollPosition,this._maxScrollPosition));this._barPosition=Math.floor(this._scrollPosition*this._barFactor);this._rowPosition=this._scrollPosition/this._rowHeight;this._barDiv.scrollTop=this._barPosition;if(this.onScroll){this.onScroll({source:this,type:"scroll",row:this._rowPosition});}},_processScroll:function(a){if(!this.client||!this.client.verifyInput(this.component)){this._barDiv.scrollTop=this._barPosition;
return;}if(this._barDiv.scrollTop!==this._barPosition){this._barPosition=this._barDiv.scrollTop;this._scrollPosition=this._barPosition/this._barFactor;this._rowPosition=this._scrollPosition/this._rowHeight;if(this.onScroll){this.onScroll({source:this,type:"scroll",row:this._rowPosition});}}},_processWheel:function(b){if(!this.client||!this.client.verifyInput(this.component)){return;}var a;if(b.wheelDelta){a=b.wheelDelta/-120;}else{if(b.detail){a=b.detail/3;}else{return;}}if(this._accumulator===0){Core.Web.Scheduler.add(this._accumulatorRunnable);}this._accumulator+=a;Core.Web.DOM.preventEventDefault(b);return true;},renderDisplay:function(){Core.Web.VirtualPosition.redraw(this.rootElement);Core.Web.VirtualPosition.redraw(this.contentElement);Core.Web.VirtualPosition.redraw(this._barDiv);this._height=this._barDiv.offsetHeight;this._vScrollContent.style.height=Math.min(this._height*50,this._totalRowHeight)+"px";this._scrollHeight=this._barDiv.scrollHeight;this._barRange=this._scrollHeight-this._height;
this._updateSizes();},_updateSizes:function(){this._maxScrollPosition=Math.max(0,this._totalRowHeight-this._height);this._barFactor=this._barRange/this._maxScrollPosition;},setActive:function(a){if(a){this.contentElement.style.right=Core.Web.Measure.SCROLL_WIDTH+"px";}else{this.contentElement.style.right=0;}},setRows:function(a){this._totalRowHeight=a*this._rowHeight;this._updateSizes();this.renderDisplay();}});