/*******************************************************************************
 * 用途：jMagic基础框架
 * 
 * @author 吴颖
 * 
 * 版本日志：
 * @version 1.0 2008.10.01 创建 吴颖
 * @version 1.2 2011.05.01 更新 吴颖
 * @version 1.3 2012.09.01 更新 吴颖
 ******************************************************************************/
(function(win,unf){
	
	var doc = win.document, nav = win.navigator, dna = doc.createElement('div'), rex = {
		URL : /^(((HT|F)TPS?:\/)?\/|(\.+\/)*)[\w\-]+([:\.\/][\w\-]+)*\/?(\?(\w+(=[^\s]*)?&?)+)?(#\w*)?$/i,
		PCT : /%/,
		DOM : /^1|9$/,
		HID : /^NONE$/i,
		XDR : /^JSON$/i,
		ZIP : /^\d{6}$/i,
		VML : /<\/?v:.+/i,
		FMT : /\$([1-9]\d*)/g,
		INT : /^[+\-]?[1-9]\d*$/,
		FLT : /^[+\-]?\d+\.\d+$/,
		NUM : /^[+\-]?\d+(\.\d*)?(e[+\-]?\d+)?$/i,
		MAC : /^([0-9A-F]{2})(([:-][0-9A-F]{2}){5})$/i,
		WND : /([^;]*);([^;]*);([^;]+);([^;]+);([^;]+);([^;]+)/g,
		JSN : {
			SCRIPT : /^[\],:{}\s]*$/,
			BRACES : /(?:^|:|,)(?:\s*\[)+/g,
			ESCAPE : /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
			TOKENS : /"[^"\\\n\r]*"|NaN|true|false|null|undefined|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g
		},
		AJAX : /=\?(&|$)/g,
		CODE : /^[_A-Z]\w*$/i,
		FORM : /^(\d+)(@[0-9-A-Z]+)?$/i,
		CARD : /^[1-9]([0-9]{14}|[0-9]{16}[0-9X])$/i,
		TRIM : /(^[\s\t\xa0\u3000]+)|([\s\t\xa0\u3000]+$)/g,
		EMAIL : /^\w+((-\w+)|(\.\w+))*\@[0-9A-Z]+((\.|-)[0-9A-Z]+)*\.[0-9A-Z]+$/i
	};
	
	(function(arr){
		for(var i=0,j=/(^|(.*?\/))(jMagic.js)(\\?|$)/,l=arr.length; i<l; i++){
			if(jMagic.root = (arr[i].src.match(j) || 0)[1]) break;
		}
	})(doc.getElementsByTagName('script'), win.jMagic = {version:'1.3'});
	
	var _BROWSER = {
		os: nav.platform.toLowerCase(), ua: nav.userAgent.toLowerCase()
	};
	
	var $Browser = jMagic.Browser = function(web,env){
		switch (web[1] || (/opera|safari/).exec(_BROWSER.ua)[0]) {
			case 'msie': return (env.ie = !!doc.all) ? (env.v = web[2] || 'unknow') && env : env;
			case 'efox': return (env.ff = !!win.netscape) ? (env.v = web[2] || 'unknow') && env : env;
			case 'opera': return (env.opera = !!win.opera) ? (env.v = web[2] || 'unknow') && env : env;
			case 'webkit': return (env.webkit = !!win.WebKitPoint) ? (env.v = web[2] || 'unknow') && env : env;
			case 'safari': return (env.safari = /Apple/.test(nav.vendor)) ? (env.v = web[2] || 'unknow') && env : env;
			case 'chrome': return (env.chrome = !!win.chrome || !!win.webkitURL) ? (env.v = web[2] || 'unknow') && env : env;
			default: return env;
		}
	}((
		(/(?:(msie|efox|chrome)|(?:version))[\s\/:]([\w\d.]+)?/).exec(_BROWSER.ua) || (/(webkit)[\s\/:]([\w\d.]+)?/).exec(_BROWSER.ua)
	), {
		os: (!_BROWSER.ua.match(/ip(?:ad|od|hone)/) ? (_BROWSER.ua.match(/(?:webos|android)/) || _BROWSER.os.match(/mac|win|linux/) || ['unknow']) : ['ios'])[0]
	});
	
	var $Support = jMagic.Support = {
		  json2 : !!win.JSON,
		  xpath : !!doc.evaluate,
		  video : !!win.HTMLVideoElement,
		  audio : !!win.HTMLAudioElement,
		  cache : !!win.applicationCache,
		  webgl : !!win.WebGLRenderingContext,
		 worker : !!win.Worker,
		 locate : !!nav.geolocation,
		 select : !!doc.querySelector,
		 socket : !!win.WebSocket || !!win.MozWebSocket,
		graphic : {
			vml : !!doc.namespaces,
			svg : !!win.SVGElement,
			cav : !!win.CanvasRenderingContext2D
		},
		message : {
			post : !!win.postMessage,
			push : !!win.EventSource
		},
		storage : {
			machine : !!(win.localStorage || 0).getItem,
			session : !!(win.sessionStorage || 0).getItem
		}
	};
	
	var _CHOOSER = {
		count : 1,
		regex : {
			NTH : /(-?\d*)n([+-]?\d*)/,
			CLS : /\./g,
			SUM : /\d+/,
			REL : {
				R : /[\s+>~]/g,
				N : /[^\s+>~]+/g
			},
			PSEU : {
				R : /[^:]+/g,
				P : /\([^()]+\)/g
			},
			ATTR : {
				R : /[!\^$*|~]?=/,
				P : /[^\[]+(?=\])/g
			},
			PICK : /\s*([^a-zA-Z*])\s*/g,
			FIND : /((?:#[^.:\[]+)*)([A-Z*]*)([^\[:]*)((?:\[.+\])*)((?::.+)*)/i
		},
		trans : {
			  'for' : 'htmlFor',
			'class' : 'className'
		},
		leach : {
			cls : function(els,law){
				var arr = [];
				for(var i = 0, j = els.length, o, e; i < j; i++){
					if(o = (e = els[i]).className)
						if(!law.replace(new RegExp(o.replace(' ', '|'), 'g'), ''))
							$Array.push(arr, e);
				}
				return arr;
			},
			pseu : function(els,law){
				var arr = els;
				for(var i = 0, j = law.length, o, h, p, e, m, n; i < j; i += 3){
					for(els = arr, arr = [], o = law[i + 1], h = law[i], p = law[i + 2], m = els.length, n = 0; n < m; n++){
						if(h){
							if(!o.call(this, e = els[n], n, p))
								continue;
						}else{
							if(!o.call(this, e = els[n], n, m))
								continue;
						}
						$Array.push(arr, e);
					}
				}
				return arr;
			},
			attr : function(els,law){
				var arr = [];
				for(var i = 0, j = els.length, m = law.length, n, o, e, r, v; i < j; i++){
					for (e = els[i], n = 0; n < m; n += 3) {
						if(!(v = ((o = law[n + 1]) === 'href' ? e.getAttribute(o, 2) : e.getAttribute(o))))
							if(!(v = e[this.trans[o] || o]))
								break;
						if(!law[n].call(this, v + '', law[n + 2]))
							break;
					}
					if(n === m)
						$Array.push(arr, e);
				}
				return arr;
			},
			elem : function(obj,tag,cls,attr,pseu){
				return tag !== '*' && obj.nodeName.toLowerCase() !== tag ? false : (
					cls && !this.leach.cls.call(this, [obj], cls).length ? false : (
						attr && !this.leach.attr.call(this, [obj], attr).length ? false : (
							pseu && !this.leach.pseu.call(this, [obj], pseu).length ? false : true
						)
					)
				);
			}
		},
		fetch : {
			rule : function(rule){
				var saw, law = this.regex.FIND.exec(rule);
				if(saw = (law[2] || '*')){
					law[2] = saw;
				}
				if(saw = law[3]){
					law[3] = law[3].replace(this.regex.CLS, '');
				}
				if(saw = law[4]){
					law[4] = this.fetch.attr.call(this, saw.match(this.regex.ATTR.P), this.$ATTR);
				}
				if(saw = law[5]){
					law[5] = this.fetch.pseu.call(this, saw.match(this.regex.PSEU.R), this.$PSEU);
				}
				return law;
			},
			elem : function(elem){
				return (elem || 0).$GUID ? elem : (
					elem.$GUID = 0 || elem
				);
			},
			pseu : function(pseu,args){
				var arr = [];
				for(var z = this.count++, j = pseu.length, i = 0, o; i < j; i++){
					this.regex.SUM.test(
						o = pseu[i]
					) ? $Array.push(arr, true, (o = _GRAMMAR.pseus[RegExp['$`']]).fn, o.pm ? o.pm.call(this, args[RegExp['$&']], z) : args[RegExp['$&']]) : $Array.push(arr, false, _GRAMMAR.pseus[o], null);
				}
				return arr;
			},
			attr : function(attr,args){
				var arr = [];
				for(var i = 0, j = attr.length, o; i < j; i++){
					this.regex.ATTR.R.test(
						o = args[attr[i]]
					) ? $Array.push(arr, _GRAMMAR.attrs[RegExp['$&']], RegExp['$`'],RegExp['$\'']) : $Array.push(arr, _GRAMMAR.attrs[' '], o, '');
				}
				return arr;
			},
			nthp : function(nthp,guid){
				if(this.regex.NTH.test(nthp === 'odd' && '2n+1' || nthp === 'even' && '2n' || nthp)){
					if(((nthp = RegExp.$1) === '' ? nthp = 1 : (nthp === '-' ? nthp = -1 : nthp = nthp * 1)) !== 0){
						return [guid, true, nthp, RegExp.$2 * 1];
					}
					nthp = RegExp.$2;
				}
				return [guid, false, nthp * 1, null];
			}
		},
		check : {
			nthp : function(args,snid){
				return args[1] ? (snid = snid - args[3]) * (args = args[2]) >= 0 && snid % args === 0 : snid === args[2];
			},
			child : function(elem,sign,args){
				var data, sire, guid = args[0];
				if ((data = this.fetch.elem.call(this, sire = elem.parentNode)).$GUID !== guid) {
					var hash, snid, type, name, head = args[4], next = args[5], node = sire[head];
					if(type = args[6]) {
						hash = data.$HASH = {};
					} else {
						snid = 0;
					}
					while(node){
						if(node.nodeType === 1){
							if(type){
	                            if(!hash[name = node.nodeName]){
	                            	hash[name] = 1;
	                            }
	                            snid = hash[name]++;
							}else{
								snid++;
							}
							this.fetch.elem.call(this, node).$SNID = snid;
						}
						node = node[next];
					}
					data.$GUID = guid;
				}
				return this.check.nthp.call(this, args, this.fetch.elem.call(this, elem).$SNID);
			},
			sibling : function(elem,near,type,name){
				while(elem = elem[near]){
					if(elem.nodeType === 1 && (!type || name === elem.nodeName))
						return false;
				}
				return true;
			}
		},
		build : function(html,size){
			if(size > 1)
				for(var z = this.count++, j = html.length, i = 0, e; i < j; i++){
					(
						e = this.fetch.elem.call(this, html[i])
					).$GUID === z ? $Array.splice(html, i, 1) : e.$GUID = z;
				}
		},
		ready : function(expr,pseu,attr){
			if(expr = $Util.trim(expr).replace(this.regex.PICK, '$1').replace(this.regex.ATTR.P, function(data){
				return $Array.push(attr, data) - 1;
			})){
				while(expr.indexOf('(') !== -1){
					expr = expr.replace(this.regex.PSEU.P, function(data){
						return $Array.push(pseu, data.substring(1, data.length - 1)) - 1;
					});
				}
				return expr.split(',');
			} return [];
		},
		parse : function(root,expr,rule,save){
			var saw, law;
			if(saw = (law = this.regex.FIND.exec(expr))[1]){
				return (saw = doc.getElementById(saw.substring(1))) ? [saw] : save;
			} else {
				_GRAMMAR.nexus[rule].call(this, root, law[2] || '*', save);
				if(saw = law[3]){
					save = this.leach.cls.call(this, save, saw.replace(this.regex.CLS, ''));
				}
				if(saw = law[4]){
					save = this.leach.attr.call(this, save, this.fetch.attr.call(this, saw.match(this.regex.ATTR.P), this.$ATTR));
				}
				if(saw = law[5]){
					save = this.leach.pseu.call(this, save, this.fetch.pseu.call(this, saw.match(this.regex.PSEU.R), this.$PSEU));
				}
				return save;
			}
		},
		query : function(root,expr,html,size){
			for(var x = this.ready(expr, this.$PSEU = [], this.$ATTR = []), j = (size = x.length), i = 0, r, m, n; i < j; i++){
				if((r = (' ' + (expr = x[i])).match(this.regex.REL.R)).length > (expr = expr.match(this.regex.REL.N)).length){
					$Array.shift(r);
				}
				for(n = 0, m = r.length; n < m; n++){
					root = this.parse(root, expr[n], r[n], []);
				}
				$Array.mix(html, root);
			}
			this.build(html, size);
		}
	};
	
	var _GRAMMAR = {
		nexus : {
			' ' : function(ctx,tag,buf,pnd,idx){
				if(pnd = ctx.parentNode){
					if(this.fetch.elem.call(this, pnd).$GUID === (this.fetch.elem.call(this, ctx).$GUID = (idx = this.count++)))
						return;
				}
				$Array.mix(buf, $Fn.tag.call(ctx, tag));
			},
			'>' : function(ctx,tag,buf){
				if(ctx = ctx.firstChild)
					do{
						if(ctx.nodeType === 1 && (ctx.nodeName.toLowerCase() === tag || tag === '*'))
							$Array.push(buf, ctx);
					}while(ctx = ctx.nextSibling);
			},
			'+' : function(ctx,tag,buf){
				while(ctx = ctx.nextSibling){
					if(ctx.nodeType === 1){
						if(ctx.nodeName.toLowerCase() === tag || tag === '*'){
							$Array.push(buf, ctx);
						}
						break;
					}
				}
			},
			'~' : function(ctx,tag,buf,pnd,idx){
				if(pnd = ctx.parentNode){
					if((pnd = this.fetch.elem.call(this, pnd)).$GUID === (idx = this.count++)){
						return;
					}
					pnd.$GUID = idx;
				}
				while(ctx = ctx.nextSibling){
					if(ctx.nodeType === 1 && (ctx.nodeName.toLowerCase() === tag || tag === '*'))
						$Array.push(buf, ctx);
				}
			}
		},
		attrs : {
			' ' : function(){
				return true;
			},
			'=' : function(attr,into){
				return attr === into;
			},
			'!=' : function(attr,into){
				return attr !== into;
			},
			'^=' : function(attr,into){
				return attr.indexOf(into) === 0;
			},
			'*=' : function(attr,into){
				return attr.indexOf(into) !== -1
			},
			'$=' : function(attr,into){
				return attr.substring(attr.length - into.length) === into;
			},
			'~=' : function(attr,into){
				return (' ' + attr + ' ').indexOf(' ' + into + ' ') !== -1;
			},
			'|=' : function(attr, into){
				return attr === into || attr.substring(0, into.length + 1) === into + '-';
			}
		},
		pseus : {
			'nth-last-of-type' : {
				fn : _CHOOSER.check.child,
				pm : function(args,guid){
					if(args = this.fetch.nthp.call(this, args, guid)){
						$Array.push(args, 'lastChild', 'previousSibling', true);
					}
					return args;
				}
			},
			'first-of-type' : function(elem,sign,size){
				return this.check.sibling.call(this, elem, 'previousSibling', true, elem.nodeName);
			},
			'last-of-type' : function(elem,sign,size){
				return this.check.sibling.call(this, elem, 'nextSibling', true, elem.nodeName);
			},
			'only-of-type' : function(elem,sign,size){
				return _GRAMMAR.pseus['first-of-type'].call(this, elem, sign, size) && _GRAMMAR.pseus['last-of-type'].call(this, elem,sign,size);
			},
			'nth-of-type' : {
				fn : _CHOOSER.check.child,
				pm : function(args,guid){
					if(args = this.fetch.nthp.call(this, args, guid)){
						$Array.push(args, 'firstChild', 'nextSibling', true);
					}
					return args;
				}
			},
			'nth-last-child' : {
				fn : _CHOOSER.check.child,
				pm : function(args,guid){
					if(args = this.fetch.nthp.call(this, args, guid)){
						$Array.push(args, 'lastChild', 'previousSibling', false);
					}
					return args;
				}
			},
			'first-child' : function(elem,sign,size){
				return this.check.sibling.call(this, elem, 'previousSibling', false);
			},
			'last-child' : function(elem,sign,size){
				return this.check.sibling.call(this, elem, 'nextSibling', false);
			},
			'only-child' : function(elem,sign,size){
				return _GRAMMAR.pseus['first-child'].call(this, elem, sign, size) && _GRAMMAR.pseus['last-child'].call(this, elem, sign, size);
			},
			'nth-child': {
				fn: _CHOOSER.check.child,
				pm: function(args,guid){
					if(args = this.fetch.nthp.call(this, args, guid)){
						$Array.push(args, 'firstChild', 'nextSibling', false);
					}
					return args;
				}
			},
			nth : {
				pm : _CHOOSER.fetch.nthp,
				fn : function(elem,sign,args){
					return this.check.nthp.call(this, args, sign);
				}
			},
			has : {
				pm : function(args){
					var arr = [];
					for(var s = args.split(','), j = s.length, i = 0, o, r; i < j; i++){
						if((r = (' ' + (o = s[i])).match(this.regex.REL.R)).length > (o = o.match(this.regex.REL.N)).length){
							$Array.shift(r);
						}
						$Array.push(arr, o, r);
					}
					return arr;
				},
				fn : function(elem,sign,args){
					var arr = [];
					for(var i = 0, j = args.length, c = [elem], t, s, r, m, n; i < j; i += 2){
						for(t = c, s = args[i], r = args[i + 1], m = r.length, n = 0; n < m; n++){
							t = this.parse(t, s[n], r[n], []);
						}
						$Array.mix(arr, t);
					}
					return arr.length !== 0;
				}
			},
			not : {
				pm : function(args){
					var law = args.split(','), arr = [];
					while(law.length){
						$Array.push(arr, this.fetch.rule.call(this, $Array.pop(law)));
					}
					return arr;
				},
				fn : function(elem,sign,args){
					for(var i = 0, j = args.length, p; i < j; i++) {
						if((p = args[i])[1]){
							if('#' + elem.id !== p[1]){
								continue;
							}
							return false;
						}
						if(this.leach.elem.call(this, elem, p[2], p[3], p[4], p[5]))
							return false;
					}
					return true;
				}
			},
			odd : function(elem,sign){
				return sign % 2 === 1;
			},
			even : function(elem,sign){
				return sign % 2 === 0;
			},
			last : function(elem,sign,size){
				return sign === (size - 1);
			},
			first : function(elem,sign){
				return sign === 0;
			},
			empty : function(elem){
				return !elem.firstChild;
			},
			checked : function(elem){
				return elem.checked === true;
			},
			selected : function(elem){
				return elem.selected === true;
			},
			disabled : function(elem){
				return elem.disabled === true;
			},
			enabled : function(elem){
				return elem.disabled === false;
			},
			contains : {
				fn : function(elem,sign,text){
					return (elem.textContent || elem.innerText || '').indexOf(text) !== -1;
				}
			}
		}
	};
	
	var $Fn = jMagic.Fn = {
		id:		function(){
					if(arguments.length > 1){
						var ret = [];
						try{
							$Array.each($Array.unique($Array.clone(arguments)),function(obj){
								if(obj = $Fn.id.call(this,obj))
									$Array.push(ret,obj);
							},this);
						}catch(e){return []} return ret;
					} try{return ($Match.isDoc(this) ? this : doc).getElementById(arguments[0])}catch(e){return null}
				},
		css:	function(){
					return $Match.isString(arguments[0]) ? function(ctx,raw,css){
						if(!($Support.select && raw)){
							var ret = [];
							try{
								_CHOOSER.query(ctx,css,ret);
							}catch(e){return []} return ret;
						} try{return $Array.clone(ctx.querySelectorAll(css))}catch(e){return []}
					}($Match.isDom(this) ? this : doc, $Match.isBoolean(arguments[1]) ? arguments[1] : true, arguments[0]) : [];
				},
		tag:	function(){
					if(arguments.length > 1){
						var ret = [];
						try{
							$Array.each($Array.unique($Array.clone(arguments)),function(obj){
								if(obj = $Fn.tag.call(this,obj))
									$Array.mix(ret,obj);
							},this);
						}catch(e){return []} return ret;
					} try{return $Array.clone(($Match.isDom(this) ? this : doc).getElementsByTagName(arguments[0]))}catch(e){return []}
				},
		name:	function(){
					if(arguments.length > 1){
						var ret = [];
						try{
							$Array.each($Array.unique($Array.clone(arguments)),function(obj){
								if(obj = $Fn.name.call(this,obj))
									$Array.mix(ret,obj);
							},this);
						}catch(e){return []} return ret;
					} try{return $Array.clone(($Match.isDoc(this) ? this : doc).getElementsByName(arguments[0]))}catch(e){return []}
				}
	};
	
	var _CHARSET = {'' : '**', '@GBK' : '**', '@UTF-8' : '***'}, _W3SVGNS = {prefix : '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">', suffix : '</svg>'}, _LOCATOR = {
		opt : function(){
			return !this ? {
				   	   maximumAge : 0,
			  		  	  timeout : 30000,
			  		  	frequency : 60000,
			  	enableHighAcuracy : $Browser.os === 'android' ? true : false
			}: {
					   maximumAge : 0,
						  timeout : $Match.isNumber(this.Timeout) ? this.Timeout : 30000,
						frequency : $Match.isNumber(this.Refresh) ? this.Refresh : 60000,
				enableHighAcuracy : $Browser.os === 'android' ? true : $Match.isBoolean(this.Precise) ? this.Precise : false
			};
		},
		geo : function(jsn,arg,pos,run){
			if((jsn || 0).Success && (pos = {
				day: (
					function(){
						return $Array.join([
							$Util.format(this.date, "$1-$2-$3"),
							$Util.format(this.time, "$1:$2:$3")
						], ' ');
					}
				).call(
					$Util.getDateTime(
						new Date($Browser.os === 'ios' ? pos.timestamp * 1000 : pos.timestamp)
					)
				),
				lng: pos.coords.longitude || 0.0,
				lat: pos.coords.latitude || 0.0,
				alt: pos.coords.altitude || 0.0,
				brg: pos.coords.heading || 0.0,
				spd: pos.coords.speed || 0.0
			}))
				jsn.Success.call(arg || run || pos, pos, run);
		},
		err : function(jsn,arg,err,run){
			if((jsn || 0).Failure && (err = (
				function(){
					switch (err.code) {
						case err.POSITION_UNAVAILABLE: {
							return {UNAVAIL : this, message : this};
						}
						case err.PERMISSION_DENIED: {
							return {DISABLE : this, message : this};
						}
						case err.TIMEOUT: {
							return {TIMEOUT : this, message : this};
						}
						default: {
							return {UNKNOWN : this, message : this};
						}
					}
				}
			).call($Util.now())))
				jsn.Failure.call(arg || run || err, err, run);
		}
	};
	
	var $Fx = jMagic.Fx = {
		add:		function(obj,arr,fun,arg){
						if($Match.isDom(obj) && (arr || 0).length){
							var ctx, htm;
							try{
								(ctx = $Util.getDoc(this).createRange()).selectNode(obj);
							}catch(e){
								ctx = unf;
							}finally{
								$Thread.delay.call(this, $Util.bind($Array.splice(arr, 0, 300), function(timer,weber){
									try{
										obj.insertAdjacentHTML('BeforeEnd', (
											htm = $Array.join(this, '')
										));
									}catch(e){
										try{
											obj.appendChild(
												ctx.createContextualFragment(htm)
											);
										}catch(e){$Array.clear(arr)}
									}finally{
										arr.length ? $Thread.delay.call(weber, $Util.bind($Array.splice(arr, 0, 300), arguments.callee), 0, weber) : (
											$Match.isFunction(fun) ? fun.call(arg || obj, obj) : timer.abort()
										);
									}
								}), 0, this);
							}
						}
					},
		win:		{
						open:	function(){
							var wide = screen.width, high = screen.height;
							return (
								function(conf){
									$Array.mix(conf, (wide - conf[2]) / 2, (high - conf[3]) / 2);
									return this.open(
										conf[0],
										conf[1],
										$Array.join(
											conf,';'
										).replace(
											rex.WND,'width=$3,height=$4,left=$5,top=$6,toolbar=0,menubar=0,scrollbars=1,resizable=1,location=0,status=0'
										)
									);
								}
							).call($Util.getWin(this), $Array.map(['', '', wide, high], function(arg,idx){return this[idx] || arg}, arguments));
						}
					},
		evt:		{
						click:	function(obj){
							if($Browser.ie){
								obj.click();
							}else{
								var evt = $Util.getDoc(this).createEvent('MouseEvents');
								try{
									evt.initEvent('click',true,true);
								}catch(e){evt = null}finally{
									if(!$Match.isEmpty(evt))
										obj.dispatchEvent(evt);
								}
							}
						}
					},
		web:		{
						checkForm:	function(jsn){
							var str = [];
							try{
								$Array.each(jsn,function(obj,idx){
									return $Match.isEmpty(str) ? (function(src,fmt){
										if($Match.isEmpty(src)){
											return obj.must ? $Array.push(str,(obj.name || idx),'\u4e0d\u80fd\u4e3a\u7a7a\uff01\n') && false : true;
										}else{
											if(!$Match.isEmpty(fmt = rex.FORM.exec(obj.size)) ? src.replace(/[^\x00-\xff]/g,_CHARSET[(fmt[2] || '').toUpperCase()]).length > fmt[1] : false){
												return $Array.push(str,(obj.name || idx),'\u4e0d\u80fd\u8d85\u8fc7',fmt[1],'\u4e2a\u5b57\u8282\uff01\n') && false;
											}else{
												if(obj.rule && $Match.isArray(obj.rule))
													$Array.each(obj.rule,function(law,ind){
														if(law.func && $Match.isFunction(law.func))
															return !law.func.call(obj,idx,src) ? $Array.push(str,(obj.name || idx),'\u8fdd\u53cd\u89c4\u5219\u0023',(law.name || ++ind),'\u0023\uff01\n') && false : true;
													},this);
											}
										}
									}).call(this,$Util.trim($Fn.id.call(this,idx).value)) : false;
								},this);
							}catch(e){throw e} return $Array.join(str,'');
						},
						clearFile:	function(obj){
							(function(tmp,htm,frm){
								if((htm = this.body) && (frm = this.createElement('form')))
									try{
										htm.appendChild(frm);
										frm.appendChild(obj);
										frm.reset();
									}catch(e){throw e}finally{
										if(htm.removeChild(frm))
											$Dom.insertBefore(tmp,obj);
									}
							}).call($Util.getDoc(this),$Dom.getNext(obj));
						}
					},
		 draw: 		function(obj,arr,fun,arg) {
						 if($Match.isDom(obj) && (arr || 0).length){
							 var ctx, htm, svg;
							 try{
								 (ctx = $Util.getDoc(this).createRange()).selectNode(obj.ownerSVGElement || obj);
							 }catch(e){
								 ctx = unf;
							 }finally{
								$Thread.delay.call(this, $Util.bind($Array.splice(arr, 0, 300), function(timer,weber){
									if(rex.VML.test(htm = $Array.join(this, '')) && $Support.graphic.vml){
										obj.insertAdjacentHTML('BeforeEnd', htm);
									}else{
										if($Support.graphic.svg){
											htm = _W3SVGNS.prefix + htm + _W3SVGNS.suffix;
											try{
												svg = ctx.createContextualFragment(htm);
											}catch(e){
												try{
													(svg = doc.createDocumentFragment(true)).appendChild(dna.cloneNode()).outerHTML = htm;
												}catch(e){svg = $Array.clear(arr)}
											}finally{
												if(svg = ((svg.childNodes || 0)[0] || 0).childNodes)
													while(svg.length){obj.appendChild(svg[0])}
											}
										}
									}
									arr.length ? $Thread.delay.call(weber, $Util.bind($Array.splice(arr, 0, 300), arguments.callee), 0, weber) : (
										$Match.isFunction(fun) ? fun.call(arg || obj, obj) : timer.abort()
									);
								}), 0, this);
							 }
						 }
		 			},
		wheel:		function(obj,fun){
						if($Match.isFunction(fun)){
							return {
								open:	function(){
									if($Browser.ie)
										obj.attachEvent('onmousewheel',fun);
									else
										obj.addEventListener('DOMMouseScroll',fun,false);
								},
								shut:	function(){
									if($Browser.ie)
										obj.detachEvent('onmousewheel',fun);
									else
										obj.removeEventListener('DOMMouseScroll',fun,false);
								}
							};
						}	return null;
					},
		locate:		{
						share: function(jsn,arg){
							 return $Support.locate ? !nav.geolocation.getCurrentPosition(
								function(pos){_LOCATOR.geo(jsn, arg, pos)},function(err){_LOCATOR.err(jsn, arg, err)}, _LOCATOR.opt.call(jsn)
							 ) : false;
						},
						trace: function(jsn,arg){
							 return $Support.locate ? (
								function(run){
									return run = {
										stop : (
											function(guid){
												return $Util.bind(this, function(){
													this.clearWatch(guid);
												});
											}
										).call(this, this.watchPosition(
											function(pos){_LOCATOR.geo(jsn, arg, pos, run)}, function(err){_LOCATOR.err(jsn, arg, err, run)}, _LOCATOR.opt.call(jsn)
										))
									};
								}
							).call(nav.geolocation) : null;
						}
					},
		toggle:		function(obj,fun,arg){
						if((obj || 0).style){
							if(rex.HID.test(obj.style.display))
								try{
									if(fun) fun.call(arg || true, true);
								}catch(e){throw e}finally{
									obj.style.display = '';
								}
							else
								try{
									if(fun) fun.call(arg || false, false);
								}catch(e){throw e}finally{
									obj.style.display = 'none';
								}
						}
					}
	};
	
	var $Dom = jMagic.Dom = {
		createDom:		function(syn){
							var dom = null;
							try{
								(
									dom = ($Browser.ie ? new ActiveXObject('Microsoft.XMLDOM') : $Util.getDoc(this).implementation.createDocument('', '', null))
								).async = syn || false;
							}catch(e){dom = null} return dom;
						},
		createXml:		function(xns,fmt,syn){
							var dom = $Dom.createDom.call(this, syn);
							try{
								dom.insertBefore(
									dom.createProcessingInstruction('xml', $Array.join(['version="1.0" encoding="', fmt || 'utf-8', '"'], '')), dom.childNodes.item(0)
	 							);
								dom.insertBefore(
									dom.createElement(xns), dom.childNodes.item(1)
								);
							}catch(e){dom = null} return dom;
						},
		importXml:		function(xml,syn){
							var dom = ($Browser.ie ? $Dom.createDom.call(this, syn) : null);
							try{
								dom ? (
									dom.loadXML(xml)
								) : (
									(dom = (new DOMParser()).parseFromString(xml, 'text/xml')).async = syn || false
								);
							}catch(e){dom = null} return dom;
						},
		importXsl:		function(xsl,xml){
							var dom = $Dom.getRoot(xml);
							try{
								$Browser.ie ? (
									dom = (dom || xml).transformNode(xsl)
								) : (
									dom = ((dom = new XSLTProcessor()).importStylesheet(xsl) || dom).transformToFragment(xml, $Util.getDoc(this))
								);
							}catch(e){dom = null} return dom;
						},
		importUri:		function(uri,syn){
							var dom = $Dom.createDom.call(this, syn);
							try{
								dom.load(uri);
							}catch(e){dom = null} return dom;
						},
		select:			function(ctx,law){
							if(!$Browser.ie){
								var ret = [];
								try{
									(
										function(saw){
											while(saw = this.iterateNext()){
												$Array.push(ret, saw);
											}
										}
									).call(
										(new XPathEvaluator()).evaluate(law, ctx, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null)
									);
								}catch(e){return $Array.clear(ret)} return ret;
							}else try{return ctx.selectNodes(law)}catch(e){return []}
						},
		serial:			function(xml){
							try{
								return $Util.trim(
									$Browser.ie ? xml.xml : (new XMLSerializer()).serializeToString(xml)
								);
							}catch(e){return null}
						},
		getSire:		function(node){
							try{
								return node.parentNode;
							}catch(e){return null}
						},
		getRoot:		function(node){
							try{
								return node.documentElement;
							}catch(e){return null}
						},
		getText:		function(node){
							try{
								return $Browser.ie ? node.text : node.textContent;
							}catch(e){return null}
						},
		getFore:		function(node){
							try{
								node = node.firstChild
							}catch(e){node = null}finally{
								return !$Match.equal(node,null) ? (
									!$Match.isDom(node) ? $Dom.getNext(node) : node
								) : null;
							}
						},
		getPrev:		function(node){
							try{
								while(node = node.previousSibling){
									if($Match.isDom(node)) break;
								}
							}catch(e){node = null} return node;
						},
		getNext:		function(node){
							try{
								while(node = node.nextSibling){
									if($Match.isDom(node)) break;
								}
							}catch(e){node = null} return node;
						},
		getLast:		function(node){
							try{
								node = node.lastChild
							}catch(e){node = null}finally{
								return !$Match.equal(node,null) ? (
									!$Match.isDom(node) ? $Dom.getPrev(node) : node
								) : null;
							}
						},
		insertAfter: 	function(node,elem){
							var sire = $Dom.getSire(node), next = $Dom.getNext(node);
							try{
								next ? sire.insertBefore(elem, next) : sire.appendChild(elem);
							}catch(e){}finally{sire = (next = null)}
						},
		insertBefore: 	function(node,elem){
							var sire = $Dom.getSire(node);
							try{
								sire.insertBefore(elem, node);
							}catch(e){}finally{sire = null}
						},
		removeNode:		function(node){
							var sire = $Dom.getSire(node);
							try{
								sire.removeChild(node);
							}catch(e){}finally{sire = null}
						},
		removeChild:	function(node,bool){
							var sire = node;
							try{
								if(!(sire.innerHTML = ''))
									while(sire = node.firstChild){
										node.removeChild(sire);
									}
							}catch(e){bool = (sire = null)}finally{
								if(bool) $Dom.removeNode(node);
							}
						},
		removeAfter:	function(node){
							var sire = $Dom.getSire(node), next = null;
							try{
								if(sire)
									while(next = node.nextSibling){
										sire.removeChild(next);
									}
							}catch(e){}finally{sire = (next = null)}
						},
		removeBefore:	function(node){
							var sire = $Dom.getSire(node), prev = null;
							try{
								if(sire)
									while(prev = node.previousSibling){
										sire.removeChild(prev);
									}
							}catch(e){}finally{sire = (prev = null)}
						},
		removeBetween:	function(from,over){
							var sire = $Dom.getSire(from), node = $Dom.getSire(over);
							try{
								if((sire || true) === node)
									while((node = from.nextSibling) && node !== over){
										sire.removeChild(node);
									}
							}catch(e){}finally{sire = (node = null)}
						}
	};
	
	var $Util = jMagic.Util = {
		now:			function(){
							return +new Date;
						},
		exec:			function(txt){
							var tag = $Fn.tag.call(this,'HEAD')[0], obj = $Import.js.call(this,txt,false);
							try{
								tag.appendChild(obj);
							}catch(e){throw e}finally{
								tag.removeChild(obj);
							}
						},
		swap: 			function(src,obj,fun,arg){
							return fun.call(arg || src, src, obj) ? src : obj;
						},
		trim:			function(txt){
							return (txt || '').replace(rex.TRIM, '');
						},
		bind:			function(obj,fun){
							return function(){
								return fun ? fun.apply(obj,arguments) : unf;
							};
						},
		format:			function(fmt,arr){
							return String(fmt).replace(rex.FMT, function(reg,num){
								return arr[num - 1] || '';
							});
						},
		padded:			function(obj,len,pad,fun){
							return function(num){
								return num > 0 && $Match.isFunction(fun) ? fun.call(
									$Parse.toTxt(obj), Array(num + 1).join(pad)
								) : $Parse.toTxt(obj);
							}(len - $Parse.toTxt(obj).length);
						},
		getDocSize:		function(obj){
							return (function(html,root,body,doce){
								if(html.innerHeight){
									this.winW = html.innerWidth;
									this.winH = html.innerHeight;
									if(this.scrollMaxY){
										this.webW = html.innerWidth + html.scrollMaxX;
										this.webH = html.innerHeight + html.scrollMaxY;
									}
								}else{
									if(body = root.body){
										if(((doce = root.documentElement) || 0).clientHeight){
											this.winW = doce.clientWidth;
											this.winH = doce.clientHeight;
										}else{
											this.winW = body.clientWidth;
											this.winH = body.clientHeight;
										}
										if(body.scrollHeight > body.offsetHeight){
											this.webW = body.scrollWidth;
											this.webH = body.scrollHeight;
										}else{
											this.webW = body.offsetWidth;
											this.webH = body.offsetHeight;
										}
									}
								}
								return {
									webW: this.webW < this.winW ? this.winW : this.webW,
									webH: this.webH < this.winH ? this.winH : this.webH,
									winW: this.winW,
									winH: this.winH
								};
							}).call({
								webW: 0,
								webH: 0,
								winW: 0,
								winH: 0
							}, $Util.getWin.call(this, obj), $Util.getDoc.call(this, obj));
						},	
		getElemSize:	function(obj){
							var w = obj.style.width, h = obj.style.height;
							return {
								w: w ? $Parse.toInt(w) : obj.offsetWidth,
								h: h ? $Parse.toInt(h) : obj.offsetHeight
							};
						},
		setElemSize:	function(obj,cfg){
							if((cfg || 0).w != unf)
								obj.style.width = rex.PCT.test(cfg.w) ? cfg.w : cfg.w + 'px';
							if((cfg || 0).h != unf)
								obj.style.height = rex.PCT.test(cfg.h) ? cfg.h : cfg.h + 'px';
						},
		getElemSeat:	function(obj){
							var t = obj.style.top, l = obj.style.left;
							return {
								t: t ? $Parse.toInt(t) : obj.offsetTop,
								l: l ? $Parse.toInt(l) : obj.offsetLeft
							};
						},
		setElemSeat:	function(obj,cfg){
							if((cfg || 0).t != unf)
								obj.style.top = rex.PCT.test(cfg.t) ? cfg.t : cfg.t + 'px';
							if((cfg || 0).l != unf)
								obj.style.left = rex.PCT.test(cfg.l) ? cfg.l : cfg.l + 'px';
						},
		getPosition:   	function(obj){
							var y = obj.offsetTop, x = obj.offsetLeft;
							while(obj = obj.offsetParent){
								 y += obj.offsetTop;
								 x += obj.offsetLeft;
							}
							return {x:x,y:y};
						},
		getWin:			function(obj){
							return !$Match.isWin(obj || (obj = this)) ? win : obj;
						},
		getDoc:			function(obj){
							return !$Match.isWin(obj || (obj = this)) ? (
								$Match.isDoc(obj) ? obj : doc
							) : obj.document;
						},
		getKey:			function(evt){
							if(evt = $Util.getEvent.call(this,evt).e){
								if((evt.charCode || evt.charCode === 0) ? evt.charCode : evt.keyCode)
									return evt.charCode || evt.keyCode;
								else
									return function(key){
										return $Browser.ie ? (
											key == 1 ? 1 : (
											key == 2 ? 3 : (
											key == 4 ? 2 : 0
										))) : (
											key == 0 ? 1 : (
											key == 2 ? 3 : (
											key == 1 ? 2 : 0
										)));
									}(evt.button);
							}else return null;
						},
		getWheel:		function(evt){
							return (evt = $Util.getEvent.call(this,evt).e) ? (
								evt.wheelDelta ? (evt.wheelDelta > 0 ? 1 : -1) : (
									evt.detail ? (evt.detail < 0 ? 1 : -1) : 0
								)
							) : 0;
						},
		getEvent:		function(evt){
							return $Browser.ie ? (
								(evt = $Util.getWin(this).event) ? {e:evt,src:evt.srcElement} : null
							) : {e:evt,src:evt.target};
						},
		getMouse:		function(evt){
							return (function(obj,htm,web){
								if(obj && (htm = this.documentElement) && (web = this.body))
									return {
										x: obj.clientX + ((htm || 0).scrollLeft || (web || 0).scrollLeft || 0) - (htm.clientLeft || 0),
										y: obj.clientY + ((htm || 0).scrollTop  || (web || 0).scrollTop  || 0) - (htm.clientTop  || 0)
									};
								else return null;
							}).call($Util.getDoc(this),$Util.getEvent.call(this,evt).e);
						},
		setMouse:		function(obj,src){
							return !!(obj.style.cursor = ($Match.isUrl(src) ? 'url(' + src + '), auto' : src));
						},
		addEvent: 		function(lsn,run){
							return function(jsn){
								try{
									$Browser.ie ? (
										jsn.obj.attachEvent('on' + jsn.evt, jsn.fun)
									) : (
										jsn.obj.addEventListener(jsn.evt, jsn.fun, false)
									);
								}catch(e){return null} return jsn;
							}({
								obj: lsn.obj,
								evt: lsn.evt,
								fun: function(e){
										if(!run)
											$Util.stopBubble(e);
										return lsn.fun ? lsn.fun.call(lsn.arg || e, e) : unf;
									 }
							});
						},
		delEvent:    	function(lsn){
							try{
								$Browser.ie ? (
									lsn.obj.detachEvent('on' + lsn.evt, lsn.fun)
								) : (
									lsn.obj.removeEventListener(lsn.evt, lsn.fun, false)
								);
							}catch(e){return false} return true;
						},
		addCapture:     function(obj){
							if(obj.setCapture){
								obj.setCapture();
							}else if((obj = $Util.getWin(this)).captureEvents){
								obj.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
							}
						},
		delCapture: 	function(obj){
							if(obj.releaseCapture){
								obj.releaseCapture();
							}else if((obj = $Util.getWin(this)).releaseEvents){
								obj.releaseEvents(Event.MOUSEMOVE|Event.MOUSEUP);
							}
						},
		stopBubble:     function(evt){
							return evt = $Util.getEvent.call(this,evt).e ? (
								$Browser.ie ? evt.cancelBubble = true : evt.stopPropagation()
							) : false;
						},
		getDateTime:	function(day){
							return day = ($Match.isDate(day) ? day : new Date) ? {
								date: [day.getFullYear(),day.getMonth() + 1,day.getDate()],
								time: [day.getHours(),day.getMinutes(),day.getSeconds()],
								msel: [day.getMilliseconds()]
							} : null;
						}
	   
	};
	
	var $Math = jMagic.Math = {
		fix:	function(flt,cep){
					return Number.prototype.toFixed.call(flt,cep);
				}
	};
	
	var _AJAX = {};
	
	var $Ajax = jMagic.Ajax = {
				init:	function(){
							_AJAX.url      = '';
							_AJAX.type     = '';
							_AJAX.sync     = true;
							_AJAX.param    = [];
							_AJAX.timer    = null;
							_AJAX.timeout  = -1;
							_AJAX.encode   = 'utf-8';
							_AJAX.content  = 'application/x-www-form-urlencoded';
							_AJAX.callback = {};
							_AJAX.status   = 0;
						},
			  create:	function(){
							return {
									xhr: rex.XDR.test(_AJAX.type) ? $Ajax.getJsonpback() : $Ajax.getTransport(),
									url: _AJAX.url,
								   type: _AJAX.type,
								   sync: _AJAX.sync,
								  param: _AJAX.param,
								  timer: _AJAX.timer,
								timeout: _AJAX.timeout,
								 encode: _AJAX.encode,
								content: _AJAX.content,
							   callback: _AJAX.callback,
								 status: _AJAX.status
							};
						},
		getJsonpback:	function(){
							return '_Jsonp' + $Util.now();
						},
		delJsonpback:	function(xhr){
							if(jMagic[xhr])
								try {
									jMagic[xhr] = unf;
								}catch(e){throw e}finally {
									delete jMagic[xhr];
								}
						},
		getTransport:	function(){
							return win.ActiveXObject ? new win.ActiveXObject('Microsoft.XMLHTTP') : new win.XMLHttpRequest();
						},
		delTransport:	function(xhr){
							if(xhr) xhr.abort();
						},
			 setType:	function(type){
							if($Match.isString(type))
								_AJAX.type = $Util.trim(type).toUpperCase();
						},
			 setSync:	function(sync){
							if($Match.isBoolean(sync))
								_AJAX.sync = sync;
							else
								_AJAX.sync = true;
						},
			  setUrl:	function(path){
							if($Match.isString(path))
								_AJAX.url = $Util.trim(path);
						},
			addParam:	function(name,data){
							if($Match.isString(name))
								$Array.push(_AJAX.param,$Array.join([name,'=',data],''));
						},
		  setContent:	function(type){
							if($Match.isString(type))
								_AJAX.content = $Util.trim(type);
						},
		   setEncode:	function(code){
							if($Match.isString(code))
								_AJAX.encode = $Util.trim(code);
						},
		  setTimeout:	function(time){
							if($Match.isInt(time))
								_AJAX.timeout = $Parse.toInt(time,10);
						},
		 setCallBack:	function(back){
							if($Match.isObject(back))
								_AJAX.callback = back;
						},
			   doGet:	function(url,fun,syn){
							$Ajax.setType('GET');
							$Ajax.setUrl(url);
							$Ajax.setSync(syn);
							$Ajax.setCallBack(fun);
							$Ajax.doRequest.call($Ajax.create());
						},
			  doPost:	function(url,fun,syn){
							$Ajax.setType('POST');
							$Ajax.setUrl(url);
							$Ajax.setSync(syn);
							$Ajax.setCallBack(fun);
							$Ajax.doRequest.call($Ajax.create());
						},
			 doJsonp:	function(url,fun,syn){
							$Ajax.setType('JSON');
							$Ajax.setUrl(url);
							$Ajax.setSync(syn);
							$Ajax.setCallBack(fun);
							$Ajax.doRequest.call($Ajax.create());
						},
			doUpload:	function(src,fun,syn){},
			doSubmit:	function(frm,fun,syn){},
			doMethod:	function(cmd,fun,syn){},
		   doRequest:	function(){
							with(this){
								try{
									if($Match.isFunction(callback.Loading))
										callback.Loading();
								}catch(e){throw e}finally{
									if(timeout > 0)
										$Thread.delay(function(){
											if(!status)
												try{
													if($Match.isFunction(callback.Timeout))
														callback.Timeout();
												}catch(e){throw e}finally{
													if($Match.isString(xhr))
														$Ajax.delJsonpback(xhr);
													else
														$Ajax.delTransport(xhr);
												}
										},timeout);
								}
								if(rex.XDR.test(type)){
									var htm = $Fn.tag('HEAD')[0], jss = $Import.js($Array.join([url,'?',$Array.join(param,'&')],'').replace(rex.AJAX,'=jMagic.' + xhr + '$1'),sync);
									try{
										jMagic[xhr] = function(json){
											if(status = 1)
												try{
													if($Match.isFunction(callback.Success))
														callback.Success.call({responseJson:json});
												}catch(e){throw e}finally{
													$Ajax.delJsonpback(xhr);
												}
										};
									}catch(e){throw e}finally{
										if((jss.charset = encode) && (jss.onload = jss.onreadystatechange = function(){
											if(!this.readyState || /loaded/i.test(this.readyState) || /complete/i.test(this.readyState)){
												try{
													htm.removeChild((
														jss.onload = jss.onreadystatechange = null
													) || jss);
												}catch(e){throw e}finally{
													htm = jss = null;
												}
											}
										}))
											try{
												htm.appendChild(jss);
											}catch(e){
												try{
													if($Match.isFunction(callback.Failure))
														callback.Failure();
												}catch(e){throw e}finally{
													$Ajax.delJsonpback(xhr);
												}
											}
									}
								}else{
									try{
										netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserRead');
									}catch(e){}finally{
										try{
											xhr.open(type, url, sync);
											xhr.setRequestHeader('Content-Type',$Array.join([content,';charset=',encode],''));
											xhr.send($Array.join(param,'&'));
											if(sync)
												xhr.onreadystatechange = $Util.bind(this,function(){
													$Ajax.doResponse.call(this);
												});
											else $Ajax.doResponse.call(this);
										}catch(e){
											try{
												if($Match.isFunction(callback.Failure))
													callback.Failure();
											}catch(e){throw e}finally{
												$Ajax.delTransport(xhr);
											}
										}
									}
								}
							}
						},
		  doResponse:	function(){
							with(this){
								if(xhr.readyState == 4){
									try{
										if(xhr.status == 200 && (status = 1)){
											if($Match.isFunction(callback.Success))
												callback.Success.call(xhr);
										}else{
											if($Match.isFunction(callback.Failure))
												callback.Failure();
										}
									}catch(e){
										if($Match.isFunction(callback.Failure))
											callback.Failure();
									}finally{
										$Ajax.delTransport(xhr);
									}
								}
							}
						}
	};
	
	var $Match = jMagic.Match = {
		equal:			function(a,b){
							return a == b && a === b;
						},
		style:			function(tag,css){
							try{
								return new RegExp('(^|\\s)' + css + '(\\s|$)').test(
									$Match.isString(tag) ? tag : tag.className
								);
							}catch(e){return false}
						},
		isEmpty:		function(obj){
							return !(obj === 0) ? !obj || (($Match.isString(obj) || $Match.isArray(obj)) && !obj.length) : false;
						},
		isObject:		function(obj){
							return !!obj && $Parse.toStr(obj) === '[object Object]';
						},
		isFunction: 	function(fun){
							return !!fun && $Parse.toStr(fun) === '[object Function]';
						},
		isPrimitive: 	function(obj){
							return $Match.isString(obj) || $Match.isNumber(obj) || $Match.isBoolean(obj);
						},
		isArray: 		function(arr){
							return !!arr && $Parse.toStr(arr) === '[object Array]';
						},
		isString: 		function(str){
							return $Parse.toStr(str) === '[object String]';
						},
		isNumber: 		function(num){
							return $Parse.toStr(num) === '[object Number]' && isFinite(num);
						},
		isBoolean: 		function(obj){
							return $Parse.toStr(obj) === '[object Boolean]';
						},
		isDefined: 		function(obj){
							return !$Match.equal(obj,unf);
						},
		isElement: 		function(obj){
							return !!(obj || 0).tagName;
						},
		isArgument:		function(arg){
							return !!(arg || 0).callee;
						},
		isIterable:		function(ita){
							return !!ita && !!(ita.nextNode || ita.item) && $Match.isNumber(ita.length);
						},
		isXml:			function(xml){
							var obj = null;
							try{
								obj = (xml ? xml.ownerDocument || xml : 0).documentElement;
							}catch(e){
								obj = null;
							}finally{
								return obj ? obj.nodeName !== 'HTML' : false;
							}
						},
		isDoc:			function(obj){
							return !!(obj || 0).execCommand;
						},
		isWin:			function(obj){
							return !!(obj || 0).clearInterval;
						},
		isDom:			function(obj){
							return !!obj && rex.DOM.test(obj.nodeType);
						},
		isUrl:			function(url){
							return rex.URL.test(url);
						},
		isJsn:			function(jsn){
							return $Match.isString(jsn) ? rex.JSN.SCRIPT.test(
								jsn.replace(
									rex.JSN.ESCAPE, '@'
								).replace(
									rex.JSN.TOKENS, ']'
								).replace(
									rex.JSN.BRACES, ''
								)
							) : $Match.isObject(jsn) && !$Match.isDom(jsn) && !$Match.isDefined(jsn.length);
						},
		isNum:          function(num){
							return !isNaN(num) && rex.NUM.test(num);
						},
		isInt:			function(num){
							return !isNaN(num) && rex.INT.test(num);
						},
		isFlt:        	function(flt){
							return !isNaN(flt) && rex.FLT.test(flt);
						},
		isZip:			function(zip){
							return rex.ZIP.test(zip);
						},
		isMac:			function(mac){
							return rex.MAC.test(mac);
						},
		isDate:			function(obj){
							return !!obj && $Parse.toStr(obj) === '[object Date]';
						},
		isCode:			function(str){
							return rex.CODE.test(str);
						},
		isCard:			function(str){
							return rex.CARD.test(str);
						},
		isEmail:		function(str){
							return rex.EMAIL.test(str);
						},
		isSubset:		function(pnd,chd,sub){
							if(pnd === chd){
								return sub || false;
							}else{
								if(sub = $Util.getDoc(this).documentElement)
									try{
										return sub.contains ? pnd.contains(chd) : !!(
											pnd.compareDocumentPosition(chd) & 16
										);
									}catch(e){
										while(chd = $Dom.getSire(chd)){
											if(pnd === chd) return true;
											if(chd === sub) return false;
										}
									}
							}
						}
	};
	
	var $Parse = jMagic.Parse = {
		toNum:	function(src){
					return $Match.isNum(src) ? Number(src) : function(str){
						try{
							return parseInt(str);
						}catch(e){return 0}
					}(src);
				},
		toInt:	function(src,cep){
					return $Match.isNum(cep) ? parseInt(src,cep || 10) : parseInt($Parse.toNum(src),cep || 10);
				},
		toFlt:	function(src,cep){
					return $Match.isNum(cep) ? $Math.fix(parseFloat(src),cep || 2) : $Math.fix(parseFloat($Parse.toNum(src),cep || 2));
				},
		toStr:	function(src){
					return Object.prototype.toString.call(src);
				},
		toTxt: 	function(src){
					return $Match.isDefined(src) ? src + '' : '';
				},
		toJsn:	function(src){
					return $Match.isJsn(src) ? $Match.isString(src) ? (
						$Support.json2 ? win.JSON.parse(src) : (
							new Function('return ' + src)
						)()
					) : (
						$Support.json2 ? win.JSON.stringify(src) : function(jsn,map){
							return $Match.isString(jsn) ? /["\\\x00-\x1f]/.test(jsn) ? '"' + jsn.replace(/([\x00-\x1f\\"])/g, function(reg,num){
								return map[num] ? map[num] : function(str){
									return '\\u00' + Math.floor(str / 16).toString(16) + (str % 16).toString(16);
								}(num.charCodeAt());
							}) + '"' : '"' + jsn + '"' : $Match.isArray(jsn) ? function(fun){
								return '[' + $Array.join($Array.map(jsn,function(arr,ind){
									return fun(arr,map);
								})) + ']';
							}(arguments.callee) : $Match.isObject(jsn) ? function(fun){
								return '{' + $Array.join($Array.map(jsn,function(obj,key){
									return fun(key,map) + ':' + fun(obj,map);
								})) + '}';
							}(arguments.callee) : jsn;
						}(src,{'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'})
					) : null;
				},
		toArr:	function(src){
					return $Match.isPrimitive(src) ? $Parse.toTxt(src).match(/./g) : !$Match.isDefined(src.length) || $Match.isFunction(src) || (
						!$Match.isFunction(src) && src.setInterval
					) ? [src] : $Array.clone(src);
				}
	};
	
	var _SORT = {
		asc : function(x,y){
			return x == y ? 0 : (x > y ? 1 : -1);
		},
		desc : function(x,y){
			return x == y ? 0 : (x > y ? -1 : 1);
		},
		random : function(){
			return Math.floor(Math.random() * 3) - 1;
		}
	};
	
	var $Array = jMagic.Array = {
		mix: 		function(arr){
						$Array.each($Array.slice(arguments,1),function(){
							!$Match.isArray(this) ? $Array.push(arr,this) : $Array.each(this,function(){
								$Array.mix(arr,this);
							});
						});
					},
		min: 		function(arr){
						return Math.min.apply(unf,arr);
					},
		max: 		function(arr){
						return Math.max.apply(unf,arr);
					},
		map:		function(arr,fun,arg){
						var ret = [];
						try{
							$Array.each(arr,function(obj,ind){
								$Array.push(ret,fun.call(
									arg || obj, obj, ind, arr
								));
							});
						}catch(e){return []} return ret;
					},
		pop:		function(arr){
						return Array.prototype.pop.call(arr);
					},
		join:		function(arr){
						return Array.prototype.join.apply(arr,$Array.slice(arguments,1));
					},
		push:		function(arr){
						return Array.prototype.push.apply(arr,$Array.slice(arguments,1));
					},
		each: 		function(arr,fun,arg){
						if(!$Match.isDefined(arr.length)){
							for(var i in arr){
								if ((fun || 0).call(
									arg || arr[i], arr[i], i, arr
								) === false) break;
							}
						}else{
							for(var i=0,l=arr.length; i<l; i++){
								if ((fun || 0).call(
									arg || arr[i], arr[i], i, arr
								) === false) break;
							}
						}
					},
		grep:		function(arr,fun,inv){
						var ret = [];
						try{
							$Array.each(arr,function(obj,ind){
								if(!inv !== !fun(obj,ind))
									$Array.push(ret,obj);
							});
						}catch(e){return []} return ret;
					},
		sort:		function(arr,fun){
						try{
							return Array.prototype.sort.call(arr,(!$Match.isFunction(fun) ? _SORT[fun] || null : fun));
						}catch(e){return []}
					},
		index:    	function(arr,itm){
						var ret = -1;
						try{
							$Array.each(arr,function(obj,ind){
								if($Match.equal(obj,itm))
									return (ret = ind) && false;
							});
						}catch(e){return -1} return ret;
					},
		clone:		function(arr){
						try{
							return $Array.slice(arr,0);
						}catch(e){
							var ret = [];
							try{
								$Array.each(arr,function(){
									$Array.push(ret,this);
								});
							}catch(e){return []} return ret;
						}
					},
		slice:		function(arr,ind,len){
						return Array.prototype.slice.call(arr,ind,len || arr.length);
					},
		merge:		function(arr){
						try{
							return Array.prototype.concat.apply(arr,$Array.slice(arguments,1));
						}catch(e){
							var ret = [];
							try{
								$Array.each(arguments,function(){
									$Array.each(this,function(){
										$Array.push(ret,this);
									});
								});
							}catch(e){return []} return ret;
						}
					},
		shift:		function(arr){
						return Array.prototype.shift.call(arr);
					},
		clear: 		function(arr) {
						try{
							arr.length = 0;
						}catch(e){return []} return arr;
					},
		unique: 	function(arr){
						var i = 0, j = 0;
						try{
							while($Match.isDefined(arr[i])){
								j = i + 1;
								while($Match.isDefined(arr[j])){
									if($Match.equal(arr[i],arr[j])){
										$Array.splice(arr,j,1);
										j--;
									}
									++j;
								}
								++i;
							}
						}catch(e){return []} return arr;
					},
		
		splice:		function(arr){
						return Array.prototype.splice.apply(arr,$Array.slice(arguments,1));
					},
		remove:     function(arr,itm){
						try{
							$Array.each(arr,function(obj,ind){
								if($Match.equal(obj,itm))
									return $Array.splice(arr,ind) && false;
							});
						}catch(e){return []} return arr;
					},
		replace:	function(arr,ind,obj){
						try{
							if((ind = $Parse.toNum(ind)) >= 0){
								arr[ind] = obj;
							}
						}catch(e){return []} return arr;
					},
		reverse:	function(arr){
						return Array.prototype.reverse.call(arr);
					},
		unshift:	function(arr){
						return Array.prototype.unshift.apply(arr,$Array.slice(arguments,1));
					}
	};
	
	var $Thread = jMagic.Thread = {
		delay:	function(fun,num,arg){
					return (function(timer){
						return timer = {
							abort : (
								function(guid){
									return $Util.bind(this, function(){
										try{
											if(guid)
												this.clearTimeout(guid);
										}catch(e){
											return false;
										}
										return !(guid = null);
									});
								}
							).call(this, this.setTimeout(function(){
								try{
									fun.call(arg || timer, timer, arg);
								}catch(e){}finally{
									timer.abort();
								}
							}, num || 0))
						};
					}).call($Util.getWin(this));
				},
		retry:	function(fun,num,arg){
					return (function(tryer){
						return tryer = {
							abort : (
								function(guid){
									return $Util.bind(this, function(){
										try{
											if(guid)
												this.clearInterval(guid);
										}catch(e){
											return false;
										}
										return !(guid = null);
									});
								}
							).call(this, this.setInterval(function(){
								try{
									if(fun.call(arg || tryer, tryer, arg))
										tryer.abort();
								}catch(e){
									tryer.abort();
								}
							}, num || 1))
						};
					}).call($Util.getWin(this));
				}
	};
	
	var $Import = jMagic.Import = {
		 js:	function(src,syn){
					var js = null;
					if($Match.isString(src)){
						try{
							js = $Util.getDoc(this).createElement('script');
						}catch(e){
							js = null;
						}finally{
							if(js != null){
								js.type = 'text/javascript';
								if(
									js.defer = $Match.isBoolean(syn) ? syn : true
								){
									js.src = src;
								}else{
									if(!$Match.isUrl(src)){
										js.text = src;
									}else{
										$Ajax.init();
										$Ajax.doGet(src,{
											Success: function(){
												js.text = this.responseText;
											}
										},false);
									}
								}
							}
						}
					}
					return js;
				},
		css:	function(src){
					var css = null;
					if($Match.isString(path)){
						try{
							css = $Util.getDoc(this).createElement('link');
						}catch(e){
							css = null;
						}finally{
							if(css != null){
								css.rel  = 'stylesheet';
								css.type = 'text/css';
								css.href = src;
							}
						}
					}
					return css;
				}
	};
	
	var $Widget = jMagic.Widget = {};
	
	var $Extend = jMagic.Extend = {};
	
})(window);