var state = {
  H: [],
  minH: null,
  maxH: null,
  Htopmean: null,
  Hbottommean: null,
  Qtotrecharge: 0,
  Qtotbase: 0,
  Qtotdrain: 0,
};

var eqs = {
  QC: [],
  Qo: [],
  QXc: [],
  QX: [],
};

var topparam = {
  activedrainlength: 0,
  xtopseepage: null,
  ytopseepage: null,
  grwXY: null,
  oldnodeY: null,
};

// function calc_grw(atx) {
//   let i = 1;
//   while (topparam.grwXY[2 * i] < atx) {
//     i += 1;
//   }
//   if (2 * i + 1 > topparam.grwXY.length) {
//     return topparam.grwXY[topparam.grwXY.length - 1];
//   } else {
//     let f =
//       (topparam.grwXY[2 * i] - atx) /
//       (topparam.grwXY[2 * i] - topparam.grwXY[2 * i - 2]);
//     return f * topparam.grwXY[2 * i - 1] + (1 - f) * topparam.grwXY[2 * i + 1];
//   }
// }

function constructXYdomain() {
  XYdomain = [];
  // left under
  XYdomain.push(0);
  XYdomain.push(0);
  for (let i = 0; i < drain.xz.length; i++) {
    XYdomain.push(drain.xz[i]);
  }
  XYdomain.push(geo.domainwidth);
  XYdomain.push(geo.domainheight);
  XYdomain.push(geo.domainwidth);
  XYdomain.push(0);

  calc_drainlength();
  topparam.grwXY = [];
  topparam.grwXY.push(topparam.xtopseepage);
  topparam.grwXY.push(physics.drainlevel);
  topparam.grwXY.push(geo.domainwidth);
  topparam.grwXY.push(physics.drainlevel);
}

function calc_drainlength() {
  let r = drain.findbyz(physics.drainlevel);
  topparam.xtopseepage = r.x;
  topparam.activedrainlength = r.L;
}

function constructXYwater() {
  calc_drainlength();
  let r = drain.findbyz(physics.drainlevel);

  XYwater = [];
  XYwater.push(0);
  XYwater.push(physics.drainlevel);
  for (let i = 0; i < r.imin; i++) {
    XYwater.push(drain.xz[2 * i]);
    XYwater.push(drain.xz[2 * i + 1]);
  }
  XYwater.push(r.x);
  XYwater.push(r.z);
}
//
// flux calculations
//

function dotriangle(Ax, Az, Bx, Bz, Cx, Cz, kxx, kxz, kzz) {
  var xAB = Ax - Bx;
  var zAB = Az - Bz;
  var xBC = Bx - Cx;
  var zBC = Bz - Cz;
  var xCA = Cx - Ax;
  var zCA = Cz - Az;

  var midx = (Ax + Bx + Cx) / 3;
  var slicewidth = 1 + midx * geo.condivfactor;
  var D = xCA * zAB - xAB * zCA;
  var result;
  if (Math.abs(D) < 1e-4) {
    //should normally not occur, but to be on the safe side ...
    result = {
      QAA: 0,
      QAB: 0,
      QAC: 0,
      QBA: 0,
      QBB: 0,
      QBC: 0,
      QCA: 0,
      QCB: 0,
      QCC: 0,
    };
    // console.log("bad triangle");
  } else {
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

    result = {
      QAA: slicewidth * QAA,
      QAB: slicewidth * QAB,
      QAC: slicewidth * QAC,
      QBA: slicewidth * QBA,
      QBB: slicewidth * QBB,
      QBC: slicewidth * QBC,
      QCA: slicewidth * QCA,
      QCB: slicewidth * QCB,
      QCC: slicewidth * QCC,
    };
  }
  return result;
}

function fluxintriangle(Ax, Az, Bx, Bz, Cx, Cz, HA, HB, HC, kxx, kxz, kzz) {
  var xAB = Ax - Bx;
  var zAB = Az - Bz;
  var HAB = HA - HB;
  var xCA = Cx - Ax;
  var zCA = Cz - Az;
  var HCA = HC - HA;
  var D = xCA * zAB - xAB * zCA;

  var midx = (Ax + Bx + Cx) / 3.0;
  var slicewidth = 1 + midx * geo.condivfactor;

  var dHdx = (-zCA * HAB + zAB * HCA) / D;
  var dHdz = (xCA * HAB - xAB * HCA) / D;

  var qx = -kxx * dHdx - kxz * dHdz;
  var qz = -kxz * dHdx - kzz * dHdz;
  return {
    qx: slicewidth * qx,
    qz: slicewidth * qz,
  };
}

function cdrain_func(aty) {
  if (aty <= physics.drainlevel) {
    if (modelchoices.cvaluesinterpolated != "non-interpolated") {
      yfrac = (aty - geo.drainbottom) / (physics.drainlevel - geo.drainbottom);
      return (1 - yfrac) * physics.cdrain + yfrac * physics.cseepage;
    } else {
      return physics.cdrain;
    }
  } else {
    return physics.cseepage;
  }
}

