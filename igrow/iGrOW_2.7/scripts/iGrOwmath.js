var discretisation = {
  numnodes: null,
  numhornodes: null,
  numvernodes: null,
  XYnodes: [],
  DULRcells: [], //DownLeft,UpLeft,UpRight,DownRight
  topnodes: [],
  bottomnodes: [],
  itopnode: [],
  iN: [], // node at north etc
  iNE: [],
  iE: [],
  iSE: [],
  iS: [],
  iSW: [],
  iW: [],
  iNW: [],
  icNW: [], //cell at NW etc
  icNE: [],
  icSW: [],
  icSE: [],
  done: false
};

var state = {
  H: [],
  Qbase: [],
  minH: null,
  maxH: null,
  Htopmean: null,
  Hbottommean: null,
  Qtotrecharge: 0,
  Qtotbase: 0,
  Qtotdrain: 0
};

var eqs = {
  QC: [],
  QN: [],
  QNE: [],
  QE: [],
  QSE: [],
  QS: [],
  QSW: [],
  QW: [],
  QNW: [],
  QXc: [],
  QX: [],
  cdrain: []
};

function constructXYdomain() {
  XYdomain = [];
  // left under
  XYdomain.push(0);
  XYdomain.push(0);
  // the drain cross section
  var Ndrainpoints = 100;
  for (var i = 0; i < Ndrainpoints + 1; i++) {
    XYdomain[2 + 2 * i] = (geo.drainwidth * i) / Ndrainpoints;
  }
  var mincwidth = 0;
  var maxcwidth = geo.drainwidth;
  var depth = geo.domainheight - geo.drainbottom;
  var tangle = Math.tan((geo.taludangle / 180) * Math.PI);
  while (maxcwidth - mincwidth > geo.drainwidth * 0.01) {
    var cwidth = (maxcwidth + mincwidth) / 2;
    var delwidth = geo.drainwidth - cwidth;
    m = tangle * delwidth;
    var a3 = m - 2 * depth;
    var a2 = 3 * depth - m;
    var minz = 0;
    for (var i = 0; i < Ndrainpoints; i++) {
      t = (XYdomain[2 + 2 * i] - cwidth) / delwidth;
      if (t < 0) {
        XYdomain[3 + 2 * i] = geo.drainbottom;
      } else {
        var t2 = t * t;
        var t3 = t2 * t;
        var z = a2 * t2 + a3 * t3;
        XYdomain[3 + 2 * i] = geo.drainbottom + z;
        if (z < minz) {
          minz = z;
        }
      }
    }
    if (minz < 0) {
      mincwidth = cwidth;
    } else {
      maxcwidth = cwidth;
    }
  }
  // right upper and lower ned
  XYdomain.push(geo.domainheight);
  XYdomain.push(geo.domainwidth);
  XYdomain.push(geo.domainheight);
  XYdomain.push(geo.domainwidth);
  XYdomain.push(0);
}

function topground(x) {
  if (x < geo.drainwidth) {
    var i = Math.ceil((100 * x) / geo.drainwidth);
    return XYdomain[3 + 2 * i];
  } else {
    return geo.domainheight;
  }
}

function makeVnodes(N, dens) {
  var a = 1 / N / dens;
  var b = (1 - N * a) / ((N * (N + 1)) / 2);

  var prevy = 0;
  var y = [prevy];

  for (var i = 1; i <= N; i++) {
    prevy = prevy + a + (N - i + 1) * b;
    y.push(prevy);
  }
  return y;
}

function makeHnodes(xleft, xdens, xright, Nleft, Nright, ndens) {
  // the left side
  var a = (xdens - xleft) / Nleft / ndens;
  var denom = 0;
  for (var i = 1; i < Nleft; i++) {
    denom = denom + i;
  }
  var b = (xdens - xleft - a * Nleft) / denom;
  var nodes = [];
  var revnodes = 0;
  nodes[Nleft] = xdens - revnodes;
  for (var i = 0; i < Nleft; i++) {
    revnodes += a + b * i;
    nodes[Nleft - i - 1] = xdens - revnodes;
  }
  // the right side
  var pow = 1;
  var powisok = false;
  while (!powisok) {
    denom = 0;
    for (var i = 1; i < Nright; i++) {
      denom = denom + Math.pow(i, pow);
    }
    b = (xright - xdens - a * Nright) / denom;
    if (a + b * Math.pow(2, pow) < 4 * a) {
      powisok = true;
    } else {
      pow = pow + 0.1;
      // if(pow>5)
      // {
      //   powisok = true;
      // }
    }
  }
  curnode = xdens + a;
  nodes.push(curnode);
  // curnode = xdens + a;
  for (var i = 1; i < Nright; i++) {
    curnode = curnode + (a + b * Math.pow(i, pow));
    nodes.push(curnode);
  }
  return nodes;
}

