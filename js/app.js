var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var pathFns = {
    diamond: function(elem){
        var cx=elem.num('cx'), cy=elem.num('cy'), w=elem.num('w'), h=elem.num('h');
        var left=cx-w/2, top=cy-h/2, right=cx+w/2, bottom=cy+h/2;
        return ['M', cx, top, right, cy, cx, bottom, left, cy, 'Z'].join(' ');
    },
    asterisk: function(elem){
        var cx=elem.num('cx'), cy=elem.num('cy'), r=elem.num('r'), num=elem.num('num');
        var path = [];
        var theta = Math.PI * 2 / num;
        for (var i = 0; i < num; i++){
            path.push('M', cx, cy, Math.cos(theta * i) * r + cx, Math.sin(theta * i) * r + cy);
        }
        return path.join(' ');
    },
    polygon: function(elem){
        var cx=elem.num('cx'), cy=elem.num('cy'), r=elem.num('r'), num=elem.num('num');
        var path = ['M'];
        var theta = Math.PI * 2 / num;
        for (var i = 0; i < num; i++){
            path.push(Math.cos(theta * i) * r + cx, Math.sin(theta * i) * r + cy);
        }
        path.push('Z');
        return path.join(' ');
    }
}


Snap.plugin(function (Snap, Element, Paper, global, Fragment) {

    Paper.prototype.diamond = function (cx, cy, w, h) {
      var elem = this.path();
      elem.attr('w', w).attr('h', h).attr('type', 'diamond');
      return elem.moveTo(cx,cy);
    };

    Paper.prototype.asterisk = function(cx, cy, r, num){
        var elem = this.path();
        elem.attr('r', r).attr('num', num).attr('type', 'asterisk');
        return elem.moveTo(cx, cy);
    };

    Paper.prototype.regularPolygon = function(cx, cy, r, num){
        var elem = this.path();
        elem.attr('r', r).attr('num', num).attr('type', 'polygon');
        return elem.moveTo(cx, cy);
    };

    Element.prototype.num = function(name){
        return Number(this.attr(name));
    };

    Element.prototype.moveTo = function(cx, cy){
        this.attr('cx', cx).attr('cy', cy);
        return this.attr('d', pathFns[this.attr('type')](this));
    };

    Element.prototype.moveBy = function(dx, dy){
        this.attr('cx', this.num('cx') + dx).attr('cy', this.num('cy') + dy);
        return this.attr('d', pathFns[this.attr('type')](this));
    };
});

var ATTRS = {
    fill: '#FFF',
    stroke: '#000',
    strokeWidth: 5
}
var s = Snap(WIDTH, HEIGHT);

var circle = s.circle(50,50,25).attr(ATTRS);
var diamond = s.diamond(50, 125, 50, 50).attr(ATTRS);
var asterisk1 = s.asterisk(50, 200, 25, 5).attr(ATTRS);
var asterisk2 = s.asterisk(50, 275, 25, 6).attr(ATTRS);
var asterisk3 = s.asterisk(50, 350, 25, 8).attr(ATTRS);

var poly3 = s.regularPolygon(125, 50, 25, 3).attr(ATTRS);
var poly4 = s.regularPolygon(125, 125, 25, 4).attr(ATTRS);
var poly5 = s.regularPolygon(125, 200, 25, 5).attr(ATTRS);
var poly6 = s.regularPolygon(125, 275, 25, 6).attr(ATTRS);
var poly50 = s.regularPolygon(125, 350, 25, 50).attr(ATTRS);