function setupeqs() {
  for (var i = 0; i < discretization.Numnodes; i++) {
    eqs.QC[i] = 0;
    eqs.QXc[i] = 0;
    eqs.QX[i] = 0;
    eqs.Qo[i] = [];
    for (let j = 0; j < discretization.neighbours[i].length; j++) {
      eqs.Qo[i].push(0);
    }
  }
  for (const tr of discretization.elements) {
    let trc = dotriangle(
      discretization.nodes[2 * tr[0]],
      discretization.nodes[2 * tr[0] + 1],
      discretization.nodes[2 * tr[1]],
      discretization.nodes[2 * tr[1] + 1],
      discretization.nodes[2 * tr[2]],
      discretization.nodes[2 * tr[2] + 1],
      physics.kxx,
      physics.kxz,
      physics.kzz
    );

    let nb = discretization.neighbours[tr[0]];
    eqs.QC[tr[0]] += trc.QAA;
    for (let k = 0; k < nb.length; k++) {
      if (nb[k] == tr[1]) {
        eqs.Qo[tr[0]][k] += trc.QAB;
      } else if (nb[k] == tr[2]) {
        eqs.Qo[tr[0]][k] += trc.QAC;
      }
    }
    eqs.QC[tr[1]] += trc.QBB;
    nb = discretization.neighbours[tr[1]];
    for (let k = 0; k < nb.length; k++) {
      if (nb[k] == tr[2]) {
        eqs.Qo[tr[1]][k] += trc.QBC;
      } else if (nb[k] == tr[0]) {
        eqs.Qo[tr[1]][k] += trc.QBA;
      }
    }
    eqs.QC[tr[2]] += trc.QCC;
    nb = discretization.neighbours[tr[2]];
    for (let k = 0; k < nb.length; k++) {
      if (nb[k] == tr[0]) {
        eqs.Qo[tr[2]][k] += trc.QCA;
      } else if (nb[k] == tr[1]) {
        eqs.Qo[tr[2]][k] += trc.QCB;
      }
    }
  }
  // recharge
  for (let j = discretization.idraingrw; j < discretization.igrwright; j++) {
    let midx =
      (discretization.nodes[2 * j + 2] + discretization.nodes[2 * j]) / 2;
    let slicewidth = 1 + midx * geo.condivfactor;
    let Q =
      (discretization.nodes[2 * j + 2] - discretization.nodes[2 * j]) *
      physics.recharge;
    eqs.QXc[j] = 0;
    eqs.QX[j] += (Q / 2) * slicewidth;
    eqs.QXc[j + 1] = 0;
    eqs.QX[j + 1] += (Q / 2) * slicewidth;
    if (j == discretization.idraingrw) {
      eqs.QsplitrechargeX = (Q / 2) * slicewidth;
    }
  }
  // drainage
  for (let j = discretization.ileftdrain; j < discretization.idraingrw; j++) {
    {
      let yleft = discretization.nodes[2 * j + 1];
      let yright = discretization.nodes[2 * j + 3];
      let dx = discretization.nodes[2 * j + 2] - discretization.nodes[2 * j];
      let midx =
        (discretization.nodes[2 * j + 2] - discretization.nodes[2 * j]) / 2;
      let slicewidth = 1 + midx * geo.condivfactor;
      let dy = yright - yleft;
      let L = Math.sqrt(dx * dx + dy * dy);
      // left part
      let cdrainy = cdrain_func(yleft);
      eqs.QXc[j] -= (L / 2 / cdrainy) * slicewidth;
      eqs.QC[j] -= (L / 2 / cdrainy) * slicewidth;
      if (yleft <= physics.drainlevel) {
        eqs.QX[j] += (((L / 2) * physics.drainlevel) / cdrainy) * slicewidth;
      } else {
        eqs.QX[j] += (((L / 2) * yleft) / cdrainy) * slicewidth;
      }
      // right part
      cdrainy = cdrain_func(yright);
      eqs.QXc[j + 1] -= (L / 2 / cdrainy) * slicewidth;
      eqs.QC[j + 1] -= (L / 2 / cdrainy) * slicewidth;
      if (yright <= physics.drainlevel) {
        eqs.QX[j + 1] +=
          (((L / 2) * physics.drainlevel) / cdrainy) * slicewidth;
      } else {
        eqs.QX[j + 1] += (((L / 2) * yright) / cdrainy) * slicewidth;
      }
      if (j == discretization.idraingrw - 1) {
        eqs.QsplitdrainXc = -(L / 2 / cdrainy) * slicewidth;
        if (yright <= physics.drainlevel) {
          eqs.QsplitdrainX =
            (((L / 2) * physics.drainlevel) / cdrainy) * slicewidth;
        } else {
          eqs.QsplitdrainX = (((L / 2) * yright) / cdrainy) * slicewidth;
        }
      }
    }

    if (modelchoices.modelbottom == "open") {
      //
      // is done in update qbase
      //
      // flux from/to layer below
      // for (
      //   let j = discretization.irightbottom;
      //   j < discretization.ileftbottom;
      //   j++
      // ) {
      //   let Q =
      //     ((discretization.nodes[2 * j - 2] - discretization.nodes[2 * j]) *
      //       (state.qbase[j] + state.qbase[j + 1])) /
      //     2;
      //   let midx =
      //     (discretization.nodes[2 * j + 2] + discretization.nodes[2 * j]) / 2;
      //   let slicewidth = 1 + midx * geo.condivfactor;
      //   eqs.QXc[j] = 0;
      //   eqs.QX[j] += (Q / 2) * slicewidth;
      //   eqs.QXc[j + 1] = 0;
      //   eqs.QX[j + 1] += (Q / 2) * slicewidth;
      //   console.log("5>", eqs.QX[j], eqs.QX[j + 1]);
      // }
    }
  }
}

