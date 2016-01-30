var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var PI = Math.PI, cos = Math.cos, sin = Math.sin, rad=Snap.rad;

Snap.plugin(function (Snap, Element, Paper, global, Fragment) {

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
        }
    }

    // New path handlers

    Paper.prototype.asterisk = function(cx, cy, r, num){
        return this.path()
            .attr('r', r).attr('num', num).attr('type', 'asterisk')
            .moveTo(cx, cy);
    };

    Paper.prototype.rpolygon = function(cx, cy, r, num){
        return this.path()
            .attr('r', r).attr('num', num).attr('type', 'polygon')
            .moveTo(cx, cy);
    };

    Paper.prototype.star = function(cx, cy, r, num){
        return this.path()
            .attr('r', r).attr('num', num).attr('type', 'star')
            .moveTo(cx, cy);
    };

    // Element extensions

    Element.prototype.num = function(name){
        return Number(this.attr(name));
    };

    Element.prototype.rad = function(name){
        return rad(this.num(name));
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
});

var ATTRS = {
    fill: '#FFF',
    stroke: '#000',
    strokeWidth: 5
}
var s = Snap(WIDTH, HEIGHT);

var circle = s.rpolygon(50,50,25, 20).attr(ATTRS);
var diamond = s.rpolygon(50, 125, 25, 4).attr(ATTRS);
var asterisk1 = s.asterisk(50, 200, 25, 5).attr(ATTRS);
var asterisk2 = s.asterisk(50, 275, 25, 6).attr(ATTRS);
var asterisk3 = s.asterisk(50, 350, 25, 8).attr(ATTRS);

var poly3 = s.rpolygon(125, 50, 25, 3).attr(ATTRS);
var poly4 = s.rpolygon(125, 125, 25, 4).attr(ATTRS);
var poly5 = s.rpolygon(125, 200, 25, 5).attr(ATTRS);
var poly6 = s.rpolygon(125, 275, 25, 6).attr(ATTRS);
var star5 = s.star(125, 350, 25, 5).attr(ATTRS);

var star7 = s.star(200, 50, 25, 7).attr(ATTRS);