function resetnodestotop() {
  var j = 0;
  for (var ix = 0; ix < discretisation.numhornodes; ix++) {
    var x = discretisation.hornodes[ix];
    var top = topground(x);
    for (var iy = 0; iy < discretisation.numvernodes; iy++) {
      var y = discretisation.vernodes[iy] * top;
      discretisation.XYnodes.push(x);
      discretisation.XYnodes.push(y);
    }
  }
}

function constructXYNodes() {
  var ydens = physics.drainlevel; //-0.1 * geo.drainbottom + 1.1 * physics.drainlevel;
  var xdens = 0;
  while (topground(xdens) < ydens) {
    xdens += 0.01;
  }
  xdens -= 0.005;
  discretisation.hornodes = makeHnodes(
    0,
    xdens,
    geo.domainwidth,
    numerics.horleft,
    numerics.horright,
    numerics.denshor
  );
  discretisation.numhornodes = discretisation.hornodes.length;

  discretisation.vernodes = makeVnodes(numerics.ver, 9 * numerics.densver - 8);
  discretisation.numvernodes = discretisation.vernodes.length;
  discretisation.numnodes =
    discretisation.numhornodes * discretisation.numvernodes;
  discretisation.XYnodes = [];
  for (var ix = 0; ix < discretisation.numhornodes; ix++) {
    var x = discretisation.hornodes[ix];
    var top = topground(x);
    for (var iy = 0; iy < discretisation.numvernodes; iy++) {
      var y = discretisation.vernodes[iy] * top;
      discretisation.XYnodes.push(x);
      discretisation.XYnodes.push(y);
    }
  }
}

function constructDULRcells() {
  discretisation.DULRcells = [];
  var DL = 0;
  for (var ih = 0; ih < discretisation.numhornodes - 1; ih++) {
    for (var iv = 0; iv < discretisation.numvernodes - 1; iv++) {
      var UL = DL + 1;
      var UR = UL + discretisation.numvernodes;
      var DR = DL + discretisation.numvernodes;
      var newcell = [DL, UL, UR, DR];
      discretisation.DULRcells.push(newcell);
      var icell = discretisation.DULRcells.length - 1;
      discretisation.icNE[DL] = icell;
      discretisation.icSE[UL] = icell;
      discretisation.icSW[UR] = icell;
      discretisation.icNW[DR] = icell;
      DL += 1;
    }
    DL += 1;
  }
}

function constructinodes() {
  discretisation.topnodes = []; // the node numbers at the top
  discretisation.itopnode = []; // the index in the array above where to find topnode
  discretisation.iN = [];
  discretisation.iNE = [];
  discretisation.iE = [];
  discretisation.iSE = [];
  discretisation.iS = [];
  discretisation.iSW = [];
  discretisation.iW = [];
  discretisation.iNW = [];
  discretisation.bottomnodes = [];

  var curi = 0;
  for (var ih = 0; ih < discretisation.numhornodes; ih++) {
    discretisation.bottomnodes[ih] = ih * discretisation.numvernodes;
    var itop = (ih + 1) * discretisation.numvernodes - 1;
    discretisation.topnodes.push(itop);
    for (var iv = 0; iv < discretisation.numvernodes; iv++) {
      discretisation.itopnode[curi] = ih;
      if (iv < discretisation.numvernodes - 1) {
        discretisation.iN[curi] = curi + 1;
      } else {
        discretisation.iN[curi] = discretisation.numnodes;
      }
      if (
        (iv < discretisation.numvernodes) &
        (ih < discretisation.numhornodes - 1)
      ) {
        discretisation.iNE[curi] = curi + 1 + discretisation.numvernodes;
      } else {
        discretisation.iNE[curi] = discretisation.numnodes;
      }
      if (ih < discretisation.numhornodes - 1) {
        discretisation.iE[curi] = curi + discretisation.numvernodes;
      } else {
        discretisation.iE[curi] = discretisation.numnodes;
      }
      if ((iv > 0) & (ih < discretisation.numhornodes - 1)) {
        discretisation.iSE[curi] = curi - 1 + discretisation.numvernodes;
      } else {
        discretisation.iSE[curi] = discretisation.numnodes;
      }
      if (iv > 0) {
        discretisation.iS[curi] = curi - 1;
      } else {
        discretisation.iS[curi] = discretisation.numnodes;
      }
      if ((iv > 0) & (ih > 0)) {
        discretisation.iSW[curi] = curi - 1 - discretisation.numvernodes;
      } else {
        discretisation.iSW[curi] = discretisation.numnodes;
      }
      if (ih > 0) {
        discretisation.iW[curi] = curi - discretisation.numvernodes;
      } else {
        discretisation.iW[curi] = discretisation.numnodes;
      }
      if ((ih > 0) & (iv < discretisation.numvernodes - 1)) {
        discretisation.iNW[curi] = curi + 1 - discretisation.numvernodes;
      } else {
        discretisation.iNW[curi] = discretisation.numhornodes;
      }
      curi += 1;
    }
  }
}
//
// flux calculations
//

