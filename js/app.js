var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var GRIDSIZE = 25;
var PI=Math.PI, cos=Math.cos, sin=Math.sin, abs=Math.abs, rad=Snap.rad;

var selected; //"selected"
var running = false;

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

function getGroup(id){
    return [].slice.call(Snap.selectAll('path')).filter(function(e){
        return e.attr('group') === id;
    });

}

function rotatePoint(px, py, angle){
    var s = sin(angle);
    var c = cos(angle);
    var x = px * c - py * s;
    var y = px * s + py * c;
    return [x, y];
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
        if(!running){
            prevdx = prevdy = 0;
            if (evt.metaKey){
                this.insertBefore(this.clone().setup());
            }
        }
    }

    function onDragEnd(evt){
        if(!running){
            this.snapToGrid();
            this.joinGroup(randcolor());
            selected = this;
        }
    }

    var pathFns = {

        asterisk: function(e){
            var cx=e.num('cx'), cy=e.num('cy'), r=e.num('r'), num=e.num('num');
            var flipH = e.bool('flipH') ? -1 : +1, flipV = e.bool('flipV') ? -1 : +1;
            var rot=e.rad('rot') * flipH * flipV;
            var path = [];
            var theta = PI * 2 / num;
            for (var i = 0; i < num; i++){
                path.push('M', cx, cy,
                          cos(theta * i + rot) * r * flipH + cx,
                          sin(theta * i + rot) * r  * flipV + cy);
            }
            return path.join(' ');
        },
        polygon: function(e){
            var cx=e.num('cx'), cy=e.num('cy'), r=e.num('r'), num=e.num('num');
            var flipH = e.bool('flipH') ? -1 : +1, flipV = e.bool('flipV') ? -1 : +1;
            var rot=e.rad('rot') * flipH * flipV;
            var path = ['M'];
            var theta = PI * 2 / num;
            for (var i = 0; i < num; i++){
                path.push(cos(theta * i + rot) * r * flipH + cx,
                          sin(theta * i + rot) * r * flipV + cy);
            }
            path.push('Z');
            return path.join(' ');
        },
        star: function(e){
            var cx=e.num('cx'), cy=e.num('cy'), r=e.num('r'), num=e.num('num');
            var flipH = e.bool('flipH') ? -1 : +1, flipV = e.bool('flipV') ? -1 : +1;
            var rot=e.rad('rot') * flipH * flipV;
            // num should be odd and 5 or greater
            var skip = (num - 1) / 2;
            var theta = PI * 2 / num * skip;
            var path = ['M'];
            for (var i = 0; i < num; i++){
                path.push(cos(theta * i + rot) * r * flipH + cx,
                          sin(theta * i + rot) * r * flipV + cy);
            }
            path.push('Z');
            return path.join(' ');
        },
        spiral: function(e){
            var cx=e.num('cx'), cy=e.num('cy'), r=e.num('r'), num=e.num('num'), len=e.num('len');
            var theta = PI * 2 / num;
            var flipH = e.bool('flipH') ? -1 : +1, flipV = e.bool('flipV') ? -1 : +1;
            var rot=e.rad('rot') * flipH * flipV;
            var dR = r / (num * len);
            var path = ['M'];
            for (var i = 0; i < (num * len); i++){
                path.push(cos(theta * i + rot) * (dR * i) * flipH + cx,
                          sin(theta * i + rot) * (dR * i) * flipV + cy);
            }
            return path.join(' ');
        },
        line: function(e){
            var x1=e.num('cx'), y1=e.num('cy'), x2=e.num('x2')+x1, y2=e.num('y2')+y1;
            var flipH = e.bool('flipH') ? -1 : +1, flipV = e.bool('flipV') ? -1 : +1;
            var rot=e.rad('rot') * flipH * flipV;
            var cx = (x1+x2)/2, cy=(y1+y2)/2;
            var p1 = rotatePoint(x1-cx, y1-cy, rot);
            var p2 = rotatePoint(x2-cx, y2-cy, rot);
            return ['M', p1[0] * flipH + cx, p1[1] * flipV + cy,
                         p2[0] * flipH + cx, p2[1] * flipV + cy].join(' ');
        },
        coffin: function(cx, cy, r){
        },
        crescent: function(cx, cy, r){
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
        return this.path()
            .attr('r', r).attr('num', num).attr('type', 'asterisk')
            .moveTo(cx, cy).setup();
    };

    Paper.prototype.rpolygon = function(cx, cy, r, num){
        return this.path()
            .attr('r', r).attr('num', num).attr('type', 'polygon')
            .moveTo(cx, cy).setup();
    };

    Paper.prototype.star = function(cx, cy, r, num){
        return this.path()
            .attr('r', r).attr('num', num).attr('type', 'star')
            .moveTo(cx, cy).setup();
    };

    Paper.prototype.spiral = function(cx, cy, r, num, len){
        return this.path()
            .attr('r', r).attr('num', num).attr('len', len).attr('type', 'spiral')
            .moveTo(cx, cy).setup();
    };

    Paper.prototype.line = function(cx, cy, x2, y2){
        return this.path()
            .attr('x2', x2).attr('y2', y2).attr('type', 'line')
            .moveTo(cx, cy).setup();
    };

    // Element extensions

    Element.prototype.setup = function(){
        this.adjacent = [];
        return this.drag(onDrag, onDragStart, onDragEnd);
    };

    Element.prototype.num = function(name){
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

    Element.prototype.update = function(b){
        if(b){
            return this.animate({d: pathFns[this.attr('type')](this)}, 100, this.ease(), this.update)
        }
        return this.attr('d', pathFns[this.attr('type')](this));
    }

    Element.prototype.moveTo = function(cx, cy){
        return this.attr('cx', cx).attr('cy', cy).update();
    };

    Element.prototype.move = function(dx, dy){
        return this.attr('cx', this.num('cx') + dx).attr('cy', this.num('cy') + dy).update();
    };

    Element.prototype.rotateTo = function(deg){
        return this.attr('rot', deg).update();
    };

    Element.prototype.rotate = function(deg){
        return this.attr('rot', this.num('rot') + deg).update(true);
    };

    Element.prototype.flipH = function(){
        if (this.node.hasAttribute('flipH')){
            this.node.removeAttribute('flipH');
        }else{
            this.attr('flipH', true);
        }
        return this.update(true);
    };

    Element.prototype.flipV = function(){
        if (this.node.hasAttribute('flipV')){
            this.node.removeAttribute('flipV');
        }else{
            this.attr('flipV', true);
        }
        return this.update(true);
    };

    Element.prototype.snapToGrid = function(){
        var x = this.num('cx'), y = this.num('cy');
        x = Math.round(x/GRIDSIZE)*GRIDSIZE
        y = Math.round(y/GRIDSIZE)*GRIDSIZE
        /*var dX = x % GRIDSIZE;
        if (dX < GRIDSIZE / 2){
            x -= dX;
        }else{
            x += GRIDSIZE - dX;
        }
        var dY = y % GRIDSIZE;
        if (dY < GRIDSIZE / 2){
            y -= dY;
        }else{
            y += GRIDSIZE - dY;
        }*/
        this.moveTo(x,y);
    };

    Element.prototype.pulse = function(){
        var dur=this.num('dur') || 1000, color=this.attr('color') || '#00F';
        var easing=this.ease('ease');
        this.animate({stroke: color, strokeWidth: 7}, dur, easing, this.unPulse)
    };

    Element.prototype.unPulse = function(){
        var dur=this.num('dur') || 1000, color='#000';
        var easing=this.ease('ease');
        this.animate({stroke: color, strokeWidth: 5}, dur, easing, this.endPulse);
    };

    Element.prototype.endPulse = function(){
    };

    function distance(x1, y1, x2, y2){
        var val = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
        return val;
    }

    Element.prototype.intersects = function(e){
        var selfType = this.attr('type');
        var otherType = e.attr('type');
        if (selfType === 'line' && otherType === 'line'){
            return !! Snap.path.intersection(this, e).length;
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
        self.attr('stroke', color);
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
                    color = e.attr('stroke');
                    self.attr('stroke', color);
                }else{
                    group = randomId();
                    self.attr('group', group);
                    e.attr('group', group);
                    e.attr('stroke', color);
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
