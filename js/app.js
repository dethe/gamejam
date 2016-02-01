var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var GRIDSIZE = 25;
var PI=Math.PI, cos=Math.cos, sin=Math.sin, abs=Math.abs, rad=Snap.rad;

var selected; //"selected"
var running = false;

var shake = new Howl({
  urls: ['audio/piece_move_01.mp3', 'audio/piece_move_01.mp3'],
  volume: 0.5
});

var levelend = new Howl({
  urls: ['audio/level_end.mp3', 'audio/level_end.wav'],
  volume: 0.5
});

var levelstart = new Howl({
  urls: ['audio/level_start_01.mp3', 'audio/level_start_01.wav'],
  volume: 0.5
});

var clunk = new Howl({
  urls: ['audio/piece_place.mp3', 'audio/piece_place.wav'],
  volume: 0.5
});

// Utilities

function randint(max){
    return Math.floor(Math.random() * max);
}

function randcolor(){
    return Snap.hsl(randint(360), 50, 50);
}

function choice(list){
    return list[randint(list.length)];
}

// properly delete from a list
function deleteItem(list, item) {
    var idx = list.indexOf(item);
    if (idx > -1) {
        list.splice(idx, 1);
    }
    return item;
}

function distance(x1, y1, x2, y2){
    var val = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
    return val;
}

function getGroup(id){
    return [].slice.call(Snap.selectAll('path')).filter(function(e){
        return e.attr('group') === id;
    });

}

function rotatePoint(x, y, angle){
    var s = sin(angle);
    var c = cos(angle);
    var nx = x * c - y * s;
    var ny = x * s + y * c;
    return [nx, ny];
}

function linePoints(e){
    var x1=e.num('cx'), y1=e.num('cy'), x2=e.num('x2')+x1, y2=e.num('y2')+y1;
    return [[x1, y1], [x2, y2]];
}

function pointsAdjacent(p1, p2){
    return (abs(p1[0] - p2[0]) < 5) && (abs(p1[1] - p2[1]) < 5);
}

function endpointsMatch(line1, line2){
    var l1 = linePoints(line1);
    var l2 = linePoints(line2);
    return pointsAdjacent(l1[0], l2[0]) || pointsAdjacent(l1[0], l2[1]) || pointsAdjacent(l1[1], l2[0]) || pointsAdjacent(l1[1], l2[0]);
}

function randomId() {
    // Based on Paul Irish's random hex color:http://www.paulirish.com/2009/random-hex-color-code-snippets/
    // Theoretically could return non-unique values, not going to let that keep me up at night
    return 'k' + Math.floor(Math.random() * 16777215).toString(16); // 'k' because ids have to start with a letter
}