function fluxintriangle(Ax, Az, Bx, Bz, Cx, Cz, HA, HB, HC, kxx, kxz, kzz) {
  var xAB = Ax - Bx;
  var zAB = Az - Bz;
  var HAB = HA - HB;
  var xCA = Cx - Ax;
  var zCA = Cz - Az;
  var HCA = HC - HA;

  var D = xCA * zAB - xAB * zCA;

  var dHdx = (-zCA * HAB + zAB * HCA) / D;
  var dHdz = (xCA * HAB - xAB * HCA) / D;

  var qx = -kxx * dHdx - kxz * dHdz;
  var qz = -kxz * dHdx - kzz * dHdz;
  return {
    qx: qx,
    qz: qz
  };
}

function dotriangle(Ax, Az, Bx, Bz, Cx, Cz, kxx, kxz, kzz) {
  var xAB = Ax - Bx;
  var zAB = Az - Bz;
  var xBC = Bx - Cx;
  var zBC = Bz - Cz;
  var xCA = Cx - Ax;
  var zCA = Cz - Az;

  var D = xCA * zAB - xAB * zCA;

  var qxA = (-kxx * zBC + kxz * xBC) / D;
  var qyA = (-kxz * zBC + kzz * xBC) / D;
  var qxB = (-kxx * zCA + kxz * xCA) / D;
  var qyB = (-kxz * zCA + kzz * xCA) / D;
  var qxC = (-kxx * zAB + kxz * xAB) / D;
  var qyC = (-kxz * zAB + kzz * xAB) / D;

  QAA = (-zBC * qxA + xBC * qyA) / 2;
  QBA = (-zCA * qxA + xCA * qyA) / 2;
  QCA = (-zAB * qxA + xAB * qyA) / 2;

  QAB = (-zBC * qxB + xBC * qyB) / 2;
  QBB = (-zCA * qxB + xCA * qyB) / 2;
  QCB = (-zAB * qxB + xAB * qyB) / 2;

  QAC = (-zBC * qxC + xBC * qyC) / 2;
  QBC = (-zCA * qxC + xCA * qyC) / 2;
  QCC = (-zAB * qxC + xAB * qyC) / 2;

  var result = {
    q: {
      qxA: qxA,
      qyA: qyA,
      qxB: qxB,
      qxC: qxC,
      qyC: qyC
    },
    Q: {
      QAA: QAA,
      QAB: QAB,
      QAC: QAC,
      QBA: QBA,
      QBB: QBB,
      QBC: QBC,
      QCA: QCA,
      QCB: QCB,
      QCC: QCC
    }
  };
  return result;
}

function doquad(Ex, Ey, Fx, Fy, Gx, Gy, Hx, Hy, kxx, kxz, kzz) {
  var QEFG = dotriangle(Ex, Ey, Fx, Fy, Gx, Gy, kxx, kxz, kzz).Q;
  var QEGH = dotriangle(Ex, Ey, Gx, Gy, Hx, Hy, kxx, kxz, kzz).Q;
  var QEFH = dotriangle(Ex, Ey, Fx, Fy, Hx, Hy, kxx, kxz, kzz).Q;
  var QFGH = dotriangle(Fx, Fy, Gx, Gy, Hx, Hy, kxx, kxz, kzz).Q;

  var QEE = 0.5 * (QEFG.QAA + QEGH.QAA + QEFH.QAA);
  var QEF = 0.5 * (QEFG.QAB + QEFH.QAB);
  var QEG = 0.5 * (QEFG.QAC + QEGH.QAB);
  var QEH = 0.5 * (QEGH.QAC + QEFH.QAC);

  var QFF = 0.5 * (QEFG.QBB + QEFH.QBB + QFGH.QAA);
  var QFE = 0.5 * (QEFG.QBA + QEFH.QBA);
  var QFG = 0.5 * (QEFG.QBC + QFGH.QAB);
  var QFH = 0.5 * (QEFH.QBC + QFGH.QAC);

  var QGG = 0.5 * (QEFG.QCC + QEGH.QBB + QFGH.QBB);
  var QGE = 0.5 * (QEFG.QCA + QEGH.QBA);
  var QGF = 0.5 * (QEFG.QCB + QFGH.QBA);
  var QGH = 0.5 * (QEGH.QBC + QFGH.QBC);

  var QHH = 0.5 * (QEGH.QCC + QEFH.QCC + QFGH.QCC);
  var QHE = 0.5 * (QEGH.QCA + QEFH.QCA);
  var QHF = 0.5 * (QEFH.QCB + QFGH.QCA);
  var QHG = 0.5 * (QEGH.QCB + QFGH.QCB);

  return {
    QEE: QEE,
    QEF: QEF,
    QEG: QEG,
    QEH: QEH,
    QFE: QFE,
    QFF: QFF,
    QFG: QFG,
    QFH: QFH,
    QGE: QGE,
    QGF: QGF,
    QGH: QGH,
    QGG: QGG,
    QHE: QHE,
    QHF: QHF,
    QHG: QHG,
    QHH: QHH
  };
}

