function setupcontroles() {
  geo.domainwidth_lastok = geo.domainwidth;
  geo.drainwidth_lastok = geo.drainwidth;
  geo.domainheight_lastok = geo.domainheight;
  geo.drainbottom_lastok = geo.drainbottom;
  physics.drainlevel_lastok = physics.drainlevel;
  geo.taludangel_lastok = geo.taludangle;
  geo.traptalud_lastok = geo.traptalud;
  geo.curvature_lastok = geo.curvature;
  geo.CELLwidth_lastok = geo.CELLwidth;
  if (
    (modelchoices.cvaluesinterpolated != "height interpolated") &
    (modelchoices.riparianconnection != "seepage face")
  ) {
    physics.cseepage = physics.cdrain;
  }
  physics.cdrain_lastok = physics.cdrain;
  physics.cseepage_lastok = physics.cseepage;
  physics.kxx_lastok = physics.kxx;
  physics.kzz_lastok = physics.kzz;
  physics.kxz_lastok = physics.kxz;
}

setupcontroles();

var wfe_discr_param = new waitforenterkey();
wfe_discr_param.do_if_any(function () {
  control_discr_params();
});

function control_discr_params() {
  if (interactiveuse) {
    let m = geomenu._controls["iGrOw width (L/2)"].container;
    m.style.backgroundColor = "#eeeeee";
    m = geomenu._controls["drain width (B/2)"].container;
    m.style.backgroundColor = "#eeeeee";
    m = physicsmenu._controls["drain level"].container;
    m.style.backgroundColor = "#eeeeee";
    m = geomenu._controls["drain bottom"].container;
    m.style.backgroundColor = "#eeeeee";
    m = geomenu._controls["domain height"].container;
    m.style.backgroundColor = "#eeeeee";
    if (modelchoices.crosssection == "trapezoidal") {
      m = geomenu._controls["trap talud 1 over"].container;
      m.style.backgroundColor = "#eeeeee";
    }
    geomenu.hideControl("to commit number(s)");
    physicsmenu.hideControl("to commit number(s)");
  }
  let ineqnotsat = "";
  if (!(geo.drainwidth < 0.9 * geo.domainwidth)) {
    if (interactiveuse) {
      m = geomenu._controls["iGrOw width (L/2)"].container;
      m.style.backgroundColor = "#fb9b9b";
      m = geomenu._controls["drain width (B/2)"].container;
      m.style.backgroundColor = "#fb9b9b";
      ineqnotsat += "   drain width < 0.9 * domain width\n";
    } else {
      return false;
    }
  }
  if (!(geo.drainbottom > 0.1 * geo.domainheight)) {
    if (interactiveuse) {
      m = geomenu._controls["drain bottom"].container;
      m.style.backgroundColor = "#fb9b9b";
      m = geomenu._controls["domain height"].container;
      m.style.backgroundColor = "#fb9b9b";
      ineqnotsat += "   drain bottom > 0.1 * domain height\n";
    } else {
      return false;
    }
  }
  if (!(geo.drainbottom < physics.drainlevel - 0.05)) {
    if (interactiveuse) {
      m = geomenu._controls["drain bottom"].container;
      m.style.backgroundColor = "#fb9b9b";
      m = physicsmenu._controls["drain level"].container;
      m.style.backgroundColor = "#fb9b9b";
      ineqnotsat += "   drain bottom < drain level-0.05\n";
    } else {
      return false;
    }
  }
  if (!(geo.drainbottom < geo.domainheight - 0.05)) {
    if (interactiveuse) {
      m = geomenu._controls["drain bottom"].container;
      m.style.backgroundColor = "#fb9b9b";
      m = geomenu._controls["domain height"].container;
      m.style.backgroundColor = "#fb9b9b";
      ineqnotsat += "   drain bottom < domain height-0.05\n";
    } else {
      return false;
    }
  }
  if (!(physics.drainlevel < geo.domainheight - 0.05)) {
    if (interactiveuse) {
      m = geomenu._controls["domain height"].container;
      m.style.backgroundColor = "#fb9b9b";
      m = physicsmenu._controls["drain level"].container;
      m.style.backgroundColor = "#fb9b9b";
      ineqnotsat += "   drain level < domainheight-0.5\n";
    } else {
      return false;
    }
  }

  if (modelchoices.crosssection == "trapezoidal") {
    if (
      !(geo.drainwidth >= geo.traptalud * (geo.domainheight - geo.drainbottom))
    ) {
      if (interactiveuse) {
        m = geomenu._controls["drain width (B/2)"].container;
        m.style.backgroundColor = "#fb9b9b";
        m = geomenu._controls["domain height"].container;
        m.style.backgroundColor = "#fb9b9b";
        m = geomenu._controls["drain bottom"].container;
        m.style.backgroundColor = "#fb9b9b";
        m = geomenu._controls["trap talud 1 over"].container;
        m.style.backgroundColor = "#fb9b9b";
        ineqnotsat +=
          "   drain width >= trap talud *(domain height - drain bottom)\n";
      } else {
        return false;
      }
    }
  }
  if (!interactiveuse) {
    return true;
  }
  if (ineqnotsat == "") {
    geo.domainwidth_lastok = geo.domainwidth;
    tabledata[0]["iGrOw width (L/2)"] = geo.domainwidth;
    tabledata[0]["iGrOw land width"] = geo.domainwidth - geo.drainwidth;
    geo.drainwidth_lastok = geo.drainwidth;
    tabledata[0]["drain width (B/2)"] = geo.drainwidth;
    geo.domainheight_lastok = geo.domainheight;
    tabledata[0]["domain height"] = geo.domainheight;
    geo.drainbottom_lastok = geo.drainbottom;
    tabledata[0]["drain bottom"] = geo.drainbottom;
    if (modelchoices.crosssection == "trapezoidal") {
      geo.traptalud_lastok = geo.traptalud;
      tabledata[0]["trap talud 1 over"] = geo.traptalud;
      tabledata[0]["top talud angle"] = NaN;
    } else {
      tabledata[0]["top talud angle"] = geo.taludangle;
      tabledata[0]["trap talud 1 over"] = NaN;
    }
    physics.drainlevel_lastok = physics.drainlevel;
    tabledata[0]["drain level"] = physics.drainlevel;
    fullgeoredraw();
    fneeddiscretization();
    return true;
  } else {
    let intro = "iGrOw cannot draw or discretize with the parameters set";
    intro += " because the following inequalities are not satisified:\n";
    intro += ineqnotsat;
    intro += "\n continue with the set values?";
    let question = confirm(intro);
    if (!question) {
      if (confirm("restore last iGrOw-consistent parameter values?")) {
        interactiveuse = false;
        geomenu.setValue("iGrOw width (L/2)", geo.domainwidth_lastok);
        m = geomenu._controls["iGrOw width (L/2)"].container;
        m.style.backgroundColor = "#eeeeee";
        geomenu.setValue("drain width (B/2)", geo.drainwidth_lastok);
        m = geomenu._controls["drain width (B/2)"].container;
        m.style.backgroundColor = "#eeeeee";
        physicsmenu.setValue("drain level", physics.drainlevel_lastok);
        m = physicsmenu._controls["drain level"].container;
        m.style.backgroundColor = "#eeeeee";
        geomenu.setValue("drain bottom", geo.drainbottom_lastok);
        m = geomenu._controls["drain bottom"].container;
        m.style.backgroundColor = "#eeeeee";
        geomenu.setValue("domain height", geo.domainheight_lastok);
        m = geomenu._controls["domain height"].container;
        m.style.backgroundColor = "#eeeeee";
        geomenu.setValue("domain height", geo.domainheight_lastok);
        m = geomenu._controls["domain height"].container;
        m.style.backgroundColor = "#eeeeee";
        geomenu.setValue("top talud angle", geo.taludangle_lastok);
        m = geomenu._controls["top talud angle"].container;
        m.style.backgroundColor = "#eeeeee";
        console.log("aaaaa");
        geomenu.setValue("trap talud 1 over", geo.traptalud_lastok);
        m = geomenu._controls["trap talud 1 over"].container;
        m.style.backgroundColor = "#eeeeee";
        interactiveuse = true;
      }
    }
    return false;
  }
}

