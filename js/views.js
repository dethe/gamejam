/*tour = new Shepherd.Tour({defaults: {
    classes: 'shepherd-theme-default',
    //scrollTo: true
  }});

tour.addStep('example-step', {
  text: 'this is a line!',
  attachTo: '.attachtome bottom',
  //classes: 'example-step-extra-class',
  buttons: [
    {
      text: 'Next',
      action: tour.next
    }
  ]
});

tour.start()*/

var root_element = document.querySelector('#root')

var current_view;

views = {

}

function changeView(v){
	if(current_view != undefined && current_view.tini != undefined){
		current_view.tini.apply(current_view)
	}
	current_view = v
	root_element.innerHTML = ''
	current_view.init.apply(current_view)
}

views.title_screen = {
	init: function(){
		root_element.innerHTML = 	'<div class="titlemenu">'+
										'<h1>Verve</h1>'+
										'<button onclick="changeView(views.level_select)">levels</button>'+
									'</div>'
	},
	tini: function(){

	}
}

views.level_select = {
	init: function(){
		var html = 	'<button class="btn back fa fa-angle-left" onclick="changeView(views.title_screen)"></button><br/>'+
					'<div class="levelselect">'+
						'<h1>Levels</h1>'
		for(var i = 0; i < levels.length; i++){
			html += 	'<button onclick="current_level = '+i+'; changeView(views.game)">'+i+'</button>'
		}
		html += 	'</div>'
		root_element.innerHTML = html
	},
	tini: function(){

	}
}

views.game = {
	init: function(){
		this.s = Snap(0,0)
		running = false;
		root_element.innerHTML = 	'<button class="btn back fa fa-angle-left" onclick="changeView(views.level_select)"></button>'+
									'<button class="btn fa fa-rotate-left" style="right:260px;" onclick="if(selected!=undefined && !running){selected.rotate(-90)}"></button>'+
									'<button class="btn fa fa-rotate-right" style="right:180px;" onclick="if(selected!=undefined && !running){selected.rotate(90)}"></button>'+
									'<button class="btn fa fa-arrows-h" style="right:100px;" onclick="if(selected!=undefined && !running){selected.flipH()}"></button>'+
									'<button class="btn fa fa-arrows-v" style="right:20px;" onclick="if(selected!=undefined && !running){selected.flipV()}"></button>'+
									'<button class="btn fa fa-play" style="margin-left:auto; margin-right:auto; left:0; right:0" onclick="toggleRun(this)"></button>'
		root_element.appendChild(this.s.node)

		this.level = levels[current_level]
		this.shapes = []
		for(var i = 0; i < this.level.shapes.length; i++){
			this.shapes.push( this.s[this.level.shapes[i][0]].apply(this.s, this.level.shapes[i].slice(1)).attr(ATTRS) )
		}
		this.resize();
		window.addEventListener('resize', this.resize.bind(this))
	},
	tini: function(){
		this.s.remove()
		window.removeEventListener('resize', this.resize)
	},
	resize: function(){
	    w = window.innerWidth
	    h = window.innerHeight
	    this.s.node.setAttribute('width', w)
	    this.s.node.setAttribute('height', h)
	    this.s.node.setAttribute('viewBox', -w/2+','+(-h/2)+','+w+','+h )
	}
}

function toggleRun(el){
	running = !running;
	if(running){
		el.classList.remove('fa-play')
		el.classList.add('fa-stop')

		var asterisks = []
		for(var i = 0; i < views.game.shapes.length; i++){
			if(views.game.shapes[i].attr('type') == 'asterisk'){
				asterisks.push(views.game.shapes[i])
			}
		}

		var speed = 500;
		function pulse(signal, adj){
			//var adj = a.adjacent[i2]
			var closex, closey;
			if(adj.attr('type') == 'line'){
				var g = distance(signal.num('cx'), signal.num('cy'), adj.num('cx') + adj.num('x2'), adj.num('cy') + adj.num('y2')) < distance(signal.num('cx'), signal.num('cy'), adj.num('cx'), adj.num('cy'))

				var points = [[adj.num('cx'), adj.num('cy')], [adj.num('cx') + adj.num('x2'), adj.num('cy') + adj.num('y2')]]
				var closepoint = points[g+0]
				var farpoint = points[!g+0]
				//closex = closepoint[0]
				//closey = closepoint[1]
				signal.animate({cx:closepoint[0]+'px', cy:closepoint[1]+'px'}, speed, mina.linear, function(){
					adj.pulse()
					this.animate({cx:farpoint[0]+'px', cy:farpoint[1]+'px'}, speed)
					if(adj.adjacent.length > 1){
						pulse(this, adj.adjacent[1])
					}
				})
			}else{
				signal.animate({cx:adj.num('cx')+'px', cy:adj.num('cy')+'px'}, speed, mina.linear, function(){
					adj.pulse()
					if(adj.adjacent.length > 1){
						pulse(signal, adj.adjacent[1])
					}
				})
				
				//closex = 
				//closey = adj.num('cy')
			}
			//console.log(closex, closey)
			//signal.animate({cx:closex+'px', cy:closey+'px'}, 200)
			//adj.pulse()
		}
		for(var i = 0; i < asterisks.length; i++){
			var a = asterisks[i]
			asterisks[i].pulse()
			for(var i2 = 0; i2 < a.adjacent.length; i2++){
				var signal = views.game.s.circle(a.num('cx'), a.num('cy'), 7)
				pulse(signal, a.adjacent[i])
			}
		}
		console.log(asterisks)
		gameloop()
	}else{
		el.classList.add('fa-play')
		el.classList.remove('fa-stop')
	}
}

function gameloop(){
	if(running){
		requestAnimationFrame(gameloop)

	}
}

changeView(views.title_screen)
