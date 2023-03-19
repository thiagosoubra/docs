Extras.Serial.ItemModel=Core.extend(Echo.Serial.PropertyTranslator,{$static:{parseIcon:function(a,b){var c=Core.Web.DOM.getChildElementByTagName(b,"icon");if(c){return Echo.Serial.ImageReference.toProperty(a,c);}return null;},toProperty:function(a,b){var d=b.getAttribute("t");if(d.indexOf(Extras.Serial.PROPERTY_TYPE_PREFIX)===0){d=d.substring(Extras.Serial.PROPERTY_TYPE_PREFIX.length);}var c=Extras.Serial[d];if(c){return c.toProperty(a,b);}else{throw new Error("Unsupported model type: "+d);}}}});Extras.Serial.MenuModel=Core.extend(Echo.Serial.PropertyTranslator,{$static:{toProperty:function(d,j){var a=j.getAttribute("id");var k=j.getAttribute("text");var h=Extras.Serial.ItemModel.parseIcon(d,j);var g=new Extras.MenuModel(a,k,h);var b=Core.Web.DOM.getChildElementsByTagName(j,"item");for(var f=0;f<b.length;f++){var e=b[f];var c=Extras.Serial.ItemModel.toProperty(d,e);g.addItem(c);}return g;}},$load:function(){Echo.Serial.addPropertyTranslator("Extras.Serial.MenuModel",this);}});Extras.Serial.OptionModel=Core.extend(Echo.Serial.PropertyTranslator,{$static:{toProperty:function(a,b){var e=b.getAttribute("id");
var d=b.getAttribute("text");var c=Extras.Serial.ItemModel.parseIcon(a,b);return new Extras.OptionModel(e,d,c);}},$load:function(){Echo.Serial.addPropertyTranslator("Extras.Serial.OptionModel",this);}});Extras.Serial.RadioOptionModel=Core.extend(Echo.Serial.PropertyTranslator,{$static:{toProperty:function(a,b){var e=b.getAttribute("id");var d=b.getAttribute("text");var c=Extras.Serial.ItemModel.parseIcon(a,b);return new Extras.RadioOptionModel(e,d,c);}},$load:function(){Echo.Serial.addPropertyTranslator("Extras.Serial.RadioOptionModel",this);}});Extras.Serial.ToggleOptionModel=Core.extend(Echo.Serial.PropertyTranslator,{$static:{toProperty:function(a,b){var e=b.getAttribute("id");var d=b.getAttribute("text");var c=Extras.Serial.ItemModel.parseIcon(a,b);return new Extras.ToggleOptionModel(e,d,c);}},$load:function(){Echo.Serial.addPropertyTranslator("Extras.Serial.ToggleOptionModel",this);}});Extras.Serial.SeparatorModel=Core.extend(Echo.Serial.PropertyTranslator,{$static:{toProperty:function(a,b){return new Extras.SeparatorModel();
}},$load:function(){Echo.Serial.addPropertyTranslator("Extras.Serial.SeparatorModel",this);}});Extras.Serial.MenuStateModel=Core.extend(Echo.Serial.PropertyTranslator,{$static:{toProperty:function(a,b){var g=new Extras.MenuStateModel();var f=Core.Web.DOM.getChildElementsByTagName(b,"i");for(var e=0;e<f.length;e++){var c=f[e];var h=c.getAttribute("enabled");if(h!=null){g.setEnabled(c.getAttribute("id"),h=="true");}var d=c.getAttribute("selected");if(d!=null){g.setSelected(c.getAttribute("id"),d=="true");}}return g;}},$load:function(){Echo.Serial.addPropertyTranslator("Extras.Serial.MenuStateModel",this);}});