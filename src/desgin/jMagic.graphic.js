/*****************************************************************************************************************
 * 用途：jMagic绘图框架
 *
 * @author Wythe
 *
 * 版本日志：
 * @version 1.0 2008.10.01 创建 Wythe
 * @version 2.0 2012.12.12 创建 Wythe
 ******************************************************************************************************************/
(function($){

	var _blank = 'M 0 0', _event = $.Array.merge(['click', 'dblclick', 'mouseover', 'mouseout', 'contextmenu'], $.Support.touch ? ['touchstart', 'touchmove', 'touchend'] : ['mousedown', 'mousemove', 'mouseup']), _regex = {
		solid : /^SOLID$/i,
		color : /^#[0-9A-F]{6}$/i,
		style : /^(DOT|DASH|SOLID|DASHDOT)$/i
	}, _stamp = function(fore){
		return (fore || '') + $.Util.padded((this % 0xFFFFFF).toString(16), 6, 0, function(lack){
			return lack + this;
		});
	}, _amend = function(mend){
		return function(){
			return !$.Array.each(mend, function(task, attr){
				if(attr in this) task.call(this);
			}, this);
		};
	}({
		'thick' : function(){
			this.thick = ($.Match.isInt(this.thick) ? this.thick : 1);
		},
		'alpha' : function(){
			this.alpha = ($.Match.isInt(this.alpha) ? this.alpha : 100);
		},
		'slope' : function(){
			this.slope = ($.Match.isNumber(this.slope) ? this.slope : false);
		},
		'matte' : function(){
			this.matte = ($.Match.isBoolean(this.matte) ? this.matte : false);
		},
		'arrow' : function(){
			this.arrow = ($.Match.isBoolean(this.arrow) ? this.arrow : false);
		},
		'style' : function(){
			this.style = (_regex.style.test(this.style) ? this.style.toUpperCase() : 'SOLID');
		},
		'color' : function(){
			this.color = (_regex.color.test(this.color) ? this.color.toUpperCase() : '#FF0000');
		},
		'stuff' : function(){
			this.stuff = (_regex.color.test(this.stuff) ? this.stuff.toUpperCase() : (
				this.stuff === true ? this.color : false
			));
		},
		'angle' : function(){
			this.angle = ($.Match.isNumber((this.angle || 0).f) && $.Match.isNumber((this.angle || 0).t) ? this.angle : null);
		},
		'extra' : function(){
			this.extra = ($.Match.isNumber((this.extra || 0).x) && $.Match.isNumber((this.extra || 0).y) ? this.extra : null);
		},
		'point' : function(){
			this.point = ($.Match.isNumber((this.point || 0).x) && $.Match.isNumber((this.point || 0).y) ? this.point : null);
		}
	}), _arith = {
		/**
		 * 十六进制颜色转换
		 * @param r
		 * @param g
		 * @param b
		 * @return hex
		 */
		rgb2hex : function(r, g, b){
			return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
		},
		pos2len : function(x1, y1, x2, y2){
			return Math.sqrt((x1 = x2 - x1) * x1 + (y1 = y2 - y1) * y1);
		},
		pos4arc : function(cx, cy, rx, ry, ta, sa){
			rx = rx * Math.cos(ta);
			ry = ry * Math.sin(ta);
			ta = Math.cos(sa);
			sa = Math.sin(sa);
			return [cx + (rx * ta - ry * sa), cy + (rx * sa + ry * ta)];
		},
		pos4crv : function(x1, y1, x2, y2, x3, y3, x4, y4, ta){
			var a3, a2 = ((a3 = $.Match.isDefined(ta)) ? ta * ta : x4 * x4);
			return !a3 ? (
				[x3 * a2 + x2 * (2 * x4 - 2 * a2) + x1 * (1 - 2 * x4 + a2), y3 * a2 + y2 * (2 * x4 - 2 * a2) + y1 * (1 - 2 * x4 + a2)]
			) : (
				[x4 * (a3 = a2 * ta) + x3 * 3 * (a2 - a3) + x2 * 3 * (ta - 2 * a2 + a3) + x1 * (1 - 3 * ta + 3 * a2 - a3), y4 * a3 + y3 * 3 * (a2 - a3) + y2 * 3 * (ta - 2 * a2 + a3) + y1 * (1 - 3 * ta + 3 * a2 - a3)]
			);
		},
		ang2ecc : function(av, rx, ry){
			return Math.atan2(rx * Math.sin(av * Math.PI / 180), ry * Math.cos(av * Math.PI / 180));
		},
		trans2d : (function(){
			this.prototype = {
				offset : function(v){
					return v ? [$.Math.fix(this.m[4], 10), $.Math.fix(this.m[5], 10)] : [this.m[4], this.m[5]];
				},
				matrix : function(v){
					return v ? [$.Math.fix(this.m[0], 10), $.Math.fix(this.m[2], 10), $.Math.fix(this.m[1], 10), $.Math.fix(this.m[3], 10), 0, 0] : this.m;
				},
				matmul : function(m, x, y){
					this.m[5] = this.m[1] * m[4] + (x = this.m[3]) * m[5] + this.m[5];
					this.m[4] = this.m[0] * m[4] + (y = this.m[2]) * m[5] + this.m[4];
					this.m[3] = this.m[1] * m[2] + x * m[3];
					this.m[2] = this.m[0] * m[2] + y * m[3];
					this.m[1] = this.m[1] * m[0] + x * m[1];
					this.m[0] = this.m[0] * m[0] + y * m[1];
					return this;
				},
				rotate : function(r, x, y){
					var c = Math.cos(r), s = Math.sin(r);
					if($.Match.isNumber(x) && $.Match.isNumber(y)){
						this.matmul.call(this, [c, s, -s, c, x, y]);
						this.matmul.call(this, [1, 0, 0, 1, -x, -y]);
					}else{
						this.m[0] = (x = this.m[0]) * c + this.m[2] * s;
						this.m[1] = (y = this.m[1]) * c + this.m[3] * s;
						this.m[2] = x * -s + this.m[2] * c;
						this.m[3] = y * -s + this.m[3] * c;
					}
					return this;
				}
			};
			return this;
		}).call(function(){
			this.m = [1, 0, 0, 1, 0, 0];
		})
	}, _graph = (
		$.Support.graphic.svg ? function(parse, model){
			parse.prototype = {
				A : function(p){
					for(var i = 0, l = p.length; i < l; i += 7){
						$.Array.push(this.save, 'A', p[i], p[i + 1], p[i + 2], p[i + 3], p[i + 4], p[i + 5], p[i + 6]);
					}
					return this;
				},
				C : function(p){
					for(var i = 0, l = p.length; i < l; i += 6){
						$.Array.push(this.save, 'C', p[i], p[i + 1], p[i + 2], p[i + 3], p[i + 4], p[i + 5]);
					}
					return this;
				},
				Q : function(p){
					for(var i = 0, l = p.length; i < l; i += 4){
						$.Array.push(this.save, 'Q', p[i], p[i + 1], p[i + 2], p[i + 3]);
					}
					return this;
				},
				L : function(p){
					for(var i = 0, l = p.length; i < l; i += 2){
						$.Array.push(this.save, 'L', p[i], p[i + 1]);
					}
					return this;
				},
				M : function(p){
					for(var i = 0, l = p.length; i < l; i += 2){
						$.Array.push(this.save, 'M', p[i], p[i + 1]);
					}
					return this;
				},
				Z : function(){
					return $.Array.push(this.save, 'Z') && this;
				},
				P : function(){
					return $.Array.join(this.save, ' ');
				}
			};
			return function(wnd, doc, cnv, can){
				var count = 0, scene, quote, scope = {x : 0, y : 0, w : 0, h : 0}, mount = function(sire){
					return function(gene){
						return function(owner){
							sire.apply(this, arguments);
							gene.apply(this, arguments);
							/**
							 * 绘制图形
							 */
							$.Thread.delay.call(wnd, function() {
								try{
									(scene.shapes[owner.ident = _stamp.call(count++, '_')] = this).paint();
								}catch(e){owner.error = e}finally{
									if(!owner.error){
										this.regist('mouseout', function(){
											$.Util.setMouse(cnv, cnv.title = '');
										});
										this.regist('mouseover', $.Util.bind(this, function(){
											cnv.title = this.title || '';
											{
												$.Util.setMouse(cnv, this.mouse);
											}
										}));
									}
								}
							}, 0, this);
						};
					};
				}(function(owner, param){
					/**
					 * 标题
					 * @type {String}
					 */
					this.title = param.title;
					/**
					 * 透明
					 * @type {Number}
					 */
					this.alpha = param.alpha;
					/**
					 * 可见
					 * @type {Boolean}
					 */
					this.matte = param.matte;
					/**
					 * 鼠标样式
					 */
					this.mouse = param.mouse;
					/**
					 * 置前图形
					 */
					this.front = function(){
						if((owner || 0).alive)
							!owner.svg2d || owner.run2d ? $.Thread.delay.call(wnd, arguments.callee) : scene.appendChild(owner.svg2d);
					};
					/**
					 * 擦除图形
					 */
					this.erase = function(){
						if(!owner.svg2d || owner.run2d){
							$.Thread.delay.call(wnd, arguments.callee, 0, this);
						}else{
							if((owner || 0).alive && scene.removeChild(owner.svg2d)){
								var done = delete scene.shapes[owner.ident];
								try{
									if(done && ('arrow' in this))
										done = !!quote.removeChild($.Array.pop($.Fn.css.call(quote, '#' + owner.ident)));
								}catch(e){
									done = false;
								}finally{
									if(!done && (scene.shapes[owner.ident] = this)){
										scene.appendChild(owner.svg2d);
									}else{
										// 销毁缓存
										param = $.Array.each(owner, function(_, key){
											delete owner[key];
										});
										// 销毁实例
										owner = $.Array.each(this, function(_, fun){
											delete this[fun];
										}, this);
									}
								}
							}
						}
					};
					/**
					 * 注册事件
					 */
					this.regist = function(evt, fun){
						if($.Match.isFunction(fun) && $.Array.index(_event, evt = $.Parse.toTxt(evt)) > -1)
							(function(){
								if((owner || 0).alive)
									!owner.svg2d || owner.run2d ? $.Thread.delay.call(wnd, arguments.callee, 0, this) : (fun[owner.ident] || (fun[owner.ident] = {}))[evt] = $.Util.addEvent({
										evt : evt,
										arg : this,
										obj : owner.svg2d,
										fun : function(e){
											fun.call(this, e, this);
										}
									}, true);
							}).call(this);
					};
					/**
					 * 销毁事件
					 */
					this.reject = function(evt, fun){
						if($.Match.isFunction(fun) && $.Array.index(_event, evt = $.Parse.toTxt(evt)) > -1)
							(function(){
								if((owner || 0).alive)
									!owner.svg2d || owner.run2d ? $.Thread.delay.call(wnd, arguments.callee, 0, this) : $.Thread.delay.call(wnd, function(lsn){
										if(((lsn = fun[owner.ident]) || 0)[evt] && $.Util.delEvent(lsn[evt]))
											delete lsn[evt];
									});
							}).call(this);
					};
				}), skill = {
					styleTo : function(type, thin){
						switch(type){
							case 'SOLID':
								return '';
							case 'DOT':
								return $.Array.join([thin, thin * 3], ' ');
							case 'DASH':
								return $.Array.join([thin * 4, thin * 3], ' ');
							case 'DASHDOT':
								return $.Array.join([thin * 4, thin * 3, thin, thin * 3], ' ');
						}
					}
				};
				/**
				 * 修正舞台
				 */
				this.refix = function(dimen){
					if(!(scene || 0).shapes){
						$.Thread.delay.call(wnd, arguments.callee);
					}else{
						if(dimen = (dimen || $.Util.getElemSize(cnv)))
							try{
								$.Util.setElemSize(scene, {
									w : scope.w = $.Parse.toInt(dimen.w) || 0,
									h : scope.h = $.Parse.toInt(dimen.h) || 0
								});
							}catch(e){
								dimen = null;
							}finally{
								if(dimen)
									dimen = this.slice(scope);
							}
					}
				};
				/**
				 * 修正视野
				 */
				this.slice = function(limit){
					if((scene || 0).setAttribute)
						scene.setAttribute('viewBox', $.Array.join([
							0 - (scope.x = $.Parse.toInt(limit.x) || 0), 0 - (scope.y = $.Parse.toInt(limit.y) || 0), scope.w, scope.h
						], ' '));
				};
				/**
				 * 预处理
				 */
				this.ready = function(){
					if(!can){
						try{
							can = !$.Fx.draw.call(wnd, scene = cnv.appendChild(doc.createElementNS('http://www.w3.org/2000/svg', 'svg')), ['<defs></defs>'], function(){
								if((scene.shapes = {}) && !this.refix())
									$.Fx.draw.call(wnd, quote = scene.childNodes[0], ['<path id="arrow-classic" d="M5 0 0 2.5 5 5 3.5 3 3.5 2Z" stroke-linecap="round"></path>'], function(){
										scene.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
									});
							}, this);
						}catch(e){
							can = false;
						}
					}
					return can;
				};
				/**
				 * 刷新舞台
				 */
				this.renew = function(){
					if(!(scene || 0).shapes){
						$.Thread.delay.call(wnd, arguments.callee);
					}else{
						$.Array.each(scene.shapes, function(shape){
							shape.paint();
						});
					}
				};
				/**
				 * 清空舞台
				 */
				this.clear = function(){
					if(!(scene || 0).shapes){
						$.Thread.delay.call(wnd, arguments.callee);
					}else{
						$.Array.each(scene.shapes, function(shape){
							shape.erase();
						});
					}
				};
				/**
				 * 创建图形
				 */
				this.build = {
					/**
					 * 创建线条
					 */
					'LINE' : mount(function(owner, param){
						/**
						 * 路径
						 * @type {Array}
						 */
						this.route = param.route;
						/**
						 * 粗细
						 * @type {Number}
						 */
						this.thick = param.thick;
						/**
						 * 颜色
						 * @type {String}
						 */
						this.color = param.color;
						/**
						 * 箭头
						 * @type {true|false}
						 */
						this.arrow = param.arrow;
						/**
						 * 线型
						 * @type {DOT|DASH|SOLID|DASHDOT}
						 */
						this.style = param.style;
						/**
						 * 重绘图形
						 */
						this.paint = function(){
							if((owner || 0).alive)
								if(owner.run2d || !scene || !quote || !owner.ident){
									$.Thread.delay.call(wnd, arguments.callee, 0, this);
								}else{
									if(_amend.call(this)){
										var gplug, gpath = (gplug = (this.route || 0).length > 3) ? (new parse()).M($.Array.slice(this.route, 0, 2)).L($.Array.slice(this.route, 2)).P() : _blank;
										if(owner.svg2d && !(owner.svg2d.style.display = (this.matte ? 'none' : ''))){
											owner.svg2d.setAttribute('d', gpath);
											owner.svg2d.setAttribute('stroke', this.color);
											owner.svg2d.setAttribute('stroke-width', this.thick);
											owner.svg2d.setAttribute('opacity', this.alpha / 100);
											owner.svg2d.setAttribute('marker-end', this.arrow && gplug ? 'url(#' + owner.ident + ')' : '');
											owner.svg2d.setAttribute('stroke-dasharray', skill.styleTo(this.style, this.thick));
										}else{
											owner.run2d = !$.Fx.draw.call(wnd, scene, [$.Util.format(model.line, [gpath, owner.ident, this.color, this.thick, this.alpha / 100, skill.styleTo(this.style, this.thick), this.matte ? 'none' : ''])], function(){
												if(owner.svg2d = $.Array.pop($.Fn.css.call(scene, "." + owner.ident)))
													$.Fx.draw.call(wnd, quote, [$.Util.format(model.mark, [owner.ident, this.color])], function(){
														if(!(owner.run2d = false) && !this.matte && this.arrow && gplug)
															owner.svg2d.setAttribute('marker-end', 'url(#' + owner.ident + ')');
													}, this);
											}, this);
										}
									}
								}
						};
					}),
					'RECT' : mount(function(owner, param){
						/**
						 * 中点
						 * @type {x,y}
						 */
						this.point = param.point;
						/**
						 * 辐射
						 * @type {x,y}
						 */
						this.extra = param.extra;
						/**
						 * 粗细
						 * @type {Number}
						 */
						this.thick = param.thick;
						/**
						 * 颜色
						 * @type {String}
						 */
						this.color = param.color;
						/**
						 * 填充
						 * @type {String}
						 */
						this.stuff = param.stuff;
						/**
						 * 斜率
						 * @type {Number}
						 */
						this.slope = param.slope;
						/**
						 * 线型
						 * @type {DOT|DASH|SOLID|DASHDOT}
						 */
						this.style = param.style;
						/**
						 * 重绘图形
						 */
						this.paint = function(){
							if((owner || 0).alive)
								if(owner.run2d || !scene || !quote || !owner.ident){
									$.Thread.delay.call(wnd, arguments.callee, 0, this);
								}else{
									if(_amend.call(this)){
										var gpath = this.point && this.extra ? (new parse()).M([this.point.x - this.extra.x, this.point.y - this.extra.y]).L([this.point.x - this.extra.x, this.point.y + this.extra.y, this.point.x + this.extra.x, this.point.y + this.extra.y, this.point.x + this.extra.x, this.point.y - this.extra.y, this.point.x - this.extra.x, this.point.y - this.extra.y]).P() : _blank, trans = (
											!this.matte && this.slope && gpath !== _blank ? 'matrix(' + (new _arith.trans2d()).rotate(-this.slope * Math.PI / 180, this.point.x, this.point.y).matrix() + ')' : false
										);
										if(owner.svg2d && !(owner.svg2d.style.display = (this.matte ? 'none' : ''))){
											owner.svg2d.setAttribute('d', gpath);
											owner.svg2d.setAttribute('opacity', this.alpha / 100);
											owner.svg2d.setAttribute('stroke-width', this.thick);
											owner.svg2d.setAttribute('stroke', this.color);
											owner.svg2d.setAttribute('fill', this.stuff || 'none');
											owner.svg2d.setAttribute('stroke-dasharray', skill.styleTo(this.style, this.thick));
											if(!trans){
												owner.svg2d.removeAttribute('transform');
											}else{
												owner.svg2d.setAttribute('transform', trans);
											}
										}else{
											owner.run2d = !$.Fx.draw.call(wnd, scene, [$.Util.format(model.rect, [gpath, owner.ident, this.color, this.thick, this.alpha / 100, skill.styleTo(this.style, this.thick), this.matte ? 'none' : '', this.stuff || 'none'])], function(){
												if(!(owner.run2d = false) && (owner.svg2d = $.Array.pop($.Fn.css.call(scene, "." + owner.ident))) && trans)
													owner.svg2d.setAttribute('transform', trans);
											});
										}
									}
								}
						};
					}),
					'POLY' : mount(function(owner, param){
						/**
						 * 路径
						 * @type {Array}
						 */
						this.route = param.route;
						/**
						 * 粗细
						 * @type {Number}
						 */
						this.thick = param.thick;
						/**
						 * 颜色
						 * @type {String}
						 */
						this.color = param.color;
						/**
						 * 填充
						 * @type {String}
						 */
						this.stuff = param.stuff;
						/**
						 * 线型
						 * @type {DOT|DASH|SOLID|DASHDOT}
						 */
						this.style = param.style;
						/**
						 * 重绘图形
						 */
						this.paint = function(){
							if((owner || 0).alive)
								if(owner.run2d || !scene || !quote || !owner.ident){
									$.Thread.delay.call(wnd, arguments.callee, 0, this);
								}else{
									if(_amend.call(this)){
										var gpath = (this.route || 0).length > 3 ? (new parse()).M($.Array.slice(this.route, 0, 2)).L($.Array.slice(this.route, 2)).Z().P() : _blank;
										if(owner.svg2d && !(owner.svg2d.style.display = (this.matte ? 'none' : ''))){
											owner.svg2d.setAttribute('d', gpath);
											owner.svg2d.setAttribute('opacity', this.alpha / 100);
											owner.svg2d.setAttribute('stroke-width', this.thick);
											owner.svg2d.setAttribute('stroke', this.color);
											owner.svg2d.setAttribute('fill', this.stuff || 'none');
											owner.svg2d.setAttribute('stroke-dasharray', skill.styleTo(this.style, this.thick));
										}else{
											owner.run2d = !$.Fx.draw.call(wnd, scene, [$.Util.format(model.poly, [gpath, owner.ident, this.color, this.thick, this.alpha / 100, skill.styleTo(this.style, this.thick), this.matte ? 'none' : '', this.stuff || 'none'])], function(){
												owner.run2d = ((owner.svg2d = $.Array.pop($.Fn.css.call(scene, "." + owner.ident))) && false);
											});
										}
									}
								}
						};
					}),
					'OVAL' : mount(function(owner, param){
						/**
						 * 中点
						 * @type {x,y}
						 */
						this.point = param.point;
						/**
						 * 辐射
						 * @type {x,y}
						 */
						this.extra = param.extra;
						/**
						 * 粗细
						 * @type {Number}
						 */
						this.thick = param.thick;
						/**
						 * 颜色
						 * @type {String}
						 */
						this.color = param.color;
						/**
						 * 填充
						 * @type {String}
						 */
						this.stuff = param.stuff;
						/**
						 * 斜率
						 * @type {Number}
						 */
						this.slope = param.slope;
						/**
						 * 线型
						 * @type {DOT|DASH|SOLID|DASHDOT}
						 */
						this.style = param.style;
						/**
						 * 重绘图形
						 */
						this.paint = function(){
							if((owner || 0).alive)
								if(owner.run2d || !scene || !quote || !owner.ident){
									$.Thread.delay.call(wnd, arguments.callee, 0, this);
								}else{
									if(_amend.call(this)){
										var gpath = this.point && this.extra ? (new parse()).M([this.point.x, this.point.y - this.extra.y]).A([this.extra.x, this.extra.y, 0, 1, 1, this.point.x, this.point.y + this.extra.y]).A([this.extra.x, this.extra.y, 0, 1, 1, this.point.x, this.point.y - this.extra.y]).P() : _blank, trans = (
											!this.matte && this.slope && gpath !== _blank ? 'matrix(' + (new _arith.trans2d()).rotate(-this.slope * Math.PI / 180, this.point.x, this.point.y).matrix() + ')' : false
										);
										if(owner.svg2d && !(owner.svg2d.style.display = (this.matte ? 'none' : ''))){
											owner.svg2d.setAttribute('d', gpath);
											owner.svg2d.setAttribute('opacity', this.alpha / 100);
											owner.svg2d.setAttribute('stroke-width', this.thick);
											owner.svg2d.setAttribute('stroke', this.color);
											owner.svg2d.setAttribute('fill', this.stuff || 'none');
											owner.svg2d.setAttribute('stroke-dasharray', skill.styleTo(this.style, this.thick));
											if(!trans){
												owner.svg2d.removeAttribute('transform');
											}else{
												owner.svg2d.setAttribute('transform', trans);
											}
										}else{
											owner.run2d = !$.Fx.draw.call(wnd, scene, [$.Util.format(model.oval, [gpath, owner.ident, this.color, this.thick, this.alpha / 100, skill.styleTo(this.style, this.thick), this.matte ? 'none' : '', this.stuff || 'none'])], function(){
												if(!(owner.run2d = false) && (owner.svg2d = $.Array.pop($.Fn.css.call(scene, "." + owner.ident))) && trans)
													owner.svg2d.setAttribute('transform', trans);
											});
										}
									}
								}
						};
					}),
					'ARCH' : mount(function(owner, param){
						/**
						 * 角度
						 * @type {f,t}
						 */
						this.angle = param.angle;
						/**
						 * 中点
						 * @type {x,y}
						 */
						this.point = param.point;
						/**
						 * 辐射
						 * @type {x,y}
						 */
						this.extra = param.extra;
						/**
						 * 粗细
						 * @type {Number}
						 */
						this.thick = param.thick;
						/**
						 * 颜色
						 * @type {String}
						 */
						this.color = param.color;
						/**
						 * 填充
						 * @type {String}
						 */
						this.stuff = param.stuff;
						/**
						 * 斜率
						 * @type {Number}
						 */
						this.slope = param.slope;
						/**
						 * 线型
						 * @type {DOT|DASH|SOLID|DASHDOT}
						 */
						this.style = param.style;
						/**
						 * 重绘图形
						 */
						this.paint = function(){
							if((owner || 0).alive)
								if(owner.run2d || !scene || !quote || !owner.ident){
									$.Thread.delay.call(wnd, arguments.callee, 0, this);
								}else{
									if(_amend.call(this)){
										var gpath = this.point && this.extra && this.angle ? (new parse()).M(_arith.pos4arc(this.point.x, this.point.y, this.extra.x, this.extra.y, -_arith.ang2ecc(this.angle.f, this.extra.x, this.extra.y), 0)).A($.Array.merge([this.extra.x, this.extra.y, 0, (this.angle.t - this.angle.f) > 180 ? 1 : 0, 0], _arith.pos4arc(this.point.x, this.point.y, this.extra.x, this.extra.y, -_arith.ang2ecc(this.angle.t, this.extra.x, this.extra.y), 0))).L([this.point.x, this.point.y]).Z().P() : _blank, trans = (
											!this.matte && this.slope && gpath !== _blank ? 'matrix(' + (new _arith.trans2d()).rotate(-this.slope * Math.PI / 180, this.point.x, this.point.y).matrix() + ')' : false
										);
										if(owner.svg2d && !(owner.svg2d.style.display = (this.matte ? 'none' : ''))){
											owner.svg2d.setAttribute('d', gpath);
											owner.svg2d.setAttribute('opacity', this.alpha / 100);
											owner.svg2d.setAttribute('stroke-width', this.thick);
											owner.svg2d.setAttribute('stroke', this.color);
											owner.svg2d.setAttribute('fill', this.stuff || 'none');
											owner.svg2d.setAttribute('stroke-dasharray', skill.styleTo(this.style, this.thick));
											if(!trans){
												owner.svg2d.removeAttribute('transform');
											}else{
												owner.svg2d.setAttribute('transform', trans);
											}
										}else{
											owner.run2d = !$.Fx.draw.call(wnd, scene, [$.Util.format(model.arch, [gpath, owner.ident, this.color, this.thick, this.alpha / 100, skill.styleTo(this.style, this.thick), this.matte ? 'none' : '', this.stuff || 'none'])], function(){
												if(!(owner.run2d = false) && (owner.svg2d = $.Array.pop($.Fn.css.call(scene, "." + owner.ident))) && trans)
													owner.svg2d.setAttribute('transform', trans);
											});
										}
									}
								}
						};
					}),
					'WAVE' : mount(function(owner, param){
						/**
						 * 路径
						 * @type {Array}
						 */
						this.route = param.route;
						/**
						 * 粗细
						 * @type {Number}
						 */
						this.thick = param.thick;
						/**
						 * 颜色
						 * @type {String}
						 */
						this.color = param.color;
						/**
						 * 箭头
						 * @type {true|false}
						 */
						this.arrow = param.arrow;
						/**
						 * 线型
						 * @type {DOT|DASH|SOLID|DASHDOT}
						 */
						this.style = param.style;
						/**
						 * 重绘图形
						 */
						this.paint = function(){
							if((owner || 0).alive)
								if(owner.run2d || !scene || !quote || !owner.ident){
									$.Thread.delay.call(wnd, arguments.callee, 0, this);
								}else{
									if(_amend.call(this)){
										var gplug, gpath = (gplug = (this.route || 0).length > 5) ? (new parse()).M($.Array.slice(this.route, 0, 2))[this.route.length === 8 ? 'C' : 'Q']($.Array.slice(this.route, 2)).P() : _blank;
										if(owner.svg2d && !(owner.svg2d.style.display = (this.matte ? 'none' : ''))){
											owner.svg2d.setAttribute('d', gpath);
											owner.svg2d.setAttribute('stroke', this.color);
											owner.svg2d.setAttribute('stroke-width', this.thick);
											owner.svg2d.setAttribute('opacity', this.alpha / 100);
											owner.svg2d.setAttribute('marker-end', this.arrow && gplug ? 'url(#' + owner.ident + ')' : '');
											owner.svg2d.setAttribute('stroke-dasharray', skill.styleTo(this.style, this.thick));
										}else{
											owner.run2d = !$.Fx.draw.call(wnd, scene, [$.Util.format(model.wave, [gpath, owner.ident, this.color, this.thick, this.alpha / 100, skill.styleTo(this.style, this.thick), this.matte ? 'none' : ''])], function(){
												if(owner.svg2d = $.Array.pop($.Fn.css.call(scene, "." + owner.ident)))
													$.Fx.draw.call(wnd, quote, [$.Util.format(model.mark, [owner.ident, this.color])], function(){
														if(!(owner.run2d = false) && !this.matte && this.arrow && gplug)
															owner.svg2d.setAttribute('marker-end', 'url(#' + owner.ident + ')');
													}, this);
											}, this);
										}
									}
								}
						};
					})
				};
			};
		}(function(){
			this.save = [];
		}, {
			line : '<path d="$1" class="$2" stroke="$3" stroke-width="$4" opacity="$5" stroke-dasharray="$6" style="display:$7;" fill="none"></path>',
			rect : '<path d="$1" class="$2" stroke="$3" stroke-width="$4" opacity="$5" stroke-dasharray="$6" style="display:$7;" fill="$8"></path>',
			poly : '<path d="$1" class="$2" stroke="$3" stroke-width="$4" opacity="$5" stroke-dasharray="$6" style="display:$7;" fill="$8"></path>',
			oval : '<path d="$1" class="$2" stroke="$3" stroke-width="$4" opacity="$5" stroke-dasharray="$6" style="display:$7;" fill="$8"></path>',
			arch : '<path d="$1" class="$2" stroke="$3" stroke-width="$4" opacity="$5" stroke-dasharray="$6" style="display:$7;" fill="$8"></path>',
			wave : '<path d="$1" class="$2" stroke="$3" stroke-width="$4" opacity="$5" stroke-dasharray="$6" style="display:$7;" fill="none"></path>',
			mark : '<marker id="$1" markerHeight="3" markerWidth="3" orient="auto" refX="1.5" refY="1.5"><use xlink:href="#arrow-classic" transform="rotate(180 1.5 1.5) scale(0.6,0.6)" stroke-width="1.6667" fill="$2" stroke="none"></use></marker>'
		}) : (
			$.Support.graphic.cav ? function(wnd, doc, cnv, can){
				var count = 0, stage = [], proxy = {}, cache = {}, scope = {x : 0, y : 0, w : 0, h : 0}, basic = doc.createElement('canvas'), mount = function(sire){
					return function(gene){
						return function(owner){
							sire.apply(this, arguments);
							gene.apply(this, arguments);
							/**
							 * 绘制图形
							 */
							if((owner.scene = alloc()) && (owner.cav2d = owner.scene.canvas.getContext('2d')) && (owner.mir2d = owner.scene.mirror.getContext('2d')))
								try{
									(owner.scene.shapes[owner.ident = _stamp.call(count, '#')] = this).paint(true);
								}catch(e){owner.error = e}
						};
					};
				}(function(owner, param){
					/**
					 * 标题
					 * @type {String}
					 */
					this.title = param.title;
					/**
					 * 透明
					 * @type {Number}
					 */
					this.alpha = param.alpha;
					/**
					 * 可见
					 * @type {Boolean}
					 */
					this.matte = param.matte;
					/**
					 * 鼠标样式
					 */
					this.mouse = param.mouse;
					/**
					 * 置前图形
					 */
					this.front = function(){
						if((owner || 0).alive && delete owner.scene.shapes[owner.ident])
							try{
								this.paint();
							}catch(e){
								(owner.scene.shapes[owner.ident] = this).paint();
							}finally{
								if(!owner.scene.shapes[owner.ident] && (owner.scene = stage[stage.length - 1]) && (owner.cav2d = owner.scene.canvas.getContext('2d')) && (owner.mir2d = owner.scene.mirror.getContext('2d')))
									(owner.scene.shapes[owner.ident] = this).paint();
							}
					};
					/**
					 * 擦除图形
					 */
					this.erase = function(){
						if((owner || 0).alive && delete owner.scene.shapes[owner.ident])
							try{
								this.paint();
							}catch(e){
								(owner.scene.shapes[owner.ident] = this).paint();
							}finally{
								if(!owner.scene.shapes[owner.ident]){
									// 销毁事件
									$.Array.each(_event, function(chain){
										if((proxy[chain] || 0)[owner.ident])
											delete proxy[chain][owner.ident];
									});
									// 销毁缓存
									param = $.Array.each(owner, function(_, key){
										delete owner[key];
									});
									// 销毁实例
									owner = $.Array.each(this, function(_, fun){
										delete this[fun];
									}, this);
								}
							}
					};
					/**
					 * 注册事件
					 */
					this.regist = function(evt, fun){
						if((owner || 0).alive && $.Match.isFunction(fun) && (evt = proxy[$.Parse.toTxt(evt)]))
							$.Array.push((evt[owner.ident] || (evt[owner.ident] = [])), fun);
					};
					/**
					 * 销毁事件
					 */
					this.reject = function(evt, fun){
						if((owner || 0).alive && $.Match.isFunction(fun) && (evt = (proxy[$.Parse.toTxt(evt)] || 0)[owner.ident]))
							$.Array.remove(evt, fun);
					};
				}), alloc = function(){
					return count++ % 1000 > 0 ? stage[stage.length - 1] : function(dimen, scene){
						scene.canvas.style.position = (scene.mirror.style.position = 'absolute');
						scene.canvas.height = (scene.mirror.height = $.Parse.toInt(dimen.h));
						scene.canvas.width = (scene.mirror.width = $.Parse.toInt(dimen.w));
						return stage[$.Array.push(stage, scene) - 1];
					}($.Util.getElemSize(cnv), {
						shapes : {},
						mirror : basic.cloneNode(false),
						canvas : cnv.appendChild(basic.cloneNode(false))
					});
				}, cross = function(){
					for(var i = stage.length - 1, m = $.Util.getMouse.call(wnd, this), p = $.Util.getPosition(cnv), x = Math.round(m.x - p.x), y = Math.round(m.y - p.y); i >= 0; i--){
						if(((p = (m = stage[i]).mirror.getContext('2d').getImageData(x, y, 1, 1).data) || 0)[3] === 255)
							return {ident : (p = '#' + _arith.rgb2hex(p[0], p[1], p[2])), shape : m.shapes[p]};
					}
				}, skill = {
					styleTo : {
						line : function(plan){
							return function(type, x1, y1, x2, y2, thin){
								switch(type){
									case 'SOLID':
										this.lineTo(x2, y2);
										break;
									case 'DOT':
										plan.call(this, x1, y1, x2, y2, [thin, thin * 3]);
										break;
									case 'DASH':
										plan.call(this, x1, y1, x2, y2, [thin * 4, thin * 3]);
										break;
									case 'DASHDOT':
										plan.call(this, x1, y1, x2, y2, [thin * 4, thin * 3, thin, thin * 3]);
										break;
								}
							};
						}(function(x1, y1, x2, y2, da){
							var dl = da.length, dx = x2 - x1, dy = y2 - y1, de = dx > dy, t, i = 0, l = 0, r = Math.sqrt(dx * dx + dy * dy), s = $.Array.max([
								$.Array.min([de ? dy / dx : dx / dy, 9999]), -9999
							]);
							while((r -= l) >= 0.1){
								t = Math.sqrt((l = ((l = da[i++ % dl]) === 0 ? 0.001 : l) > r ? r : l) * l / (1 + s * s));
								if(de){
									x1 += dx < 0 && dy < 0 ? t * -1 : t;
									y1 += dx < 0 && dy < 0 ? s * t * -1 : s * t;
								}else{
									x1 += dx < 0 && dy < 0 ? s * t * -1 : s * t;
									y1 += dx < 0 && dy < 0 ? t * -1 : t;
								}
								this[i % 2 ? 'lineTo' : 'moveTo'](x1, y1);
							}
							this.moveTo(x2, y2);
						}),
						oval : function(plan) {
							return function(type, cx, cy, rx, ry, thin){
								switch(type){
									case 'SOLID':
										this.arc(cx, cy, rx, 0, 2 * Math.PI, false);
										break;
									case 'DOT':
										plan.call(this, cx, cy, rx, ry, [thin, thin * 3]);
										break;
									case 'DASH':
										plan.call(this, cx, cy, rx, ry, [thin * 4, thin * 3]);
										break;
									case 'DASHDOT':
										plan.call(this, cx, cy, rx, ry, [thin * 4, thin * 3, thin, thin * 3]);
										break;
								}
							};
						}(function(cx, cy, rx, ry, da){
							for(var s = 1 / Math.floor(Math.PI * (1.5 * (rx + ry) - Math.sqrt(rx * ry))), x = rx * rx, y = ry * ry, p = x + y, m = x - y, d = da.length, i = 0, l = 0, t = 0, a = 0; t <= Math.PI; t += s){
								if((l += Math.sqrt(p - m * Math.cos(2 * t)) * s * 0.707) >= da[i]){
									if(i % 2 === 0){
										this.moveTo((l = _arith.pos4arc(cx, cy, rx, rx, a, 0))[0], l[1]);
										this.arc(cx, cy, rx, a, t, false);
										this.moveTo((l = _arith.pos4arc(cx, cy, rx, rx, a + Math.PI, 0))[0], l[1]);
										this.arc(cx, cy, rx, a + Math.PI, t + Math.PI, false);
									}
									a = t;
									l = 0;
									i = (i + 1) % d;
								}
							}
						}),
						arch : function(plan){
							return function(type, cx, cy, rx, ry, sa, ea, thin){
								if(_regex.solid.test(type)){
									this.arc(cx, cy, rx, sa, ea, false);
									this.lineTo(cx, cy);
									this.closePath();
								}else{
									var sp = _arith.pos4arc(cx, cy, rx, rx, sa, 0), ep = _arith.pos4arc(cx, cy, rx, rx, ea, 0);
									switch(type){
										case 'DOT':
											plan.call(this, cx, cy, rx, ry, sa, ea, [thin, thin * 3]);
											this.moveTo(ep[0], ep[1]);
											skill.styleTo.line.call(this, type, ep[0], ep[1], 0, 0, thin);
											this.moveTo(0, 0);
											skill.styleTo.line.call(this, type, 0, 0, sp[0], sp[1], thin);
											break;
										case 'DASH':
											plan.call(this, cx, cy, rx, ry, sa, ea, [thin * 4, thin * 3]);
											this.moveTo(ep[0], ep[1]);
											skill.styleTo.line.call(this, type, ep[0], ep[1], 0, 0, thin);
											this.moveTo(0, 0);
											skill.styleTo.line.call(this, type, 0, 0, sp[0], sp[1], thin);
											break;
										case 'DASHDOT':
											plan.call(this, cx, cy, rx, ry, sa, ea, [thin * 4, thin * 3, thin, thin * 3]);
											this.moveTo(ep[0], ep[1]);
											skill.styleTo.line.call(this, type, ep[0], ep[1], 0, 0, thin);
											this.moveTo(0, 0);
											skill.styleTo.line.call(this, type, 0, 0, sp[0], sp[1], thin);
											break;
									}
								}
							};
						}(function(cx, cy, rx, ry, sa, ea, da){
							for(var s = 1 / Math.floor(Math.PI * (1.5 * (rx + ry) - Math.sqrt(rx * ry))), x = rx * rx, y = ry * ry, p = x + y, m = x - y, d = da.length, i = 0, l = 0, t = sa, a = sa; t <= ea; t += s){
								if((l += Math.sqrt(p - m * Math.cos(2 * t)) * s * 0.707) >= da[i]){
									if(i % 2 === 0){
										this.moveTo((l = _arith.pos4arc(cx, cy, rx, rx, a, 0))[0], l[1]);
										this.arc(cx, cy, rx, a, t, false);
									}
									a = t;
									l = 0;
									i = (i + 1) % d;
								}
							}
						}),
						wave : function(plan){
							return function(type, ctrl, thin){
								if(_regex.solid.test(type)){
									switch(ctrl.length){
										case 8 :
											this.bezierCurveTo(ctrl[2], ctrl[3], ctrl[4], ctrl[5], ctrl[6], ctrl[7]);
											break;
										case 6 :
											this.quadraticCurveTo(ctrl[2], ctrl[3], ctrl[4], ctrl[5]);
											break;
									}
								}else{
									switch(type){
										case 'DOT':
											plan.call(this, ctrl, [thin, thin * 3]);
											break;
										case 'DASH':
											plan.call(this, ctrl, [thin * 4, thin * 3]);
											break;
										case 'DASHDOT':
											plan.call(this, ctrl, [thin * 4, thin * 3, thin, thin * 3]);
											break;
									}
								}
							};
						}(function(xy, da){
							for(var x1, y1, x2, y2, x3, y3, x4, y4, q = (xy.length === 8), s = 1 / (_arith.pos2len(x1 = xy[0], y1 = xy[1], x2 = xy[2], y2 = xy[3]) + _arith.pos2len(x2, y2, x3 = xy[4], y3 = xy[5]) + (q ? _arith.pos2len(x3, y3, x4 = xy[6], y4 = xy[7]) : 0)), p = [x1, y1], d = da.length, i = 0, l = 0, t = 0, c; t <= 1; t += s){
								c = (q ? _arith.pos4crv(x1, y1, x2, y2, x3, y3, x4, y4, t) : _arith.pos4crv(x1, y1, x2, y2, x3, y3, t));
								if((l += _arith.pos2len(p[0], p[1], c[0], c[1])) >= da[i]){
									if(i % 2 === (l = 0)){
										this.lineTo(c[0], c[1]);
									}
									i = (i + 1) % d;
									this.moveTo(c[0], c[1]);
								}
								if(i % 2 === 0){
									this.lineTo(c[0], c[1]);
								}
								p = c;
							}
						})
					},
					arrowTo : function(x, y, r, t){
						this.save();
						this.beginPath();
						this.translate(x, y);
						this.moveTo(0, 0);
						this.rotate(r);
						this.lineTo(-2 - t, -1 - 0.5 * t);
						this.lineTo(-1.4 - 0.7 * t, 0);
						this.lineTo(-2 - t, 1 + 0.5 * t);
						this.closePath();
						this.restore();
					}
				};
				/**
				 * 修正舞台
				 */
				this.refix = function(dimen){
					if(dimen = (dimen || $.Util.getElemSize(cnv)))
						$.Array.each(stage, function(scene){
							scene.canvas.width = (scene.mirror.width = (scope.w = $.Parse.toInt(dimen.w) || 0));
							scene.canvas.height = (scene.mirror.height = (scope.h = $.Parse.toInt(dimen.h) || 0));
						});
				};
				/**
				 * 修正视野
				 */
				this.slice = function(limit){
					scope.x = $.Parse.toInt(limit.x) || 0;
					scope.y = $.Parse.toInt(limit.y) || 0;
					// 重绘图形
					this.renew();
				};
				/**
				 * 预处理
				 */
				this.ready = function(){
					// 事件绑定
					if(!can){
						try{
							can = !$.Array.each(_event, function(done){
								return function(name, task){
									task > 2 ? $.Util.addEvent({
										obj : cnv,
										evt : name,
										fun : function(chan){
											switch(name){
												case 'touchstart':
												case 'mousedown':
													return function(e, o){
														done.call(e, (cache.click = true) && chan);
													};
												case 'touchmove':
												case 'mousemove':
													return function(e, o){
														if(((o = cross.call(e)) || 0).shape){
															cnv.title = o.shape.title || '';
															{
																$.Util.setMouse(cnv, o.shape.mouse);
															}
															try{
																$.Array.each(chan[o.ident], function(func){
																	func.call(this, e, this);
																}, o.shape);
															}catch(e){}finally{
																if(cache.shape !== o.shape && cache.ident !== o.ident)
																	try{
																		done.call(e);
																	}catch(e){}finally{
																		if((cache.ident = o.ident) && (cache.shape = o.shape))
																			done.call(e, proxy['mouseover']);
																	}
															}
														}else{
															$.Util.setMouse(cnv, cnv.title = '');
															try{
																done.call(e);
															}catch(e){}finally{
																cache.ident = (cache.shape = null);
																cache.click = (cache.again = false);
															}
														}
													};
												case 'touchend':
												case 'mouseup':
													return function(e, o){
														try{
															done.call(e, chan);
														}catch(e){}finally{
															if(cache.click && ($.Util.getKey(e) === 1))
																try{
																	done.call(e, proxy['click']);
																}catch(e){}finally{
																	try{
																		if(cache.again)
																			done.call(e, proxy['dblclick']);
																	}catch(e){}finally{
																		if(!$.Support.touch && (cache.again = true))
																			$.Thread.delay.call(wnd, function(){
																				cache.again = false;
																			}, 300);
																	}
																}
														}
														cache.click = false;
													};
												case 'mouseout':
													return function(e){
														try{
															done.call(e, chan);
														}catch(e){}finally{
															cache.ident = (cache.shape = null);
															cache.click = (cache.again = false);
														}
													};
												case 'contextmenu':
													return function(e){
														try{
															done.call(e, chan);
														}catch(e){}finally{
															cache.click = (cache.again = false);
														}
													};
											}
										}(proxy[name] = {})
									}, true) : proxy[name] = {};
								};
							}(function(){
								if(cache.ident && cache.shape)
									$.Array.each((arguments[0] || proxy['mouseout'])[cache.ident], function(func){
										func.call(cache.shape, this, cache.shape);
									}, this);
							}));
						}catch(e){
							can = false;
						}
					}
					return can;
				};
				/**
				 * 刷新舞台
				 */
				this.renew = function(){
					var shapes = [];
					try{
						$.Array.each(stage, function(scene){
							$.Array.each(scene.shapes, function(shape){
								return $.Array.push(shapes, shape) && false;
							});
						});
					}catch(e){}finally{
						while(shapes.length){
							$.Array.pop(shapes).paint();
						}
					}
				};
				/**
				 * 清空舞台
				 */
				this.clear = function(){
					var shapes = [];
					try{
						$.Array.each(stage, function(scene){
							$.Array.each(scene.shapes, function(shape, ident){
								if(delete scene.shapes[ident])
									$.Array.push(shapes, shape);
							});
						});
					}catch(e){}finally{
						while(shapes.length){
							$.Array.pop(shapes).erase();
						}
					}
				};
				/**
				 * 创建图形
				 */
				this.build = {
					/**
					 * 创建线条
					 */
					'LINE' : mount(function(owner, param){
						/**
						 * 路径
						 * @type {Array}
						 */
						this.route = param.route;
						/**
						 * 粗细
						 * @type {Number}
						 */
						this.thick = param.thick;
						/**
						 * 颜色
						 * @type {String}
						 */
						this.color = param.color;
						/**
						 * 箭头
						 * @type {true|false}
						 */
						this.arrow = param.arrow;
						/**
						 * 线型
						 * @type {DOT|DASH|SOLID|DASHDOT}
						 */
						this.style = param.style;
						/**
						 * 重绘图形
						 */
						this.paint = function(run){
							if((owner || 0).alive && owner.ident && owner.cav2d && owner.mir2d){
								if($.Match.isDefined(run)){
									if(run === true && (run = (this.route || 0).length) > 3 && _amend.call(this) && !this.matte){
										// 绘制图形
										owner.cav2d.save();
										owner.mir2d.save();
										owner.cav2d.beginPath();
										owner.mir2d.beginPath();
										owner.cav2d.translate(scope.x, scope.y);
										owner.mir2d.translate(scope.x, scope.y);
										owner.cav2d.moveTo(this.route[0], this.route[1]);
										owner.mir2d.moveTo(this.route[0], this.route[1]);
										for(var i = 2; i < run; i += 2){
											skill.styleTo.line.call(owner.cav2d, this.style, this.route[i - 2], this.route[i - 1], this.route[i], this.route[i + 1], this.thick);
											skill.styleTo.line.call(owner.mir2d, this.style, this.route[i - 2], this.route[i - 1], this.route[i], this.route[i + 1], this.thick);
										}
										// 图形样式
										owner.cav2d.save();
										owner.mir2d.save();
										owner.mir2d.lineWidth = (owner.cav2d.lineWidth = this.thick);
										owner.cav2d.globalAlpha = this.alpha / 100;
										owner.cav2d.strokeStyle = this.color;
										owner.mir2d.strokeStyle = owner.ident;
										owner.cav2d.stroke();
										owner.mir2d.stroke();
										owner.cav2d.restore();
										owner.mir2d.restore();
										// 绘制箭头
										if(this.arrow && (run = $.Array.slice(this.route, -4))){
											skill.arrowTo.call(owner.cav2d, run[2], run[3], Math.atan2(run[3] - run[1], run[2] - run[0]), this.thick);
											skill.arrowTo.call(owner.mir2d, run[2], run[3], Math.atan2(run[3] - run[1], run[2] - run[0]), this.thick);
											// 箭头样式
											owner.cav2d.save();
											owner.mir2d.save();
											owner.mir2d.lineWidth = (owner.cav2d.lineWidth = this.thick);
											owner.cav2d.globalAlpha = this.alpha / 100;
											owner.cav2d.strokeStyle = this.color;
											owner.cav2d.fillStyle = this.color;
											owner.mir2d.strokeStyle = owner.ident;
											owner.mir2d.fillStyle = owner.ident;
											owner.cav2d.stroke();
											owner.mir2d.stroke();
											owner.cav2d.fill();
											owner.mir2d.fill();
											owner.cav2d.restore();
											owner.mir2d.restore();
										}
										owner.cav2d.restore();
										owner.mir2d.restore();
									}
								}else{
									$.Array.each(owner.cav2d.clearRect(0, 0, owner.scene.canvas.width, owner.scene.canvas.height) || owner.mir2d.clearRect(0, 0, owner.scene.mirror.width, owner.scene.mirror.height) || owner.scene.shapes, function(shape){
										shape.paint(true);
									});
								}
							}
						};
					}),
					'RECT' : mount(function(owner, param){
						/**
						 * 中点
						 * @type {x,y}
						 */
						this.point = param.point;
						/**
						 * 辐射
						 * @type {x,y}
						 */
						this.extra = param.extra;
						/**
						 * 粗细
						 * @type {Number}
						 */
						this.thick = param.thick;
						/**
						 * 颜色
						 * @type {String}
						 */
						this.color = param.color;
						/**
						 * 填充
						 * @type {String}
						 */
						this.stuff = param.stuff;
						/**
						 * 斜率
						 * @type {Number}
						 */
						this.slope = param.slope;
						/**
						 * 线型
						 * @type {DOT|DASH|SOLID|DASHDOT}
						 */
						this.style = param.style;
						/**
						 * 重绘图形
						 */
						this.paint = function(run){
							if((owner || 0).alive && owner.ident && owner.cav2d && owner.mir2d){
								if($.Match.isDefined(run)){
									if(run === true && _amend.call(this) && !this.matte && this.point && this.extra){
										run = [-this.slope * Math.PI / 180, -this.extra.x, -this.extra.y, -this.extra.x, this.extra.y, this.extra.x, this.extra.y, this.extra.x, -this.extra.y, -this.extra.x, -this.extra.y];
										try{
											// 绘制图形
											owner.cav2d.save();
											owner.mir2d.save();
											owner.cav2d.beginPath();
											owner.mir2d.beginPath();
											owner.cav2d.translate(this.point.x + scope.x, this.point.y + scope.y);
											owner.mir2d.translate(this.point.x + scope.x, this.point.y + scope.y);
											owner.cav2d.rotate(run[0]);
											owner.mir2d.rotate(run[0]);
											owner.cav2d.moveTo(run[1], run[2]);
											owner.mir2d.moveTo(run[1], run[2]);
											for(var i = 3; i < 11; i += 2){
												skill.styleTo.line.call(owner.cav2d, this.style, run[i - 2], run[i - 1], run[i], run[i + 1], this.thick);
												skill.styleTo.line.call(owner.mir2d, this.style, run[i - 2], run[i - 1], run[i], run[i + 1], this.thick);
											}
											owner.cav2d.restore();
											owner.mir2d.restore();
											// 图形样式
											owner.cav2d.save();
											owner.mir2d.save();
											owner.mir2d.lineWidth = (owner.cav2d.lineWidth = this.thick);
											owner.cav2d.globalAlpha = this.alpha / 100;
											owner.cav2d.strokeStyle = this.color;
											owner.mir2d.strokeStyle = owner.ident;
											owner.cav2d.stroke();
											owner.mir2d.stroke();
											owner.cav2d.restore();
											owner.mir2d.restore();
											if(this.stuff){
												if(!_regex.solid.test(this.style)){
													owner.cav2d.save();
													owner.mir2d.save();
													owner.cav2d.beginPath();
													owner.mir2d.beginPath();
													owner.cav2d.translate(this.point.x + scope.x, this.point.y + scope.y);
													owner.mir2d.translate(this.point.x + scope.x, this.point.y + scope.y);
													owner.cav2d.rotate(run[0]);
													owner.mir2d.rotate(run[0]);
													owner.cav2d.moveTo(run[1], run[2]);
													owner.mir2d.moveTo(run[1], run[2]);
													for(var i = 3; i < 11; i += 2){
														owner.cav2d.lineTo(run[i], run[i + 1]);
														owner.mir2d.lineTo(run[i], run[i + 1]);
													}
													owner.cav2d.restore();
													owner.mir2d.restore();
												}
												owner.cav2d.save();
												owner.mir2d.save();
												owner.cav2d.globalAlpha = this.alpha / 100;
												owner.cav2d.fillStyle = this.stuff;
												owner.mir2d.fillStyle = owner.ident;
												owner.cav2d.fill();
												owner.mir2d.fill();
												owner.cav2d.restore();
												owner.mir2d.restore();
											}
										}catch(e){}finally{
											$.Array.clear(run);
										}
									}
								}else{
									$.Array.each(owner.cav2d.clearRect(0, 0, owner.scene.canvas.width, owner.scene.canvas.height) || owner.mir2d.clearRect(0, 0, owner.scene.mirror.width, owner.scene.mirror.height) || owner.scene.shapes, function(shape){
										shape.paint(true);
									});
								}
							}
						};
					}),
					'POLY' : mount(function(owner, param){
						/**
						 * 路径
						 * @type {Array}
						 */
						this.route = param.route;
						/**
						 * 粗细
						 * @type {Number}
						 */
						this.thick = param.thick;
						/**
						 * 颜色
						 * @type {String}
						 */
						this.color = param.color;
						/**
						 * 填充
						 * @type {String}
						 */
						this.stuff = param.stuff;
						/**
						 * 线型
						 * @type {DOT|DASH|SOLID|DASHDOT}
						 */
						this.style = param.style;
						/**
						 * 重绘图形
						 */
						this.paint = function(run){
							if((owner || 0).alive && owner.ident && owner.cav2d && owner.mir2d){
								if($.Match.isDefined(run)){
									if(run === true && (run = (this.route || 0).length) > 3 && _amend.call(this) && !this.matte){
										// 绘制图形
										owner.cav2d.save();
										owner.mir2d.save();
										owner.cav2d.beginPath();
										owner.mir2d.beginPath();
										owner.cav2d.translate(scope.x, scope.y);
										owner.mir2d.translate(scope.x, scope.y);
										owner.cav2d.moveTo(this.route[0], this.route[1]);
										owner.mir2d.moveTo(this.route[0], this.route[1]);
										for(var i = 0; i < run; i += 2){
											skill.styleTo.line.call(owner.cav2d, this.style, this.route[i], this.route[i + 1], this.route[i + 2] || this.route[0], this.route[i + 3] || this.route[1], this.thick);
											skill.styleTo.line.call(owner.mir2d, this.style, this.route[i], this.route[i + 1], this.route[i + 2] || this.route[0], this.route[i + 3] || this.route[1], this.thick);
										}
										owner.cav2d.restore();
										owner.mir2d.restore();
										// 图形样式
										owner.cav2d.save();
										owner.mir2d.save();
										owner.mir2d.lineWidth = (owner.cav2d.lineWidth = this.thick);
										owner.cav2d.globalAlpha = this.alpha / 100;
										owner.cav2d.strokeStyle = this.color;
										owner.mir2d.strokeStyle = owner.ident;
										owner.cav2d.stroke();
										owner.mir2d.stroke();
										owner.cav2d.restore();
										owner.mir2d.restore();
										if(this.stuff){
											if(!_regex.solid.test(this.style)){
												owner.cav2d.save();
												owner.mir2d.save();
												owner.cav2d.beginPath();
												owner.mir2d.beginPath();
												owner.cav2d.translate(scope.x, scope.y);
												owner.mir2d.translate(scope.x, scope.y);
												owner.cav2d.moveTo(this.route[0], this.route[1]);
												owner.mir2d.moveTo(this.route[0], this.route[1]);
												for(var i = 2; i < run; i += 2){
													owner.cav2d.lineTo(this.route[i], this.route[i + 1]);
													owner.mir2d.lineTo(this.route[i], this.route[i + 1]);
												}
												owner.cav2d.closePath();
												owner.mir2d.closePath();
												owner.cav2d.restore();
												owner.mir2d.restore();
											}
											owner.cav2d.save();
											owner.mir2d.save();
											owner.cav2d.globalAlpha = this.alpha / 100;
											owner.cav2d.fillStyle = this.stuff;
											owner.mir2d.fillStyle = owner.ident;
											owner.cav2d.fill();
											owner.mir2d.fill();
											owner.cav2d.restore();
											owner.mir2d.restore();
										}
									}
								}else{
									$.Array.each(owner.cav2d.clearRect(0, 0, owner.scene.canvas.width, owner.scene.canvas.height) || owner.mir2d.clearRect(0, 0, owner.scene.mirror.width, owner.scene.mirror.height) || owner.scene.shapes, function(shape){
										shape.paint(true);
									});
								}
							}
						};
					}),
					'OVAL' : mount(function(owner, param){
						/**
						 * 中点
						 * @type {x,y}
						 */
						this.point = param.point;
						/**
						 * 辐射
						 * @type {x,y}
						 */
						this.extra = param.extra;
						/**
						 * 粗细
						 * @type {Number}
						 */
						this.thick = param.thick;
						/**
						 * 颜色
						 * @type {String}
						 */
						this.color = param.color;
						/**
						 * 填充
						 * @type {String}
						 */
						this.stuff = param.stuff;
						/**
						 * 斜率
						 * @type {Number}
						 */
						this.slope = param.slope;
						/**
						 * 线型
						 * @type {DOT|DASH|SOLID|DASHDOT}
						 */
						this.style = param.style;
						/**
						 * 重绘图形
						 */
						this.paint = function(run){
							if((owner || 0).alive && owner.ident && owner.cav2d && owner.mir2d){
								if($.Match.isDefined(run)){
									if(run === true && _amend.call(this) && !this.matte && this.point && this.extra){
										run = [this.point.x + scope.x, this.point.y + scope.y, this.extra.x, this.extra.y, -this.slope * Math.PI / 180];
										try{
											// 绘制图形
											owner.cav2d.save();
											owner.mir2d.save();
											owner.cav2d.beginPath();
											owner.mir2d.beginPath();
											owner.cav2d.translate(run[0], run[1]);
											owner.mir2d.translate(run[0], run[1]);
											owner.cav2d.rotate(run[4]);
											owner.mir2d.rotate(run[4]);
											owner.cav2d.scale(1, run[3] / run[2]);
											owner.mir2d.scale(1, run[3] / run[2]);
											skill.styleTo.oval.call(owner.cav2d, this.style, 0, 0, run[2], run[3], this.thick);
											skill.styleTo.oval.call(owner.mir2d, this.style, 0, 0, run[2], run[3], this.thick);
											owner.cav2d.restore();
											owner.mir2d.restore();
											// 图形样式
											owner.cav2d.save();
											owner.mir2d.save();
											owner.mir2d.lineWidth = (owner.cav2d.lineWidth = this.thick);
											owner.cav2d.globalAlpha = this.alpha / 100;
											owner.cav2d.strokeStyle = this.color;
											owner.mir2d.strokeStyle = owner.ident;
											owner.cav2d.stroke();
											owner.mir2d.stroke();
											owner.cav2d.restore();
											owner.mir2d.restore();
											if(this.stuff){
												if(!_regex.solid.test(this.style)){
													owner.cav2d.save();
													owner.mir2d.save();
													owner.cav2d.beginPath();
													owner.mir2d.beginPath();
													owner.cav2d.translate(run[0], run[1]);
													owner.mir2d.translate(run[0], run[1]);
													owner.cav2d.rotate(run[4]);
													owner.mir2d.rotate(run[4]);
													owner.cav2d.scale(1, run[3] / run[2]);
													owner.mir2d.scale(1, run[3] / run[2]);
													owner.cav2d.arc(0, 0, run[2], 0, 2 * Math.PI, true);
													owner.mir2d.arc(0, 0, run[2], 0, 2 * Math.PI, true);
													owner.cav2d.restore();
													owner.mir2d.restore();
												}
												owner.cav2d.save();
												owner.mir2d.save();
												owner.cav2d.globalAlpha = this.alpha / 100;
												owner.cav2d.fillStyle = this.stuff;
												owner.mir2d.fillStyle = owner.ident;
												owner.cav2d.fill();
												owner.mir2d.fill();
												owner.cav2d.restore();
												owner.mir2d.restore();
											}
										}catch(e){}finally{
											$.Array.clear(run);
										}
									}
								}else{
									$.Array.each(owner.cav2d.clearRect(0, 0, owner.scene.canvas.width, owner.scene.canvas.height) || owner.mir2d.clearRect(0, 0, owner.scene.mirror.width, owner.scene.mirror.height) || owner.scene.shapes, function(shape){
										shape.paint(true);
									});
								}
							}
						};
					}),
					'ARCH' : mount(function(owner, param){
						/**
						 * 角度
						 * @type {f,t}
						 */
						this.angle = param.angle;
						/**
						 * 中点
						 * @type {x,y}
						 */
						this.point = param.point;
						/**
						 * 辐射
						 * @type {x,y}
						 */
						this.extra = param.extra;
						/**
						 * 粗细
						 * @type {Number}
						 */
						this.thick = param.thick;
						/**
						 * 颜色
						 * @type {String}
						 */
						this.color = param.color;
						/**
						 * 填充
						 * @type {String}
						 */
						this.stuff = param.stuff;
						/**
						 * 斜率
						 * @type {Number}
						 */
						this.slope = param.slope;
						/**
						 * 线型
						 * @type {DOT|DASH|SOLID|DASHDOT}
						 */
						this.style = param.style;
						/**
						 * 重绘图形
						 */
						this.paint = function(run){
							if((owner || 0).alive && owner.ident && owner.cav2d && owner.mir2d){
								if($.Match.isDefined(run)){
									if(run === true && _amend.call(this) && !this.matte && this.point && this.extra && this.angle){
										run = [this.point.x + scope.x, this.point.y + scope.y, this.extra.x, this.extra.y, -this.slope * Math.PI / 180, -_arith.ang2ecc(this.angle.f, this.extra.x, this.extra.y), -_arith.ang2ecc(this.angle.t, this.extra.x, this.extra.y)];
										try{
											// 绘制图形
											owner.cav2d.save();
											owner.mir2d.save();
											owner.cav2d.beginPath();
											owner.mir2d.beginPath();
											owner.cav2d.translate(run[0], run[1]);
											owner.mir2d.translate(run[0], run[1]);
											owner.cav2d.rotate(run[4]);
											owner.mir2d.rotate(run[4]);
											owner.cav2d.scale(1, run[3] / run[2]);
											owner.mir2d.scale(1, run[3] / run[2]);
											skill.styleTo.arch.call(owner.cav2d, this.style, 0, 0, run[2], run[3], run[6], run[5], this.thick);
											skill.styleTo.arch.call(owner.mir2d, this.style, 0, 0, run[2], run[3], run[6], run[5], this.thick);
											owner.cav2d.restore();
											owner.mir2d.restore();
											// 图形样式
											owner.cav2d.save();
											owner.mir2d.save();
											owner.mir2d.lineWidth = (owner.cav2d.lineWidth = this.thick);
											owner.cav2d.globalAlpha = this.alpha / 100;
											owner.cav2d.strokeStyle = this.color;
											owner.mir2d.strokeStyle = owner.ident;
											owner.cav2d.stroke();
											owner.mir2d.stroke();
											owner.cav2d.restore();
											owner.mir2d.restore();
											if(this.stuff){
												if(!_regex.solid.test(this.style)){
													owner.cav2d.save();
													owner.mir2d.save();
													owner.cav2d.beginPath();
													owner.mir2d.beginPath();
													owner.cav2d.translate(run[0], run[1]);
													owner.mir2d.translate(run[0], run[1]);
													owner.cav2d.rotate(run[4]);
													owner.mir2d.rotate(run[4]);
													owner.cav2d.scale(1, run[3] / run[2]);
													owner.mir2d.scale(1, run[3] / run[2]);
													owner.cav2d.arc(0, 0, run[2], run[5], run[6], true);
													owner.mir2d.arc(0, 0, run[2], run[5], run[6], true);
													owner.cav2d.lineTo(0, 0);
													owner.mir2d.lineTo(0, 0);
													owner.cav2d.closePath();
													owner.mir2d.closePath();
													owner.cav2d.restore();
													owner.mir2d.restore();
												}
												owner.cav2d.save();
												owner.mir2d.save();
												owner.cav2d.globalAlpha = this.alpha / 100;
												owner.cav2d.fillStyle = this.stuff;
												owner.mir2d.fillStyle = owner.ident;
												owner.cav2d.fill();
												owner.mir2d.fill();
												owner.cav2d.restore();
												owner.mir2d.restore();
											}
										}catch(e){}finally{
											$.Array.clear(run);
										}
									}
								}else{
									$.Array.each(owner.cav2d.clearRect(0, 0, owner.scene.canvas.width, owner.scene.canvas.height) || owner.mir2d.clearRect(0, 0, owner.scene.mirror.width, owner.scene.mirror.height) || owner.scene.shapes, function(shape){
										shape.paint(true);
									});
								}
							}
						};
					}),
					'WAVE' : mount(function(owner, param){
						/**
						 * 路径
						 * @type {Array}
						 */
						this.route = param.route;
						/**
						 * 粗细
						 * @type {Number}
						 */
						this.thick = param.thick;
						/**
						 * 颜色
						 * @type {String}
						 */
						this.color = param.color;
						/**
						 * 箭头
						 * @type {true|false}
						 */
						this.arrow = param.arrow;
						/**
						 * 线型
						 * @type {DOT|DASH|SOLID|DASHDOT}
						 */
						this.style = param.style;
						/**
						 * 重绘图形
						 */
						this.paint = function(run){
							if((owner || 0).alive && owner.ident && owner.cav2d && owner.mir2d){
								if($.Match.isDefined(run)){
									if(run === true && (run = (this.route || 0).length) > 5 && _amend.call(this) && !this.matte){
										// 绘制图形
										owner.cav2d.save();
										owner.mir2d.save();
										owner.cav2d.beginPath();
										owner.mir2d.beginPath();
										owner.cav2d.translate(scope.x, scope.y);
										owner.mir2d.translate(scope.x, scope.y);
										owner.cav2d.moveTo(this.route[0], this.route[1]);
										owner.mir2d.moveTo(this.route[0], this.route[1]);
										skill.styleTo.wave.call(owner.cav2d, this.style, this.route, this.thick);
										skill.styleTo.wave.call(owner.mir2d, this.style, this.route, this.thick);
										// 图形样式
										owner.cav2d.save();
										owner.mir2d.save();
										owner.mir2d.lineWidth = (owner.cav2d.lineWidth = this.thick);
										owner.cav2d.globalAlpha = this.alpha / 100;
										owner.cav2d.strokeStyle = this.color;
										owner.mir2d.strokeStyle = owner.ident;
										owner.cav2d.stroke();
										owner.mir2d.stroke();
										owner.cav2d.restore();
										owner.mir2d.restore();
										// 绘制箭头
										if(this.arrow && (run = $.Array.slice(this.route, -4))){
											skill.arrowTo.call(owner.cav2d, run[2], run[3], Math.atan2(run[3] - run[1], run[2] - run[0]), this.thick);
											skill.arrowTo.call(owner.mir2d, run[2], run[3], Math.atan2(run[3] - run[1], run[2] - run[0]), this.thick);
											// 箭头样式
											owner.cav2d.save();
											owner.mir2d.save();
											owner.mir2d.lineWidth = (owner.cav2d.lineWidth = this.thick);
											owner.cav2d.globalAlpha = this.alpha / 100;
											owner.cav2d.strokeStyle = this.color;
											owner.cav2d.fillStyle = this.color;
											owner.mir2d.strokeStyle = owner.ident;
											owner.mir2d.fillStyle = owner.ident;
											owner.cav2d.stroke();
											owner.mir2d.stroke();
											owner.cav2d.fill();
											owner.mir2d.fill();
											owner.cav2d.restore();
											owner.mir2d.restore();
										}
										owner.cav2d.restore();
										owner.mir2d.restore();
									}
								}else{
									$.Array.each(owner.cav2d.clearRect(0, 0, owner.scene.canvas.width, owner.scene.canvas.height) || owner.mir2d.clearRect(0, 0, owner.scene.mirror.width, owner.scene.mirror.height) || owner.scene.shapes, function(shape){
										shape.paint(true);
									});
								}
							}
						};
					})
				};
			} : (
				$.Support.graphic.vml ? function(parse, model){
					parse.prototype = {
						A : function(p){
							for(var i = 0, l = p.length; i < l; i += 6){
								$.Array.push(this.save, 'AE', Math.round(p[i]), Math.round(p[i + 1]), Math.round(p[i + 2]), Math.round(p[i + 3]), Math.round(p[i + 4]), Math.round(p[i + 5]));
							}
							return this;
						},
						C : function(p){
							for(var i = 0, l = p.length; i < l; i += 6){
								$.Array.push(this.save, 'C', Math.round(p[i]), Math.round(p[i + 1]), Math.round(p[i + 2]), Math.round(p[i + 3]), Math.round(p[i + 4]), Math.round(p[i + 5]));
							}
							return this;
						},
						Q : function(p){
							for(var i = 2, l = p.length; i < l; i += 4){
								$.Array.push(this.save, 'C', Math.round(p[i - 2] / 3 + 2 * p[i] / 3), Math.round(p[i - 1] / 3 + 2 * p[i + 1] / 3), Math.round(p[i + 2] / 3 + 2 * p[i] / 3), Math.round(p[i + 3] / 3 + 2 * p[i + 1] / 3), Math.round(p[i + 2]), Math.round(p[i + 3]));
							}
							return this;
						},
						L : function(p){
							for(var i = 0, l = p.length; i < l; i += 2){
								$.Array.push(this.save, 'L', Math.round(p[i]), Math.round(p[i + 1]));
							}
							return this;
						},
						M : function(p){
							for(var i = 0, l = p.length; i < l; i += 2){
								$.Array.push(this.save, 'M', Math.round(p[i]), Math.round(p[i + 1]));
							}
							return this;
						},
						Z : function(p){
							return $.Array.push(this.save, 'XE') && this;
						},
						P : function(){
							return $.Array.join(this.save, ' ');
						}
					};
					return function(wnd, doc, cnv, can){
						var count = 0, scene, scope = {x : 0, y : 0, w : 0, h : 0}, mount = function(sire){
							return function(gene){
								return function(owner){
									sire.apply(this, arguments);
									gene.apply(this, arguments);
									/**
									 * 绘制图形
									 */
									$.Thread.delay.call(wnd, function(){
										try{
											(scene.shapes[owner.ident = _stamp.call(count++, '_')] = this).paint();
										}catch(e){owner.error = e}finally{
											if(!owner.error){
												this.regist('mouseout', function(){
													$.Util.setMouse(cnv, cnv.title = '');
												});
												this.regist('mouseover', $.Util.bind(this, function(){
													cnv.title = this.title || '';
													{
														$.Util.setMouse(cnv, this.mouse);
													}
												}));
											}
										}
									}, 0, this);
								};
							};
						}(function(owner, param){
							/**
							 * 标题
							 * @type {String}
							 */
							this.title = param.title;
							/**
							 * 透明
							 * @type {Number}
							 */
							this.alpha = param.alpha;
							/**
							 * 可见
							 * @type {Boolean}
							 */
							this.matte = param.matte;
							/**
							 * 鼠标样式
							 */
							this.mouse = param.mouse;
							/**
							 * 置前图形
							 */
							this.front = function(){
								if((owner || 0).alive)
									!owner.vml2d || owner.run2d ? $.Thread.delay.call(wnd, arguments.callee) : scene.appendChild(owner.vml2d);
							};
							/**
							 * 擦除图形
							 */
							this.erase = function(){
								if(!owner.vml2d || owner.run2d){
									$.Thread.delay.call(wnd, arguments.callee, 0, this);
								}else{
									if((owner || 0).alive && scene.removeChild(owner.vml2d))
										if(!delete scene.shapes[owner.ident]){
											scene.appendChild(owner.vml2d);
										}else{
											// 销毁缓存
											param = $.Array.each(owner, function(_, key){
												delete owner[key];
											});
											// 销毁实例
											owner = $.Array.each(this, function(_, fun){
												delete this[fun];
											}, this);
										}
								}
							};
							/**
							 * 注册事件
							 */
							this.regist = function(evt, fun){
								if($.Match.isFunction(fun) && $.Array.index(_event, evt = $.Parse.toTxt(evt)) > -1)
									(function(){
										if((owner || 0).alive)
											!owner.vml2d || owner.run2d ? $.Thread.delay.call(wnd, arguments.callee, 0, this) : (fun[owner.ident] || (fun[owner.ident] = {}))[evt] = $.Util.addEvent({
												evt : evt,
												arg : this,
												obj : owner.vml2d,
												fun : function(e){
													fun.call(this, e, this);
												}
											}, true);
									}).call(this);
							};
							/**
							 * 销毁事件
							 */
							this.reject = function(evt, fun){
								if($.Match.isFunction(fun) && $.Array.index(_event, evt = $.Parse.toTxt(evt)) > -1)
									(function(){
										if((owner || 0).alive)
											!owner.vml2d || owner.run2d ? $.Thread.delay.call(wnd, arguments.callee, 0, this) : $.Thread.delay.call(wnd, function(lsn){
												if(((lsn = fun[owner.ident]) || 0)[evt] && $.Util.delEvent(lsn[evt]))
													delete lsn[evt];
											});
									}).call(this);
							};
						});
						/**
						 * 修正舞台
						 */
						this.refix = function(dimen){
							if((scene || 0).shapes && (dimen = dimen || $.Util.getElemSize(cnv))){
								scope.w = $.Parse.toInt(dimen.w) || 0;
								scope.h = $.Parse.toInt(dimen.h) || 0;
							}
						};
						/**
						 * 修正视野
						 */
						this.slice = function(limit){
							if((scene || 0).style)
								$.Util.setElemSeat(scene, {
									t : scope.y = $.Parse.toInt(limit.y) || 0,
									l : scope.x = $.Parse.toInt(limit.x) || 0
								});
						};
						/**
						 * 预处理
						 */
						this.ready = function(){
							if(!can && doc.namespaces.add('v', 'urn:schemas-microsoft-com:vml')){
								var css = doc.createStyleSheet();
								try{
									can = (((scene = cnv.appendChild(document.createElement(
										'<v:group style="position:absolute;top:0;left:0;width:1px;height:1px;" coordsize="1,1" coordorigin="0 0"><v:/group>'
									))).shapes = {}) && !$.Array.each(['v\\:fill', 'v\\:skew', 'v\\:shape', 'v\\:image', 'v\\:group', 'v\\:stroke', 'v\\:textbox'], function(vml){
										css.addRule(vml, 'position:absolute;behavior:url(#default#VML);display:inline-block;');
									}));
								}catch(e){
									can = false;
								}finally{
									css = null;
								}
							}
							return can;
						};
						/**
						 * 刷新舞台
						 */
						this.renew = function(){
							if((scene || 0).shapes)
								$.Array.each(scene.shapes, function(shape){
									shape.paint();
								});
						};
						/**
						 * 清空舞台
						 */
						this.clear = function(){
							if((scene || 0).shapes)
								$.Array.each(scene.shapes, function(shape){
									shape.erase();
								});
						};
						/**
						 * 创建图形
						 */
						this.build = {
							/**
							 * 创建线条
							 */
							'LINE' : mount(function(owner, param){
								/**
								 * 路径
								 * @type {Array}
								 */
								this.route = param.route;
								/**
								 * 粗细
								 * @type {Number}
								 */
								this.thick = param.thick;
								/**
								 * 颜色
								 * @type {String}
								 */
								this.color = param.color;
								/**
								 * 箭头
								 * @type {true|false}
								 */
								this.arrow = param.arrow;
								/**
								 * 线型
								 * @type {DOT|DASH|SOLID|DASHDOT}
								 */
								this.style = param.style;
								/**
								 * 重绘图形
								 */
								this.paint = function(){
									if((owner || 0).alive)
										if(owner.run2d || !scene || !owner.ident){
											$.Thread.delay.call(wnd, arguments.callee, 0, this);
										}else{
											if(_amend.call(this)){
												var gpath = (this.route || 0).length > 3 ? (new parse()).M($.Array.slice(this.route, 0, 2)).L($.Array.slice(this.route, 2)).P() : _blank;
												if(owner.vml2d && !(owner.vml2d.style.display = (this.matte ? 'none' : ''))){
													owner.vml2d.path = gpath;
													owner.vml2d.write.color = this.color;
													owner.vml2d.write.weight = this.thick;
													owner.vml2d.write.dashstyle = this.style;
													owner.vml2d.write.opacity = this.alpha / 100;
													owner.vml2d.write.endarrow = this.arrow ? 'classic' : 'none';
												}else{
													owner.run2d = !$.Fx.draw.call(wnd, scene, [$.Util.format(model.line, [gpath, owner.ident, this.color, this.thick, this.alpha / 100, this.style, this.arrow ? 'classic' : 'none', this.matte ? 'none' : ''])], function(){
														if(!(owner.run2d = false) && (owner.vml2d = $.Array.pop($.Fn.css.call(scene, "." + owner.ident))))
															owner.vml2d.write = $.Dom.getFore(owner.vml2d);
													});
												}
											}
										}
								};
							}),
							'RECT' : mount(function(owner, param){
								/**
								 * 中点
								 * @type {x,y}
								 */
								this.point = param.point;
								/**
								 * 辐射
								 * @type {x,y}
								 */
								this.extra = param.extra;
								/**
								 * 粗细
								 * @type {Number}
								 */
								this.thick = param.thick;
								/**
								 * 颜色
								 * @type {String}
								 */
								this.color = param.color;
								/**
								 * 填充
								 * @type {String}
								 */
								this.stuff = param.stuff;
								/**
								 * 斜率
								 * @type {Number}
								 */
								this.slope = param.slope;
								/**
								 * 线型
								 * @type {DOT|DASH|SOLID|DASHDOT}
								 */
								this.style = param.style;
								/**
								 * 重绘图形
								 */
								this.paint = function(){
									if((owner || 0).alive)
										if(owner.run2d || !scene || !owner.ident){
											$.Thread.delay.call(wnd, arguments.callee, 0, this);
										}else{
											if(_amend.call(this)){
												var gpath = this.point && this.extra ? (new parse()).M([this.point.x - this.extra.x, this.point.y - this.extra.y]).L([this.point.x - this.extra.x, this.point.y + this.extra.y, this.point.x + this.extra.x, this.point.y + this.extra.y, this.point.x + this.extra.x, this.point.y - this.extra.y, this.point.x - this.extra.x, this.point.y - this.extra.y]).P() : _blank, trans = (
													!this.matte && this.slope && gpath !== _blank ? (new _arith.trans2d()).rotate(-this.slope * Math.PI / 180, this.point.x, this.point.y) : false
												);
												if(owner.vml2d && !(owner.vml2d.style.display = (this.matte ? 'none' : ''))){
													owner.vml2d.path = gpath;
													owner.vml2d.stuff.color = (
														(owner.vml2d.stuff.on = !!this.stuff) ? this.stuff : ''
													);
													owner.vml2d.write.color = this.color;
													owner.vml2d.write.weight = this.thick;
													owner.vml2d.write.dashstyle = this.style;
													owner.vml2d.stuff.opacity = owner.vml2d.write.opacity = this.alpha / 100;
													if(owner.vml2d.slope.on = !!trans){
														owner.vml2d.slope.offset = trans.offset(true);
														owner.vml2d.slope.matrix = trans.matrix(true);
													}else{
														owner.vml2d.slope.removeAttribute('offset');
														owner.vml2d.slope.removeAttribute('matrix');
													}
												}else{
													owner.run2d = !$.Fx.draw.call(wnd, scene, [$.Util.format(model.rect, [gpath, owner.ident, this.color, this.thick, this.alpha / 100, this.style, !!this.stuff, this.stuff || '', this.matte ? 'none' : ''])], function(){
														if((owner.vml2d = $.Array.pop($.Fn.css.call(scene, "." + owner.ident))) && (owner.vml2d.write = $.Dom.getPrev(owner.vml2d.stuff = $.Dom.getLast(owner.vml2d))))
															$.Fx.draw.call(wnd, owner.vml2d, [model.skew], function(){
																if(!(owner.run2d = false) && (owner.vml2d.slope = $.Dom.getLast(owner.vml2d)) && (owner.vml2d.slope.on = !!trans)){
																	owner.vml2d.slope.offset = trans.offset(true);
																	owner.vml2d.slope.matrix = trans.matrix(true);
																}
															});
													});
												}
											}
										}
								};
							}),
							'POLY' : mount(function(owner, param){
								/**
								 * 路径
								 * @type {Array}
								 */
								this.route = param.route;
								/**
								 * 粗细
								 * @type {Number}
								 */
								this.thick = param.thick;
								/**
								 * 颜色
								 * @type {String}
								 */
								this.color = param.color;
								/**
								 * 填充
								 * @type {String}
								 */
								this.stuff = param.stuff;
								/**
								 * 线型
								 * @type {DOT|DASH|SOLID|DASHDOT}
								 */
								this.style = param.style;
								/**
								 * 重绘图形
								 */
								this.paint = function(){
									if((owner || 0).alive)
										if(owner.run2d || !scene || !owner.ident){
											$.Thread.delay.call(wnd, arguments.callee, 0, this);
										}else{
											if(_amend.call(this)){
												var gpath = (this.route || 0).length > 3 ? (new parse()).M($.Array.slice(this.route, 0, 2)).L($.Array.slice(this.route, 2)).Z().P() : _blank;
												if(owner.vml2d && !(owner.vml2d.style.display = (this.matte ? 'none' : ''))){
													owner.vml2d.path = gpath;
													owner.vml2d.stuff.color = (
														(owner.vml2d.stuff.on = !!this.stuff) ? this.stuff : ''
													);
													owner.vml2d.write.color = this.color;
													owner.vml2d.write.weight = this.thick;
													owner.vml2d.write.dashstyle = this.style;
													owner.vml2d.stuff.opacity = owner.vml2d.write.opacity = this.alpha / 100;
												}else{
													owner.run2d = !$.Fx.draw.call(wnd, scene, [$.Util.format(model.poly, [gpath, owner.ident, this.color, this.thick, this.alpha / 100, this.style, !!this.stuff, this.stuff || '', this.matte ? 'none' : ''])], function(){
														if(!(owner.run2d = false) && (owner.vml2d = $.Array.pop($.Fn.css.call(scene, "." + owner.ident))))
															owner.vml2d.write = $.Dom.getPrev(owner.vml2d.stuff = $.Dom.getLast(owner.vml2d));
													});
												}
											}
										}
								};
							}),
							'OVAL' : mount(function(owner, param){
								/**
								 * 中点
								 * @type {x,y}
								 */
								this.point = param.point;
								/**
								 * 辐射
								 * @type {x,y}
								 */
								this.extra = param.extra;
								/**
								 * 粗细
								 * @type {Number}
								 */
								this.thick = param.thick;
								/**
								 * 颜色
								 * @type {String}
								 */
								this.color = param.color;
								/**
								 * 填充
								 * @type {String}
								 */
								this.stuff = param.stuff;
								/**
								 * 斜率
								 * @type {Number}
								 */
								this.slope = param.slope;
								/**
								 * 线型
								 * @type {DOT|DASH|SOLID|DASHDOT}
								 */
								this.style = param.style;
								/**
								 * 重绘图形
								 */
								this.paint = function(){
									if((owner || 0).alive)
										if(owner.run2d || !scene || !owner.ident){
											$.Thread.delay.call(wnd, arguments.callee, 0, this);
										}else{
											if(_amend.call(this)){
												var gpath = this.point && this.extra ? (new parse()).A([this.point.x, this.point.y, this.extra.x, this.extra.y, 0, 23592960]).Z().P() : _blank, trans = (
													!this.matte && this.slope && gpath !== _blank ? (new _arith.trans2d()).rotate(-this.slope * Math.PI / 180, this.point.x, this.point.y) : false
												);
												if(owner.vml2d && !(owner.vml2d.style.display = (this.matte ? 'none' : ''))){
													owner.vml2d.path = gpath;
													owner.vml2d.stuff.color = (
														(owner.vml2d.stuff.on = !!this.stuff) ? this.stuff : ''
													);
													owner.vml2d.write.color = this.color;
													owner.vml2d.write.weight = this.thick;
													owner.vml2d.write.dashstyle = this.style;
													owner.vml2d.stuff.opacity = owner.vml2d.write.opacity = this.alpha / 100;
													if(owner.vml2d.slope.on = !!trans){
														owner.vml2d.slope.offset = trans.offset(true);
														owner.vml2d.slope.matrix = trans.matrix(true);
													}else{
														owner.vml2d.slope.removeAttribute('offset');
														owner.vml2d.slope.removeAttribute('matrix');
													}
												}else{
													owner.run2d = !$.Fx.draw.call(wnd, scene, [$.Util.format(model.oval, [gpath, owner.ident, this.color, this.thick, this.alpha / 100, this.style, !!this.stuff, this.stuff || '', this.matte ? 'none' : ''])], function(){
														if((owner.vml2d = $.Array.pop($.Fn.css.call(scene, "." + owner.ident))) && (owner.vml2d.write = $.Dom.getPrev(owner.vml2d.stuff = $.Dom.getLast(owner.vml2d))))
															$.Fx.draw.call(wnd, owner.vml2d, [model.skew], function(){
																if(!(owner.run2d = false) && (owner.vml2d.slope = $.Dom.getLast(owner.vml2d)) && (owner.vml2d.slope.on = !!trans)){
																	owner.vml2d.slope.offset = trans.offset(true);
																	owner.vml2d.slope.matrix = trans.matrix(true);
																}
															});
													});
												}
											}
										}
								};
							}),
							'ARCH' : mount(function(owner, param){
								/**
								 * 角度
								 * @type {f,t}
								 */
								this.angle = param.angle;
								/**
								 * 中点
								 * @type {x,y}
								 */
								this.point = param.point;
								/**
								 * 辐射
								 * @type {x,y}
								 */
								this.extra = param.extra;
								/**
								 * 粗细
								 * @type {Number}
								 */
								this.thick = param.thick;
								/**
								 * 颜色
								 * @type {String}
								 */
								this.color = param.color;
								/**
								 * 填充
								 * @type {String}
								 */
								this.stuff = param.stuff;
								/**
								 * 斜率
								 * @type {Number}
								 */
								this.slope = param.slope;
								/**
								 * 线型
								 * @type {DOT|DASH|SOLID|DASHDOT}
								 */
								this.style = param.style;
								/**
								 * 重绘图形
								 */
								this.paint = function(){
									if((owner || 0).alive)
										if(owner.run2d || !scene || !owner.ident){
											$.Thread.delay.call(wnd, arguments.callee, 0, this);
										}else{
											if(_amend.call(this)){
												var gpath = this.point && this.extra && this.angle ? (new parse()).A([this.point.x, this.point.y, this.extra.x, this.extra.y, 11796480 * _arith.ang2ecc(this.angle.f, this.extra.x, this.extra.y) / Math.PI, 11796480 * (_arith.ang2ecc(this.angle.t, this.extra.x, this.extra.y) - _arith.ang2ecc(this.angle.f, this.extra.x, this.extra.y)) / Math.PI]).L([this.point.x, this.point.y]).Z().P() : _blank, trans = (
													!this.matte && this.slope && gpath !== _blank ? (new _arith.trans2d()).rotate(-this.slope * Math.PI / 180, this.point.x, this.point.y) : false
												);
												if(owner.vml2d && !(owner.vml2d.style.display = (this.matte ? 'none' : ''))){
													owner.vml2d.path = gpath;
													owner.vml2d.stuff.color = (
														(owner.vml2d.stuff.on = !!this.stuff) ? this.stuff : ''
													);
													owner.vml2d.write.color = this.color;
													owner.vml2d.write.weight = this.thick;
													owner.vml2d.write.dashstyle = this.style;
													owner.vml2d.stuff.opacity = owner.vml2d.write.opacity = this.alpha / 100;
													if(owner.vml2d.slope.on = !!trans){
														owner.vml2d.slope.offset = trans.offset(true);
														owner.vml2d.slope.matrix = trans.matrix(true);
													}else{
														owner.vml2d.slope.removeAttribute('offset');
														owner.vml2d.slope.removeAttribute('matrix');
													}
												}else{
													owner.run2d = !$.Fx.draw.call(wnd, scene, [$.Util.format(model.arch, [gpath, owner.ident, this.color, this.thick, this.alpha / 100, this.style, !!this.stuff, this.stuff || '', this.matte ? 'none' : ''])], function(){
														if((owner.vml2d = $.Array.pop($.Fn.css.call(scene, "." + owner.ident))) && (owner.vml2d.write = $.Dom.getPrev(owner.vml2d.stuff = $.Dom.getLast(owner.vml2d))))
															$.Fx.draw.call(wnd, owner.vml2d, [model.skew], function(){
																if(!(owner.run2d = false) && (owner.vml2d.slope = $.Dom.getLast(owner.vml2d)) && (owner.vml2d.slope.on = !!trans)){
																	owner.vml2d.slope.offset = trans.offset(true);
																	owner.vml2d.slope.matrix = trans.matrix(true);
																}
															});
													});
												}
											}
										}
								};
							}),
							'WAVE' : mount(function(owner, param){
								/**
								 * 路径
								 * @type {Array}
								 */
								this.route = param.route;
								/**
								 * 粗细
								 * @type {Number}
								 */
								this.thick = param.thick;
								/**
								 * 颜色
								 * @type {String}
								 */
								this.color = param.color;
								/**
								 * 箭头
								 * @type {true|false}
								 */
								this.arrow = param.arrow;
								/**
								 * 线型
								 * @type {DOT|DASH|SOLID|DASHDOT}
								 */
								this.style = param.style;
								/**
								 * 重绘图形
								 */
								this.paint = function(){
									if((owner || 0).alive)
										if(owner.run2d || !scene || !owner.ident){
											$.Thread.delay.call(wnd, arguments.callee, 0, this);
										}else{
											if(_amend.call(this)){
												var gpath = (this.route || 0).length > 5 ? (new parse()).M($.Array.slice(this.route, 0, 2))[this.route.length === 8 ? 'C' : 'Q']($.Array.slice(this.route, 2)).P() : _blank;
												if(owner.vml2d && !(owner.vml2d.style.display = (this.matte ? 'none' : ''))){
													owner.vml2d.path = gpath;
													owner.vml2d.write.color = this.color;
													owner.vml2d.write.weight = this.thick;
													owner.vml2d.write.dashstyle = this.style;
													owner.vml2d.write.opacity = this.alpha / 100;
													owner.vml2d.write.endarrow = this.arrow ? 'classic' : 'none';
												}else{
													owner.run2d = !$.Fx.draw.call(wnd, scene, [$.Util.format(model.wave, [gpath, owner.ident, this.color, this.thick, this.alpha / 100, this.style, this.arrow ? 'classic' : 'none', this.matte ? 'none' : ''])], function(){
														if(!(owner.run2d = false) && (owner.vml2d = $.Array.pop($.Fn.css.call(scene, "." + owner.ident))))
															owner.vml2d.write = $.Dom.getFore(owner.vml2d);
													});
												}
											}
										}
								};
							})
						};
					};
				}(function(){
					this.save = [];
				}, {
					line : '<v:shape coordsize="1,1" style="width:1px;height:1px;display:$8;" path="$1" class="$2"><v:stroke color="$3" weight="$4" opacity="$5" dashstyle="$6" endarrow="$7"></v:stroke><v:fill on="f"></v:fill></v:shape>',
					rect : '<v:shape coordsize="1,1" style="width:1px;height:1px;display:$9;" path="$1" class="$2"><v:stroke color="$3" weight="$4" opacity="$5" dashstyle="$6" endarrow="none"></v:stroke><v:fill on="$7" color="$8" opacity="$5"></v:fill></v:shape>',
					poly : '<v:shape coordsize="1,1" style="width:1px;height:1px;display:$9;" path="$1" class="$2"><v:stroke color="$3" weight="$4" opacity="$5" dashstyle="$6" endarrow="none"></v:stroke><v:fill on="$7" color="$8" opacity="$5"></v:fill></v:shape>',
					oval : '<v:shape coordsize="1,1" style="width:1px;height:1px;display:$9;" path="$1" class="$2"><v:stroke color="$3" weight="$4" opacity="$5" dashstyle="$6" endarrow="none"></v:stroke><v:fill on="$7" color="$8" opacity="$5"></v:fill></v:shape>',
					arch : '<v:shape coordsize="1,1" style="width:1px;height:1px;display:$9;" path="$1" class="$2"><v:stroke color="$3" weight="$4" opacity="$5" dashstyle="$6" endarrow="none"></v:stroke><v:fill on="$7" color="$8" opacity="$5"></v:fill></v:shape>',
					wave : '<v:shape coordsize="1,1" style="width:1px;height:1px;display:$8;" path="$1" class="$2"><v:stroke color="$3" weight="$4" opacity="$5" dashstyle="$6" endarrow="$7"></v:stroke><v:fill on="f"></v:fill></v:shape>',
					skew : '<v:skew on="f"></v:skew>'
				}) : null
			)
		)
	);

	$.Graphic = function(cnv, wnd){
		if(!!_graph && cnv){
			var _brush = new _graph($.Util.getWin(wnd), $.Util.getDoc(wnd), ($.Match.isString(cnv) ? $.Fn.id(cnv) : cnv), false);
			if((_brush || 0).ready()){
				this.renewStage = function(){
					_brush.renew();
				};
				this.clearStage = function(){
					_brush.clear();
				};
				this.refixStage = function(dimen){
					_brush.refix(dimen);
				};
				this.sliceStage = function(limit){
					_brush.slice(limit);
				};
				this.createLine = function(param){
					return new _brush.build['LINE']({
						alive : true
					}, param);
				};
				this.createRect = function(param){
					return new _brush.build['RECT']({
						alive : true
					}, param);
				};
				this.createPoly = function(param){
					return new _brush.build['POLY']({
						alive : true
					}, param);
				};
				this.createOval = function(param){
					return new _brush.build['OVAL']({
						alive : true
					}, param);
				};
				this.createArch = function(param){
					return new _brush.build['ARCH']({
						alive : true
					}, param);
				};
				this.createWave = function(param){
					return new _brush.build['WAVE']({
						alive : true
					}, param);
				};
			}else throw 'Prepare Exception';
		}else throw 'Support Exception';
	};

})(jMagic);