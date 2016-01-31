var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var GRIDSIZE = 25;
var PI=Math.PI, cos=Math.cos, sin=Math.sin, abs=Math.abs, rad=Snap.rad;

var selected; //"selected"

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

function randomId() {
    // Based on Paul Irish's random hex color:http://www.paulirish.com/2009/random-hex-color-code-snippets/
    // Theoretically could return non-unique values, not going to let that keep me up at night
    return 'k' + Math.floor(Math.random() * 16777215).toString(16); // 'k' because ids have to start with a letter
}

Snap.plugin(function (Snap, Element, Paper, global, Fragment) {
    var prevdx, prevdy;
    function onDrag(dx, dy, x, y, evt){
        if(evt.shiftKey){
            this.moveTo(Math.floor((x-window.innerWidth/2)/25)*25, Math.floor((y-window.innerHeight/2)/25)*25);
        }else{
            this.move(dx - prevdx, dy - prevdy);
        }
        prevdx = dx;
        prevdy = dy;
    }

    function onDragStart(x, y, evt){
        prevdx = prevdy = 0;
        if (evt.metaKey){
            this.insertBefore(this.clone().setup());
        }
    }

    function onDragEnd(evt){
        this.snapToGrid();
        this.joinGroup(randcolor());
    }

    var pathFns = {

        asterisk: function(e){
            var cx=e.num('cx'), cy=e.num('cy'), r=e.num('r'), num=e.num('num'), rot=e.rad('rot');
            var path = [];
            var theta = PI * 2 / num;
            for (var i = 0; i < num; i++){
                path.push('M', cx, cy, cos(theta * i + rot) * r + cx, sin(theta * i + rot) * r + cy);
            }
            return path.join(' ');
        },
        polygon: function(e){
            var cx=e.num('cx'), cy=e.num('cy'), r=e.num('r'), num=e.num('num'), rot=e.rad('rot');
            var path = ['M'];
            var theta = PI * 2 / num;
            for (var i = 0; i < num; i++){
                path.push(cos(theta * i + rot) * r + cx, sin(theta * i + rot) * r + cy);
            }
            path.push('Z');
            return path.join(' ');
        },
        star: function(e){
            var cx=e.num('cx'), cy=e.num('cy'), r=e.num('r'), num=e.num('num'), rot=e.rad('rot');
            // num should be odd and 5 or greater
            var skip = (num - 1) / 2;
            var theta = PI * 2 / num * skip;
            var path = ['M'];
            for (var i = 0; i < num; i++){
                path.push(cos(theta * i + rot) * r + cx, sin(theta * i + rot) * r + cy);
            }
            path.push('Z');
            return path.join(' ');
        },
        spiral: function(e){
            var cx=e.num('cx'), cy=e.num('cy'), r=e.num('r'), num=e.num('num'), len=e.num('len'), rot=e.rad('rot');
            var theta = PI * 2 / num;
            var flipH = e.bool('flipH') ? -1 : +1, flipV = e.bool('flipV') ? -1 : +1;
            var dR = r / (num * len);
            var path = ['M'];
            for (var i = 0; i < (num * len); i++){
                path.push(cos(theta * i + rot) * (dR * i) * flipH + cx,
                          sin(theta * i + rot) * (dR * i) * flipV + cy);
            }
            return path.join(' ');
        },
        line: function(e){
            var cx=e.num('cx'), cy=e.num('cy'), x2=e.num('x2'), y2=e.num('y2');
            return ['M', cx, cy, cx+x2, cy+y2].join(' ');
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

    Element.prototype.update = function(){
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
        return this.attr('rot', this.num('rot') + deg).update();
    };

    Element.prototype.flipH = function(){
        if (this.node.hasAttribute('flipH')){
            this.node.removeAttribute('flipH');
        }else{
            this.attr('flipH', true);
        }
        return this.update();
    };

    Element.prototype.flipV = function(){
        if (this.node.hasAttribute('flipV')){
            this.node.removeAttribute('flipV');
        }else{
            this.attr('flipV', true);
        }
        return this.update();
    };

    Element.prototype.snapToGrid = function(){
        var x = this.num('cx'), y = this.num('cy');
        var dX = x % GRIDSIZE;
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
        }
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
        connected.forEach(function(e){
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

var s = Snap(WIDTH, HEIGHT);

var circle = s.rpolygon(-150,-150,25, 20).attr(ATTRS);
var star7 = s.star(-150, -75, 25, 7).attr(ATTRS);
var asterisk1 = s.asterisk(-150, 0, 25, 5).attr(ATTRS);
var asterisk2 = s.asterisk(-150, 75, 25, 6).attr(ATTRS);
var asterisk3 = s.asterisk(-150, 150, 25, 8).attr(ATTRS);

var poly3 = s.rpolygon(-75, -150, 25, 3).attr(ATTRS);
var poly4 = s.rpolygon(-75, -75, 25, 4).attr(ATTRS);
var poly5 = s.rpolygon(-75, 0, 25, 5).attr(ATTRS);
var poly6 = s.rpolygon(-75, 75, 25, 6).attr(ATTRS);
var star5 = s.star(-75, 150, 25, 5).attr(ATTRS);

var spiral1 = s.spiral(0, -150, 25, 500, 3).attr(ATTRS);
var spiral2 = s.spiral(0, -75, 25, 20, .75).attr(ATTRS);
var spiral3 = s.spiral(0, 0, 25, 20, .75).flipH().attr(ATTRS);
var spiral4 = s.spiral(0, 75, 25, 20, .75).flipV().attr(ATTRS);
var spiral5 = s.spiral(0, 150, 25, 20, .75).flipH().flipV().attr(ATTRS);

var line1 = s.line(75, -150, 25, 25).attr(ATTRS);
var line2 = s.line(75, -75, 25, 0).attr(ATTRS);
var line3 = s.line(75, 0, 25, -25).attr(ATTRS);
var line4 = s.line(75, 75, 0, 25).attr(ATTRS);


function resize(){
    w = window.innerWidth
    h = window.innerHeight
    s.node.setAttribute('width', w)
    s.node.setAttribute('height', h)
    s.node.setAttribute('viewBox', -w/2+','+(-h/2)+','+w+','+h )
}

window.addEventListener('resize', resize)
resize()