function initialiseH() {
  state.H = [];

  for (var i = 0; i < discretization.Numnodes; i++) {
    // state.H[i] = calc_grw(discretization.nodes[2 * i]);
    state.H[i] = physics.drainlevel;
  }
  // state.H[discretization.Numnodes] = 0; // for indices outside domain
  state.qbase = [];
  for (
    let i = discretization.irightbottom;
    i <= discretization.ileftbottom;
    i++
  ) {
    state.qbase[i] = 0;
  }
}
function updateqbase() {
  var maxcqhange = 0;
  if (modelchoices.modelbottom == "open") {
    let a = convergence.baserelax;
    for (
      let i = discretization.irightbottom;
      i <= discretization.ileftbottom;
      i++
    ) {
      let qraw = (physics.Hbase - state.H[i]) / physics.cbase;
      state.qbase[i] =
        a * state.qbase[i] + ((1 - a) * qraw) / (1 + 200 * Math.abs(qraw));
    }
  }
  for (
    let j = discretization.irightbottom;
    j <= discretization.ileftbottom;
    j++
  ) {
    eqs.QXc[j] = 0;
    eqs.QX[j] = 0;
  }
  for (
    let j = discretization.irightbottom;
    j < discretization.ileftbottom;
    j++
  ) {
    let Q =
      ((discretization.nodes[2 * j] - discretization.nodes[2 * j + 2]) *
        (state.qbase[j] + state.qbase[j + 1])) /
      2;
    let midx =
      (discretization.nodes[2 * j + 2] + discretization.nodes[2 * j]) / 2;
    let slicewidth = 1 + midx * geo.condivfactor;
    eqs.QXc[j] = 0;
    eqs.QX[j] += (Q / 2) * slicewidth;
    eqs.QXc[j + 1] = 0;
    eqs.QX[j + 1] += (Q / 2) * slicewidth;
  }
}

checkqbase = function () {
  for (
    let i = discretization.irightbottom;
    i <= discretization.ileftbottom;
    i++
  ) {
    let qraw = (physics.Hbase - state.H[i]) / physics.cbase;
    qraw = qraw / (1 + 200 * Math.abs(qraw));
    state.qbase[i] = qraw;
    console.log("qbase[", i, "]=", state.qbase[i]);
    console.log("QX[", i, "]=", eqs.QX[i]);
  }
};
function solvestep() {
  var critH = 0;
  var critQ = 0;

  for (var i = 0; i < discretization.Numnodes; i++) {
    if (
      modelchoices.riparianconnection == "dirichlet" &&
      i == discretization.idraingrw
    ) {
      state.H[i] = discretization.nodes[2 * i + 1];
    } else {
      let oH = state.H[i];
      let Qi = eqs.QX[i];
      for (let j = 0; j < discretization.neighbours[i].length; j++) {
        Qi += eqs.Qo[i][j] * state.H[discretization.neighbours[i][j]];
      }
      let nH = -Qi / eqs.QC[i];
      if (isNaN(nH)) {
        return null;
      }
      state.H[i] = convergence.omega * nH + (1 - convergence.omega) * oH;
      critH = Math.max(critH, Math.abs(oH - state.H[i]));
      critQ = Math.max(critQ, Math.abs(Qi + eqs.QC[i] * state.H[i]));
    }
  }
  for (let i = 0; i < discretization.Numnodes; i++) {
    state.H[i] = Math.max(state.H[i], geo.domainheight / 50);
  }

  return {
    critH: critH,
    critQ: critQ,
  };
}

checkbalance = function (inode) {
  let bal = 0;
  console.log("QX[", inode, "] =", eqs.QX[inode]);
  bal += eqs.QX[inode];
  for (let j = 0; j < discretization.neighbours[inode].length; j++) {
    let Qji = eqs.Qo[inode][j] * (state.H[j] - state.H[inode]);
    console.log(
      "QX[",
      discretization.neighbours[inode][j],
      ">",
      inode,
      "] =",
      Qji
    );
    bal += Qji;
  }
  console.log("bal[", inode, "]=", bal);
};

function HoverYinterpol(x) {
  let ileft = 0;
  if (x < topparam.grwXY[2 * ileft]) {
    return null;
  }
  let iright = topparam.grwXY.length / 2;
  if (x > topparam.grwXY[2 * iright]) {
    return null;
  }
  iright = 0;
  while (x > topparam.grwXY[2 * iright]) {
    iright++;
  }
  ileft = iright - 1;
  let f =
    (x - topparam.grwXY[2 * ileft]) /
    (topparam.grwXY[2 * iright] - topparam.grwXY[2 * ileft]);
  let Hi = f * topparam.maxnewY[iright] + (1 - f) * topparam.maxnewY[ileft];
  if (Hi > geo.domainheight) {
    return { factor: 1, max: Hi };
  }
  let nodeYi =
    f * topparam.oldnodeY[iright] + (1 - f) * topparam.oldnodeY[ileft];
  let factor = 0.25 * (Hi / nodeYi) + 0.75;
  return { factor: factor, max: Hi };
}

