menuchoice = {
  shownodes: false,
  showcells: false,
  solutionready: false,
  showHtable: false,
  fillcells: false,
  showcontourvalues: false,
  arrowsareflow: false,
  arrowsareflux: false,
  arrowfactor: 1,
  cutsmallarrows: true,
  hasnodeinspector: false,
  CELLanalysis: false,
};

var mainmenu;
var modelchoicemenu;
var geomenu;
var physicsmenu;
var numericmenu;
var solutionmenu;

var fmakediscretization;
var fneeddiscretization;
var fneedsolution;
var fdosolve;
var faddCellanalysis;
var fdoCellanalysis;

let interactiveuse = true;

function setupmenu() {
  let xmenustart = StageWidth * 0.35;
  let ymenustart = StageWidth * 0.2;

  mainmenu = QuickSettings.create(
    xmenustart - 50,
    ymenustart,
    "menu (min/max: dbl click)"
  );
  modelchoicemenu = QuickSettings.create(
    xmenustart + 25,
    ymenustart + 35,
    "choices (min/max: dbl click)"
  );
  solutionmenu = QuickSettings.create(
    xmenustart + 50,
    ymenustart + 70,
    "solution (min/max: dbl click)"
  );
  // solutionmenu.collapse();
  // solutionmenu.hide();
  numericmenu = QuickSettings.create(
    xmenustart + 75,
    ymenustart + 105,
    "num vars (min/max: dbl click)"
  );
  // numericmenu.collapse();
  numericmenu.hide();
  physicsmenu = QuickSettings.create(
    xmenustart + 100,
    ymenustart + 140,
    "hydro vars (min/max: dbl click)"
  );
  // physicsmenu.collapse();
  // physicsmenu.hide();
  geomenu = QuickSettings.create(
    xmenustart + 125,
    ymenustart + 175,
    "geo (min/max: dbl click)"
  );

  mainmenu.addBoolean("show choices menu", false, function (value) {
    if (value) {
      modelchoicemenu.show();
    } else {
      modelchoicemenu.hide();
    }
  });
  // mainmenu.hideControl("show geo menu");
  mainmenu.addBoolean("show geo menu", false, function (value) {
    if (value) {
      geomenu.show();
    } else {
      geomenu.hide();
    }
  });
  // mainmenu.hideControl("show geo menu");
  mainmenu.addBoolean("show hydro vars menu", false, function (value) {
    if (value) {
      physicsmenu.show();
    } else {
      physicsmenu.hide();
    }
  });
  // mainmenu.hideControl("show hydro vars menu");
  mainmenu.addBoolean("show numerics menu", false, function (value) {
    if (value) {
      numericmenu.show();
    } else {
      numericmenu.hide();
    }
  });
  // mainmenu.hideControl("show numerics menu");
  mainmenu.addBoolean("show solution menu", false, function (value) {
    if (value) {
      solutionmenu.show();
    } else {
      solutionmenu.hide();
    }
  });

  mainmenu.addButton("load help", function (value) {
    window.open("./iGrOw_Help.html", "_blank").focus();
  });
  modelchoicemenu.hide();
  modelchoicemenu.addDropDown(
    "cross section form",
    ["smooth", "trapezoidal"],
    function (value) {
      let oldinteractiveuse = interactiveuse;
      interactiveuse = false;
      if (modelchoices.crosssection == "smooth") {
        if (value.label == "trapezoidal") {
          geomenu.setValue("trap talud 1 over", 0);
          modelchoices.crosssection = value.label;
          geomenu.hideControl("top talud angle");
          geomenu.showControl("trap talud 1 over");
        }
      } else if (modelchoices.crosssection == "trapezoidal") {
        if (value.label == "smooth") {
          geomenu.setValue("trap talud 1 over", 0);
          modelchoices.crosssection = value.label;
          geomenu.showControl("top talud angle");
          geomenu.hideControl("trap talud 1 over");
        }
      }
      interactiveuse = oldinteractiveuse;
      tabledata[0]["cross section form"] = value.label;
      setdrain();
      if (interactiveuse) {
        constructXYdomain();
        constructXYwater();
        if (stage1 != undefined) {
          repicgeo1();
          stage1.draw();
          repicgeo2();
          stage2.draw();
          needdiscretization();
        }
      }
    }
  );

  modelchoicemenu.addDropDown(
    "model bottom",
    ["closed", "open"],
    function (value) {
      if (value.label == "closed") {
        physicsmenu.hideControl("c base");
        physicsmenu.hideControl("H base");
      } else {
        physicsmenu.showControl("c base");
        physicsmenu.showControl("H base");
      }
      modelchoices.modelbottom = value.label;
      tabledata[0]["model bottom"] = value.label;
      if (interactiveuse) {
        if (value.label == "open") {
          if (bottomborder1 != undefined) {
            bottomborder1.remove();
            stage1.draw();
            bottomborder2.remove();
            stage2.draw();
          }
        } else {
          modelchoices.modelbottom = "closed";
          if (bottomborder1 != undefined) {
            geolayer1.add(bottomborder1);
            stage1.draw();
            geolayer2.add(bottomborder2);
          }
        }
        needsolution();
      }
    }
  );

  modelchoicemenu.addDropDown(
    "riparian connection",
    ["impermeable", "seepage face", "dirichlet"],
    function (value) {
      if (value.label == "seepage face") {
        physicsmenu.showControl("c seepage");
        if (modelchoices.cvaluesinterpolated == "height interpolated") {
          control_run_params();
        }
        modelchoices.riparianconnection = "seepage face";
      } else if (value.label == "impermeable") {
        physicsmenu.hideControl("c seepage");
        modelchoices.riparianconnection = "impermeable";
      } else if (value.label == "dirichlet") {
        physicsmenu.hideControl("c seepage");
        modelchoices.riparianconnection = "dirichlet";
      }
      tabledata[0]["riparian connection"] = value.label;
      if (interactiveuse) {
        needdiscretization();
        needsolution();
      }
    }
  );
  modelchoicemenu.addDropDown(
    "c(drain-seepage) values",
    ["non-interpolated", "height interpolated"],
    function (value) {
      if (value.label == "height interpolated") {
        if (!(modelchoices.riparianconnection == "seepage face")) {
          physicsmenu.showControl("c seepage");
        }
      } else {
        if (!(modelchoices.riparianconnection == "seepage face")) {
          physicsmenu.hideControl("c seepage");
        }
      }
      modelchoices.cvaluesinterpolated = value.label;
      control_run_params();
      tabledata[0]["c(drainage-seepage) values"] = value.label;
      if (interactiveuse) {
        needsolution();
      }
    }
  );

  modelchoicemenu.addDropDown(
    "catchment form",
    ["parallel", "convergent", "divergent"],
    function (value) {
      modelchoices.catchment = value.label;
      let oldinteractiveuse = interactiveuse;
      interactiveuse = false;
      geomenu.setValue("catchment curvature", 0);
      interactiveuse = oldinteractiveuse;
      if (modelchoices.catchment != "parallel") {
        geomenu.showControl("catchment curvature");
      } else {
        geomenu.hideControl("catchment curvature");
      }
      tabledata[0]["catchment form"] = value.label;
      if (interactiveuse) {
        needsolution();
      }
    }
  );

  geomenu.hide();

  function makenewfield(
    menu,
    field,
    min,
    max,
    start,
    step,
    wfe,
    gstore,
    gname,
    gmult = 1
  ) {
    var menu = menu;
    var field = field;
    var wfe = wfe;
    var wid = wfe.do_if_this(function () {
      let v = menu.getValue(field);
      let m = menu._controls[field].container;
      m.style.backgroundColor = "#DCDCDC";
      gstore[gname] = v * gmult;
    });
    menu.addNumber(field, min, max, start, step, function (v) {
      if (isNaN(v)) {
        return;
      }
      if (interactiveuse) {
        // console.log(field," in ",interactiveuse)
        wfe.set(wid);
        let m = menu._controls[field].container;
        m.style.backgroundColor = "#44E737";
        geomenu.showControl("to commit number(s)");
        physicsmenu.showControl("to commit number(s)");
      } else {
        gstore[gname] = v * gmult;
      }
    });
  }

  makenewfield(
    geomenu,
    "iGrOw width (L/2)",
    2,
    5000,
    geo.domainwidth,
    1,
    wfe_discr_param,
    geo,
    "domainwidth"
  );

  makenewfield(
    geomenu,
    "domain height",
    1,
    50,
    geo.domainheight,
    0.1,
    wfe_discr_param,
    geo,
    "domainheight"
  );

  makenewfield(
    geomenu,
    "drain width (B/2)",
    0.1,
    50,
    geo.drainwidth,
    0.1,
    wfe_discr_param,
    geo,
    "drainwidth"
  );

  makenewfield(
    geomenu,
    "drain bottom",
    0.1,
    50,
    geo.drainbottom,
    0.1,
    wfe_discr_param,
    geo,
    "drainbottom"
  );

  makenewfield(
    geomenu,
    "top talud angle",
    0,
    89,
    geo.taludangle,
    1,
    wfe_discr_param,
    geo,
    "taludangle"
  );

  makenewfield(
    geomenu,
    "trap talud 1 over",
    0,
    20,
    geo.traptalud,
    0.05,
    wfe_discr_param,
    geo,
    "traptalud"
  );

  geomenu.hideControl("trap talud 1 over");

  makenewfield(
    geomenu,
    "catchment curvature",
    0.0,
    5,
    geo.curvature,
    0.05,
    wfe_discr_param,
    geo,
    "curvature"
  );

  geomenu.hideControl("catchment curvature");

  geomenu.addHTML("to commit number(s)", "hit enter/return");
  var m = geomenu._controls["to commit number(s)"].container;
  m.style.backgroundColor = "#44E737";
  geomenu.hideControl("to commit number(s)");

  geomenu.addDropDown("aspect", ["screen", "physical"], function (value) {
    var y1scale = 1;
    var x2scale = 1;
    var y2scale = 1;

    if (value.index == 1) {
      y1scale = geo.domainheight / geo.domainwidth;
    }
    if (interactiveuse) {
      stage1.scaleY(y1scale);
      stage1.draw();
    }
  });

  physicsmenu.hide();

  makenewfield(
    physicsmenu,
    "drain level",
    0.1,
    50,
    physics.drainlevel,
    0.01,
    wfe_discr_param,
    physics,
    "drainlevel"
  );

  makenewfield(
    physicsmenu,
    "recharge *1000",
    -2,
    5,
    physics.recharge * 1000,
    0.05,
    wfe_run_param,
    physics,
    "recharge",
    0.001
  );

  makenewfield(
    physicsmenu,
    "kxx",
    0.1,
    10,
    physics.kxx,
    0.1,
    wfe_run_param,
    physics,
    "kxx"
  );

  makenewfield(
    physicsmenu,
    "kzz",
    0.1,
    10,
    physics.kzz,
    0.1,
    wfe_run_param,
    physics,
    "kzz"
  );

  makenewfield(
    physicsmenu,
    "kxz",
    0.1,
    10,
    physics.kxz,
    0.1,
    wfe_run_param,
    physics,
    "kxz"
  );

  makenewfield(
    physicsmenu,
    "c drain",
    0.01,
    50,
    physics.cdrain,
    0.01,
    wfe_run_param,
    physics,
    "cdrain"
  );

  makenewfield(
    physicsmenu,
    "c seepage",
    0.01,
    50,
    physics.cseepage,
    0.01,
    wfe_run_param,
    physics,
    "cseepage"
  );

  makenewfield(
    physicsmenu,
    "c base",
    0.01,
    50,
    physics.cbase,
    0.01,
    wfe_run_param,
    physics,
    "cbase"
  );

  makenewfield(
    physicsmenu,
    "H base",
    0,
    20,
    physics.Hbase,
    0.1,
    wfe_run_param,
    physics,
    "Hbase"
  );

  physicsmenu.addHTML("to commit number(s)", "hit enter/return");
  m = physicsmenu._controls["to commit number(s)"].container;
  m.style.backgroundColor = "#44E737";
  physicsmenu.hideControl("to commit number(s)");

  numericmenu.addNumber(
    "# hor under drain",
    5,
    50,
    numerics.horleft,
    1,
    function (value) {
      if (isNaN(value)) {
        return;
      }
      numerics.horleft = Math.round(value);
      tabledata[0]["# hor under drain"] = numerics.horleft;
      if (interactiveuse) {
        needdiscretization();
      }
    }
  );
  numericmenu.addNumber(
    "# hor right of drain",
    5,
    50,
    numerics.horright,
    1,
    function (value) {
      if (!isNaN(value)) {
        return;
      }
      numerics.horright = Math.round(value);
      tabledata[0]["# hor right of drain"] = numerics.horright;
      if (interactiveuse) {
        needdiscretization();
      }
    }
  );

  numericmenu.addNumber(
    "# verleft",
    5,
    50,
    numerics.verleft,
    1,
    function (value) {
      if (isNaN(value)) {
        return;
      }
      numerics.verleft = Math.round(value);
      tabledata[0]["# verleft"] = numerics.verleft;
      if (interactiveuse) {
        needdiscretization();
      }
    }
  );

  numericmenu.addNumber(
    "# verright",
    5,
    50,
    numerics.verright,
    1,
    function (value) {
      if (isNaN(value)) {
        return;
      }
      numerics.verright = Math.round(value);
      tabledata[0]["# verright"] = numerics.verleft;
      if (interactiveuse) {
        needdiscretization();
      }
    }
  );
  numericmenu.addNumber(
    "# dens factor",
    0,
    0.975,
    numerics.densfactor,
    0.025,
    function (value) {
      if (isNaN(value)) {
        return;
      }
      numerics.densfactor = Math.min(value, 0.975);
      tabledata[0]["# dens factor"] = numerics.densfactor;
      if (interactiveuse) {
        needdiscretization();
      }
    }
  );

  numericmenu.addBoolean("show nodes", false, function (value) {
    if (value) {
      menuchoice.shownodes = true;
      numlayer1.add(nodes1);
      stage1.draw();
      numlayer2.add(nodes2);
      stage2.draw();
    } else {
      menuchoice.shownodes = false;
      if (nodes1 != undefined) {
        nodes1.remove();
        stage1.draw();
        nodes2.remove();
        stage2.draw();
      }
    }
  });
  numericmenu.hideControl("show nodes");

  numericmenu.addBoolean("show cells", false, function (value) {
    if (value) {
      menuchoice.showcells = true;
      numlayer1.add(cells1);
      stage1.draw();
      numlayer2.add(cells2);
      stage2.draw();
    } else {
      menuchoice.showcells = false;
      if (cells1 != undefined) {
        cells1.remove();
        stage1.draw();
        cells2.remove();
        stage2.draw();
      }
    }
  });
  numericmenu.hideControl("show cells");

  var discretizationdone = false;

  function makediscretization() {
    let isok = control_discr_params();
    if (!isok) {
      return;
    }
    constructXYdomain();
    ground1.setAttr("points", []);
    xy2s1xy(XYdomain, ground1.getAttr("points"));
    ground2.setAttr("points", []);
    xy2s2xy(XYdomain, ground2.getAttr("points"));

    generatenetwork();
    makenodes();
    maketriangles();
    numericmenu.showControl("show nodes");
    numericmenu.showControl("show cells");
    numericmenu.hideControl("make discretization");
    discretization.done = true;
    solutionmenu.hideControl("warning");
    solutionmenu.showControl("solve");
  }

  fmakediscretization = makediscretization;

  numericmenu.addButton("make discretization", makediscretization);

  function needdiscretization() {
    if (nodes1 != undefined) {
      nodes1.remove();
      nodes2.remove();
      cells1.remove();
      cells2.remove();
    }
    numericmenu.hideControl("show nodes");
    numericmenu.setValue("show nodes", false);
    numericmenu.hideControl("show cells");
    numericmenu.setValue("show cells", false);
    numericmenu.showControl("make discretization");
    solutionmenu.showControl("warning");
    solutionmenu.hideControl("solve");
    discretization.done = false;
    needsolution();
  }

  fneeddiscretization = needdiscretization;

  solutionmenu.hide();
  solutionmenu.addHTML("warning", "no discetistation yet");

  function dosolve() {
    let allok = control_run_params();
    if (!allok) {
      tabledata[0]["H_min"] = NaN;
      tabledata[0]["H_max"] = NaN;
      tabledata[0]["top_mean"] = NaN;
      tabledata[0]["Hbottom_mean"] = NaN;
      tabledata[0]["Gr Wet Per"] = NaN;
      tabledata[0]["Ow Wet Per"] = NaN;
      tabledata[0]["Ow Per"] = NaN;
      tabledata[0]["Ow Wet Width"] = NaN;
      tabledata[0]["Q tot drain"] = NaN;
      tabledata[0]["Q tot recharge"] = NaN;
      tabledata[0]["Q tot base"] = NaN;
      tabledata[0]["Q seepage face"] = NaN;
      tabledata[0]["CELL H_mean"] = NaN;
      tabledata[0]["CELL Q recharge"] = NaN;
      tabledata[0]["CELL Q lateral"] = NaN;
      tabledata[0]["CELL c_fleak"] = NaN;
      tabledata[0]["CELL Q base"] = NaN;
      return;
    }
    solvesteps();
    nodes1.remove();
    nodes2.remove();
    makenodes();
    cells1.remove();
    cells2.remove();
    maketriangles();
    makeHtable12();
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
      Hfill1legend.KonvaNode.moveToTop();
      sollayer2.add(Hfill2);
      sollayer2.add(Hfill2legend.Konva());
      Hfill2legend.KonvaNode.moveToTop();
    }
    if (menuchoice.arrowsareflux) {
      menuchoice.arrowsareflux = true;
      menuchoice.arrowsareflow = false;
      makearrows1();
      fluxlayer1.add(arrows1);
      makearrows2();
      fluxlayer2.add(arrows2);
      solutionmenu.showControl("arrow factor");
      solutionmenu.showControl("dont draw small arrows");
    }
    if (menuchoice.arrowsareflow) {
      menuchoice.arrowsareflux = false;
      menuchoice.arrowsareflow = true;
      makearrows1();
      fluxlayer1.add(arrows1);
      makearrows2();
      fluxlayer2.add(arrows2);
    }

    solutionmenu.showControl("show H table");
    solutionmenu.showControl("fill cells with H");
    solutionmenu.showControl("add contours");
    solutionmenu.showControl("flow visualisation:");
    solutionmenu.showControl("add node inspector");
    solutionmenu.showControl("add CELL analysis");
    solutionmenu.hideControl("solve");
    fullresultsredraw();
  }

  fdosolve = dosolve;

  solutionmenu.addButton("solve", dosolve);
  solutionmenu.hideControl("solve");

  solutionmenu.addBoolean("show H table", false, function (value) {
    if (value) {
      makeHtable12();
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

  solutionmenu.addBoolean("fill cells with H", false, function (value) {
    if (value) {
      menuchoice.fillcells = true;
      sollayer1.add(Hfill1);
      sollayer1.add(Hfill1legend.Konva());
      Hfill1legend.KonvaNode.moveToTop();
      makeHfill2();
      sollayer2.add(Hfill2);
      sollayer2.add(Hfill2legend.Konva());
      Hfill2legend.KonvaNode.moveToTop();
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
  solutionmenu.addBoolean("add contours", false, function (value) {
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

  solutionmenu.addDropDown(
    "flow visualisation:",
    ["none", "draw flow directions", "draw fluxes"],
    function (choice) {
      if (choice.value == "none") {
        if (menuchoice.arrowsareflow) {
          menuchoice.arrowsareflow = false;
          arrows1.remove();
          arrows2.remove();
        }
        if (menuchoice.arrowsareflux) {
          menuchoice.arrowsareflux = false;
          arrows1.remove();
          arrows2.remove();
          solutionmenu.hideControl("arrow factor");
          solutionmenu.hideControl("dont draw small arrows");
        }
      } else if (choice.value == "draw flow directions") {
        if (menuchoice.arrowsareflux) {
          menuchoice.arrowsareflux = false;
          arrows1.remove();
          arrows2.remove();
          solutionmenu.hideControl("arrow factor");
          solutionmenu.hideControl("dont draw small arrows");
        }
        menuchoice.arrowsareflow = true;
        menuchoice.arrowfactor = 0;
        makearrows1();
        makearrows2();
        fluxlayer1.add(arrows1);
        fluxlayer2.add(arrows2);
        // console.log("# draw flow direcrtions done");
      } else if (choice.value == "draw fluxes") {
        menuchoice.arrowsareflow = false;
        menuchoice.arrowsareflux = true;
        menuchoice.arrowfactor = solutionmenu.getValue("arrow factor");
        makearrows1();
        makearrows2();
        fluxlayer1.add(arrows1);
        fluxlayer2.add(arrows2);
        solutionmenu.showControl("arrow factor");
        solutionmenu.showControl("dont draw small arrows");
      } else if (choice.value == "dynamic") {
        if (menuchoice.arrowsareflow) {
          solutionmenu.hide();
          menuchoice.arrowsareflow = false;
          arrows1.remove();
          arrows2.remove();
        }
        if (menuchoice.arrowsareflux) {
          solutionmenu.hideControl("arrow factor");
          solutionmenu.hideControl("dont draw small arrows");
          menuchoice.arrowsareflux = false;
          arrows1.remove();
          arrows2.remove();
        }
        let temp = menuchoice.showHtable;
        solutionmenu.setValue("show H table", true);
        menuchoice.showHtable = temp;
        temp = menuchoice.fillcells;
        solutionmenu.setValue("fill cells with H", true);
        Hfill1legend.Konva().hide();
        Hfill2legend.Konva().hide();
        menuchoice.fillcells = temp;
        sollayer1.setOpacity(0.3);
        geolayer1.setOpacity(0.3);
        sollayer2.setOpacity(0.3);
        geolayer2.setOpacity(0.3);

        mainmenu.hide();
        modelchoicemenu.hide();
        geomenu.hide();
        physicsmenu.hide();
        numericmenu.hide();
        solutionmenu.hide();
        dynamicmenu.show();
        state2tubes();
      }
      stage1.draw();
      stage2.draw();
    }
  );
  solutionmenu.hideControl("flow visualisation:");

  //
  solutionmenu.addRange("arrow factor", -2, 4, 0, 0.1, function (value) {
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

  solutionmenu.addBoolean("dont draw small arrows", true, function (value) {
    menuchoice.cutsmallarrows = value;
    makearrows1();
    fluxlayer1.add(arrows1);
    stage1.draw();
    makearrows2();
    fluxlayer2.add(arrows2);
    stage2.draw();
  });
  solutionmenu.hideControl("dont draw small arrows");

  solutionmenu.addBoolean("add node inspector", false, function (value) {
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
      if (inspector1 != undefined) {
        inspector1.remove();
        inspector2.remove();
      }
      nodeparent.style.display = "none";
      menuchoice.hasnodeinspector = false;
    }
    if (stage1 != undefined) {
      stage1.draw();
      stage2.draw();
    }
  });

  solutionmenu.hideControl("add node inspector");
  //

  function doCellanalysis(isok) {
    if (!isok) {
      tabledata[0]["CELL H_mean"] = NaN;
      tabledata[0]["CELL Q recharge"] = NaN;
      tabledata[0]["CELL Q lateral"] = NaN;
      tabledata[0]["CELL c_fleak"] = NaN;
      tabledata[0]["CELL Q base"] = NaN;
      if (CELLdivide1 != undefined) {
        CELLdivide1.remove();
        CELLHmean1.remove();
        CELLdivide2.remove();
        CELLHmean2.remove();
        menuchoice.CELLanalysis = false;
      }
      if (stage1 != undefined) {
        stage1.draw();
        stage2.draw();
      }
      cellparent.style.display = "none";
    } else {
      makeCELL();
      toplayer1.add(CELLdivide1);
      toplayer1.add(CELLHmean1);
      toplayer2.add(CELLdivide2);
      toplayer2.add(CELLHmean2);
      menuchoice.CELLanalysis = true;
      if (stage1 != undefined) {
        stage1.draw();
        stage2.draw();
      } 
      cellparent.style.display = "block";
    }
  }

  fdoCellanalysis = doCellanalysis;

  solutionmenu.addBoolean("add CELL analysis", false, addCellanalysis);
  solutionmenu.hideControl("add CELL analysis");

  function addCellanalysis(value) {
    if (value) {
      if (isNaN(geo.CELLwidth)) {
        let oldinteractiveuse = interactiveuse;
        interactiveuse = false;
        solutionmenu.setValue(
          "CELL width",
          Math.round(3 * geo.drainwidth + geo.domainwidth) / 4
        );
        interactiveuse = oldinteractiveuse;
      } else {
        let oldinteractiveuse = interactiveuse;
        interactiveuse = false;
        solutionmenu.setValue("CELL width", geo.CELLwidth);
        interactiveuse = oldinteractiveuse;
      }
      solutionmenu.showControl("CELL width");
      control_CELL_params();
    } else {
      solutionmenu.hideControl("CELL width");
      tabledata[0]["CELL width"] = NaN;
      geo.CELLwidth = NaN;
      fdoCellanalysis(false);
    }
  }

  makenewfield(
    solutionmenu,
    "CELL width",
    0.05,
    5000,
    geo.CELLwidth,
    0.05,
    wfe_CELL_param,
    geo,
    "CELLwidth"
  );

  solutionmenu.hideControl("CELL width");

  function needsolution() {
    menuchoice.solutionready = false;
    doCellanalysis(false);
    solutionmenu.hideControl("show H table");
    if (Htable1 != undefined) {
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
    }
    solutionmenu.hideControl("show H table");
    solutionmenu.hideControl("fill cells with H");
    solutionmenu.hideControl("add contours");
    solutionmenu.hideControl("flow visualisation:");
    solutionmenu.hideControl("arrow factor");
    solutionmenu.hideControl("dont draw small arrows");
    solutionmenu.hideControl("add node inspector");
    solutionmenu.setValue("add node inspector", false);
    solutionmenu.hideControl("add CELL analysis");
    solutionmenu.setValue("add CELL analysis", false);
    if (typeof tabledata !== "undefined") {
      tabledata[0]["H_min"] = NaN;
      tabledata[0]["H_max"] = NaN;
      tabledata[0]["Q tot drain"] = NaN;
      tabledata[0]["Q tot recharge"] = NaN;
      tabledata[0]["Q tot base"] = NaN;
      tabledata[0]["Cell H_mean"] = NaN;
      tabledata[0]["Cell Q recharge"] = NaN;
      tabledata[0]["Cell Q lateral"] = NaN;
      tabledata[0]["Cell c_fleak"] = NaN;
      tabledata[0]["Cell Q base"] = NaN;
    }
    if (discretization.done) {
      solutionmenu.showControl("solve");
    }
  }
  fneedsolution = needsolution;
}
// stupid quicksettings has no easy setting for dropdown!!!
function modelmenusetChoice(name, value) {
  // console.log("model set",name,value)
  if (name == "model bottom") {
    if (value == "open") {
      modelchoicemenu.setValue("model bottom", { index: 1 });
    } else {
      modelchoicemenu.setValue("model bottom", { index: 0 });
    }
  } else if (name == "riparian connection") {
    // console.log("2 ",name,value)
    if (value == "seepage face") {
      modelchoicemenu.setValue("riparian connection", { index: 1 });
    } else if (value == "dirichlet") {
      modelchoicemenu.setValue("riparian connection", { index: 2 });
    } else {
      modelchoicemenu.setValue("riparian connection", { index: 0 });
    }
  } else if (name == "c(drain-seepage) values") {
    if (value == "height interpolated") {
      modelchoicemenu.setValue("c(drain-seepage) values", { index: 1 });
    } else {
      modelchoicemenu.setValue("c(drain-seepage) values", { index: 0 });
    }
  } else if (name == "catchment form") {
    if (value == "convergent") {
      modelchoicemenu.setValue("catchment form", { index: 2 });
    } else if (value == "divergent") {
      modelchoicemenu.setValue("catchment form", { index: 1 });
    } else {
      modelchoicemenu.setValue("catchment form", { index: 0 });
    }
  } else if (name == "cross section form") {
    // console.log("model set 2",name,value)
    if (value == "trapezoidal") {
      // console.log("model set 3",name,value)
      modelchoicemenu.setValue("cross section form", { index: 1 });
    } else {
      modelchoicemenu.setValue("cross section form", { index: 0 });
    }
  }
}

function setmenudefaultchoices() {
  modelmenusetChoice("model bottom", modelchoices.modelbottom);

  modelmenusetChoice("riparian connection", modelchoices.riparianconnection);

  modelmenusetChoice(
    "c(drain-seepage) values",
    modelchoices.cvaluesinterpolated
  );

  modelmenusetChoice("catchment form", modelchoices.catchment);

  modelmenusetChoice("cross section form", modelchoices.crosssection);
}
