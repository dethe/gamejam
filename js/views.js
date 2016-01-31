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
		for(var i = 0; i < asterisks.length; i++){
			asterisks[i].pulse()
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