Snap.plugin(function (Snap, Element, Paper, global, Fragment) {
    var prevdx, prevdy;
    function onDrag(dx, dy, x, y, evt){
        if(!running){
            if(evt.shiftKey){
                this.moveTo(Math.round((x-window.innerWidth/2)/25)*25, Math.round((y-window.innerHeight/2)/25)*25);
            }else{
                this.move(dx - prevdx, dy - prevdy);
            }
            prevdx = dx;
            prevdy = dy;
        }
    }

    function onDragStart(x, y, evt){
        var self = this;
        this.adjacent.forEach(function(e){
            deleteItem(e.adjacent, self);
        });
        this.adjacent = [];
        if(!running){
            shake.play()
            prevdx = prevdy = 0;
            if (evt.metaKey){
                this.insertBefore(this.clone().setup());
            }
        }
    }

    function onDragEnd(evt){
        if(!running){
            clunk.play()
            this.snapToGrid();
            this.joinGroup(randcolor());
            selected = this;
        }
    }

    var pathFns = {

        asterisk: function(cx, cy, r, num){
            var path = [];
            var theta = PI * 2 / num;
            for (var i = 0; i < num; i++){
                path.push('M', cx, cy,
                          cos(theta * i) * r + cx,
                          sin(theta * i) * r + cy);
            }
            return path.join(' ');
        },
        polygon: function(cx, cy, r, num){
            var path = ['M'];
            var theta = PI * 2 / num;
            for (var i = 0; i < num; i++){
                path.push(cos(theta * i) * r + cx,
                          sin(theta * i) * r + cy);
            }
            path.push('Z');
            return path.join(' ');
        },
        polygonPlus: function(cx, cy, r, num){
            var plus = pathFns.asterisk(cx, cy, r/2, 4);
            return pathFns.polygon(cx,cy,r,num).concat(plus);
        },
        polygonMinus: function(cx, cy, r, num){
            var plus = pathFns.asterisk(cx, cy, r/2, 2);
            return pathFns.polygon(cx, cy, r, num).concat(plus);
        },
        crescent: function(cx, cy, r, num){
            var path = ['M'];
            var theta = PI * 2 / num;
            for (var i = 0; i < num; i++){
                if (i < num/2){
                    path.push(cos(theta * i) *  r + cx,
                              sin(theta * i) * r + cy);
                }else{
                    path.push(cos(theta * i) * r + cx,
                              sin(theta * i)/2 * -r + cy);
                }
            }
            path.push('Z');
            return path.join(' ');
        },
        star: function(cx, cy, r, num){
            // num should be odd and 5 or greater
            var skip = (num - 1) / 2;
            var theta = PI * 2 / num * skip;
            var path = ['M'];
            for (var i = 0; i < num; i++){
                path.push(cos(theta * i) * r + cx,
                          sin(theta * i) * r + cy);
            }
            path.push('Z');
            return path.join(' ');
        },
        spiral: function(cx, cy, r, num, len){
            var theta = PI * 2 / num;
            var dR = r / (num * len);
            var path = ['M'];
            for (var i = 0; i < (num * len); i++){
                path.push(cos(theta * i) * (dR * i) + cx,
                          sin(theta * i) * (dR * i) + cy);
            }
            return path.join(' ');
        },
        line: function(x1, y1, x2, y2){
            return ['M', x1, y1, x2, y2].join(' ');
        },
        coffin: function(cx, cy, r){
            var degs = [70, 110, 215, 250, 290, 325];
            var path = ['M'];
            degs.forEach(function(d){
                path.push(cos(rad(d)) * r + cx,
                          sin(rad(d)) * r + cy);
            });
            path.push('Z');
            return path.join(' ');
        },
        trigram: function(cx, cy, r, h){
        },
        leaf: function(cx, cy, r){
        },
        heart: function(cx, cy, r){
        }
    }

    // New path handlers

    Paper.prototype.asterisk = function(cx, cy, r, num){
        return this.path(pathFns.asterisk(cx, cy, r, num))
            .attr({cx: cx, cy: cy, type: 'asterisk'}).setup();
    };

    Paper.prototype.rpolygon = function(cx, cy, r, num){
        return this.path(pathFns.polygon(cx, cy, r, num))
            .attr({cx: cx, cy: cy, type: 'polygon'}).setup();
    };

    Paper.prototype.polyplus = function(cx, cy, r, num){
        return this.path(pathFns.polygonPlus(cx, cy, r, num))
            .attr({cx: cx, cy: cy, type: 'polygonPlus'}).setup();
    };

    Paper.prototype.polyminus = function(cx, cy, r, num){
        return this.path(pathFns.polygonMinus(cx, cy, r, num))
            .attr({cx: cx, cy: cy, type: 'polygonMinus'}).setup();
    };

    Paper.prototype.crescent = function(cx, cy, r, num){
        return this.path(pathFns.crescent(cx, cy, r, num))
            .attr({cx: cx, cy: cy, type: 'crescent'}).setup();
    };

    Paper.prototype.star = function(cx, cy, r, num){
        return this.path(pathFns.star(cx, cy, r, num))
            .attr({cx: cx, cy: cy, type: 'star'}).setup();
    };

    Paper.prototype.spiral = function(cx, cy, r, num, len){
        return this.path(pathFns.spiral(cx, cy, r, num, len))
            .attr({cx: cx, cy: cy, type: 'spiral'}).setup();
    };

    Paper.prototype.line = function(x1, y1, dx, dy){
        var x2 = x1+dx, y2 = y1+dy;
        var cx = (x1 + x2)/2, cy = (y1 + y2)/2;
        return this.path(pathFns.line(x1, y1, x2, y2))
            .attr({cx: cx, cy: cy, type: 'line'}).setup();
    };

    Paper.prototype.coffin = function(cx, cy, r){
        return this.path(pathFns.spiral(cx, cy, r))
            .attr({cx: cx, cy: cy, type: 'coffin'}).setup();
    };

    // Element extensions

    Element.prototype.setup = function(){
        this.adjacent = [];
        return this.drag(onDrag, onDragStart, onDragEnd);
    };

    Element.prototype.num = function(name){
        //console.log(name+': '+this.attr(name))
        return Number(this.attr(name));
    };

    Element.prototype.rad = function(name){
        return rad(this.num(name));
    };

    Element.prototype.bool = function(name, val){
        if (typeof(val) === 'undefined'){
            return this.attr(name) === 'true';
        }else{
            if (val){
                this.attr(name, 'true');
            }else{
                this.node.removeAttribute(name);
            }
        }
        return this;
    };

    Element.prototype.ease = function(name){
        return mina[this.attr(name)] || mina.easeinout; // get easing
    };

    Element.prototype.updatePath(fn){
        return this.attr('d', Snap.parsePathString(this.attr('d')).map(function(seg){
            if (seg[0] === 'Z'){
                return seg[0];
            }
            var p = fn(seg[1], seg[2]);
            if (seg[0] === 'M'){
                return [seg[0], p[0], p[1]].join(' ');
            }
            return p.join(' ');
        }).join(' '));
    }

    Element.prototype.moveTo = function(cx, cy){
        var dx = this.num('cx') - cx, dy = this.num('cy') - cy;
        this.attr({cx: cx, cy: cy});
        this.updatePath(function(x,y){
            return [x+dx, y+dy];
        });
    };

    Element.prototype.move = function(dx, dy){
        this.attr({cx: '+=' + dx, cy: '+=' + dy});
        this.updatePath(function(x,y){
            return [x+dx, y+dy];
        });
    };

    Element.prototype.rotate = function(deg){
        var cx = this.num('cx'), cy = this.num('cy');
        var angle = rad(deg);
        this.updatePath(function(x,y){
            var pt = rotatePoint(x-cx, y-cy, angle);
            return [pt[0]+cx, pt[1]+cy];
        });
    };

    Element.prototype.flipH = function(){
        var cx = this.num('cx');
        this.updatePath(function(x,y){
            return [(x - cx) * -1 + cx, y];
        });
    };

    Element.prototype.flipV = function(){
        var cy = this.num('cy');
        this.updatePath(function(x,y){
            return [x, (y - cy) * -1 + cy];
        });
    };

    Element.prototype.snapToGrid = function(){
        var x = this.num('cx'), y = this.num('cy');
        x = Math.round(x/GRIDSIZE)*GRIDSIZE
        y = Math.round(y/GRIDSIZE)*GRIDSIZE
        this.moveTo(x,y);
    };

    Element.prototype.pulse = function(){
        var dur=this.num('dur') || 1000, color=this.attr('color') || '#00F';
        var easing=this.ease('ease');
        this.animate({/*stroke: color,*/ /*strokeWidth: 7*/}, dur, easing, this.unPulse)
    };

    Element.prototype.unPulse = function(){
        var dur=this.num('dur') || 1000, color='#000';
        var easing=this.ease('ease');
        this.animate({/*stroke: color,*/ /*strokeWidth: 5*/}, dur, easing, this.endPulse);
    };

    Element.prototype.endPulse = function(){
    };

    Element.prototype.intersects = function(e){
        var selfType = this.attr('type');
        var otherType = e.attr('type');
        if (selfType === 'line' && otherType === 'line'){
            return (!! Snap.path.intersection(this, e).length) || endpointsMatch(this, e);
        }else if (selfType === 'line'){
            var x1=this.num('cx'), x2=this.num('x2')+x1, y1=this.num('cy'), y2=this.num('y2')+y1;
            var ex=e.num('cx'), ey=e.num('cy');
            return ((distance(x1, y1, ex, ey) < 30) ||
                    (distance(x2, y2, ex, ey) < 30));
        }else if (otherType === 'line'){
            var x1=e.num('cx'), x2=e.num('x2')+x1, y1=e.num('cy'), y2=e.num('y2')+y1;
            var tx=this.num('cx'), ty=this.num('cy');
            return ((distance(x1, y1, tx, ty) < 30) ||
                    (distance(x2, y2, tx, ty) < 30));
        }else{
            return (distance(this.num('cx'), this.num('cy'), e.num('cx'), e.num('cy')) < 40);
        }
    };

    Element.prototype.joinGroup = function(color){
        var self = this;
        //self.attr('stroke', color);
        self.attr('group', '');
        var group = null;
        var connected = [].slice.call(Snap.selectAll('path')).filter(function(e){
            if (self === e){
                return false;
            }
            return self.intersects(e);
        });
        this.adjacent = connected;
        connected.forEach(function(e){
            e.adjacent.push(self);
            if (!group){
                if (e.attr('group')){
                    group = e.attr('group');
                    self.attr('group', group);
                    //color = e.attr('stroke');
                    //self.attr('stroke', color);
                }else{
                    group = randomId();
                    self.attr('group', group);
                    e.attr('group', group);
                    //e.attr('stroke', color);
                }
            }else{
                if (e.attr('group') === group){
                    // do nothing
                }else if (!e.attr('group')){
                    e.attr('group', group);
                    e.attr('stroke', color);
                }else{
                    // adopt group
                    getGroup(e.attr('group')).forEach(function(e){
                        e.attr('group', group);
                        e.attr('stroke', color);
                    });

                }
            }
        });
    };


});

var ATTRS = {
    fill: 'transparent',
    stroke: '#000',
    strokeWidth: 5,
    color: '#00F', // for animation
}