function setupeqs() {
  for (var i = 0; i < discretisation.numnodes; i++) {
    eqs.QC[i] = 0;
    eqs.QN[i] = 0;
    eqs.QNE[i] = 0;
    eqs.QE[i] = 0;
    eqs.QSE[i] = 0;
    eqs.QS[i] = 0;
    eqs.QSW[i] = 0;
    eqs.QW[i] = 0;
    eqs.QNW[i] = 0;
    eqs.QXc[i] = 0;
    eqs.QX[i] = 0;
    eqs.cdrain[i] = 0;
  }
  for (var i = 0; i < discretisation.DULRcells.length; i++) {
    var cell = discretisation.DULRcells[i];
    var quad = doquad(
      discretisation.XYnodes[2 * cell[0]],
      discretisation.XYnodes[2 * cell[0] + 1],
      discretisation.XYnodes[2 * cell[1]],
      discretisation.XYnodes[2 * cell[1] + 1],
      discretisation.XYnodes[2 * cell[2]],
      discretisation.XYnodes[2 * cell[2] + 1],
      discretisation.XYnodes[2 * cell[3]],
      discretisation.XYnodes[2 * cell[3] + 1],
      physics.kxx,
      physics.kxz,
      physics.kzz
    );
    eqs.QC[cell[0]] += quad.QEE;
    eqs.QN[cell[0]] += quad.QEF;
    eqs.QNE[cell[0]] += quad.QEG;
    eqs.QE[cell[0]] += quad.QEH;
    eqs.QC[cell[1]] += quad.QFF;
    eqs.QS[cell[1]] += quad.QFE;
    eqs.QE[cell[1]] += quad.QFG;
    eqs.QSE[cell[1]] += quad.QFH;
    eqs.QC[cell[2]] += quad.QGG;
    eqs.QS[cell[2]] += quad.QGH;
    eqs.QSW[cell[2]] += quad.QGE;
    eqs.QW[cell[2]] += quad.QGF;
    eqs.QC[cell[3]] += quad.QHH;
    eqs.QW[cell[3]] += quad.QHE;
    eqs.QNW[cell[3]] += quad.QHF;
    eqs.QN[cell[3]] += quad.QHG;
  }

  for (var j = 0; j < discretisation.topnodes.length - 1; j++) {
    var lefti = discretisation.topnodes[j];
    var righti = discretisation.topnodes[j + 1];
    var halfdx =
      (discretisation.XYnodes[2 * righti] - discretisation.XYnodes[2 * lefti]) /
      2;
    var halfdz =
      (discretisation.XYnodes[2 * righti + 1] -
        discretisation.XYnodes[2 * lefti + 1]) /
      2;
    var halfL = Math.sqrt(halfdx * halfdx + halfdz * halfdz);
    if (discretisation.XYnodes[2 * lefti] < geo.drainwidth) {
      var idrainbottom = topground(discretisation.XYnodes[2 * lefti]);
      if (discretisation.XYnodes[2 * lefti + 1] > idrainbottom - 1e-4) {
        var Hdrain = Math.max(physics.drainlevel, idrainbottom);
        let yfrac =
          (discretisation.XYnodes[2 * lefti + 1] - geo.drainbottom) /
          (physics.drainlevel - geo.drainbottom);
        if (yfrac > 1) {
          yfrac = 1;
        }
        let cdrainy = (1 - yfrac) * physics.cdrain + yfrac * physics.cseepage;
        eqs.QXc[lefti] -= halfL / cdrainy;
        eqs.QC[lefti] -= halfL / cdrainy;
        eqs.QX[lefti] += (halfL * Hdrain) / cdrainy;
        eqs.cdrain[lefti] = cdrainy;
      }
    } else {
      eqs.QXc[lefti] = 0;
      eqs.QX[lefti] += halfdx * physics.recharge;
    }
    if (discretisation.XYnodes[2 * righti] < geo.drainwidth) {
      var idrainbottom = topground(discretisation.XYnodes[2 * righti]);
      if (discretisation.XYnodes[2 * righti + 1] > idrainbottom - 1e-4) {
        var Hdrain = Math.max(physics.drainlevel, idrainbottom);
        let yfrac =
          (discretisation.XYnodes[2 * lefti + 1] - geo.drainbottom) /
          (physics.drainlevel - geo.drainbottom);
        if (yfrac > 1) {
          yfrac = 1;
        }
        let cdrainy = (1 - yfrac) * physics.cdrain + yfrac * physics.cseepage;
        eqs.QXc[righti] -= halfL / cdrainy;
        eqs.QC[righti] -= halfL / cdrainy;
        eqs.QX[righti] += (halfL * Hdrain) / cdrainy;
        eqs.cdrain[righti] = cdrainy;
      }
    } else {
      eqs.QXc[righti] = 0;
      eqs.QX[righti] += halfdx * physics.recharge;
    }
  }

  if (geo.hasbaselayer) {
    for (var j = 0; j < discretisation.bottomnodes.length - 1; j++) {
      var lefti = discretisation.bottomnodes[j];
      var righti = discretisation.bottomnodes[j + 1];

      var halfL =
        (discretisation.XYnodes[2 * righti] -
          discretisation.XYnodes[2 * lefti]) /
        2;
      eqs.QX[lefti] += halfL * state.Qbase[lefti];
      eqs.QX[righti] += halfL * state.Qbase[righti];
    }
  }
}