function adjustgrid() {
  let oldxoftop = [];
  let oldyoftop = [];
  let newxoftop = [];
  let newyoftop = [];
  let ioftop = [];

  for (let i = 0; i <= discretization.igrwright; i++) {
    ioftop[i] = i;
    oldxoftop[i] = discretization.nodes[2 * i];
    oldyoftop[i] = discretization.nodes[2 * i + 1];
    newxoftop[i] = 0;
    newyoftop[i] = 0;
  }

  // console.log(oldxoftop)
  // console.log("oldytop", oldyoftop);
  if (modelchoices.riparianconnection == "seepage face") {
    let is = discretization.idraingrw;
    let oldisx = discretization.nodes[2 * is];
    let oldisy = discretization.nodes[2 * is + 1];
    let oldsplit = drain.finddist(oldisx, oldisy);
    // console.log("oldsplit", oldsplit);
    let His = state.H[is];
    let newsplit = drain.findbyz(His);
    // let leftxfactor = newsplit.x / oldsplit.x;

    let lfactor = newsplit.L / oldsplit.L;
    for (let i = 0; i <= discretization.idraingrw; i++) {
      let oldL = drain.finddist(
        discretization.nodes[2 * i],
        discretization.nodes[2 * i + 1]
      ).L;
      // console.log("i L *lfactor", i, oldL, oldL * lfactor, drain.maxL);
      let newdrnode = drain.findbyL(oldL * lfactor);
      // console.log(newdrnode.z);
      newxoftop[i] = newdrnode.x;
      newyoftop[i] = newdrnode.z;
    }
    let rightxfactor =
      (geo.domainwidth - newsplit.x) / (geo.domainwidth - oldsplit.x);
    for (
      let i = discretization.idraingrw + 1;
      i <= discretization.igrwright;
      i++
    ) {
      let x = oldxoftop[i];
      newxoftop[i] = newsplit.x + rightxfactor * (x - oldsplit.x);
      // console.log(i,">",newsplit.x,rightxfactor,x,oldsplit.x)
      let maxy = geo.domainheight;
      if (x < geo.drainwidth) {
        let drx = drain.findbyx(x);
        maxy = drx.z;
      }
      let yprop =
        convergence.alpha * oldyoftop[i] + (1 - convergence.alpha) * state.H[i];
      yprop = Math.max(yprop, His);
      newyoftop[i] = Math.min(yprop, maxy);
    }
    // console.log("#newxoftop", newxoftop);
  } else {
    for (let i = 0; i < discretization.ifirstvertical; i++) {
      let x = oldxoftop[i];
      newxoftop[i] = x;
      let maxy = geo.domainheight;
      if (x < geo.drainwidth) {
        let drx = drain.findbyx(x);
        maxy = drx.z;
      }
      let yprop =
        convergence.alpha * oldyoftop[i] + (1 - convergence.alpha) * state.H[i];
      newyoftop[i] = Math.min(yprop, maxy);
    }
    let i = discretization.idraingrw;
    let x = oldxoftop[i];
    newxoftop[i] = x;
    let maxy = geo.domainheight;
    if (x < geo.drainwidth) {
      let drx = drain.findbyx(x);
      maxy = drx.z;
    }
    let yprop =
      convergence.alpha * oldyoftop[i] + (1 - convergence.alpha) * state.H[i];
    newyoftop[i] = Math.min(yprop, maxy);

    let frac =
      (newyoftop[i] - geo.drainbottom) / (oldyoftop[i] - geo.drainbottom);
    for (
      let j = discretization.ifirstvertical;
      j < discretization.idraingrw;
      j++
    ) {
      newxoftop[j] = oldxoftop[j];
      newyoftop[j] = geo.drainbottom + frac * (oldyoftop[j] - geo.drainbottom);
    }
    for (
      let i = discretization.idraingrw + 1;
      i <= discretization.igrwright;
      i++
    ) {
      let x = oldxoftop[i];
      newxoftop[i] = x;
      let maxy = geo.domainheight;
      if (x < geo.drainwidth) {
        let drx = drain.findbyx(x);
        maxy = drx.z;
      }
      let yprop =
        convergence.alpha * oldyoftop[i] + (1 - convergence.alpha) * state.H[i];
      newyoftop[i] = Math.min(yprop, maxy);
      if (
        (newxoftop[i] > geo.drainwidth - 1e-4) &
        (newxoftop[i] < geo.drainwidth + 1e-4)
      ) {
        console.log(newxoftop[i], newyoftop[i]);
      }
    }
  }
  // console.log("--------------------------");
  // console.log(newxoftop);
  // console.log(newyoftop);

  for (let i = discretization.igrwright + 1; i < discretization.Numnodes; i++) {
    let oldx = discretization.nodes[2 * i];
    let oldy = discretization.nodes[2 * i + 1];
    let jx = interpol_arrays(oldx, oldxoftop, ioftop);

    let jleft = Math.floor(jx);
    let jf = jx - jleft;
    let nextjleft = Math.min(jleft + 1, discretization.igrwright);
    let newx = (1 - jf) * newxoftop[jleft] + jf * newxoftop[nextjleft];
    let oldytop = (1 - jf) * oldyoftop[jleft] + jf * oldyoftop[nextjleft];
    let newytop = (1 - jf) * newyoftop[jleft] + jf * newyoftop[nextjleft];
    discretization.nodes[2 * i] = newx;
    discretization.nodes[2 * i + 1] = (oldy * newytop) / oldytop;
  }

  let critdiff = -Infinity;
  let minati = 0;
  for (let i = 0; i <= discretization.igrwright; i++) {
    let newdiff = Math.abs(oldyoftop[i] - newyoftop[i]);
    if (newdiff > critdiff) {
      minati = i;
      critdiff = newdiff;
    }
    discretization.nodes[2 * i] = newxoftop[i];
    discretization.nodes[2 * i + 1] = newyoftop[i];
  }

  // console.log(
  //   "max diff at i=",
  //   minati,
  //   state.H[minati],
  //   oldyoftop[minati],
  //   newyoftop[minati]
  // );
  maketriangles();
  return critdiff;
}

