function interpol_arrays(x, xarray, yarray) {
  let indexfound = 0;
  if (x <= xarray[0]) {
    return yarray[0];
  }
  for (indexfound = 1; indexfound < xarray.length; indexfound++) {
    if (xarray[indexfound] > x) {
      break;
    }
  }
  if (indexfound == xarray.length) {
    return yarray[indexfound - 1];
  }
  let f =
    (xarray[indexfound] - x) / (xarray[indexfound] - xarray[indexfound - 1]);

  return f * yarray[indexfound - 1] + (1 - f) * yarray[indexfound];
}

function lin_interpol(x, xp, yp) {
  let f = (x - xp[0]) / (xp[1] - xp[0]);
  return yp[0] + f * (yp[1] - yp[0]);
}

const disc_par = {
  lineiter1: 75,
  lineiter2: 10,
  lineeps: 1e-3,
  maxnsplit: 100,
  tooclosefactor: 0.67,
  mintooclose: 0.2,
  mintooclosefactor: 0.9,
  bridgecrit: 1.5,
  bridgecritfactor: 1.1, //2,
  inTrcrit: 1e-10,
  Ninparline: 300,
  maxsteps: 1e6,
};

class parline {
  constructor(xy) {
    this.xy = [...xy];
    this.L = [0];
    this.Ltot = 0;
    for (let i = 2; i < xy.length; i += 2) {
      this.Ltot += Math.hypot(xy[i] - xy[i - 2], xy[i + 1] - xy[i - 1]);
      this.L.push(this.Ltot);
    }
    this.Np = this.xy.length / 2 - 1;
  }

  xybyL(l) {
    if (l <= 0) {
      return { x: this.xy[0], y: this.xy[1] };
    }
    if (l >= this.Ltot) {
      return { x: this.xy[2 * this.Np], y: this.xy[2 * this.Np + 1] };
    }
    let i = 0;
    while (this.L[i] < l) {
      i++;
    }
    let f = (this.L[i] - l) / (this.L[i] - this.L[i - 1]);
    return {
      x: f * this.xy[2 * i - 2] + (1 - f) * this.xy[2 * i],
      y: f * this.xy[2 * i - 1] + (1 - f) * this.xy[2 * i + 1],
    };
  }

  discretize(distfun) {
    let crit = +Infinity;
    let oldl = [];
    for (let N = 0; N < disc_par.lineiter1; N++) {
      let l = [];
      for (let i = 0; i <= N; i++) {
        l.push((this.Ltot * i) / N);
      }
      let lambda = 0;
      for (let iter2 = 0; iter2 < disc_par.lineiter2; iter2++) {
        let gamma = [];
        let delta = [];
        let sumgamma = 0;
        for (let i = 0; i < N; i++) {
          let midl = (l[i] + l[i + 1]) / 2;
          let xymid = this.xybyL(midl);
          gamma[i] = distfun(xymid.x, xymid.y);
          sumgamma += gamma[i];
        }
        lambda = (this.Ltot - sumgamma) / N;
        for (let i = 0; i < N; i++) {
          delta[i] = gamma[i] + lambda;
        }
        oldl[0] = 0;
        l[0] = 0;
        let lcrit = -Infinity;
        for (let i = 1; i <= N; i++) {
          oldl[i] = l[i];
          l[i] = l[i - 1] + delta[i - 1];
          lcrit = Math.max(lcrit, Math.abs(l[i] - oldl[i]));
        }
        if (lcrit < this.Ltot * disc_par.lineeps) {
          break;
        }
      }
      let oldcrit = crit;
      crit = lambda * lambda;
      if (crit > oldcrit) {
        break;
      }
    }
    let xy = [];
    for (let i = 0; i < oldl.length; i++) {
      let newxy = this.xybyL(oldl[i]);
      xy.push(newxy.x);
      xy.push(newxy.y);
    }
    return xy;
  }
}