function initialiseHold() {
  state.H = [];
  for (var i = 0; i < discretisation.numnodes; i++) {
    var topnodenumber = discretisation.topnodes[discretisation.itopnode[i]];
    state.H[i] = discretisation.XYnodes[2 * topnodenumber + 1];
  }
  state.H[discretisation.numnodes] = 0; // for indices outside domain
}

function initialiseH() {
  state.H = [];
  for (var i = 0; i < discretisation.numnodes; i++) {
    var topnodenumber = discretisation.topnodes[discretisation.itopnode[i]];
    state.H[i] = physics.drainlevel;
  }
  state.H[discretisation.numnodes] = 0; // for indices outside domain
  adjustgrid();
  if (geo.hasbaselayer) {
    var f = 1 - physics.Hbase / physics.drainlevel;

    for (var i = 0; i < discretisation.numnodes; i++) {
      var z = discretisation.XYnodes[2 * i + 1];
      state.H[i] = z * f + physics.Hbase;
      state.Qbase[i] = 0;
    }
  }
}

var XYHtop = [];

function constructXYHtop() {
  XYHtop = [];
  for (var i = 0; i < discretisation.topnodes.length; i++) {
    var j = discretisation.topnodes[i];
    XYHtop.push(discretisation.XYnodes[2 * j]);
    XYHtop.push(state.H[j]);
  }
}



function updateQbase() {
  var maxchange = 0;
  if (geo.hasbaselayer) {
    for (var j = 0; j < discretisation.bottomnodes.length; j++) {
      var inode = discretisation.bottomnodes[j];
      var Qupdate =
        (physics.Hbase - state.H[inode]) / physics.cbase - state.Qbase[inode];
      maxchange = Math.max(maxchange, Math.abs(Qupdate));
      state.Qbase[inode] =
        state.Qbase[inode] + (convergence.theta / 100) * Qupdate;
    }
    if (convergence.logmaxchange) {
      console.log(maxchange);
    }
  }
  return maxchange;
}

function solvestep() {
  var critH = 0;
  var critQ = 0;
  for (var i = 0; i < discretisation.numnodes; i++) {
    let oH = state.H[i];
    let Qi =
      eqs.QX[i] +
      eqs.QN[i] * state.H[discretisation.iN[i]] +
      eqs.QNE[i] * state.H[discretisation.iNE[i]] +
      eqs.QE[i] * state.H[discretisation.iE[i]] +
      eqs.QSE[i] * state.H[discretisation.iSE[i]] +
      eqs.QS[i] * state.H[discretisation.iS[i]] +
      eqs.QSW[i] * state.H[discretisation.iSW[i]] +
      eqs.QW[i] * state.H[discretisation.iW[i]] +
      eqs.QNW[i] * state.H[discretisation.iNW[i]];
    let nH = -Qi / eqs.QC[i];
    state.H[i] = convergence.omega * nH + (1 - convergence.omega) * oH;
    critH = Math.max(critH, Math.abs(oH - state.H[i]));
    critQ = Math.max(critQ, Math.abs(Qi + eqs.QC[i] * state.H[i]));
  }
  return {
    critH: critH,
    critQ: critQ
  };
}

function adjustgrid() {
  var maxzchange = 0;
  var factor = [];
  for (var i = 0; i < discretisation.topnodes.length; i++) {
    var inode = discretisation.topnodes[i];
    var maxtop = Math.min(
      topground(discretisation.XYnodes[2 * inode]),
      state.H[inode]
    );
    factor[i] = maxtop / discretisation.XYnodes[2 * inode + 1];
  }
  for (var i = 0; i < discretisation.numnodes; i++) {
    var oldz = discretisation.XYnodes[2 * i + 1];
    var newz = oldz * factor[discretisation.itopnode[i]];
    maxzchange = Math.max(maxzchange, Math.abs(oldz - newz));
    discretisation.XYnodes[2 * i + 1] = newz;
  }
  return maxzchange;
}

