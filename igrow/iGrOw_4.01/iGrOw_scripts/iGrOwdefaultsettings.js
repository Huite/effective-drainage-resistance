var modelchoices = {
  modelbottom: "closed", //  "closed" "open"
  riparianconnection: "impermeable", // "impermeable", "seepage face", "dirichlet"
  cvaluesinterpolated: "non-interpolated", //"non-interpolated", "height interpolated"
  catchment : "parallel", // "parallel", "convergent", "divergent"
  crosssection: "smooth" // "smooth", "trapezoidal"
}


var geo = {
  domainwidth: 120,
  domainheight: 11,
  drainwidth: 4,
  drainbottom: 8.1,
  taludangle: 75,
  traptalud: 0,
  CELLwidth: NaN,
  curvature: 0,
  condivfactor: 0,
};

var physics = {
  drainlevel: 8.6,
  recharge: 0.002,
  kxx: 1,
  kxz: 0,
  kzz: 1,
  cdrain: 5,
  cseepage: 2,
  cbase: 20,
  Hbase: 9.5,
};


var numerics = {
  horleft: 20,
  horright: 30,
  verleft: 15,
  verright: 9,
  densfactor: 0.4
};

var convergence = {
  omega: 1.8,
  alpha: 0.5,
  baserelax: 0.9,
  maxiter1: 500,
  maxiter2: 500,
  maxHchange: 1e-4,
  maxQchange: 1e-5,
  maxdiffHY: 1e-3,
};