function calc_child(bx, by, ex, ey, distfun) {
  let midx = (bx + ex) / 2;
  let midy = (by + ey) / 2;
  let difx = ex - bx;
  let dify = ey - by;
  let d = Math.hypot(difx, dify);
  let R = distfun(midx, midy);
  let F = (R * R) / d / d;
  if (F < 0.25) {
    return null;
  }
  let G = Math.sqrt(F - 0.25);
  let cx = midx + G * dify;
  let cy = midy - G * difx;
  return { cx: cx, cy: cy, R: R };
}

function makenodseg(bx, by, ex, ey, distfun, dis, mx, my) {
  let Nsplit = 0;
  let splitisok = false;
  let splitresults = [];
  while (!splitisok & (Nsplit < disc_par.maxnsplit)) {
    splitresults = [];
    Nsplit = Nsplit + 1;
    let delx = (ex - bx) / Nsplit;
    let dely = (ey - by) / Nsplit;
    splitisok = true;
    for (let j = 0; j < Nsplit; j++) {
      let jbx, jby, jex, jey;
      if (mx == null) {
        jbx = bx + j * delx;
        jex = bx + (j + 1) * delx;
        jby = by + j * dely;
        jey = by + (j + 1) * dely;
      } else {
        let t = j / Nsplit;
        jbx = (1 - t) * (1 - t) * bx + 2 * t * (1 - t) * mx + t * t * ex;
        jby = (1 - t) * (1 - t) * by + 2 * t * (1 - t) * my + t * t * ey;
        t = (j + 1) / Nsplit;
        jex = (1 - t) * (1 - t) * bx + 2 * t * (1 - t) * mx + t * t * ex;
        jey = (1 - t) * (1 - t) * by + 2 * t * (1 - t) * my + t * t * ey;
      }
      let test = calc_child(jbx, jby, jex, jey, distfun);
      if (test == null) {
        splitisok = false;
        break;
      }
      splitresults.push({
        bx: jbx,
        by: jby,
        ex: jex,
        ey: jey,
        cx: test.cx,
        cy: test.cy,
        R: test.R,
      });
    }
  }

  if (Nsplit == 1) {
    let ch = splitresults[0];
    dis.nodseg.push({
      bx: bx,
      by: by,
      ex: ex,
      ey: ey,
      R: ch.R,
      cx: ch.cx,
      cy: ch.cy,
      iprevnodseg: NaN,
      inextnodseg: NaN,
    });
    let N = dis.nodseg.length;
    dis.activenodseg.push(N - 1);
    N = dis.nodseg.length;
    return { ifirst: N - 1, ilast: N - 1 };
  } else if (Nsplit > 1) {
    let ch = splitresults[0];
    let Nold = dis.nodseg.length;
    dis.nodseg.push({
      bx: ch.bx,
      by: ch.by,
      ex: ch.ex,
      ey: ch.ey,
      R: ch.R,
      cx: ch.cx,
      cy: ch.cy,
      iprevnodseg: NaN,
      inextnodseg: Nold + 1,
    });
    dis.activenodseg.push(Nold);
    for (
      let j = 1;
      j < Nsplit - 1;
      j++ // passed if Nsplit =2
    ) {
      let ch = splitresults[j];
      dis.nodes.push(ch.bx);
      dis.nodes.push(ch.by);
      dis.nodseg.push({
        bx: ch.bx,
        by: ch.by,
        ex: ch.ex,
        ey: ch.ey,
        R: ch.R,
        cx: ch.cx,
        cy: ch.cy,
        iprevnodseg: Nold + j - 1,
        inextnodseg: Nold + j + 1,
      });
      dis.activenodseg.push(Nold + j);
    }
    ch = splitresults[Nsplit - 1];
    dis.nodes.push(ch.bx);
    dis.nodes.push(ch.by);
    dis.nodseg.push({
      bx: ch.bx,
      by: ch.by,
      ex: ch.ex,
      ey: ch.ey,
      R: ch.R,
      cx: ch.cx,
      cy: ch.cy,
      iprevnodseg: Nold + Nsplit - 2,
      inextnodseg: NaN,
    });
    dis.activenodseg.push(Nold + Nsplit - 1);
    return { ifirst: Nold, ilast: Nold + Nsplit - 1 };
  }
}

