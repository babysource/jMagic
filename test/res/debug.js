function initialize(){
	$Fn.id('jmagic_root').value = jMagic.root;
	{
		hover();
		dialog();
		browser();
	}
}

function print(out){
	if((console || 0).info){
		console.info(out);
	}
}

// 鼠标悬停效果
function hover(){
	$Fx.hover($Fn.id('hover_div'), {
		inner : function(e, obj){
			obj.style.backgroundColor = '#000000';
		}, outer : function(e, obj){
			obj.style.backgroundColor = '';
		}
	}).mount();
}

// 对话框测试
function dialog(){
	$Util.addEvent({
		obj : $Fn.id('jmagic_dialog'), evt : 'click', fun : function(){
			$Fx.win.mask('https://www.baidu.com/', '百度搜索', 800, 600, true, {
				load: function() {
					print("Dialog Load.");
				},
				shut: function() {
					print("Dialog Shut.");
				}
			});
		}
	});
}

// 浏览器判断
function browser(){
	var str = [];
	str.push("os: " + $Browser.os);
	if($Browser.ie){
		str.push("ie: true");
	}else if($Browser.ff){
		str.push("firefox: true");
	}else if($Browser.opera){
		str.push("opera: true");
	}else if($Browser.webkit){
		str.push("webkit: true");
	}else if($Browser.safari){
		str.push("safari: true");
	}else if($Browser.chrome){
		str.push("chrome: true");
	}else{
		str.push("unknow: true");
	}
	str.push("version: " + $Browser.v);
	str.push("webgl: " + $Support.webgl);
	str.push("cache: " + $Support.cache);
	str.push("xpath: " + $Support.xpath);
	str.push("video: " + $Support.video);
	str.push("audio: " + $Support.audio);
	str.push("worker: " + $Support.worker);
	str.push("locate: " + $Support.locate);
	str.push("select: " + $Support.select);
	str.push("socket: " + $Support.socket);
	str.push("canvas: " + $Support.graphic.cav);
	str.push("postMessage: " + $Support.message.post);
	str.push("pushMessage: " + $Support.message.push);
	str.push("machineStorage: " + $Support.storage.machine);
	str.push("sessionStorage: " + $Support.storage.session);
	print(str.join('\r\n'));
}