// function adjustgrid2() {
//   var critdiffHY = 0;
//   topparam.oldnodeY = [];
//   topparam.maxnewY = [];
//   topparam.grwXY = [];

//   for (let i = discretization.idraingrw; i <= discretization.igrwright; i++) {
//     let xi = discretization.nodes[2 * i];
//     let Hi = state.H[i];
//     if (i == discretization.idraingrw) {
//       topparam.maxnewY.push(discretization.nodes[2 * i + 1]);
//     } else {
//       if (xi < geo.drainwidth) {
//         let p = drain.findbyx(xi);
//         topparam.maxnewY.push(Math.min(p.z, Hi));
//       } else {
//         topparam.maxnewY.push(Math.min(geo.domainheight, Hi));
//         let newdiffHY = Math.abs(state.H[i] - discretization.nodes[2 * i + 1]);
//         if (newdiffHY > critdiffHY) {
//           // console.log("adjust>",i,state.H[i],discretization.nodes[2*i+1]);
//           critdiffHY = newdiffHY;
//         }
//       }
//     }
//     topparam.oldnodeY.push(discretization.nodes[2 * i + 1]);
//     topparam.grwXY.push(xi);
//     topparam.grwXY.push(Hi);
//   }
//   let is = discretization.idraingrw;
//   let oldisx = discretization.nodes[2 * is];
//   let oldisy = discretization.nodes[2 * is + 1];
//   let oldsplit = drain.finddist(oldisx, oldisy);
//   let His = (state.H[is] + state.H[is + 1]) / 2;
//   if ((modelchoices.riparianconnection == "seepage face") & (His > oldisy)) {
//     let newsplit = drain.findbyz(His);
//     console.log("His olisy", His, oldisy);
//     let leftxfactor = newsplit.x / oldsplit.x;
//     let yfactor = newsplit.z / oldsplit.z;
//     let rightxfactor =
//       (geo.domainwidth - newsplit.x) / (geo.domainwidth - oldisx);
//     let newdrainx = [];
//     let newdrainy = [];
//     let lfactor = newsplit.L / oldsplit.L;
//     for (let i = 0; i < discretization.idraingrw; i++) {
//       let oldL = drain.finddist(
//         discretization.nodes[2 * i],
//         discretization.nodes[2 * i + 1]
//       ).L;
//       console.log("i L *lfactor", i, oldL, oldL * lfactor, drain.maxL);
//       let newdrnode = drain.findbyL(oldL * lfactor);
//       newdrainx.push(newdrnode.x);
//       newdrainy.push(newdrnode.z);
//     }
//     newdrainx.push(newsplit.x);
//     newdrainy.push(newsplit.z);
//     // console.log("newdrainx>", newdrainx);
//     // console.log("newdrainy>", newdrainy);
//     // console.log("leftxfactor>", leftxfactor);
//     // console.log("rightxfactor>", rightxfactor);
//     for (
//       let i = discretization.igrwright + 1;
//       i < discretization.Numnodes;
//       i++
//     ) {
//       let oldxi = discretization.nodes[2 * i];
//       let oldyi = discretization.nodes[2 * i + 1];
//       if (oldxi > oldisx) {
//         let newxi = newsplit.x + (oldxi - oldisx) * rightxfactor;
//         discretization.nodes[2 * i] = newxi;
//         // console.log("i, oldisx, oldxi, newxi",i,oldisx,oldxi,newxi)
//       } else {
//         let newxi = oldxi * leftxfactor;
//         let yfactor =
//           interpol_arrays(newxi, newdrainx, newdrainy) / drain.findbyx(oldxi).z;
//         let newyi = oldyi * yfactor;
//         discretization.nodes[2 * i] = newxi;
//         discretization.nodes[2 * i + 1] = newyi;
//       }
//     }
//     for (let i = 0; i <= discretization.igrwright; i++) {
//       discretization.nodes[2 * i] = newdrainx[i];
//       discretization.nodes[2 * i + 1] = newdrainy[i];
//     }
//   } else {
//     for (
//       let i = discretization.idraingrw + 1;
//       i < discretization.Numnodes;
//       i++
//     ) {
//       let x = discretization.nodes[2 * i];
//       if (x > oldisx) {
//         let HoY = HoverYinterpol(x);

//         let factor = HoY.factor;
//         if (factor < 0) {
//           console.log("%1", factor, HoY, x);
//         }

//         let newy = discretization.nodes[2 * i + 1] * factor;

