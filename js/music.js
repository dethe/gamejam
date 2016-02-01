var mute = false;

function toggleMute(el){
    mute = !mute;
    if(mute){
        el.classList.remove('fa-volume-up')
        el.classList.add('fa-volume-off')
    }else{
        el.classList.remove('fa-volume-off')
        el.classList.add('fa-volume-up')
    }
}

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
var notes3 = ['A#3','B3','C4','D4','E4','F#4','G4','A#4','B4']

function getColor(a,b,r){
    var color1 = a;
    var color2 = b;
    var ratio = r;
    var hex = function(x) {
        x = x.toString(16);
        return (x.length == 1) ? '0' + x : x;
    };

    var r = Math.ceil(parseInt(color1.substring(0,2), 16) * ratio + parseInt(color2.substring(0,2), 16) * (1-ratio));
    var g = Math.ceil(parseInt(color1.substring(2,4), 16) * ratio + parseInt(color2.substring(2,4), 16) * (1-ratio));
    var b = Math.ceil(parseInt(color1.substring(4,6), 16) * ratio + parseInt(color2.substring(4,6), 16) * (1-ratio));

    var middle = hex(r) + hex(g) + hex(b);

    return middle
}

setInterval(function(){
	if(Math.random() > 0 && !mute){
		ambience.play({ pitch : notes[index], panning: Math.random()-.5 })
		var range = 3.5
		index += Math.round(Math.random()*range-range/2)
		if(index < 0){
			index = notes.length-1
		}
		index %= notes.length
	}
}, 400)

/*setInterval(function(){
	if(Math.random() > 0.4 && !mute){
		note.play({ pitch : notes2[index], panning: Math.random()-.5, volume:0.5 })
		var range = 3.5
		index += Math.round(Math.random()*range-range/2)
		if(index < 0){
			index = notes.length-1
		}
		index %= notes.length
	}
}, 200)*/