function calcsolutionstats() {
  state.minH = state.H[0];
  state.maxH = state.H[0];
  for (var iH = 1; iH < discretisation.numnodes; iH++) {
    if (state.maxH < state.H[iH]) {
      state.maxH = state.H[iH];
    } else if (state.minH > state.H[iH]) {
      state.minH = state.H[iH];
    }
  }
  curtable[0]["H_min"] = state.minH.toFixed(4);
  curtable[0]["H_max"] = state.maxH.toFixed(4);

  // calculating Htopmean
  state.Htopmean = 0;
  for (var i = 1; i < discretisation.topnodes.length; i++) {
    var inode = discretisation.topnodes[i];
    var iprevnode = discretisation.topnodes[i - 1];
    var curH = state.H[inode];
    var prevH = state.H[iprevnode];
    var curx = discretisation.XYnodes[2 * inode];
    var prevx = discretisation.XYnodes[2 * iprevnode];
    state.Htopmean += ((curx - prevx) * (curH + prevH)) / 2;
  }
  state.Htopmean /= geo.domainwidth;
  curtable[0]["Htop_mean"] = state.Htopmean.toFixed(4);
  // calculating Hbottommean
  state.Hbottommean = 0;
  for (var i = 1; i < discretisation.bottomnodes.length; i++) {
    var inode = discretisation.bottomnodes[i];
    var iprevnode = discretisation.bottomnodes[i - 1];
    var curH = state.H[inode];
    var prevH = state.H[iprevnode];
    var curx = discretisation.XYnodes[2 * inode];
    var prevx = discretisation.XYnodes[2 * iprevnode];
    state.Hbottommean += ((curx - prevx) * (curH + prevH)) / 2;
  }
  state.Hbottommean /= geo.domainwidth;
  curtable[0]["Hbottom_mean"] = state.Hbottommean.toFixed(4);
  // console.log("Htopmean", state.Htopmean, "Hbottommean", state.Hbottommean);

  // discharges
  state.Qtotrecharge = 0;
  state.Qtotdrain = 0;
  for (var i = 0; i < discretisation.topnodes.length; i++) {
    var inode = discretisation.topnodes[i];
    if (discretisation.XYnodes[2 * inode] < geo.drainwidth) {
      state.Qtotdrain += eqs.QXc[inode] * state.H[inode] + eqs.QX[inode];
    } else {
      state.Qtotrecharge += eqs.QXc[inode] * state.H[inode] + eqs.QX[inode];
    }
  }
  curtable[0]["Q tot recharge"] = state.Qtotrecharge.toExponential(4);
  curtable[0]["Q tot drain"] = state.Qtotdrain.toExponential(4);
  if (geo.hasbaselayer) {
    state.totQbase = 0;
    for (var j = 0; j < discretisation.bottomnodes.length - 1; j++) {
      var lefti = discretisation.bottomnodes[j];
      var righti = discretisation.bottomnodes[j + 1];
      var halfL =
        (discretisation.XYnodes[2 * righti] -
          discretisation.XYnodes[2 * lefti]) /
        2;
      state.totQbase += halfL * state.Qbase[lefti];
      state.totQbase += halfL * state.Qbase[righti];
    }
    curtable[0]["Q tot base"] = state.totQbase.toExponential(4);
  }


  var riverperimeter = 0;
  for(let i=2; i < XYdomain.length-4; i+=2)
  {
    if (XYdomain[i + 3] < geo.domainheight) {
      let diffx = XYdomain[i + 2] - XYdomain[i];
      let diffy = XYdomain[i + 3] - XYdomain[i + 1];
      riverperimeter += Math.sqrt(diffx * diffx + diffy * diffy);
    }  else {
      // last point: interpolate linear
      let slope = (XYdomain[i+1]-XYdomain[i-1])/(XYdomain[i]-XYdomain[i-2]);
      let dy = geo.domainheight-XYdomain[i+1];
      let dx = dy/slope;
      riverperimeter+= dx*Math.sqrt(1+slope*slope);
      break;
    }
  }

  // i = 0 : left point below
  // i = 2 : first point on river bed
  // as there is always a point exactly on the drainlevel
  // XYdomain[i+1] < drainlevel ==> XYdomain[i+3] <= drainlevel
  var riverwetperimeter = 0;
  var riverwetwidth = 0;
  for (var i = 2; i < XYdomain.length-4; i += 2) {
    if (XYdomain[i + 1] < physics.drainlevel) {
      let diffx = XYdomain[i + 2] - XYdomain[i];
      let diffy = XYdomain[i + 3] - XYdomain[i + 1];
      riverwetperimeter += Math.sqrt(diffx * diffx + diffy * diffy);
      riverwetwidth += diffx;
    } else {
      break;
    }
  }

  var grwetperimeter = 0;
  var j = 0;
  var notdone = true;
  var xend = XYdomain[2];
  var zend = XYdomain[3];
  while (notdone) {
    var i = discretisation.topnodes[j];
    var x = discretisation.XYnodes[2 * i];
    var z = discretisation.XYnodes[2 * i + 1];
    if (x < geo.drainwidth) {
      var zdrainbottom = topground(discretisation.XYnodes[2 * i]);
      if (z > zdrainbottom - 1e-4) {
        var dx = x - xend;
        var dz = z - zend;
        var dl =  Math.sqrt(dx * dx + dz * dz);
        grwetperimeter += dl;
        xend = x;
        zend = z;
      } else {
        notdone = false;
      }
    } else {
      notdone = false;
    }
    j++;
  }


  curtable[0]["Gr Wet Per"] = grwetperimeter.toExponential(4);
  curtable[0]["Ow Wet Per"] = riverwetperimeter.toExponential(4);
  curtable[0]["Ow Per"] = riverperimeter.toExponential(4);
  curtable[0]["Ow Wet Width"] = riverwetwidth.toExponential(4);
  table.updateData(curtable);
}