var wfe_run_param = new waitforenterkey();
wfe_run_param.do_if_any(function () {
  control_run_params();
});

function control_run_params() {
  // console.log(" in control run!")
  if (interactiveuse) {
    let m = geomenu._controls["catchment curvature"].container;
    m.style.backgroundColor = "#eeeeee";
    m = physicsmenu._controls["c seepage"].container;
    m.style.backgroundColor = "#eeeeee";
    m = physicsmenu._controls["c drain"].container;
    m.style.backgroundColor = "#eeeeee";
    geomenu.hideControl("to commit number(s)");
    physicsmenu.hideControl("to commit number(s)");
  }
  let ineqnotsat = "";
  if (modelchoices.catchment == "convergent") {
    if (!(geo.curvature < geo.domainwidth)) {
      if (interactiveuse) {
        m = geomenu._controls["catchment curvature"].container;
        m.style.backgroundColor = "#fb9b9b";
        ineqnotsat += "  convergent catchment: curvature < domain width\n";
      } else {
        return false;
      }
    }
  }
  if (modelchoices.cvaluesinterpolated == "height interpolated") {
    if (!(physics.cseepage < physics.cdrain + 1e-8)) {
      if (interactiveuse) {
        m = physicsmenu._controls["c seepage"].container;
        m.style.backgroundColor = "#fb9b9b";
        m = physicsmenu._controls["c drain"].container;
        m.style.backgroundColor = "#fb9b9b";
        ineqnotsat += "  c seepage < c drain\n";
      } else {
        return false;
      }
    }
  }
  // calculate eigenvalues transivity
  let D = Math.sqrt(
    Math.pow(physics.kxx - physics.kzz, 2) + 4 * Math.pow(physics.kxz, 2)
  );
  let l1 = (physics.kxx + physics.kzz + D) / 2;
  let l2 = (physics.kxx + physics.kzz - D) / 2;
  // console.log("eigenvalues", l1, l2);
  if (!(Math.min(l1, l2) > 0)) {
    if (interactiveuse) {
      m = physicsmenu._controls["kxx"].container;
      m.style.backgroundColor = "#fb9b9b";
      m = physicsmenu._controls["kzz"].container;
      m.style.backgroundColor = "#fb9b9b";
      m = physicsmenu._controls["kxz"].container;
      m.style.backgroundColor = "#fb9b9b";
      ineqnotsat += "  eigenvalues k-matrix > 0\n";
    } else {
      return false;
    }
  }
  if (!interactiveuse) {
    return true;
  }
  if (ineqnotsat == "") {
    geo.curvature_lastok = geo.curvature;
    tabledata[0]["catchment curvature"] = geo.curvature;
    physics.cseepage_lastok = physics.cseepage;
    tabledata[0]["c seepage"] = physics.cseepage;
    physics.cdrain_lastok = physics.cdrain;
    tabledata[0]["c drain"] = physics.cdrain;
    tabledata[0]["recharge *1000"] = physics.recharge * 1000;
    physics.kxx_lastok = physics.kxx;
    tabledata[0]["kxx"] = physics.kxx;
    physics.kzz_lastok = physics.kzz;
    tabledata[0]["kzz"] = physics.kzz;
    physics.kxz_lastok = physics.kxz;
    tabledata[0]["kxz"] = physics.kxz;
    // just a hack
    let m = physicsmenu._controls["kxx"].container;
    m.style.backgroundColor = "#DCDCDC";
    m = physicsmenu._controls["kzz"].container;
    m.style.backgroundColor = "#DCDCDC";
    m = physicsmenu._controls["kxz"].container;
    m.style.backgroundColor = "#DCDCDC";
    tabledata[0]["c base"] = physics.cbase;
    tabledata[0]["H base"] = physics.hbase;
    if (modelchoices.riparianconnection == "seepage face") {
      fneeddiscretization();
    }
    fneedsolution();
    return true;
  } else {
    let intro = "iGrOw cannot run  with the parameters set";
    intro += " because the following inequalities are not satisified:\n";
    intro += ineqnotsat;
    intro += "\n continue with the set values?";
    let question = confirm(intro);
    if (!question) {
      if (confirm("restore last iGrOw-consistent parameter values?")) {
        interactiveuse = false;
        geomenu.setValue("catchment curvature", geo.curvature_lastok);
        m = geomenu._controls["catchment curvature"].container;
        m.style.backgroundColor = "#eeeeee";
        physicsmenu.setValue("c seepage", physics.cseepage_lastok);
        m = physicsmenu._controls["c seepage"].container;
        m.style.backgroundColor = "#eeeeee";
        physicsmenu.setValue("c drain", physics.cdrain_lastok);
        m = physicsmenu._controls["c drain"].container;
        m.style.backgroundColor = "#eeeeee";
        physicsmenu.setValue("kxx", physics.kxx_lastok);
        m = physicsmenu._controls["kxx"].container;
        m.style.backgroundColor = "#eeeeee";
        physicsmenu.setValue("kzz", physics.kzz_lastok);
        m = physicsmenu._controls["kzz"].container;
        m.style.backgroundColor = "#eeeeee";
        physicsmenu.setValue("kxz", physics.kxz_lastok);
        m = physicsmenu._controls["kxz"].container;
        m.style.backgroundColor = "#eeeeee";
        interactiveuse = true;
      }
    }
    return false;
  }
}

