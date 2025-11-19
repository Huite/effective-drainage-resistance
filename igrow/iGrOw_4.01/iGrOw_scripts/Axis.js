//
// make axes
//

function nicenum(x, round) {
  var e = Math.floor(Math.log10(x));
  var f = x / Math.pow(10, e);
  var nf;
  if (round) {
    if (f < 1.5) {
      nf = 1;
    } else if (f < 3) {
      nf = 2;
    } else if (f < 7) {
      nf = 5;
    } else {
      nf = 10;
    }
  } else {
    if (f <= 1) {
      nf = 1;
    } else if (f <= 2) {
      nf = 2;
    } else if (f <= 5) {
      nf = 5;
    } else {
      nf = 10;
    }
  }
  return (nf * Math.pow(10, e));
};

function calcticks(minvalue, maxvalue, numdiv) {
  if (minvalue > maxvalue) {
    var tempvalue = minvalue;
    minvalue = maxvalue;
    maxvalue = tempvalue;
  }
  var valuerange = maxvalue - minvalue;
  var valuestep = nicenum(valuerange / (numdiv - 1), true);

  var tickmin = Math.ceil(minvalue / valuestep) * valuestep;
  var tickmax = Math.floor(maxvalue / valuestep) * valuestep;

  var tickvalues = [];
  for (var value = tickmin; value < tickmax + valuestep / 4; value += valuestep) {
    var e = 4;
    if (value != 0) {
      e = Math.floor(Math.log10(Math.abs(value))) + 4;
    }
    var tick = (Math.round(value * Math.pow(10, e)) / Math.pow(10, e));
    tickvalues.push(tick);
  }
  return tickvalues;
}

class Axis {
  constructor(args = {}) {
    this.KonvaNode = new Konva.Group({
      x: 0,
      y: 0,
      draggable: false
    });
    this.mdiv = 5;
    this.minvalue = 0;
    this.maxvalue = 1;
    this.minx = 100;
    this.maxx = 100;
    this.miny = 150;
    this.maxy = 150;
    this.ticklength = 6;
    this.fontsize = 18;
    this.textorientation = 0;
    this.linecolor = '#a5a3a3';
    this.setvalues(args);
  };
  setvalues(args) {
    if (typeof args.mdiv !== 'undefined') {
      this.mdiv = args.mdiv;
    };
    if (typeof args.minvalue !== 'undefined') {
      this.minvalue = args.minvalue;
    };
    if (typeof args.maxvalue !== 'undefined') {
      this.maxvalue = args.maxvalue;
    };
    if (typeof args.minx !== 'undefined') {
      this.minx = args.minx;
    };
    if (typeof args.maxx !== 'undefined') {
      this.maxx = args.maxx;
    };
    if (typeof args.miny !== 'undefined') {
      this.miny = args.miny;
    };
    if (typeof args.maxy !== 'undefined') {
      this.maxy = args.maxy;
    };
    if (typeof args.ticklength !== 'undefined') {
      this.ticklength = args.ticklength;
    };
    if (typeof args.fontsize !== 'undefined') {
      this.fontsize = args.fontsize;
    };
    if (typeof args.textorientation !== 'undefined') {
      this.textorientation = args.textorientation;
    };
    if (typeof args.linecolor !== 'undefined') {
      this.linecolor = args.linecolor;
    };
    if (typeof args.tickvalues !== 'undefined') {
      this.tickvalues = args.tickvalues;
    } else {
      this.tickvalues = calcticks(this.minvalue, this.maxvalue, this.mdiv);
    }

    this.KonvaNode.destroyChildren()

    var diffx = this.maxx - this.minx;
    var diffy = this.maxy - this.miny;
    var length = Math.sqrt(diffx * diffx + diffy * diffy);
    var dirx = diffx / length;
    var diry = diffy / length;
    var ortox = -diry;
    var ortoy = dirx;
    var angle = Math.atan2(diffy, diffx) * 180 / Math.PI;

    var tickx = this.ticklength * ortox;
    var ticky = this.ticklength * ortoy;


    var AxisLine = new Konva.Line({
      points: [this.minx, this.miny, this.maxx, this.maxy],
      stroke: this.linecolor,
      strokeWidth: 2,
      lineCap: 'round',
      lineJoin: 'round',
    });
    this.KonvaNode.add(AxisLine);

    var valuerange = this.maxvalue - this.minvalue;

    function getWidthOfText(txt, fontname, fontsize) {
      if (getWidthOfText.c === undefined) {
        getWidthOfText.c = document.createElement('canvas');
        getWidthOfText.ctx = getWidthOfText.c.getContext('2d');
      }
      getWidthOfText.ctx.font = fontsize + ' ' + fontname;
      return getWidthOfText.ctx.measureText(txt).width;
    }



    for (var i = 0; i < this.tickvalues.length; i++) {
      var value = this.tickvalues[i];
      var f = (value - this.minvalue) / valuerange;
      var atx = (1 - f) * this.minx + f * this.maxx;
      var aty = (1 - f) * this.miny + f * this.maxy;

      var newtickmark = new Konva.Line({
        points: [atx, aty, atx + tickx, aty + ticky],
        stroke: this.linecolor
      });
      this.KonvaNode.add(newtickmark);


      var numstr = value.toString();

      var lstr = 1.7 * getWidthOfText(numstr, 'Calibri', 18);

      var stratx;
      var straty;
      var textangle = angle;
      if (this.textorientation == 0) {
        stratx = atx + this.ticklength * ortox - lstr / 2 * ortoy;
        straty = aty + this.ticklength * ortoy + lstr / 2 * ortox;
      } else if (this.textorientation == 1) {
        textangle = angle + 90;
        stratx = atx + this.ticklength * ortox + 24 / 3 * ortoy;
        straty = aty + this.ticklength * ortoy - 24 / 3 * ortox;

      } else if (this.textorientation == 2) {
        textangle = angle + 180;
        stratx = atx + (this.ticklength + 24 / 2) * ortox + lstr / 2 * ortoy;
        straty = aty + (this.ticklength + 24 / 2) * ortoy - lstr / 2 * ortox;
      } else if (this.textorientation == 3) {
        textangle = angle + 270;
        stratx = atx + (this.ticklength + lstr) * ortox - 24 / 3 * ortoy;
        straty = aty + (this.ticklength + lstr) * ortoy + 24 / 3 * ortox;
      }



      var newtickvalue = new Konva.Text({
        x: stratx,
        y: straty,
        text: numstr,
        fontSize: this.fontsize,
        fontFamily: 'Calibri',
        fill: 'black',
        width: lstr,
        height: this.textboxheight,
        align: 'center',
        rotation: textangle
      });
      this.KonvaNode.add(newtickvalue);
    }
  }
  Konva() {
    return this.KonvaNode;
  }
}