function solvesteps() {
  resetnodestotop();
  initialiseH();
  var crit1;
  var crit2;
  var crit3 = updateQbase();
  for (var iter2 = 0; iter2 < convergence.maxiter2; iter2++) {
    // console.log("iter2",iter2);

    setupeqs();
    for (var iter1 = 0; iter1 < convergence.maxiter1; iter1++) {
      // console.log("iter1",iter1);
      crit1 = solvestep();
      // if (crit1.critH < convergence.maxHchange) {
      //   break;
      // }
      if (
        (crit1.critH < convergence.maxHchange) &
        (crit1.critQ < convergence.maxQchange)
      ) {
        break;
      }
    }
    crit2 = adjustgrid();
    crit3 = updateQbase();
    if (
      (iter2 > 3) &
      (crit2 < convergence.maxHchange) &
      (crit3 < convergence.maxQchange)
    ) {
      break;
    }
  }
  constructXYHtop();
  calcsolutionstats();
}

function findnearestnode(x, y) {
  var diffx = x - discretisation.XYnodes[0];
  var diffy = y - discretisation.XYnodes[1];
  var dsq = diffx * diffx + diffy * diffy;
  var dsqmin = dsq;
  var inode = 0;
  for (var j = 2; j < discretisation.XYnodes.length; j += 2) {
    diffx = x - discretisation.XYnodes[j];
    diffy = y - discretisation.XYnodes[j + 1];
    dsq = diffx * diffx + diffy * diffy;
    if (dsq < dsqmin) {
      inode = j / 2;
      dsqmin = dsq;
    }
  }
  return inode;
}

function quadfluxes(icell) {
  var cell = discretisation.DULRcells[icell];
  var quad = doquad(
    discretisation.XYnodes[2 * cell[0]],
    discretisation.XYnodes[2 * cell[0] + 1],
    discretisation.XYnodes[2 * cell[1]],
    discretisation.XYnodes[2 * cell[1] + 1],
    discretisation.XYnodes[2 * cell[2]],
    discretisation.XYnodes[2 * cell[2] + 1],
    discretisation.XYnodes[2 * cell[3]],
    discretisation.XYnodes[2 * cell[3] + 1],
    physics.kxx,
    physics.kxz,
    physics.kzz
  );
  var hE = state.H[cell[0]];
  var hF = state.H[cell[1]];
  var hG = state.H[cell[2]];
  var hH = state.H[cell[3]];
  var qEF = quad.QEF * (hF - hE);
  var qEG = quad.QEG * (hG - hE);
  var qEH = quad.QEH * (hH - hE);
  var qFE = quad.QFE * (hE - hF);
  var qFG = quad.QFG * (hG - hF);
  var qFH = quad.QFH * (hH - hF);
  var qGE = quad.QGE * (hE - hG);
  var qGF = quad.QGF * (hF - hG);
  var qGH = quad.QGH * (hH - hG);
  var qHE = quad.QHE * (hE - hH);
  var qHF = quad.QHF * (hF - hH);
  var qHG = quad.QHG * (hG - hH);
  return {
    qEF: qEF,
    qEG: qEG,
    qEH: qEH,
    qFE: qFE,
    qFG: qFG,
    qFH: qFH,
    qGE: qGE,
    qGF: qGF,
    qGH: qGH,
    qHE: qHE,
    qHF: qHF,
    qHG: qHG
  };
}

