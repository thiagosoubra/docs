WS.RGB=Core.extend({$static:{fromHsv:function(j,u,n){var a,k,m;if(u===0){a=k=m=n;}else{j/=60;var e=Math.floor(j);var l=j-e;var d=n*(1-u);var c=n*(1-u*l);var o=n*(1-u*(1-l));switch(e){case 0:a=n;k=o;m=d;break;case 1:a=c;k=n;m=d;break;case 2:a=d;k=n;m=o;break;case 3:a=d;k=c;m=n;break;case 4:a=o;k=d;m=n;break;default:a=n;k=d;m=c;break;}}return new WS.RGB(Math.round(a*255),Math.round(k*255),Math.round(m*255));}},r:null,g:null,b:null,$construct:function(d,c,a){this.r=this._clean(d);this.g=this._clean(c);this.b=this._clean(a);},_clean:function(a){a=a?parseInt(a,10):0;if(a<0){return 0;}else{if(a>255){return 255;}else{return a;}}},toHexTriplet:function(){var b=this.r.toString(16);if(b.length==1){b="0"+b;}var c=this.g.toString(16);if(c.length==1){c="0"+c;}var a=this.b.toString(16);if(a.length==1){a="0"+a;}return"#"+b+c+a;},toString:function(){return this.toHexTriplet();}});