//         if (i > discretization.igrwright) {
//           while (newy > HoY.max) {
//             factor *= 0.995;
//             newy = discretization.nodes[2 * i + 1] * factor;
//             // console.log("factor", factor);
//             if (factor < 1e-4) break;
//           }
//         }
//         discretization.nodes[2 * i + 1] = newy;
//       }
//     }
//   }
//   return critdiffHY;
// }
// generatetriangles();
// function nextHalfedge(e) {
//   return e % 3 === 2 ? e - 2 : e + 1;
// }
// let delaunay2 = new Delaunator(discretization.nodes);
// discretization.neighbours = [];
// for (let i = 0; i < discretization.Numnodes; i++) {
//   discretization.neighbours[i] = [];
// }
// for (let e = 0; e < delaunay2.triangles.length; e++) {
//   if (e > delaunay2.halfedges[e]) {
//     const p = delaunay2.triangles[e];
//     const q = delaunay2.triangles[nextHalfedge(e)];
//     discretization.neighbours[p].push(q);
//     discretization.neighbours[q].push(p);
//   }
// }
// discretization.elements = [];
// for (let i = 0; i < delaunay2.triangles.length; i += 3) {
//   let ni0 = delaunay2.triangles[i];
//   let ni1 = delaunay2.triangles[i + 1];
//   let ni2 = delaunay2.triangles[i + 2];
//   let x0 = discretization.nodes[2 * ni0];
//   let y0 = discretization.nodes[2 * ni0 + 1];
//   let x1 = discretization.nodes[2 * ni1];
//   let y1 = discretization.nodes[2 * ni1 + 1];
//   let x2 = discretization.nodes[2 * ni2];
//   let y2 = discretization.nodes[2 * ni2 + 1];
//   if (triangleindomain((x0 + x1 + x2) / 3, (y0 + y1 + y2) / 3)) {
//     discretization.elements.push([ni0, ni1, ni2]);
//   }
// }
//   setupeqs();
//   return critdiffHY;
// }

function calcsolutionstats() {
  if (state.H.length > 0) {
    state.minH = state.H[0];
    state.maxH = state.H[0];
    for (var iH = 1; iH < discretization.Numnodes; iH++) {
      if (state.maxH < state.H[iH]) {
        state.maxH = state.H[iH];
      } else if (state.minH > state.H[iH]) {
        state.minH = state.H[iH];
      }
    }
    tabledata[0].H_min = state.minH.toFixed(4);
    tabledata[0].H_max = state.maxH.toFixed(4);

    //calculating Htopmean
    state.Htopmean = 0;
    for (var i = 1; i < discretization.igrwright; i++) {
      var curH = state.H[i];
      var prevH = state.H[i - 1];
      var curx = discretization.nodes[2 * i];
      var prevx = discretization.nodes[2 * i - 2];
      state.Htopmean += ((curx - prevx) * (curH + prevH)) / 2;
    }
    state.Htopmean /= geo.domainwidth;
    tabledata[0].Htop_mean = state.Htopmean.toFixed(4);
    // calculating Hbottommean
    state.Hbottommean = 0;
    for (
      let i = discretization.irightbottom + 1;
      i <= discretization.ileftbottom;
      i++
    ) {
      let curH = state.H[i];
      let prevH = state.H[i - 1];
      let curx = discretization.nodes[2 * i];
      let prevx = discretization.nodes[2 * i - 2];
      state.Hbottommean += ((prevx - curx) * (curH + prevH)) / 2;
    }
    state.Hbottommean /= geo.domainwidth;
    tabledata[0].Hbottom_mean = state.Hbottommean.toFixed(4);

    // Qtotdrain en Qseepage
    state.Qtotdrain = 0;
    state.Qtotseepage = 0;
    for (let i = discretization.ileftdrain; i < discretization.idraingrw; i++) {
      if (discretization.nodes[2 * i + 1] < physics.drainlevel) {
        state.Qtotdrain += eqs.QXc[i] * state.H[i] + eqs.QX[i];
      } else {
        state.Qtotseepage += eqs.QXc[i] * state.H[i] + eqs.QX[i];
      }
    }
    {
      let i = discretization.idraingrw;
      if (discretization.nodes[2 * i + 1] > physics.drainlevel) {
        state.Qtotseepage +=
          eqs.QsplitdrainXc * state.H[discretization.idraingrw] +
          eqs.QsplitdrainX;
      } else {
        state.Qtotdrain +=
          eqs.QsplitdrainXc * state.H[discretization.idraingrw] +
          eqs.QsplitdrainX;
      }
    }

    state.Qtotrecharge = eqs.QsplitrechargeX;
    for (
      let i = discretization.idraingrw + 1;
      i <= discretization.igrwright;
      i++
    ) {
      state.Qtotrecharge += eqs.QXc[i] * state.H[i] + eqs.QX[i];
    }

    tabledata[0]["Q tot recharge"] = state.Qtotrecharge.toExponential(4);
    tabledata[0]["Q tot drain"] = state.Qtotdrain.toExponential(4);
    tabledata[0]["Q seepage face"] = state.Qtotseepage.toExponential(4);

    if (modelchoices.modelbottom != "closed") {
      state.Qtotbase = 0;
      for (
        let i = discretization.irightbottom;
        i <= discretization.ileftbottom;
        i++
      ) {
        state.Qtotbase += eqs.QX[i];
      }
      // console.log("7>", state.Qtotbase, eqs.QX[90]);
      tabledata[0]["Q tot base"] = state.Qtotbase.toExponential(4);
    }

    let riverperimeter = drain.findbyz(geo.domainheight).L;
    let p = drain.findbyz(physics.drainlevel);
    let riverwetperimeter = p.L;
    let riverwetwidth = p.x;
    let grwetperimeter = topparam.activedrainlength;

    tabledata[0]["Gr Wet Per"] = grwetperimeter.toExponential(4);
    tabledata[0]["Ow Wet Per"] = riverwetperimeter.toExponential(4);
    tabledata[0]["Ow Per"] = riverperimeter.toExponential(4);
    tabledata[0]["Ow Wet Width"] = riverwetwidth.toExponential(4);

    // // seepage face
    // if (modelchoices.riparianconnection == "seepage face") {
    //   let Qseep = 0;
    //   let iright = discretization.idraingrw;
    //   let xr = discretization.nodes[2 * iright];
    //   let yr = discretization.nodes[2 * iright + 1];
    //   let done = yr <= physics.drainlevel;
    //   while (!done) {
    //     let ileft = iright - 1;
    //     if (ileft < 0) {
    //       //just for safety
    //       done = true;
    //     }
    //     let xr = discretization.nodes[2 * iright];
    //     let yr = discretization.nodes[2 * iright + 1];
    //     let qr = state.H[iright] / physics.cseepage;
    //     let xl = discretization.nodes[2 * ileft];
    //     let yl = discretization.nodes[2 * ileft + 1];
    //     let ql = state.H[ileft] / physics.cseepage;
    //     if (yl <= physics.drainlevel) {
    //       done = true;
    //       let f = (physics.drainlevel - yl) / (yr - yl);
    //       yl = f * yr + (1 - f) * yl;
    //       xl = f * xr + (1 - f) * xl;
    //       ql = f * qr + (1 - f) * ql;
    //     } else {
    //       iright = ileft;
    //     }
    //     let midx = (xr + xl) / 2.0;
    //     let slicewidth = 1 + midx * geo.condivfactor;
    //     L = Math.sqrt(Math.pow(xl - xr, 2) + Math.pow(yl - yr, 2));
    //     Qseep += ((L * (qr + ql)) / 2) * slicewidth;
    //   }
    //   tabledata[0]["Q seepage face"] = -Qseep;
  }
}

