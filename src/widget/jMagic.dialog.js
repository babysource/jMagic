/**********************************************************************
 * 用途：模态对话框(ModalDialog)
 *
 * 作者：Wythe
 *
 * 版本日志：
 * @version 1.0 2009.04.27 创建 Wythe
***********************************************************************/
(function(){
	
    var

    sys = window,
	
	doc = sys.document,
	
	$Dom = jMagic.Dom,
    
    $Util = jMagic.Util,
    
    $Match = jMagic.Match,
    
    $Browser = jMagic.Browser,
    
    jPath = jMagic.root + '/assets/pic/dialog/',
    
    jConfig = {
    	alpha:	jPath + 'alpha.htm',
    	lhead:	jPath + 'lhead.gif',
    	rhead:	jPath + 'rhead.gif',
    	title:	jPath + 'title.gif',
    	large:	jPath + 'large.gif',
    	reset:  jPath + 'reset.gif',
    	close:	jPath + 'close.gif'
 	};
    
    jMagic.Fx.win.mask = function(){
    	
    	var
    	
    	dSize = $Util.getDocSize(),
    	
    	param = ['','',dSize.winW,dSize.winH,true,{load:null,shut:null}];
    	
		for(var i=0,len=arguments.length; i<len; i++){
			param[i] = arguments[i];
		}
		
		return new function(){

			var modalDialog = new ModalDialog_Implement(param);
			
			this.max = function(){
				modalDialog.max();
			};
			
			this.close = function(){
				modalDialog.close();
			};
			
			this.revert = function(){
				modalDialog.revert();
			};
			
			this.resize = function(){
				modalDialog.resize();
			};
			
			this.disable = function(){
				modalDialog.disable();
		    };
		    
		    this.enable = function(){
		    	modalDialog.enable();
		    };
		    
			modalDialog.build();
			
		}
		
    };
    
    var ModalDialog_Implement = function(param){
    	
    	this.able = true;
    	
    	this.body = null;
    	
    	this.mask = null;
    	
    	this.wind = null;
    	
    	this.zoom = null;
    	
    	this.ctrl = 0;
    	
    	this.data = param;
    	
    	this.mode = param[4] || false;
    	
    	this.size = {w:Number(param[2]),h:Number(param[3])};
    	
    	this.load = $Match.isFunction((param[5] || 0).load) ? param[5].load : function(){};
    	
    	this.shut = $Match.isFunction((param[5] || 0).shut) ? param[5].shut : function(){};
    	
    };
    
    ModalDialog_Implement.prototype.build = function(){
    	var oThis = this, docs = $Util.getDocSize();
    	// 创建组件
    	this.body = doc.createElement('div');
    	{
    		doc.body.appendChild(this.body);
    	}
    	this.body.className = 'ModalDialog';
    	this.wind = doc.createElement('div');
    	this.wind.className = 'modalWind';
    	if(this.mode){
    		$Util.setElemSize(this.body,{
    			w: '100%', h: '100%'
    		});
    		$Util.setElemSeat(this.body,{
    			t: 0, l: 0
    		});
    		$Util.setElemSeat(this.wind,{
    			t: (docs.winH - this.size.h) / 2,
    			l: (docs.winW - this.size.w) / 2
    		});
    		if($Browser.ie){
    			this.mask = doc.createElement('iframe');
    			this.mask.src = jConfig.alpha;
    			this.mask.scrolling = 'no';
    			this.mask.frameBorder = 0;
    			this.mask.className = 'frameMask';
    		}else{
    			this.mask = doc.createElement('div');
    			this.mask.className = 'layerMask';
    		}
    		this.body.appendChild(this.mask);
    	}else{
    		$Util.setElemSize(this.body,this.size);
    		$Util.setElemSeat(this.body,{
    			t: (docs.winH - this.size.h) / 2,
    			l: (docs.winW - this.size.w) / 2
    		});
    		$Util.setElemSeat(this.wind,{
    			t: 0, l: 0
    		});
    	}
    	$Util.setElemSize(this.wind,this.size);
    	// 加载窗体
    	for(var i=0; i<2; i++){
    		var ul = doc.createElement('ul');
    		if(i){
    			ul.className = 'wind_body';
    			$Util.setElemSize(ul,{
                	w: this.size.w - 2,
                	h: this.size.h - 26
                });
    			var li = doc.createElement('li');
    			li.className = 'body_data';
        		$Util.setElemSize(li,{
                    w: this.size.w - 16,
                    h: this.size.h - 34
        		});
        		li.style.overflow = 'auto';
        		if($Match.isString(this.data[0])){
        			if($Match.isUrl(this.data[0])){
        				var iframe = doc.createElement('iframe');
        				iframe.src = this.data[0];
        				iframe.scrolling = 'auto';
        				iframe.frameBorder = 0;
        				iframe.className = 'body_data_href';
        				li.appendChild(iframe);
        				li.style.overflow = 'hidden'; iframe = null;
        			}else{
        				li.innerHTML = this.data[0];
        			}
                }else{
                	li.appendChild(this.data[0]);
                }
    			ul.appendChild(li); li = null;
    		}else{
    			ul.className = 'wind_head';
    			for(var j=0; j<4; j++){
    				var li = doc.createElement('li');
    				switch(j){
    					case 0:	{
    						li.className = 'head_side';
    						li.style.backgroundImage = 'url(' + jConfig.lhead + ')';
    						break;
    					}
    					case 1:	{
    						li.className = 'head_info';
    						$Util.setElemSize(li,{
    	                    	w: this.size.w - 48
    	                    });
    						li.innerHTML = this.data[1];
    						li.style.backgroundImage = 'url(' + jConfig.title + ')';
    						break;
    					}
    					case 2:	{
    						li.className = 'head_ctrl';
    						li.style.backgroundImage = 'url(' + jConfig.title + ')';
    						for(var k=0; k<2; k++){
    							var btn = doc.createElement('input');
    							btn.type = 'image';
    							if(k){
    								btn.src = jConfig.close;
    								btn.onclick = function(){
    									oThis.close();
    								};
    							}else{
    								this.zoom = btn;
    								this.zoom.src = jConfig.large;
    								this.zoom.onclick = function(){
	    								oThis.toggle();
	    							};
    							}
    							li.appendChild(btn); btn = null;
    						}
    						break;
    					}
    					case 3:	{
    						li.className = 'head_side';
    						li.style.backgroundImage = 'url(' + jConfig.rhead + ')';
    						break;
    					}
    				}
    				ul.appendChild(li); li = null;
    			}
    			if(!this.mode){
    				ul.onmousedown = function(e){
    	    	    	if($Util.getKey(e) == 1){
    	    	    		oThis.listener.drag(e,oThis);
    	    	    	}
    	            };
    	            ul.style.cursor = 'move';
    			}
    		}
    		this.wind.appendChild(ul); ul = null;
    	}
		this.body.appendChild(this.wind);
		// 绑定监听
		$Util.addEvent(sys,'resize',function(){
			oThis.resize();
		}); this.load();
    };
    
    ModalDialog_Implement.prototype.max = function(){
    	if(this.able && this.body && this.wind && this.zoom && !this.ctrl){
    		this.ctrl = 1;
    		this.zoom.src = jConfig.reset; this.resize();
    	}
    };
    
    ModalDialog_Implement.prototype.close = function(){
    	if(this.able && this.body){
    		this.shut();
    		this.body.focus();
    		$Dom.removeChild(this.body,true);
    		this.body = this.mask = this.wind = this.zoom = null;
		}
    };
    
    ModalDialog_Implement.prototype.revert = function(){
    	if(this.able && this.body && this.wind && this.zoom && this.ctrl){
    		this.ctrl = 0;
    		this.zoom.src = jConfig.large; this.resize();
    	}
    };
    
    ModalDialog_Implement.prototype.resize = function(){
    	if(this.able && this.body && this.wind){
	    	var docs = $Util.getDocSize(), elem = this.wind.childNodes;
	    	if(this.ctrl){
	    		this.size = {
	    			w: docs.winW, h: docs.winH
	    		};
	    	}else{
	    		this.size = {
	        	    w: Number(this.data[2]), h: Number(this.data[3])
	        	};
	    	}
	    	if(this.mode){
	    		$Util.setElemSeat(this.wind,{
	    			t: (docs.winH - this.size.h) < 0 ? 0 : (docs.winH - this.size.h) / 2,
	    			l: (docs.winW - this.size.w) < 0 ? 0 : (docs.winW - this.size.w) / 2
	    		});
	    	}else{
	    		$Util.setElemSize(this.body,
		    		this.size
		    	);
		    	$Util.setElemSeat(this.body,{
		    		t: (docs.winH - this.size.h) < 0 ? 0 : (docs.winH - this.size.h) / 2,
		    		l: (docs.winW - this.size.w) < 0 ? 0 : (docs.winW - this.size.w) / 2
		    	});
	    	}
	    	if(elem[0]){
	    		$Util.setElemSize(elem[0].childNodes[1],{
	            	w: this.size.w - 48
	            });
	    	}
	    	if(elem[1]){
	    		$Util.setElemSize(elem[1],{
	            	w: this.size.w - 2, h: this.size.h - 26
	            });
	    		$Util.setElemSize(elem[1].childNodes[0],{
	                w: this.size.w - 16, h: this.size.h - 34
	    		});
	    	}
	    	$Util.setElemSize(this.wind,this.size);
    	}
    };
    
    ModalDialog_Implement.prototype.toggle = function(){
    	if(this.able && this.body && this.wind && this.zoom){
    		if(this.ctrl){
    			this.ctrl = 0;
    			this.zoom.src = jConfig.large;
    		}else{
    			this.ctrl = 1;
    			this.zoom.src = jConfig.reset;
    		}
    		this.resize();
    	}
    };
    
    ModalDialog_Implement.prototype.disable = function(){
    	this.able = false;
    };

    ModalDialog_Implement.prototype.enable = function(){
    	this.able = true;
    };
    
    ModalDialog_Implement.prototype.listener = {
    	drag:   function(oEvent,oThis){
					if(oThis.body && oThis.able){
						$Util.addCapture(oThis.body);
			            var
			            mouse = $Util.getMouse(oEvent),
			            wSize = $Util.getElemSize(oThis.body),
			            dSize = $Util.getDocSize(),
			            wSeat = $Util.getElemSeat(oThis.body),
			            dragListener = $Util.addEvent(document,'mousemove',function(e){
			            	var
			            	t = wSeat.t + $Util.getMouse(e).y - mouse.y,
			            	l = wSeat.l + $Util.getMouse(e).x - mouse.x;
			            	$Util.setElemSeat(oThis.body,{
			            		t:	t < 0 ? 0 : t > dSize.winH - wSize.h ? dSize.winH - wSize.h : t,
			            		l:	l < 0 ? 0 : l > dSize.winW - wSize.w ? dSize.winW - wSize.w : l
			            	});
			         	}),
			         	stopListener = $Util.addEvent(document,'mouseup',function(e){
			             	$Util.delCapture(oThis.body);
			             	$Util.delEvent(document,'mousemove',dragListener);
			             	$Util.delEvent(document,'mouseup',stopListener);
			          	});
					}
				}
    };
    
})();