var wfe_CELL_param = new waitforenterkey();
wfe_CELL_param.do_if_any(function () {
  control_CELL_params();
});

function control_CELL_params() {
  if (interactiveuse) {
    let m = solutionmenu._controls["CELL width"].container;
    m.style.backgroundColor = "#eeeeee";
  }
  let ineqnotsat = "";
  if (!(geo.CELLwidth > geo.drainwidth - 1e-8)) {
    if (interactiveuse) {
      m = solutionmenu._controls["CELL width"].container;
      m.style.backgroundColor = "#fb9b9b";
      ineqnotsat = "  CELL width >= drain width\n";
    } else {
      return false;
    }
  }
  if (!(geo.CELLwidth < geo.domainwidth + 1e-8)) {
    if (interactiveuse) {
      m = solutionmenu._controls["CELL width"].container;
      m.style.backgroundColor = "#fb9b9b";
      ineqnotsat = "  CELL width <= domain width\n";
    } else {
      return false;
    }
  }
  if (!interactiveuse) {
    return true;
  }
  if (ineqnotsat == "") {
    geo.CELLwidth_lastok = geo.CELLwidth;
    tabledata[0]["CELL width"] = geo.CELLwidth;
    fdoCellanalysis(true);
    return true;
  } else {
    fdoCellanalysis(false);
    let intro =
      "iGrOw cann not calculate CELL results  with the parameters set";
    intro += " because the following inequalities are not satisified:\n";
    intro += ineqnotsat;
    intro += "\n continue with the set values?";
    let question = confirm(intro);
    if (!question) {
      if (confirm("restore last iGrOw-consistent parameter values?")) {
        interactiveuse = false;
        geomenu.setValue("CELL width", geo.CELLwidth_lastok);
        m = solutionmenu._controls["CELL width"].container;
        m.style.backgroundColor = "#eeeeee";
        interactiveuse = true;
      }
      return false;
    }
  }
}
