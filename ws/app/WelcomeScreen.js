WS.WelcomeScreen=Core.extend(Echo.ContentPane,{$static:{IMAGE_NAMES:["Balloon","Bee","Leaf","Rose"]},_content:null,_menu:null,$construct:function(d){this._r=WS.getResources();var c=parseInt(Math.random()*WS.WelcomeScreen.IMAGE_NAMES.length,10);var b="image/welcome/"+WS.WelcomeScreen.IMAGE_NAMES[c]+".jpg",a="image/welcome/"+WS.WelcomeScreen.IMAGE_NAMES[c]+"Blur.jpg";Echo.ContentPane.call(this,{events:{init:Core.method(this,function(f){if(d){this.start();}})},children:[new Echo.SplitPane({orientation:Echo.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM,autoPositioned:true,children:[this._menu=new Extras.MenuBarPane({layoutData:{overflow:Echo.SplitPane.OVERFLOW_HIDDEN},styleName:"Default",events:{action:Core.method(this,this._processMenuAction)}}),new Echo.ContentPane({background:"#000000",backgroundImage:{url:a,x:"50%",y:"50%",repeat:0},children:[new WS.BackgroundFader({image:{url:b,x:"50%",y:"50%",repeat:0},children:[this._content=new Echo.ContentPane({backgroundImage:{url:this._r.i["WelcomeScreen.WelcomeTitle"],x:"50%",y:"32%",repeat:0}})]})]})]})]});
},_displayBrowserWarningIE6:function(){if(!Core.Web.Env.ENGINE_MSHTML||Core.Web.Env.BROWSER_VERSION_MAJOR!=6){return;}this._displayBrowserWarningImpl("BrowserWarning.IE6");},_displayBrowserWarningImpl:function(a){this.add(new Echo.WindowPane({styleName:"Default",closable:false,title:this._r.m[a+".Title"],background:"#ffcfaf",foreground:"#4f0000",positionX:"90%",positionY:"10%",children:[new Echo.Row({cellSpacing:"1em",insets:"1em",children:[new Echo.Label({icon:this._r.i["Dialog.Error"]}),new Echo.Label({text:this._r.m[a+".Message"]})]})]}));},_displayBrowserWarningOpera:function(){if(!Core.Web.Env.ENGINE_PRESTO){return;}this._displayBrowserWarningImpl("BrowserWarning.Opera");},displayInvalidLogin:function(){this._password.set("text",null);var a=new WS.Dialog(this._r.m["WelcomeScreen.InvalidLoginTitle"],this._r.i["WelcomeScreen.InvalidLogin"],this._r.m["WelcomeScreen.InvalidLoginMessage"],this._r.i["Dialog.Error"],WS.Dialog.CONTROLS_OK);a.addListener("action",Core.method(this,function(b){this.application.setFocusedComponent(this._password);
}));this.add(a);},_processLogin:function(a){this.fireEvent({type:"authRequest",source:this,password:this._password.get("text")});},_processMenuAction:function(a){switch(a.modelId){case"about":this.application.client.exec(WS.MODULE_ABOUT,Core.method(this,function(){this.application.content.add(new WS.AboutDialog());}));break;case"faq":window.open(WS.LINK_URL_DOC_FAQ);break;case"doc":window.open(WS.LINK_URL_DOC);break;}},start:function(){this._r=WS.getResources();this._menu.set("model",new Extras.MenuModel(null,null,null,[new Extras.MenuModel(null,this._r.m["Menu.HelpMenu"],this._r.i["Menu.HelpMenu"],[new Extras.OptionModel("about",this._r.m["Menu.About"],this._r.i["Menu.About"]),new Extras.OptionModel("doc",this._r.m["Menu.Documentation"],this._r.i["Menu.Documentation"]),new Extras.OptionModel("faq",this._r.m["Menu.FAQ"],this._r.i["Menu.FAQ"])])]));this._content.add(new Echo.WindowPane({styleName:"Default",positionY:"75%",resizable:false,closable:false,title:this._r.m["WelcomeScreen.WindowTitle"],children:[new Echo.SplitPane({styleName:"ControlPane.SplitBottom",children:[new Echo.Row({styleName:"ControlPane",children:[new Echo.Button({styleName:"ControlPane",icon:this._r.i["WelcomeScreen.Login"],text:this._r.m["WelcomeScreen.Login"],events:{action:Core.method(this,this._processLogin)}})]}),new Echo.Grid({layoutData:{insets:"10px 30px"},styleName:"Layout.Spaced.100",width:"100%",columnWidth:["25%","75%"],children:[new Echo.Label({icon:this._r.i["App.Icon"]}),new Echo.Column({children:[new Echo.Label({text:this._r.m["WelcomeScreen.PasswordPrompt"]}),this._password=new Echo.PasswordField({styleName:"Default",width:"100%",events:{action:Core.method(this,this._processLogin)}})]})]})]})]}));
this.application.setFocusedComponent(this._password);this._displayBrowserWarningIE6();this._displayBrowserWarningOpera();}});