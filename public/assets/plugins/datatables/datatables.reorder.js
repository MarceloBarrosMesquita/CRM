var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.findInternal=function(a,f,d){a instanceof String&&(a=String(a));for(var k=a.length,g=0;g<k;g++){var h=a[g];if(f.call(d,h,g,a))return{i:g,v:h}}return{i:-1,v:void 0}};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.SIMPLE_FROUND_POLYFILL=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,f,d){a!=Array.prototype&&a!=Object.prototype&&(a[f]=d.value)};$jscomp.getGlobal=function(a){a=["object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global,a];for(var f=0;f<a.length;++f){var d=a[f];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")};$jscomp.global=$jscomp.getGlobal(this);$jscomp.polyfill=function(a,f,d,k){if(f){d=$jscomp.global;a=a.split(".");for(k=0;k<a.length-1;k++){var g=a[k];g in d||(d[g]={});d=d[g]}a=a[a.length-1];k=d[a];f=f(k);f!=k&&null!=f&&$jscomp.defineProperty(d,a,{configurable:!0,writable:!0,value:f})}};$jscomp.polyfill("Array.prototype.find",function(a){return a?a:function(a,d){return $jscomp.findInternal(this,a,d).v}},"es6","es3");(function(a){"function"===typeof define&&define.amd?define(["jquery","datatables.net"],function(f){return a(f,window,document)}):"object"===typeof exports?module.exports=function(f,d){f||(f=window);d&&d.fn.dataTable||(d=require("datatables.net")(f,d).$);return a(d,f,f.document)}:a(jQuery,window,document)})(function(a,f,d,k){var g=a.fn.dataTable,h=function(b,e){if(!g.versionCheck||!g.versionCheck("1.10.8"))throw"DataTables RowReorder requires DataTables 1.10.8 or newer";this.c=a.extend(!0,{},g.defaults.rowReorder,h.defaults,e);this.s={bodyTop:null,dt:new g.Api(b),getDataFn:g.ext.oApi._fnGetObjectDataFn(this.c.dataSrc),middles:null,scroll:{},scrollInterval:null,setDataFn:g.ext.oApi._fnSetObjectDataFn(this.c.dataSrc),start:{top:0,left:0,offsetTop:0,offsetLeft:0,nodes:[]},windowHeight:0,documentOuterHeight:0,domCloneOuterHeight:0};this.dom={clone:null,dtScroll:a("div.dataTables_scrollBody",this.s.dt.table().container())};b=this.s.dt.settings()[0];if(e=b.rowreorder)return e;this.dom.dtScroll.length||(this.dom.dtScroll=a(this.s.dt.table().container(),"tbody"));b.rowreorder=this;this._constructor()};a.extend(h.prototype,{_constructor:function(){var b=this,e=this.s.dt,c=a(e.table().node());"static"===c.css("position")&&c.css("position","relative");a(e.table().container()).on("mousedown.rowReorder touchstart.rowReorder",this.c.selector,function(c){if(b.c.enable){if(a(c.target).is(b.c.excludedChildren))return!0;var d=a(this).closest("tr"),f=e.row(d);if(f.any())return b._emitEvent("pre-row-reorder",{node:f.node(),index:f.index()}),b._mouseDown(c,d),!1}});e.on("destroy.rowReorder",function(){a(e.table().container()).off(".rowReorder");e.off(".rowReorder")})},_cachePositions:function(){var b=this.s.dt,e=a(b.table().node()).find("thead").outerHeight(),c=a.unique(b.rows({page:"current"}).nodes().toArray());c=a.map(c,function(b,c){c=a(b).position().top-e;return(c+c+a(b).outerHeight())/2});this.s.middles=c;this.s.bodyTop=a(b.table().body()).offset().top;this.s.windowHeight=a(f).height();this.s.documentOuterHeight=a(d).outerHeight()},_clone:function(b){var e=a(this.s.dt.table().node().cloneNode(!1)).addClass("dt-rowReorder-float").append("<tbody/>").append(b.clone(!1)),c=b.outerWidth(),d=b.outerHeight(),f=b.children().map(function(){return a(this).width()});e.width(c).height(d).find("tr").children().each(function(a){this.style.width=f[a]+"px"});e.appendTo("body");this.dom.clone=e;this.s.domCloneOuterHeight=e.outerHeight()},_clonePosition:function(a){var b=this.s.start,c=this._eventToPage(a,"Y")-b.top;a=this._eventToPage(a,"X")-b.left;var d=this.c.snapX;c+=b.offsetTop;b=!0===d?b.offsetLeft:"number"===typeof d?b.offsetLeft+d:a+b.offsetLeft;0>c?c=0:c+this.s.domCloneOuterHeight>this.s.documentOuterHeight&&(c=this.s.documentOuterHeight-this.s.domCloneOuterHeight);this.dom.clone.css({top:c,left:b})},_emitEvent:function(b,e){this.s.dt.iterator("table",function(c,d){a(c.nTable).triggerHandler(b+".dt",e)})},_eventToPage:function(a,e){return-1!==a.type.indexOf("touch")?a.originalEvent.touches[0]["page"+e]:a["page"+e]},_mouseDown:function(b,e){var c=this,w=this.s.dt,g=this.s.start,n=e.offset();g.top=this._eventToPage(b,"Y");g.left=this._eventToPage(b,"X");g.offsetTop=n.top;g.offsetLeft=n.left;g.nodes=a.unique(w.rows({page:"current"}).nodes().toArray());this._cachePositions();this._clone(e);this._clonePosition(b);this.dom.target=e;e.addClass("dt-rowReorder-moving");a(d).on("mouseup.rowReorder touchend.rowReorder",function(a){c._mouseUp(a)}).on("mousemove.rowReorder touchmove.rowReorder",function(a){c._mouseMove(a)});a(f).width()===a(d).width()&&a(d.body).addClass("dt-rowReorder-noOverflow");b=this.dom.dtScroll;this.s.scroll={windowHeight:a(f).height(),windowWidth:a(f).width(),dtTop:b.length?b.offset().top:null,dtLeft:b.length?b.offset().left:null,dtHeight:b.length?b.outerHeight():null,dtWidth:b.length?b.outerWidth():null}},_mouseMove:function(b){this._clonePosition(b);for(var e=this._eventToPage(b,"Y")-this.s.bodyTop,c=this.s.middles,d=null,f=this.s.dt,g=0,m=c.length;g<m;g++)if(e<c[g]){d=g;break}null===d&&(d=c.length);if(null===this.s.lastInsert||this.s.lastInsert!==d)e=a.unique(f.rows({page:"current"}).nodes().toArray()),d>this.s.lastInsert?this.dom.target.insertAfter(e[d-1]):this.dom.target.insertBefore(e[d]),this._cachePositions(),this.s.lastInsert=d;this._shiftScroll(b)},_mouseUp:function(b){var e=this,c=this.s.dt,f,g=this.c.dataSrc;this.dom.clone.remove();this.dom.clone=null;this.dom.target.removeClass("dt-rowReorder-moving");a(d).off(".rowReorder");a(d.body).removeClass("dt-rowReorder-noOverflow");clearInterval(this.s.scrollInterval);this.s.scrollInterval=null;var n=this.s.start.nodes,m=a.unique(c.rows({page:"current"}).nodes().toArray()),k={},h=[],p=[],q=this.s.getDataFn,x=this.s.setDataFn;var l=0;for(f=n.length;l<f;l++)if(n[l]!==m[l]){var r=c.row(m[l]).id(),y=c.row(m[l]).data(),t=c.row(n[l]).data();r&&(k[r]=q(t));h.push({node:m[l],oldData:q(y),newData:q(t),newPosition:l,oldPosition:a.inArray(m[l],n)});p.push(m[l])}var u=[h,{dataSrc:g,nodes:p,values:k,triggerRow:c.row(this.dom.target),originalEvent:b}];this._emitEvent("row-reorder",u);var v=function(){if(e.c.update){l=0;for(f=h.length;l<f;l++){var a=c.row(h[l].node).data();x(a,h[l].newData);c.columns().every(function(){this.dataSrc()===g&&c.cell(h[l].node,this.index()).invalidate("data")})}e._emitEvent("row-reordered",u);c.draw(!1)}};this.c.editor?(this.c.enable=!1,this.c.editor.edit(p,!1,a.extend({submit:"changed"},this.c.formOptions)).multiSet(g,k).one("preSubmitCancelled.rowReorder",function(){e.c.enable=!0;e.c.editor.off(".rowReorder");c.draw(!1)}).one("submitUnsuccessful.rowReorder",function(){c.draw(!1)}).one("submitSuccess.rowReorder",function(){v()}).one("submitComplete",function(){e.c.enable=!0;e.c.editor.off(".rowReorder")}).submit()):v()},_shiftScroll:function(b){var e=this,c=this.s.scroll,g=!1,h=b.pageY-d.body.scrollTop,k,m;h<a(f).scrollTop()+65?k=-5:h>c.windowHeight+a(f).scrollTop()-65&&(k=5);null!==c.dtTop&&b.pageY<c.dtTop+65?m=-5:null!==c.dtTop&&b.pageY>c.dtTop+c.dtHeight-65&&(m=5);k||m?(c.windowVert=k,c.dtVert=m,g=!0):this.s.scrollInterval&&(clearInterval(this.s.scrollInterval),this.s.scrollInterval=null);!this.s.scrollInterval&&g&&(this.s.scrollInterval=setInterval(function(){if(c.windowVert){var b=a(d).scrollTop();a(d).scrollTop(b+c.windowVert);b!==a(d).scrollTop()&&(b=parseFloat(e.dom.clone.css("top")),e.dom.clone.css("top",b+c.windowVert))}c.dtVert&&(b=e.dom.dtScroll[0],c.dtVert&&(b.scrollTop+=c.dtVert))},20))}});h.defaults={dataSrc:0,editor:null,enable:!0,formOptions:{},selector:"td:first-child",snapX:!1,update:!0,excludedChildren:"a"};var p=a.fn.dataTable.Api;p.register("rowReorder()",function(){return this});p.register("rowReorder.enable()",function(a){a===k&&(a=!0);return this.iterator("table",function(b){b.rowreorder&&(b.rowreorder.c.enable=a)})});p.register("rowReorder.disable()",function(){return this.iterator("table",function(a){a.rowreorder&&(a.rowreorder.c.enable=!1)})});h.version="1.2.6";a.fn.dataTable.RowReorder=h;a.fn.DataTable.RowReorder=h;a(d).on("init.dt.dtr",function(b,d,c){"dt"===b.namespace&&(b=d.oInit.rowReorder,c=g.defaults.rowReorder,b||c)&&(c=a.extend({},b,c),!1!==b&&new h(d,c))});return h});