function resetnodestotop() {
  // at this moment only for fixed seepagelength
  topparam.grwXY = [];
  topparam.grwXY.push(topparam.xtopseepage);
  topparam.grwXY.push(physics.drainlevel);
  topparam.grwXY.push(geo.domainwidth);
  topparam.grwXY.push(physics.drainlevel);
  generatenetwork();
}

function solvesteps() {
  resetnodestotop();
  // initialiseHold();
  initialiseH();
  setupeqs();
  let critdiff;
  for (let iter2 = 0; iter2 < convergence.maxiter2; iter2++) {
    for (var iter1 = 0; iter1 < convergence.maxiter1; iter1++) {
      crit = solvestep();
      if (crit == null) {
        return null;
      }
      if (
        (crit.critH < convergence.maxHchange) &
        (crit.critQ < convergence.maxQchange)
      ) {
        break;
      }
    }
    if (modelchoices.modelbottom == "open") {
      updateqbase();
    }

    critdiff = adjustgrid();
    // console.log("iter2", iter2, "critdiff", critdiff);
    for (var iter1 = 0; iter1 < convergence.maxiter1; iter1++) {
      crit = solvestep();
      if (crit == null) {
        return null;
      }
      if (
        (crit.critH < convergence.maxHchange) &
        (crit.critQ < convergence.maxQchange)
      ) {
        break;
      }
    }
    // console.log(critdiff,"?<?",convergence.maxdiffHY)
    if (critdiff < convergence.maxdiffHY) {
      break;
    }
  }
  console.log("critdiff=",critdiff)
  makenodes();
  maketriangles();
  calcsolutionstats();
}

function findnearestnode(x, y) {
  var diffx = x - discretization.nodes[0];
  var diffy = y - discretization.nodes[1];
  var dsq = diffx * diffx + diffy * diffy;
  var dsqmin = dsq;
  var inode = 0;
  for (var j = 2; j < discretization.nodes.length; j += 2) {
    diffx = x - discretization.nodes[j];
    diffy = y - discretization.nodes[j + 1];
    dsq = diffx * diffx + diffy * diffy;
    if (dsq < dsqmin) {
      inode = j / 2;
      dsqmin = dsq;
    }
  }
  return inode;
}