function discretize_border(domain, disfun, dis) {
  // do add nodes on border of domain
  for (let i = 0; i < domain.length; i += 1) {
    let pl = new parline(domain[i]);
    let ln = pl.discretize(disfun);
    let first = dis.nodes.length / 2;
    for (let j = 0; j < ln.length - 2; j += 2) {
      dis.nodes.push(ln[j]);
      dis.nodes.push(ln[j + 1]);
    }
    let last = dis.nodes.length / 2 - 1;
    dis.borderfirstlast.push({ first: first, last: last });
    prevlast = last;
  }
  dis.Numbordernodes = dis.nodes.length / 2;
  // do add border nodesegs
  let numnodes = dis.nodes.length / 2;
  let i = numnodes - 1;
  let nexti = 0;
  let newnp = makenodseg(
    dis.nodes[2 * i],
    dis.nodes[2 * i + 1],
    dis.nodes[2 * nexti],
    dis.nodes[2 * nexti + 1],
    disfun,
    dis,
    null,
    null
  );
  let prevnp = newnp;
  for (let i = 0; i < numnodes - 1; i++) {
    nexti = i + 1;
    newnp = makenodseg(
      dis.nodes[2 * i],
      dis.nodes[2 * i + 1],
      dis.nodes[2 * nexti],
      dis.nodes[2 * nexti + 1],
      disfun,
      dis,
      null,
      null
    );
    dis.nodseg[newnp.ifirst].iprevnodseg = prevnp.ilast;
    dis.nodseg[prevnp.ilast].inextnodseg = newnp.ifirst;
    prevnp = newnp;
  }
  dis.nodseg[0].iprevnodseg = prevnp.ifirst;
  dis.nodseg[dis.nodseg.length - 1].inextnodseg = 0;
}

function tooclose2segment(ns, x, y) {
  let db = Math.hypot(ns.bx - x, ns.by - y);
  if (db < disc_par.tooclosefactor * ns.R) {
    return true;
  }
  let de = Math.hypot(ns.ex - x, ns.ey - y);
  if (de < disc_par.tooclosefactor * ns.R) {
    return true;
  }
  return false;
}

