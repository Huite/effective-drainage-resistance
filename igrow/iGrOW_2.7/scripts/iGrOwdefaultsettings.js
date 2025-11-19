var geo = {
  domainwidth: 100,
  domainheight: 10,
  drainwidth: 1,
  drainbottom: 8,
  taludangle: 85,
  CELLwidth:  NaN,
  hasbaselayer: false
};

var physics = {
  drainlevel: 9.5,
  recharge: 0.001,
  kxx: 2,
  kxz: 0,
  kzz: 2,
  cdrain: 0.1,
  cseepage: 0.1,
  cbase: 10,
  Hbase: 9.5,
};

var numerics = {
  horleft: 8,
  horright: 15,
  ver: 8,
  denshor: 1.5,
  densver: 1.5
}

var convergence = {
  omega: 1.9,
  theta: 1.9,
  maxiter1: 1000,
  maxiter2: 1000,
  maxHchange: 1e-5,
  maxQchange: 1e-6,
  logmaxchange: false
}
