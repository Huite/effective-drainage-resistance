class ColorBarLegend {
  constructor(args={}){
    this.X = 0;
    this.Y = 0;
    this.barwidth = 15;
    this.barheight = 200;
    this.valuemin = 0;
    this.valuemax = 1;
    this.mdiv = 5;
    this.KonvaNode = new Konva.Group({
      x: 0,
      y: 0,
      draggable: true
    });
    this.setvalues(args);
  };
  setvalues(args){

    if (typeof args.X !== 'undefined') {
      this.X = args.X;
    };
    if (typeof args.Y !== 'undefined') {
      this.Y = args.Y;
    };
    if (typeof args.barwidth !== 'undefined') {
      this.barwidth = args.barwidth;
    };
    if (typeof args.barheight !== 'undefined') {
      this.barheight = args.barheight;
    };
    if (typeof args.minvalue !== 'undefined') {
      this.minvalue = args.minvalue;
    };
    if (typeof args.maxvalue !== 'undefined') {
      this.maxvalue = args.maxvalue;
    };
    if (typeof args.tickvalues !== 'undefined') {
      this.tickvalues = args.tickvalues;
    } else {
      this.tickvalues = calcticks(this.minvalue, this.maxvalue, this.mdiv);
    }
    
    this.KonvaNode.destroyChildren()

    var colorbar = new Konva.Rect({
      x: this.X,
      y: this.Y,
      width: this.barwidth,
      height: this.barheight,
      fillLinearGradientStartPoint: {
        x: 0,
        y: this.barheight
      },
      fillLinearGradientEndPoint: {
        x: 0,
        y: 0
      },
      fillLinearGradientColorStops: [0, fillcolorfun(0), 0.05, fillcolorfun(0.05),
        0.1, fillcolorfun(0.1), 0.15, fillcolorfun(0.15),
        0.2, fillcolorfun(0.2), 0.25, fillcolorfun(0.25),
        0.3, fillcolorfun(0.3), 0.35, fillcolorfun(0.35),
        0.4, fillcolorfun(0.4), 0.45, fillcolorfun(0.35),
        0.5, fillcolorfun(0.5), 0.55, fillcolorfun(0.55),
        0.6, fillcolorfun(0.6), 0.65, fillcolorfun(0.65),
        0.7, fillcolorfun(0.7), 0.75, fillcolorfun(0.75),
        0.8, fillcolorfun(0.8), 0.85, fillcolorfun(0.85),
        0.9, fillcolorfun(0.9), 0.95, fillcolorfun(0.95),
        1, fillcolorfun(1)
      ],
      stroke: 'black',
      strokeWidth: 3
    });
    var valueaxis = new Axis({
      minx: this.X+this.barwidth,
      maxx: this.X+this.barwidth,
      maxy: this.Y,
      miny: this.Y+this.barheight,
      tickvalues: this.tickvalues,
      textorientation: 1,
      minvalue: this.minvalue,
      maxvalue: this.maxvalue,
      fontsize: 16,
      linecolor: "black"
    });
    this.KonvaNode.add(valueaxis.Konva());
    this.KonvaNode.add(colorbar);
  };
  Konva() {
    return this.KonvaNode;
  }
}
