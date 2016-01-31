var ambience = new Wad({
    source : 'sine',
    volume: 0.25,
    env : {
        attack : .5, 
        decay : .002, 
       	hold: .8,
    },
    vibrato : {
        attack : .5, 
        speed : 100, 
        magnitude : 300 
    }
})

var note = new Wad({
	source : 'sine',
	volume:2,
	env : {
        attack : 0.01, 
        decay : .005, 
       	hold: .45,
    }, 
})
 

var index = 0;
var index2 = 0;
var notes = ['A#2','B2','C3','D3','E3','F#3','G3','A#3','B3','A#3','G3','F#3','E3','D3','C3','B2']
var notes2 = ['A#3','B3','C4','D4','E4','F#4','G4','A#4','B4','A#4','G4','F#4','E4','D4','C4','B3']

setInterval(function(){
	if(Math.random() > 0){
		ambience.play({ pitch : notes[index], panning: Math.random()-.5 })
		var range = 3.5
		index += Math.round(Math.random()*range-range/2)
		if(index < 0){
			index = notes.length-1
		}
		index %= notes.length
	}
}, 400)

setInterval(function(){
	if(Math.random() > 0.4){
		note.play({ pitch : notes2[index], panning: Math.random()-.5, volume:0.5 })
		var range = 3.5
		index += Math.round(Math.random()*range-range/2)
		if(index < 0){
			index = notes.length-1
		}
		index %= notes.length
	}
}, 200)