function seg1intersect(x1, y1, x2, y2) {
  if (x1 == x2) {
    if (x1 == 0) {
      if ((y1 > 1) & (y2 > 1)) {
        return false;
      } else if ((y1 < 0) & (y2 < 0)) {
        return false;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else if ((x1 < 0) & (x2 < 0)) {
    return false;
  } else if ((x1 > 0) & (x2 > 0)) {
    return false;
  } else {
    let m = x2 / (x2 - x1);
    let ym = m * y1 + (1 - m) * y2;

    if (ym > 1) {
      return false;
    } else if (ym < 0) {
      return false;
    } else {
      return true;
    }
  }
}

function TryPromoteChild(icurnodseg, distfun, dis) {
  let cns = dis.nodseg[icurnodseg];
  let canpromote = true;
  let R2 = cns.R * cns.R;

  let delxb = (cns.cx - cns.bx) / R2;
  let delyb = (cns.cy - cns.by) / R2;
  let xzb = -delyb * cns.bx + delxb * cns.by;
  let yzb = -delxb * cns.bx - delyb * cns.by;

  let delxe = (cns.cx - cns.ex) / R2;
  let delye = (cns.cy - cns.ey) / R2;
  let xze = -delye * cns.ex + delxe * cns.ey;
  let yze = -delxe * cns.ex - delye * cns.ey;

  for (itest of dis.activenodseg) {
    if ((itest != icurnodseg) & (itest != cns.iprevnodseg)) {
      let test = dis.nodseg[itest];
      let x1p = xzb + delyb * test.bx - delxb * test.by;
      let y1p = yzb + delxb * test.bx + delyb * test.by;
      let x2p = xzb + delyb * test.ex - delxb * test.ey;
      let y2p = yzb + delxb * test.ex + delyb * test.ey;
      if (seg1intersect(x1p, y1p, x2p, y2p)) {
        canpromote = false;
      }
    }
    if (canpromote) {
      if ((itest != icurnodseg) & (itest != cns.inextnodseg)) {
        let test = dis.nodseg[itest];
        let x1p = xze + delye * test.bx - delxe * test.by;
        let y1p = yze + delxe * test.bx + delye * test.by;
        let x2p = xze + delye * test.ex - delxe * test.ey;
        let y2p = yze + delxe * test.ex + delye * test.ey;
        if (seg1intersect(x1p, y1p, x2p, y2p)) {
          canpromote = false;
        }
      }
    }
    if (canpromote) {
      let test = dis.nodseg[itest];
      if (tooclose2segment(test, cns.cx, cns.cy)) {
        canpromote = false;
      }
    }
    if (!canpromote) {
      break;
    }
  }

  if (canpromote) {
    dis.nodes.push(cns.cx);
    dis.nodes.push(cns.cy);
    let ib = makenodseg(
      cns.bx,
      cns.by,
      cns.cx,
      cns.cy,
      distfun,
      dis,
      null,
      null
    );
    let ie = makenodseg(
      cns.cx,
      cns.cy,
      cns.ex,
      cns.ey,
      distfun,
      dis,
      null,
      null
    );

    dis.nodseg[ib.ifirst].iprevnodseg = cns.iprevnodseg;
    dis.nodseg[cns.iprevnodseg].inextnodseg = ib.ifirst;

    dis.nodseg[ib.ilast].inextnodseg = ie.ifirst;
    dis.nodseg[ie.ifirst].iprevnodseg = ib.ilast;

    dis.nodseg[ie.ilast].inextnodseg = cns.inextnodseg;
    dis.nodseg[cns.inextnodseg].iprevnodseg = ie.ilast;

    let ia = dis.activenodseg.indexOf(icurnodseg);
    dis.activenodseg.splice(ia, 1);
  }
  return canpromote;
}

intersect_segment_halfline = function (ax, ay, bx, by, cx, cy, dx, dy) {
  let D = (bx - ax) * (cy - dy) - (cx - dx) * (by - ay);
  if (D == 0) {
    return Infinity;
  }
  let lab = ((cy - dy) * (cx - ax) + (dx - cx) * (cy - ay)) / D;
  if (lab < 0) {
    return Infinity;
  }
  let lcd = ((ay - by) * (cx - ax) + (bx - ax) * (cy - ay)) / D;
  if (lcd <= 0) {
    return Infinity;
  }
  return lcd;
};

// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are collinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function Clockwiseorientation(px, py, qx, qy, rx, ry) {
  // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
  // for details of below formula.
  let val = (qy - py) * (rx - qx) - (qx - px) * (ry - qy);

  if (val == 0) return 0; // collinear
  if (val > 0) return 1; // Clockwise
  return 2; // counterclock
}

//%%
// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
function doIntersect(p1x, p1y, q1x, q1y, p2x, p2y, q2x, q2y) {
  // Find the four orientations needed for general and
  // special cases
  let o1 = Clockwiseorientation(p1x, p1y, q1x, q1y, p2x, p2y);
  let o2 = Clockwiseorientation(p1x, p1y, q1x, q1y, q2x, q2y);
  let o3 = Clockwiseorientation(p2x, p2y, q2x, q2y, p1x, p1y);
  let o4 = Clockwiseorientation(p2x, p2y, q2x, q2y, q1x, q1y);

  // General case
  if (o1 != o2 && o3 != o4) return true;

  // // Special Cases
  // // p1, q1 and p2 are collinear and p2 lies on segment p1q1
  // if (o1 == 0 && onSegment(p1x, p1y, p2x, p2y, q1x, q1y)) return true;

  // // p1, q1 and q2 are collinear and q2 lies on segment p1q1
  // if (o2 == 0 && onSegment(p1x, p1y, q2x, q2y, q1x, q1y)) return true;

  // // p2, q2 and p1 are collinear and p1 lies on segment p2q2
  // if (o3 == 0 && onSegment(p2x, p2y, p1x, p1y, q2x, q2y)) return true;

  // // p2, q2 and q1 are collinear and q1 lies on segment p2q2
  // if (o4 == 0 && onSegment(p2x, p2y, q1x, q1y, q2x, q2y)) return true;

  return false; // Doesn't fall in any of the above cases
}

function TryBridgeToNext(icurnodseg, distfun, dis) {
  let curnodseg = dis.nodseg[icurnodseg];
  let inextnodseg = curnodseg.inextnodseg;
  let nextnodseg = dis.nodseg[inextnodseg];
  let fq = intersect_segment_halfline(
    nextnodseg.bx,
    nextnodseg.by,
    nextnodseg.ex,
    nextnodseg.ey,
    curnodseg.bx,
    curnodseg.by,
    curnodseg.cx,
    curnodseg.cy
  );

  let d = Math.hypot(
    nextnodseg.ex - curnodseg.cx,
    nextnodseg.ey - curnodseg.cy
  );
  let canbridge = false;
  if ((fq < disc_par.bridgecrit) | (d < 0.5 * curnodseg.R)) {
    canbridge = true;
    for (let i of dis.activenodseg) {
      if (
        (i != icurnodseg) &
        (i != inextnodseg) &
        (i != curnodseg.iprevnodseg) &
        (i != nextnodseg.inextnodseg)
      ) {
        let test = dis.nodseg[i];
        if (
          doIntersect(
            test.bx,
            test.by,
            test.ex,
            test.ey,
            curnodseg.bx,
            curnodseg.by,
            nextnodseg.ex,
            nextnodseg.ey
          )
        ) {
          canbridge = false;
          break;
        }
      }
    }
  }
  if (canbridge) {
    let ibridge = makenodseg(
      curnodseg.bx,
      curnodseg.by,
      nextnodseg.ex,
      nextnodseg.ey,
      distfun,
      dis,
      curnodseg.ex,
      curnodseg.ey
    );

    dis.nodseg[ibridge.ifirst].iprevnodseg = curnodseg.iprevnodseg;
    dis.nodseg[curnodseg.iprevnodseg].inextnodseg = ibridge.ifirst;

    dis.nodseg[ibridge.ilast].inextnodseg = nextnodseg.inextnodseg;
    dis.nodseg[nextnodseg.inextnodseg].iprevnodseg = ibridge.ilast;

    let ir = dis.activenodseg.indexOf(icurnodseg);
    dis.activenodseg.splice(ir, 1);
    ir = dis.activenodseg.indexOf(inextnodseg);
    dis.activenodseg.splice(ir, 1);
    return true;
  }
  return false;
}

TryBridgeToPrev = function (icurnodseg, distfun, dis) {
  let curnodseg = dis.nodseg[icurnodseg];
  let iprevnodseg = curnodseg.iprevnodseg;
  let prevnodseg = dis.nodseg[iprevnodseg];
  let fq = intersect_segment_halfline(
    prevnodseg.ex,
    prevnodseg.ey,
    prevnodseg.bx,
    prevnodseg.by,
    curnodseg.ex,
    curnodseg.ey,
    curnodseg.cx,
    curnodseg.cy
  );
  let d = Math.hypot(
    prevnodseg.ex - curnodseg.cx,
    prevnodseg.ey - curnodseg.cy
  );
  let canbridge = false;
  if ((fq < disc_par.bridgecrit) | (d < 0.5 * curnodseg.R)) {
    canbridge = true;
    for (let i of dis.activenodseg) {
      if (
        (i != icurnodseg) &
        (i != iprevnodseg) &
        (i != curnodseg.inextnodseg) &
        (i != prevnodseg.iprevnodseg)
      ) {
        let test = dis.nodseg[i];
        if (
          doIntersect(
            test.bx,
            test.by,
            test.ex,
            test.ey,
            prevnodseg.bx,
            prevnodseg.by,
            curnodseg.ex,
            curnodseg.ey
          )
        ) {
          canbridge = false;
          break;
        }
      }
    }
    if (canbridge) {
      let ibridge = makenodseg(
        prevnodseg.bx,
        prevnodseg.by,
        curnodseg.ex,
        curnodseg.ey,
        distfun,
        dis,
        curnodseg.bx,
        curnodseg.by
      );

      dis.nodseg[ibridge.ifirst].iprevnodseg = prevnodseg.iprevnodseg;
      dis.nodseg[prevnodseg.iprevnodseg].inextnodseg = ibridge.ifirst;

      dis.nodseg[ibridge.ilast].inextnodseg = curnodseg.inextnodseg;
      dis.nodseg[curnodseg.inextnodseg].iprevnodseg = ibridge.ilast;

      let ir = dis.activenodseg.indexOf(icurnodseg);
      dis.activenodseg.splice(ir, 1);
      ir = dis.activenodseg.indexOf(iprevnodseg);
      dis.activenodseg.splice(ir, 1);

      return true;
    }
  }
  return false;
};

function do1step(icurnodseg, distfun, dis) {
  let inextnodseg = dis.nodseg[icurnodseg].inextnodseg;
  let done = TryBridgeToNext(icurnodseg, distfun, dis);
  if (done) {
    inext = dis.nodseg.length - 1;
  }
  if (!done) {
    done = TryBridgeToPrev(icurnodseg, distfun, dis);
    if (done) {
      inext = dis.nodseg.length - 1;
    }
  }
  if (!done) {
    done = TryPromoteChild(icurnodseg, distfun, dis);
    if (done) {
      inext = inextnodseg;
    }
  }
  if (!done) {
    inext = inextnodseg;
  }
  return { succes: done, inext: inext };
}

function adjustdisc_par(failsinrow, numactivesegments) {
  if (failsinrow > numactivesegments) {
    disc_par.bridgecrit = disc_par.bridgecritfactor * disc_par.bridgecrit;
    disc_par.tooclosefactor =
      disc_par.mintooclose +
      (disc_par.tooclosefactor - disc_par.mintooclose) *
        disc_par.mintooclosefactor;
  }
}

let discretization = {};

const xtransform = {
  numx: [],
  realx: [],
};

make_xtransform = function () {
  xtransform.numx = [];
  xtransform.realx = [];
  xtransform.numx.push(0);
  xtransform.realx.push(0);
  xtransform.numx.push(numerics.horleft);
  xtransform.realx.push(geo.drainwidth);
  let der0 = geo.drainwidth / numerics.horleft;
  let numxscale = numerics.horright;
  let realxscale = geo.domainwidth - geo.drainwidth;
  // console.log(">",realxscale)
  let n = 8; // n=0 is classical
  let dw = der0 + (3 / 2) * (realxscale / numxscale - der0);
  let alpha1 = realxscale / numxscale - der0;
  let alpha2 = dw - der0;
  let a2 = ((3 + n) * alpha1 - alpha2) / Math.pow(numxscale, 1 + n);
  let a3 = (-(2 + n) * alpha1 + alpha2) / Math.pow(numxscale, 2 + n);

  for (let i = 0; i < 100; i++) {
    let dnumx = ((i + 1) / 100) * numxscale;
    xtransform.numx.push(numerics.horleft + dnumx);
    xtransform.realx.push(
      geo.drainwidth +
        der0 * dnumx +
        a2 * Math.pow(dnumx, 2 + n) +
        a3 * Math.pow(dnumx, 3 + n)
    );
  }
};


transform_num2real = function (x, y) {
  let idrain = drain.findbyz(physics.drainlevel);
  let realx = interpol_arrays(x, xtransform.numx, xtransform.realx);
  let realy = 0;
  if (x < numerics.horleft) {
    let realytop = 0;
    if (realx < idrain.x) {
      let found = drain.findbyx(realx);
      realytop = found.z;
    } else {
      realytop = physics.drainlevel;
    }
    let numytop = (realytop / physics.drainlevel) * numerics.verleft;
    realy = lin_interpol(y, [0, numytop], [0, realytop]);
  } else {
    let numytop = lin_interpol(
      x,
      [numerics.horleft, numerics.horleft + numerics.horright],
      [numerics.verleft, numerics.verright]
    );
    realy = lin_interpol(y, [0, numytop], [0, physics.drainlevel]);
  }
  return { x: realx, y: realy };
};

transform_real2num = function (x, y) {
  let idrain = drain.findbyz(physics.drainlevel);
  let numx = interpol_arrays(x, xtransform.realx, xtransform.numx);
  let numy = 0;
  if (numx < numerics.horleft) {
    let realytop = 0;
    if (x < idrain.x) {
      let found = drain.findbyx(x);
      realytop = found.z;
    } else {
      realytop = physics.drainlevel;
    }
    let numytop = (realytop / physics.drainlevel) * numerics.verleft;
    numy = lin_interpol(y, [0, realytop], [0, numytop]);
  } else {
    let numytop = lin_interpol(
      numx,
      [numerics.horleft, numerics.horleft + numerics.horright],
      [numerics.verleft, numerics.verright]
    );
    numy = lin_interpol(y, [0, physics.drainlevel], [0, numytop]);
  }
  return { x: numx, y: numy };
};

generatetriangles = function () {
  // make elements (should become a function)
  let delnodes = [];
  for (let i = 0; i < discretization.Numnodes; i++) {
    let numnode = transform_real2num(
      discretization.nodes[2 * i],
      discretization.nodes[2 * i + 1]
    );
    delnodes.push(numnode.x);
    delnodes.push(numnode.y);
  }

  function testtriangle1(tr) {
    let Ax = discretization.nodes[2 * tr[0]];
    let Bx = discretization.nodes[2 * tr[1]];
    let Cx = discretization.nodes[2 * tr[2]];
    let Ay = discretization.nodes[2 * tr[0] + 1];
    let By = discretization.nodes[2 * tr[1] + 1];
    let Cy = discretization.nodes[2 * tr[2] + 1];
    let xAB = Ax - Bx;
    let yAB = Ay - By;
    let xCA = Cx - Ax;
    let yCA = Cy - Ay;
    let D = xCA * yAB - xAB * yCA;
    if (Math.abs(D) < 1e-4) {
      return false;
    }
    return true;
  }

  function testtriangle2(tr) {
    let imin = Math.min(tr[0], tr[1], tr[2]);
    if (imin >= discretization.idraingrw) {
      return true;
    }
    for (let i of tr) {
      if (i != imin) {
        if (discretization.nodes[2 * i] < discretization.nodes[2 * imin]) {
          let x1 = discretization.nodes[2 * imin - 2];
          let y1 = discretization.nodes[2 * imin - 1];
          let x2 = discretization.nodes[2 * imin];
          let y2 = discretization.nodes[2 * imin + 1];
          let x3 = discretization.nodes[2 * i];
          let y3 = discretization.nodes[2 * i + 1];
          if ((x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1) > 0) {
            return false;
          }
        } else if (
          discretization.nodes[2 * i] > discretization.nodes[2 * imin]
        ) {
          let x1 = discretization.nodes[2 * imin];
          let y1 = discretization.nodes[2 * imin + 1];
          let x2 = discretization.nodes[2 * imin + 2];
          let y2 = discretization.nodes[2 * imin + 3];
          let x3 = discretization.nodes[2 * i];
          let y3 = discretization.nodes[2 * i + 1];
          if ((x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1) > 0) {
            return false;
          }
        }
      }
    }
    return true;
  }

  delaunay = new Delaunator(delnodes);
  discretization.elements = [];
  discretization.neighbours = [];
  for (let i = 0; i < discretization.Numnodes; i++) {
    discretization.neighbours[i] = new Set();
  }
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    let ni0 = delaunay.triangles[i];
    let ni1 = delaunay.triangles[i + 1];
    let ni2 = delaunay.triangles[i + 2];
    let x0 = discretization.nodes[2 * ni0];
    let y0 = discretization.nodes[2 * ni0 + 1];
    let x1 = discretization.nodes[2 * ni1];
    let y1 = discretization.nodes[2 * ni1 + 1];
    let x2 = discretization.nodes[2 * ni2];
    let y2 = discretization.nodes[2 * ni2 + 1];

    if (testtriangle1([ni0, ni1, ni2]) & testtriangle2([ni0, ni1, ni2])) {
      discretization.elements.push([ni0, ni1, ni2]);
      discretization.neighbours[ni0].add(ni1);
      discretization.neighbours[ni0].add(ni2);
      discretization.neighbours[ni1].add(ni0);
      discretization.neighbours[ni1].add(ni2);
      discretization.neighbours[ni2].add(ni0);
      discretization.neighbours[ni2].add(ni1);
    }
  }
  // transform neighbours from set to array for math
  for (let i = 0; i < discretization.neighbours.length; i++) {
    discretization.neighbours[i] = Array.from(discretization.neighbours[i]);
  }
};

generatenetwork = function () {

  make_xtransform();
  let dis = {
    nodes: [],
    borderfirstlast: [],
    nodseg: [],
    activenodseg: [],
  };
  let hfactor = numerics.horleft / geo.drainwidth;
  let vfactor = numerics.verleft / physics.drainlevel;
  let nsplitx = hfactor * geo.drainwidth;
  let nsplity = vfactor * physics.drainlevel;
  let idrain = drain.findbyz(physics.drainlevel);

  function df(x, y) {
    let r = numerics.densfactor;
    r = Math.pow(r, 0.5);
    let rx = x / hfactor;
    let ry = y / vfactor;
    let dl = drain.finddist(rx, ry);
    let d = dl.d;
    let lf = Math.pow(dl.lfrac, 0.25);
    let dd = Math.atanh(1 - lf * r);
    return Math.tanh(Math.exp(-1 * r) * d + dd);
  }

  let nendx = numerics.horleft + numerics.horright;

  let numdrainxy = [];
  let numxy = [];
  for (let i = 0; i < idrain.iplus; i++) {
    numxy = transform_real2num(drain.xz[2 * i], drain.xz[2 * i + 1]);
    numdrainxy.push(numxy.x);
    numdrainxy.push(numxy.y);
  }
  numxy = transform_real2num(idrain.x, idrain.z);
  numdrainxy.push(numxy.x);
  numdrainxy.push(numxy.y);
  let domain = [
    numdrainxy,
    [
      numxy.x,
      numxy.y,
      nsplitx,
      nsplity,
      nendx,
      numerics.verright,
    ],
    [nendx, numerics.verright, nendx, 0],
    [nendx, 0, 0, 0],
    [0, 0, numdrainxy[0], numdrainxy[1]],
  ];

  discretize_border(domain, df, dis);

  istep = 3;
  let stepsdone = 0;
  let failsinrow = 0;
  let alldone = false;
  while ((stepsdone < disc_par.maxsteps) & (dis.activenodseg.length > 3)) {
    let ans = do1step(istep, df, dis);
    istep = ans.inext;
    if (ans.succes) {
      failsinrow = 0;
    } else {
      failsinrow++;
    }
    adjustdisc_par(failsinrow, dis.activenodseg.length);
    stepsdone++;
  }

  for (let i = 0; i < dis.nodes.length; i += 2) {
    let x = dis.nodes[i];
    let y = dis.nodes[i + 1];
    let newxy = transform_num2real(x, y);
    dis.nodes[i] = newxy.x;
    dis.nodes[i + 1] = newxy.y;
  }


  discretization.nodes = [...dis.nodes];

  discretization.Numnodes = discretization.nodes.length / 2;
  discretization.ileftdrain = dis.borderfirstlast[0].first;
  discretization.idraingrw = dis.borderfirstlast[1].first;
  discretization.igrwright = dis.borderfirstlast[2].first;
  discretization.irightbottom = dis.borderfirstlast[3].first;
  discretization.ileftbottom = dis.borderfirstlast[4].first;

  // determine first on vertical 
  // only intersting for rectangular profiles
  // for others it is just equal to idraingrw
  discretization.ifirstvertical = 0;
  while(discretization.nodes[2*discretization.ifirstvertical]
    <discretization.nodes[2*discretization.idraingrw])
  {
    discretization.ifirstvertical++;
  }
  // console.log("first-idraingrw",discretization.ifirstvertical,discretization.idraingrw);

  generatetriangles();
};
