document.addEventListener('DOMContentLoaded', function(){
	var canvas = document.createElement('canvas');
	document.body.appendChild(canvas);
	document.body.style.padding = '0px';
	document.body.style.margin = '0px';
	document.body.style.overflow = 'hidden';
	
	var w = canvas.width = window.innerWidth;
	var h = canvas.height = window.innerHeight;
	var ctx = canvas.getContext('2d');
	
	var opts = {
	};
	var gui = new dat.GUI();
	function opt(name, value, min, max){
		opts[name] = value;
		return gui.add(opts, name, min, max);
	}
	opt('info', "click (toggle,clear)");
	opt('rule', 151, 0, 255).step(1).listen();
	opt('next', function(){opts.rule = (opts.rule+1)%256;});
	opt('prev', function(){opts.rule = (opts.rule+255)%256;});
	opt('animate',  false);
	opt('seed', 0).listen();
	opt('randomSeed', randomSeed);
	opt('animateSeed', true);
	opt('cellSize', 16, [32,16,8,4]);
	opt('alpha', 0.2, [1,0.5,0.2,0.1,0.05,0.01]);
	opt('clear', clear);
	opt('progress', true);
	opt('progressMod', 1, 1, 50).step(1);
	
	var colors = ['#000','#080','#555', '#a00'];
	var cells = new Int32Array( (w/4>>0) * (h/4>>0) ), wc, hc;
	
	function randomSeed(){
		opts.seed = Math.floor(Math.random()*0x7fffffff);
	}
	
	function clear(){
		for(var i=0; i<cells.length; ++i)
			cells[i] = 0;
	}
	
	var frame = 0;
	var oldRule = 0;
	function progress(){
		++frame;
		if(opts.progress & opts.rule === oldRule ){
			if(frame % opts.progressMod == 0)
				for(var i=0; i<wc; ++i)
					if(cells[i] < 2)
						cells[i] = cells[i+wc] & ~2;
		}else{
			Math.seedrandom(opts.seed);
			for(var i=0; i<wc; ++i){
				var v = Math.random() < 0.5 ? 0 : 1;
				if(cells[i] < 2)
					cells[i] = v;
			}
		}
		oldRule = opts.rule;
		
		var rule = [];
		for(var i=0; i<8; ++i)
			rule[i] = opts.rule >> i & 1;
		
		for(var y=1; y<hc; ++y){
			for(var x=0; x<wc; ++x){
				var n1 = (y-1) * wc;
				var n2 = y * wc;
				if( cells[n2+x] > 1 )
					continue;
				cells[n2+x] = rule[
					( cells[ (x+wc-1)%wc + n1 ] & 1) +
					( cells[ (x+wc+0)%wc + n1 ] & 1)*2 +
					( cells[ (x+wc+1)%wc + n1 ] & 1)*4
				];
			}
		}
	}
	
	function render(){
		ctx.globalAlpha = opts.alpha;
		wc = Math.ceil(w / opts.cellSize);
		hc = Math.ceil(h / opts.cellSize);
		var cellSize = opts.cellSize;
		progress();
		for(var y=0; y<hc; ++y){
			for(var x=0; x<wc; ++x){			
				var n = x + y * wc;
				ctx.fillStyle = colors[cells[n]];
				ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
			}
		}
		window.requestAnimationFrame(render);
	}
	
	canvas.addEventListener('contextmenu', function(e){e.preventDefault();}, false);
	var value = false;
	canvas.addEventListener('mousedown', function(e){
		var n = (e.layerX/opts.cellSize>>0) + (e.layerY/opts.cellSize>>0)*wc;
		value = cells[n] = e.button > 0 ? 0 : (cells[n] | 2)^1;
	}, false);
	canvas.addEventListener('mouseup', function(e){
		value = false;
	}, false);
	canvas.addEventListener('mousemove', function(e){
		if(value === false)
			return;
		var n = (e.layerX/opts.cellSize>>0) + (e.layerY/opts.cellSize>>0)*wc;
		cells[n] = value;
	}, false);
	
	clear();
	render();
	setInterval(function(){
		if(opts.animate)
			opts.rule = (opts.rule+1) % 256;
		if(opts.animateSeed)
			randomSeed();
	}, 1000)
}, false);