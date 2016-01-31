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
		root_element.innerHTML = '<button onclick="changeView(views.level_select)">level select</button>'
	},
	tini: function(){

	}
}

views.level_select = {
	init: function(){
		var html = '<button onclick="changeView(views.title_screen)"><</button><br/>'
		for(var i = 0; i < levels.length; i++){
			html += '<button onclick="current_level = '+i+'; changeView(views.game)">'+i+'</button>'
		}
		root_element.innerHTML = html
	},
	tini: function(){

	}
}

views.game = {
	init: function(){
		this.s = Snap(0,0)
		root_element.appendChild(this.s.node)

		this.level = levels[current_level]
		for(var i = 0; i < this.level.shapes.length; i++){
			this.s[this.level.shapes[i][0]].apply(this.s, this.level.shapes[i].slice(1)).attr(ATTRS)
		}
		this.resize()
		window.addEventListener('resize', this.resize)
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

changeView(views.title_screen)