function makeinspectionreport(inode) {
  var x = discretisation.XYnodes[2 * inode];
  var y = discretisation.XYnodes[2 * inode + 1];
  var report = "x=" + x.toFixed(2) + "; z=" + y.toFixed(3);
  report += "; H=" + state.H[inode].toFixed(3) + "<br />";
  var QN = 0;
  var QNE = 0;
  var QE = 0;
  var QSE = 0;
  var QS = 0;
  var QSW = 0;
  var QW = 0;
  var QNW = 0;
  if (typeof discretisation.icNE[inode] !== "undefined") {
    var Qquad = quadfluxes(discretisation.icNE[inode]);
    QN += Qquad.qEF;
    QNE += Qquad.qEG;
    QE += Qquad.qEH;
  }
  if (typeof discretisation.icSE[inode] !== "undefined") {
    var Qquad = quadfluxes(discretisation.icSE[inode]);
    QE += Qquad.qFG;
    QSE += Qquad.qFH;
    QS += Qquad.qFE;
  }
  if (typeof discretisation.icSW[inode] !== "undefined") {
    var Qquad = quadfluxes(discretisation.icSW[inode]);
    QS += Qquad.qGH;
    QSW += Qquad.qGE;
    QW += Qquad.qGF;
  }
  if (typeof discretisation.icNW[inode] !== "undefined") {
    var Qquad = quadfluxes(discretisation.icNW[inode]);
    QE += Qquad.qHE;
    QNW += Qquad.qHF;
    QN += Qquad.qHG;
  }
  report +=
    "QN= " + QN.toExponential(3) + "; QNE= " + QNE.toExponential(3) + "<br >";
  report +=
    "QE= " + QE.toExponential(3) + "; QSE= " + QSE.toExponential(3) + "<br >";
  report +=
    "QS= " + QS.toExponential(3) + "; QSW= " + QSW.toExponential(3) + "<br >";
  report +=
    "QW= " + QW.toExponential(3) + "; QNW= " + QNW.toExponential(3) + "<br >";
  var Qx = eqs.QXc[inode] * state.H[inode] + eqs.QX[inode];
  report += "Qext= " + Qx.toExponential(3);
  if (eqs.cdrain[inode] > 0) {
    report += " cdrain=" + eqs.cdrain[inode].toExponential(3);
  }
  report += "<br >";
  var sum = QN + QNE + QE + QSE + QS + QSW + QW + QNW + Qx;
  report += "sum =" + sum.toExponential(3);
  return report;
}

function makeCELLcalculations() {
  var Qlat;
  var Qtop;
  var crivCELL = 0;
  var cbaseCELL = 0;
  // calculating Hmean
  var i = 0;
  var itopnode = discretisation.topnodes[i];
  var prevH = state.H[itopnode];
  var prevx = discretisation.XYnodes[2 * itopnode];
  var Hint = 0;
  i++;
  itopnode = discretisation.topnodes[i];
  var curx = discretisation.XYnodes[2 * itopnode];
  var curH = state.H[itopnode];
  while (curx < geo.CELLwidth) {
    Hint += ((curH + prevH) / 2) * (curx - prevx);
    prevH = curH;
    prevx = curx;
    i++;
    if (i < discretisation.topnodes.length) {
      itopnode = discretisation.topnodes[i];
      curx = discretisation.XYnodes[2 * itopnode];
      curH = state.H[itopnode];
    } else {
      break;
    }
  }
  // Hint += (curx-geo.CELLwidth)*(curx-prevx)*(curH + prevH) / 2 * (curx-prevx);
  Hint += ((curH + prevH) / 2) * (geo.CELLwidth - prevx);
  var Hmean = Hint / geo.CELLwidth;

  var cfleak =
    (-(Hmean - physics.drainlevel) / state.Qtotdrain) * geo.CELLwidth;

  // calculating Qbase
  var Qbase = 0;
  if (geo.hasbaselayer) {
    for (var j = 0; j < discretisation.bottomnodes.length - 1; j++) {
      var lefti = discretisation.bottomnodes[j];
      var righti = discretisation.bottomnodes[j + 1];
      var leftx = discretisation.XYnodes[2 * lefti];
      var rightx = discretisation.XYnodes[2 * righti];
      var endx = Math.min(rightx, geo.CELLwidth);
      var halfL = (endx - leftx) / 2;
      Qbase += halfL * state.Qbase[lefti];
      Qbase += halfL * state.Qbase[righti];
      if (rightx > endx) break;
    }
    var cbaseCELL = ((physics.Hbase - Hmean) / Qbase) * geo.CELLwidth;
  }

  // Q Qtotrecharge
  var Qrecharge = (geo.CELLwidth - geo.drainwidth) * physics.recharge;

  //Qlat

  var Qlat = -state.Qtotdrain - Qrecharge - Qbase;


  curtable[0]["Cell width"] = geo.CELLwidth.toFixed(2);
  var report = "Cell H_mean= " + Hmean.toFixed(3) + "<br >";
  curtable[0]["Cell H_mean"] = Hmean.toFixed(3);
  report += "Q tot drain= " + state.Qtotdrain.toExponential(4) + "<br >";
  curtable[0]["Q tot drain"] = state.Qtotdrain.toExponential(4);
  report += "Cell Q recharge= " + Qrecharge.toExponential(4) + "<br >";
  curtable[0]["Cell Q recharge"] = Qrecharge.toExponential(4);
  report += "Cell Q lateral= " + Qlat.toExponential(4) + "<br >";
  curtable[0]["Cell Q lateral"] = Qlat.toExponential(4);
  report += "Cell c_fleak= " + cfleak.toFixed(2) + "<br >";
  curtable[0]["Cell c_fleak"] = cfleak.toExponential(4);
  if (geo.hasbaselayer) {
    report += "Cell Q base= " + Qbase.toExponential(4) + "<br >";
    curtable[0]["Cell Q base"] = Qbase.toExponential(4);
  }
  table.updateData(curtable);
  return {
    Hmean: Hmean,
    report: report
  };
}
