menuchoice = {
  shownodes: false,
  showcells: false,
  solutionready: false,
  showHtable: false,
  fillcells: false,
  showcontourvalues: false,
  arrowsareflow: false,
  arrowsareflux: false,
  drawflowdirections: false,
  drawfluxes: false,
  cutsmallarrows: true,
  arrowfactor: 0,
  hasnodeinspector: false
};

var mainmenu;
var geomenu;
var physicsmenu;
var numericmenu;
var solutionmenu;

var fmakediscretisation;
var fdosolve;
var faddbaselayer;
var faddcellanalysis;

function setupmenu() {
  var xmenustart = StageWidth * 0.45;
  var ymenustart = StageWidth * 0.3;

  var mainmenu = QuickSettings.create(
    xmenustart,
    ymenustart - 75,
    "menu (min/max: dbl click)"
  );
  solutionmenu = QuickSettings.create(
    xmenustart + 50,
    ymenustart + 50,
    "solution (min/max: dbl click)"
  );
  // solutionmenu.collapse();
  // solutionmenu.hide();
  numericmenu = QuickSettings.create(
    xmenustart + 100,
    ymenustart + 100,
    "num vars (min/max: dbl click)"
  );
  // numericmenu.collapse();
  // numericmenu.hide();
  physicsmenu = QuickSettings.create(
    xmenustart + 150,
    ymenustart + 150,
    "hydro vars (min/max: dbl click)"
  );
  // physicsmenu.collapse();
  // physicsmenu.hide();
  geomenu = QuickSettings.create(
    xmenustart + 200,
    ymenustart + 200,
    "geo (min/max: dbl click)"
  );
  //geomenu.collapse();
  // geomenu.hide();
  mainmenu.addButton("open help",function(value){
    window.open('./iGrOwManual.html', '_blank').focus();
  });
  mainmenu.addBoolean("show all menus", true, function(value) {
    if (value) {
      solutionmenu.show();
      numericmenu.show();
      physicsmenu.show();
      geomenu.show();
      mainmenu.showControl("collapse all menus");
      mainmenu.hideControl("show geo menu");
      mainmenu.hideControl("show numerics menu");
      mainmenu.hideControl("show hydro vars menu");
      mainmenu.hideControl("show solution menu");
    } else {
      geomenu.hide();
      numericmenu.hide();
      physicsmenu.hide();
      solutionmenu.hide();
      mainmenu.hideControl("collapse all menus");
      mainmenu.setValue("show geo menu", false);
      mainmenu.showControl("show geo menu");
      mainmenu.setValue("show numerics menu", false);
      mainmenu.showControl("show numerics menu");
      mainmenu.setValue("show hydro vars menu", false);
      mainmenu.showControl("show hydro vars menu");
      mainmenu.setValue("show solution menu", false);
      mainmenu.showControl("show solution menu");
    }
  });
  mainmenu.addBoolean("collapse all menus", false, function(value) {
    if (value) {
      solutionmenu.collapse();
      numericmenu.collapse();
      physicsmenu.collapse();
      geomenu.collapse();
    } else {
      solutionmenu.expand();
      numericmenu.expand();
      physicsmenu.expand();
      geomenu.expand();
    }
  });
  mainmenu.addBoolean("show geo menu", false, function(value) {
    if (value) {
      geomenu.show();
    } else {
      geomenu.hide();
    }
  });
  mainmenu.hideControl("show geo menu");
  mainmenu.addBoolean("show hydro vars menu", false, function(value) {
    if (value) {
      physicsmenu.show();
    } else {
      physicsmenu.hide();
    }
  });
  mainmenu.hideControl("show hydro vars menu");
  mainmenu.addBoolean("show numerics menu", false, function(value) {
    if (value) {
      numericmenu.show();
    } else {
      numericmenu.hide();
    }
  });
  mainmenu.hideControl("show numerics menu");
  mainmenu.addBoolean("show solution menu", false, function(value) {
    if (value) {
      solutionmenu.show();
    } else {
      solutionmenu.hide();
    }
  });
  mainmenu.hideControl("show solution menu");

  // geomenu = QuickSettings.create(xmenustart+50, ymenustart+50, "geo (min/max: dbl click)");
  //geomenu.collapse();
  // geomenu.hide();
  geomenu.addNumber(
    "iGrOw width (L/2)",
    2,
    5000,
    geo.domainwidth,
    1,
    function(value) {
      if (!inputfieldisalreadytested) {
        if (value < Math.max(geo.drainwidth, 2)) {
          value = Math.max(geo.drainwidth+0.1, 2);
          alert(
            "iGrOw width should be at least 2 and  larger than drainwidth"
          );
          geomenu.setValue("iGrOw width (L/2)", value);
        }
      }
      geo.domainwidth = value;
      curtable[0]["iGrOw width (L/2)"] = value;
      curtable[0]["iGrOw land width"] = geo.domainwidth-geo.drainwidth;
      table.updateData(curtable);
      constructXYdomain();
      constructXYwater();
      repicgeo1();
      resetstage1horaxis();
      stage1.draw();
      repicgeo2();
      stage2.draw();
      needdiscretisation();
    }
  );

  geomenu.addNumber("domain height", 1, 50, geo.domainheight, 0.1, function(
    value
  ) {
    if (!inputfieldisalreadytested) {
      if (value <= physics.drainlevel) {
        value = physics.drainlevel + 0.1;
        alert("domain height must be larger than drain level");
        geomenu.setValue("domain height", value);
      }
    }
    geo.domainheight = value;
    curtable[0]["domain height"] = value;
    table.updateData(curtable);
    constructXYdomain();
    constructXYwater();
    repicgeo1();
    resetstage1veraxis();
    stage1.draw();
    repicgeo2();
    resetstage2veraxis();
    stage2.draw();
    needdiscretisation();
  });

  geomenu.addNumber("drain width (B/2)", 0.1, 50, geo.drainwidth, 0.1, function(
    value
  ) {
    if (!inputfieldisalreadytested) {
      if (value > geo.domainwidth) {
        value = geo.domainwidth-0.1;
        alert("drain width should be  less than iGrOw width");
      }
    }
    geo.drainwidth = value;
    curtable[0]["drain width (B/2)"] = value;
    curtable[0]["iGrOw land width"] = geo.domainwidth-geo.drainwidth;
    table.updateData(curtable);
    stage2xscale = 1;
    resetstage2horaxis();
    constructXYdomain();
    constructXYwater();
    needdiscretisation();
    repicgeo1();
    stage1.draw();
    repicgeo2();
    stage2.draw();
    needdiscretisation();
  });
  geomenu.addNumber("drain bottom", 0.1, 50, geo.drainbottom, 0.1, function(
    value
  ) {
    if (!inputfieldisalreadytested) {
      if (value >= geo.domainheight) {
        value = geo.drainbottom-0.1;
        alert("drain bottom should be  below surface");
      }
      if (value >= physics.drainlevel) {
        value = physics.drainlevel-0.1;
        alert("drain bottom should be below drain level");
      }
    }
    geo.drainbottom = value;
    curtable[0]["drain bottom"] = value;
    table.updateData(curtable);
    constructXYdomain();
    constructXYwater();
    needdiscretisation();
    repicgeo1();
    stage1.draw();
    repicgeo2();
    stage2.draw();
  });
  geomenu.addNumber("talud angle", 0, 89, geo.taludangle, 1, function(value) {
    geo.taludangle = value;
    curtable[0]["talud angle"] = value;
    table.updateData(curtable);
    constructXYdomain();
    constructXYwater();
    needdiscretisation();
    repicgeo1();
    stage1.draw();
    repicgeo2();
    stage2.draw();
  });

  function addbaselayer(value) {
    if (value) {
      physicsmenu.showControl("c base");
      physicsmenu.showControl("H base");
      geo.hasbaselayer = true;
      bottomborder1.remove();
      stage1.draw();
      bottomborder2.remove();
      stage2.draw();
      curtable[0]["c base"] = physics.cbase;
      curtable[0]["Hbase"] = physics.Hbase;
      table.updateData(curtable);
    } else {
      physicsmenu.hideControl("c base");
      physicsmenu.hideControl("H base");
      geo.hasbaselayer = false;
      geolayer1.add(bottomborder1);
      stage1.draw();
      geolayer2.add(bottomborder2);
      stage2.draw();
      curtable[0]["c base"] = NaN;
      curtable[0]["Hbase"] = NaN;
      table.updateData(curtable);
    }
    needsolution();
  }
  faddbaselayer = addbaselayer;
  geomenu.addBoolean("add base layer", geo.hasbaselayer, addbaselayer);

  geomenu.addDropDown("aspect", ["image", "physical"], function(value) {
    var y1scale = 1;
    var x2scale = 1;
    var y2scale = 1;

    if (value.index == 1) {
      y1scale = geo.domainheight / geo.domainwidth;
      //   y2scale =
      //     (s2y2y(30) - s2y2y(stage2.getHeight() - 10)) /
      //     (s2x2x(stage2.getWidth()) - s2x2x(30));
      //   if (y2scale > 1) {
      //     x2scale = 1 / y2scale;
      //     y2scale = 1;
      //   }
    }
    stage1.scaleY(y1scale);
    stage1.draw();
    // stage2.scaleX(x2scale);
    // stage2.scaleY(y2scale);
    // stage2.draw();
  });

  // physicsmenu = QuickSettings.create(xmenustart+100, ymenustart + 100, "hydro vars (min/max: dbl click)");
  // physicsmenu.collapse();
  // physicsmenu.hide();
  physicsmenu.addNumber(
    "drain level",
    0.1,
    50,
    physics.drainlevel,
    0.1,
    function(value) {
      if (!inputfieldisalreadytested) {
        if (value <= geo.drainbottom) {
          value =geo.drainbottom+0.1;
          alert("drain level should be at least above drain bottom");
        }
      }
      physics.drainlevel = value;
      curtable[0]["drain level"] = value;
      table.updateData(curtable);
      constructXYwater();
      needdiscretisation();
      xy2s1xy(XYwater, water1.getAttr("points"));
      stage1.draw();
      xy2s2xy(XYwater, water2.getAttr("points"));
      stage2.draw();
      needsolution();
    }
  );

  physicsmenu.addNumber(
    "recharge *1000",
    -2,
    5,
    physics.recharge * 1000,
    0.05,
    function(value) {
      physics.recharge = value * 0.001;
      curtable[0]["recharge *1000"] = value;
      table.updateData(curtable);
      needsolution();
    }
  );

  physicsmenu.addNumber("kxx", 0.1, 10, physics.kxx, 0.1, function(value) {
    physics.kxx = value;
    curtable[0]["kxx"] = value;
    table.updateData(curtable);
    needsolution();
  });

  physicsmenu.addNumber("kzz", 0.1, 10, physics.kzz, 0.1, function(value) {
    physics.kzz = value;
    curtable[0]["kzz"] = value;
    table.updateData(curtable);
    needsolution();
  });

  physicsmenu.addNumber("kxz", 0, 10, physics.kxz, 0.1, function(value) {
    physics.kxz = value;
    curtable[0]["kxz"] = value;
    table.updateData(curtable);
    needsolution();
  });

  physicsmenu.addNumber("c drain", 0.01, 50, physics.cdrain, 0.05, function(
    value
  ) {
    if (!inputfieldisalreadytested) {
      if (physics.cseepage > value) {
        alert("c drain should be larger than c seepage");
        value = physics.cseepage;
        physicsmenu.setValue("c drain", value);
      }
    }
    physics.cdrain = value;
    curtable[0]["c drain"] = value;
    table.updateData(curtable);
    needsolution();
  });
  physicsmenu.addNumber("c seepage", 0.01, 50, physics.cseepage, 0.01, function(
    value
  ) {
    if (!inputfieldisalreadytested) {
      if (value > physics.cdrain) {
        value = physics.cdrain;
        physicsmenu.setValue("c seepage", value);
        alert("c seepage should be smaller than c drain");
      }
    }

    physics.cseepage = value;
    curtable[0]["c seepage"] = physics.cseepage;
    table.updateData(curtable);
    needsolution();
  });
  physicsmenu.addNumber("c base", 0.1, 200, physics.cbase, 0.1, function(
    value
  ) {
    physics.cbase = value;
    curtable[0]["c base"] = value;
    if (geo.hasbaselayer) {
      table.updateData(curtable);
      needsolution();
    }
  });
  if (!geo.hasbaselayer) {
    physicsmenu.hideControl("c base");
  }
  physicsmenu.addNumber("H base", 0, 20, physics.Hbase, 0.1, function(value) {
    physics.Hbase = value;
    curtable[0]["H base"] = value;
    if (geo.hasbaselayer) {
      table.updateData(curtable);
      needsolution();
    }
  });
  if (!geo.hasbaselayer) {
    physicsmenu.hideControl("H base");
  }

  // numericmenu = QuickSettings.create(xmenustart+150, ymenustart + 150, "num vars (min/max: dbl click)");
  // numericmenu.collapse();
  // // numericmenu.hide();
  numericmenu.addNumber(
    "# hor under drain",
    5,
    50,
    numerics.horleft,
    1,
    function(value) {
      numerics.horleft = value;
      curtable[0]["# hor under drain"] = value;
      table.updateData(curtable);
      needdiscretisation();
    }
  );
  numericmenu.addNumber(
    "# hor right of drain",
    5,
    50,
    numerics.horright,
    1,
    function(value) {
      numerics.horright = value;
      curtable[0]["# hor right of drain"] = value;
      table.updateData(curtable);
      needdiscretisation();
    }
  );

  numericmenu.addNumber("# ver", 5, 50, 10, 1, function(value) {
    numerics.ver = value;
    curtable[0]["# ver"] = value;
    table.updateData(curtable);
    needdiscretisation();
  });

  numericmenu.addNumber(
    "densification hor",
    1,
    20,
    numerics.denshor,
    0.1,
    function(value) {
      numerics.denshor = Math.max(value, 1);
      curtable[0]["densification hor"] = numerics.denshor;
      table.updateData(curtable);
      needdiscretisation();
    }
  );

  numericmenu.addNumber(
    "densification ver",
    1,
    20,
    numerics.densver,
    0.1,
    function(value) {
      numerics.densver = value;
      curtable[0]["densification ver"] = value;
      table.updateData(curtable);
      needdiscretisation();
    }
  );

  numericmenu.addBoolean("show nodes", false, function(value) {
    if (value) {
      menuchoice.shownodes = true;
      numlayer1.add(nodes1);
      stage1.draw();
      numlayer2.add(nodes2);
      stage2.draw();
    } else {
      menuchoice.shownodes = false;
      nodes1.remove();
      stage1.draw();
      nodes2.remove();
      stage2.draw();
    }
  });
  numericmenu.hideControl("show nodes");

  numericmenu.addBoolean("show cells", false, function(value) {
    if (value) {
      menuchoice.showcells = true;
      numlayer1.add(cells1);
      stage1.draw();
      numlayer2.add(cells2);
      stage2.draw();
    } else {
      menuchoice.showcells = false;
      cells1.remove();
      stage1.draw();
      cells2.remove();
      stage2.draw();
    }
  });
  numericmenu.hideControl("show cells");

  var discretisationdone = false;

  function makediscretisation() {
    constructXYNodes();
    makenodes1();
    makenodes2();
    constructDULRcells();
    makecells1();
    makecells2();
    constructinodes();
    numericmenu.showControl("show nodes");
    numericmenu.showControl("show cells");
    numericmenu.hideControl("make discretisation");
    discretisation.done = true;
    solutionmenu.hideControl("warning");
    solutionmenu.showControl("solve");
  }

  fmakediscretisation = makediscretisation;

  numericmenu.addButton("make discretisation", makediscretisation);

  function needdiscretisation() {
    nodes1.remove();
    nodes2.remove();
    cells1.remove();
    cells2.remove();
    numericmenu.hideControl("show nodes");
    numericmenu.setValue("show nodes", false);
    numericmenu.hideControl("show cells");
    numericmenu.setValue("show cells", false);
    numericmenu.showControl("make discretisation");
    solutionmenu.showControl("warning");
    solutionmenu.hideControl("solve");
    discretisation.done = false;
    needsolution();
  }

  // solutionmenu = QuickSettings.create(xmenustart+50, ymenustart + 50, "solution (min/max: dbl click)");
  // solutionmenu.collapse();
  // solutionmenu.hide();
  solutionmenu.addHTML("warning", "no discetistation yet");

  function dosolve() {
    solvesteps();
    nodes1.remove();
    makenodes1();
    nodes2.remove();
    makenodes2();
    cells1.remove();
    makecells1();
    cells2.remove();
    makecells2();
    constructXYHtop();
    xy2s1xy(XYHtop, Htable1.getAttr("points"));
    xy2s2xy(XYHtop, Htable2.getAttr("points"));
    makeHfill1();
    makeHfill2();
    menuchoice.solutionready = true;
    if (menuchoice.shownodes) {
      numlayer1.add(nodes1);
      numlayer2.add(nodes2);
    }
    if (numericmenu.showcells) {
      numlayer1.add(cells1);
      numlayer2.add(cells2);
    }
    if (menuchoice.showHtable) {
      sollayer1.add(Htable1);
      sollayer2.add(Htable2);
    }
    if (menuchoice.fillcells) {
      sollayer1.add(Hfill1);
      sollayer1.add(Hfill1legend.Konva());
      sollayer2.add(Hfill2);
      sollayer2.add(Hfill2legend.Konva());
    }
    if (menuchoice.drawfluxes) {
      menuchoice.arrowsareflux = true;
      menuchoice.arrowsareflow = false;
      makearrows1();
      fluxlayer1.add(arrows1);
      makearrows2();
      fluxlayer2.add(arrows2);
    } else if (menuchoice.drawflowdirections) {
      menuchoice.arrowsareflux = false;
      menuchoice.arrowsareflow = true;
      makearrows1();
      fluxlayer1.add(arrows1);
      makearrows2();
      fluxlayer2.add(arrows2);
    }
    if(menuchoice.arrowfactor>0)
    {
      solutionmenu.showControl("arrow factor");
    }
    stage1.draw();
    stage2.draw();
    //   if (numericmenu.getValue("show cells")) {
    //     discrcells.remove();
    //     discrlayer.add(discrcells);
    //     stage.draw()
    //   }
    solutionmenu.showControl("show H table");
    solutionmenu.showControl("fill cells with H");
    solutionmenu.showControl("draw flow directions");
    solutionmenu.showControl("draw fluxes");
    solutionmenu.showControl("")
    solutionmenu.showControl("add node inspector");
    solutionmenu.showControl("add Cell analysis");
    solutionmenu.hideControl("solve");
  }

  fdosolve = dosolve;

  solutionmenu.addButton("solve", dosolve);
  solutionmenu.hideControl("solve");

  solutionmenu.addBoolean("show H table", false, function(value) {
    if (value) {
      menuchoice.showHtable = true;
      sollayer1.add(Htable1);
      sollayer2.add(Htable2);
    } else {
      menuchoice.showHtable = false;
      Htable1.remove();
      Htable2.remove();
    }
    stage1.draw();
    stage2.draw();
  });
  solutionmenu.hideControl("show H table");

  solutionmenu.addBoolean("fill cells with H", false, function(value) {
    if (value) {
      menuchoice.fillcells = true;
      sollayer1.add(Hfill1);
      sollayer1.add(Hfill1legend.Konva());
      makeHfill2();
      sollayer2.add(Hfill2);
      sollayer2.add(Hfill2legend.Konva());
      solutionmenu.showControl("add contours");
    } else {
      menuchoice.fillcells = false;
      Hfill1.remove();
      Hfill1legend.Konva().remove();
      Hfill2.remove();
      Hfill2legend.Konva().remove();
      solutionmenu.hideControl("add contours");
    }
    stage1.draw();
    stage2.draw();
  });
  solutionmenu.hideControl("fill cells with H");
  //
  //
  solutionmenu.addBoolean("add contours", false, function(value) {
    if (value) {
      menuchoice.showcontourvalues = true;
    } else {
      menuchoice.showcontourvalues = false;
    }
    Hfill1.remove();
    Hfill1legend.Konva().remove();
    makeHfill1();
    sollayer1.add(Hfill1);
    sollayer1.add(Hfill1legend.Konva());
    Hfill2.remove();
    Hfill2legend.Konva().remove();
    makeHfill2();
    sollayer2.add(Hfill2);
    sollayer2.add(Hfill2legend.Konva());
    stage1.draw();
    stage2.draw();
  });
  solutionmenu.hideControl("add contours");

  solutionmenu.addBoolean("draw flow directions", false, function(value) {
    if (value) {
      if (menuchoice.drawfluxes) {
        solutionmenu.setValue("draw fluxes", false);
      }
      menuchoice.drawflowdirections = true;
      if (!menuchoice.arrowsareflow) {
        menuchoice.arrowsareflux = false;
        menuchoice.arrowsareflow = true;
        makearrows1();
        makearrows2();
      }
      fluxlayer1.add(arrows1);
      fluxlayer2.add(arrows2);
    } else {
      menuchoice.showflowdirections = false;
      arrows1.remove();
      arrows2.remove();
    }
    stage1.draw();
    stage2.draw();
  });
  solutionmenu.hideControl("draw flow directions");

  solutionmenu.addBoolean("draw fluxes", false, function(value) {
    if (value) {
      if (menuchoice.drawflowdirections) {
        solutionmenu.setValue("draw flow directions", false);
      }
      menuchoice.drawfluxes = true;
      if (!menuchoice.arrowsareflux) {
        menuchoice.arrowsareflux = true;
        menuchoice.arrowsareflow = false;
        makearrows1();
        makearrows2();
      }
      fluxlayer1.add(arrows1);
      fluxlayer2.add(arrows2);
      solutionmenu.showControl("arrow factor");
      solutionmenu.showControl("dont draw small arrows");
    } else {
      menuchoice.drawfluxes = false;
      arrows1.remove();
      arrows2.remove();
      solutionmenu.hideControl("arrow factor");
      solutionmenu.hideControl("dont draw small arrows");
    }
    stage1.draw();
    stage2.draw();
  });
  solutionmenu.hideControl("draw fluxes");
  //
  solutionmenu.addRange("arrow factor", -2, 4, 0, 0.1, function(value) {
    menuchoice.arrowfactor = value;
    arrows1.remove();
    makearrows1();
    fluxlayer1.add(arrows1);
    stage1.draw();
    arrows2.remove();
    makearrows2();
    fluxlayer2.add(arrows2);
    stage2.draw();
  });
  //
  solutionmenu.hideControl("arrow factor");

  solutionmenu.addBoolean("dont draw small arrows", true, function(value) {
    menuchoice.cutsmallarrows = value;
    makearrows1();
    fluxlayer1.add(arrows1);
    stage1.draw();
    makearrows2();
    fluxlayer2.add(arrows2);
    stage2.draw();
  });
  solutionmenu.hideControl("dont draw small arrows");

  solutionmenu.addBoolean("add node inspector", false, function(value) {
    if (value) {
      menuchoice.hasnodeinspector = true;
      inspector1.setX(x2s1x(geo.drainwidth));
      inspector1.setY(y2s1y(geo.drainbottom));
      inspector2.setX(x2s2x(geo.drainwidth));
      inspector2.setY(y2s2y(geo.drainbottom));
      toplayer1.add(inspector1);
      inspector1.moveToTop();
      toplayer2.add(inspector2);
      inspector2.moveToTop();
      menuchoice.hasnodeinspector = true;
    } else {
      menuchoice.hasnodeinspector = false;
      inspector1.remove();
      inspector2.remove();
      hidereport("inspectorReport");
      menuchoice.hasnodeinspector = false;
    }
    stage1.draw();
    stage2.draw();
  });

  solutionmenu.hideControl("add node inspector");
  //

  function addCellanalysis(value) {
    if (value) {
      if (isNaN(geo.CELLwidth)) {
        solutionmenu.setValue(
          "Cell width",
          Math.round(3 * geo.drainwidth + geo.domainwidth) / 4
        );
      } else {
        solutionmenu.setValue("Cell width", geo.CELLwidth);
      }

      solutionmenu.showControl("Cell width");
      if (document.body.style.cursor != "wait") {
        makeCELL();
        toplayer1.add(CELLdivide1);
        toplayer1.add(CELLHmean1);
        showreport("CELLReport");
        toplayer2.add(CELLdivide2);
        toplayer2.add(CELLHmean2);
      }
    } else {
      solutionmenu.hideControl("Cell width");
      CELLdivide1.remove();
      CELLHmean1.remove();
      CELLdivide2.remove();
      CELLHmean2.remove();
      hidereport("CELLReport");
    }
    stage1.draw();
    stage2.draw();
  }

  faddcellanalysis = addCellanalysis;

  solutionmenu.addBoolean("add Cell analysis", false, addCellanalysis);
  solutionmenu.hideControl("add Cell analysis");

  solutionmenu.addNumber("Cell width", 0, 5000, geo.CELLwidth, 0.25, function(
    value
  ) {
    if (value < geo.drainwidth) {
      value = geo.drainwidth;
      solutionmenu.setValue("Cell width", value);
    }
    if (value > geo.domainwidth) {
      value = geo.domainwidth;
      solutionmenu.setValue("Cell width", value);
    }
    geo.CELLwidth = value;
    if (document.body.style.cursor != "wait") {
      makeCELL();
      stage1.draw();
      stage2.draw();
    }
    curtable[0]["Cell width"] = value;
    table.updateData(curtable);
  });
  solutionmenu.hideControl("Cell width");

  needsolution = function() {
    menuchoice.solutionread = false;
    solutionmenu.hideControl("show H table");
    Htable1.remove();
    Htable2.remove();
    if (Hfill1 != null) {
      Hfill1.remove();
    }
    if (Hfill2 != null) {
      Hfill2.remove();
    }
    Hfill1legend.Konva().remove();
    Hfill2legend.Konva().remove();
    if (arrows1 != null) {
      arrows1.remove();
    }
    if (arrows2 != null) {
      arrows2.remove();
    }
    stage1.draw();
    stage2.draw();

    solutionmenu.hideControl("show H table");
    solutionmenu.hideControl("fill cells with H");
    solutionmenu.hideControl("add contours");
    solutionmenu.hideControl("draw flow directions");
    solutionmenu.hideControl("draw fluxes");
    solutionmenu.hideControl("arrow factor");
    solutionmenu.hideControl("dont draw small arrows");
    solutionmenu.hideControl("add node inspector");
    solutionmenu.setValue("add node inspector", false);
    solutionmenu.hideControl("add Cell analysis");
    solutionmenu.setValue("add Cell analysis", false);
    if (typeof curtable !== "undefined") {
      curtable[0]["H_min"] = NaN;
      curtable[0]["H_max"] = NaN;
      curtable[0]["Q tot drain"] = NaN;
      curtable[0]["Q tot recharge"] = NaN;
      curtable[0]["Q tot base"] = NaN;
      curtable[0]["Cell H_mean"] = NaN;
      curtable[0]["Cell Q recharge"] = NaN;
      curtable[0]["Cell Q lateral"] = NaN;
      curtable[0]["Cell c_fleak"] = NaN;
      curtable[0]["Cell Q base"] = NaN;
    }
    if (discretisation.done) {
      solutionmenu.showControl("solve");
    }
    // }
  };
}