function makeinspectionbaseinfo(inode) {
  let Ax = discretization.nodes[2 * inode];
  let Ay = discretization.nodes[2 * inode + 1];
  let HA = state.H[inode];
  let Qext = eqs.QX[inode] + eqs.QXc[inode] * HA;
  if (
    ((inode) => discretization.irightbottom) &
    (inode <= discretization.ileftbottom)
  ) {
    Qext = eqs.QX[inode];
  }
  let Qextp = -1;
  let Qextm = -1;
  if (inode == discretization.idraingrw) {
    Qextp = eqs.QsplitrechargeX;
    Qextm = eqs.QsplitdrainX + eqs.QsplitdrainXc * HA;
  }
  let Bx = 0,
    By = 0,
    HB = 0,
    Cx = 0,
    Cy = 0,
    HC = 0;
  let tr = [];
  for (const t of discretization.elements) {
    let found = false;
    if (t[0] == inode) {
      Bx = discretization.nodes[2 * t[1]];
      By = discretization.nodes[2 * t[1] + 1];
      HB = state.H[t[1]];
      Cx = discretization.nodes[2 * t[2]];
      Cy = discretization.nodes[2 * t[2] + 1];
      HC = state.H[t[2]];
      found = true;
    } else if (t[1] == inode) {
      Bx = discretization.nodes[2 * t[2]];
      By = discretization.nodes[2 * t[2] + 1];
      HB = state.H[t[2]];
      Cx = discretization.nodes[2 * t[0]];
      Cy = discretization.nodes[2 * t[0] + 1];
      HC = state.H[t[0]];
      found = true;
    } else if (t[2] == inode) {
      Bx = discretization.nodes[2 * t[0]];
      By = discretization.nodes[2 * t[0] + 1];
      HB = state.H[t[0]];
      Cx = discretization.nodes[2 * t[1]];
      Cy = discretization.nodes[2 * t[1] + 1];
      HC = state.H[t[1]];
      found = true;
    }
    if (found) {
      let Qs = fluxintriangle(
        Ax,
        Ay,
        Bx,
        By,
        Cx,
        Cy,
        HA,
        HB,
        HC,
        physics.kxx,
        physics.kxz,
        physics.kzz
      );
      let Qcoef = dotriangle(
        Ax,
        Ay,
        Bx,
        By,
        Cx,
        Cy,
        physics.kxx,
        physics.kxz,
        physics.kzz
      );
      let QA = Qcoef.QAA * HA + Qcoef.QAB * HB + Qcoef.QAC * HC;
      tr.push({
        Bx: Bx,
        By: By,
        Cx: Cx,
        Cy: Cy,
        Qx: Qs.qx,
        Qy: Qs.qz,
        QA: QA,
      });
    }
  }
  let result = {
    Ax: Ax,
    Ay: Ay,
    HA: HA,
    Qext: Qext,
    Qextp: Qextp,
    Qextm: Qextm,
    tr: tr,
  };
  return result;
}

function makeCELLcalculations() {
  let Qtop;
  let crivCELL = 0;
  let cbaseCELL = 0;
  // calculating Hmean
  let i = 0;
  let prevH = state.H[i];
  let prevx = discretization.nodes[2 * i];
  var Hint = 0;
  i++;
  var curx = discretization.nodes[2 * i];
  var curH = state.H[i];
  while (curx < geo.CELLwidth) {
    Hint += ((curH + prevH) / 2) * (curx - prevx);
    prevH = curH;
    prevx = curx;
    i++;
    if (i < discretization.igrwright) {
      curx = discretization.nodes[2 * i];
      curH = state.H[i];
    } else {
      break;
    }
  }
  // Hint += (curx-geo.CELLwidth)*(curx-prevx)*(curH + prevH) / 2 * (curx-prevx);
  Hint += ((curH + prevH) / 2) * (geo.CELLwidth - prevx);
  let Hmean = Hint / geo.CELLwidth;
  let cfleak =
    (-(Hmean - physics.drainlevel) / state.Qtotdrain) * geo.CELLwidth;

  // calculating Qbase
  let Qbase = 0;
  let done = false;
  if (modelchoices.modelbottom == "open") {
    for (let j = discretization.ileftbottom; !done; j--) {
      let leftx = discretization.nodes[2 * j];
      let leftq = state.qbase[j];
      let rightx = discretization.nodes[2 * (j - 1)];
      let rightq = state.qbase[j - 1];
      if (geo.CELLwidth < rightx) {
        let f = (rightx - geo.CELLwidth) / (rightx - leftx);
        rightq = f * leftq + (1 - f) * rightq;
        rigthx = geo.CELLwidth;
        done = true;
      }
      Qbase += ((rightx - leftx) * (leftq + rightq)) / 2;
      if (j == discretization.irightbottom) {
        done = true;
      }
    }
    let cbaseCELL = ((physics.Hbase - Hmean) / Qbase) * geo.CELLwidth;
  }

  // Q Qtotrecharge
  let Qrecharge = (geo.CELLwidth - geo.drainwidth) * physics.recharge;

  //Qlat

  let Qlat = -state.Qtotdrain - Qrecharge - Qbase;

  var report = "CELL H_mean= " + Hmean.toFixed(3) + "<br >";
  report += "Q tot drain= " + state.Qtotdrain.toExponential(4) + "<br >";
  report += "CELL Q recharge= " + Qrecharge.toExponential(4) + "<br >";
  report += "CELL Q lateral= " + Qlat.toExponential(4) + "<br >";
  report += "CELL c_fleak= " + cfleak.toFixed(2) + "<br >";
  if (modelchoices.modelbottom != "closed") {
    report += "CELL Q base= " + Qbase.toExponential(4) + "<br >";
  }
  tabledata[0]["CELL width"] = geo.CELLwidth.toFixed(2);
  tabledata[0]["CELL H_mean"] = Hmean.toFixed(3);
  tabledata[0]["CELL Q recharge"] = Qrecharge.toExponential(4);
  tabledata[0]["CELL Q lateral"] = Qlat.toExponential(4);
  tabledata[0]["CELL c_fleak"] = cfleak.toExponential(4);
  if (modelchoices.modelbottom != "closed") {
    tabledata[0]["CELL Q base"] = Qbase.toExponential(4);
  }
  return {
    Hmean: Hmean,
    report: report,
  };
}
