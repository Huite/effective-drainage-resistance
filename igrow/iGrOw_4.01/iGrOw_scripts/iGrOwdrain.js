var drain = {
  name: "none",
  fu: null,
  xz: null,
  maxL: 0,
  Npoints: 300,
  L: null,
};

//%%
function setdrain() {
  let y = geo.domainheight - geo.drainbottom;
  if (modelchoices.crosssection == "smooth") {
    drain.name = "smooth";
    let dy = Math.tan((geo.taludangle * Math.PI) / 180);
    let W = geo.drainwidth;
    let Wcrit = (3 * y) / dy;
    let dW = W - Wcrit;
    if (dW > 0) {
      a3 = Math.pow(dy, 3) / (27 * Math.pow(y, 2));
      drain.fu = function (u) {
        let t = u * W;
        if (t < dW) {
          return {
            x: t,
            z: geo.drainbottom,
          };
        } else {
          return {
            x: t,
            z: geo.drainbottom + a3 * Math.pow(t - dW, 3),
          };
        }
      };
    } else {
      a2 = 3 * Math.pow(W, -2) * y - Math.pow(W, -1) * dy;
      a3 = -2 * Math.pow(W, -3) * y + Math.pow(W, -2) * dy;
      drain.fu = function (u) {
        let t = u * W;
        let z = geo.drainbottom + a2 * t * t + a3 * t * t * t;
        return {
          x: t,
          z: z,
        };
      };
    }
  } else if (modelchoices.crosssection == "trapezoidal") {
    drain.name = "trapezoidal";
    let W = geo.drainwidth;
    let dWR = geo.traptalud * y;
    let dWL = W - dWR;
    let f = Math.sqrt(1 + Math.pow(geo.traptalud, 2));
    let lL = y * f;
    let totl = dWL + lL;
    drain.fu = function (u) {
      let l = u * totl;
      if (l < dWL) {
        return {
          x: l,
          z: geo.drainbottom,
        };
      } else {
        let zu = (l - dWL) / f;
        let xu = geo.traptalud * zu;
        return {
          x: xu + dWL,
          z: zu + geo.drainbottom,
        };
      }
    };
  }
  drain.xz = [];
  for (let i = 0; i < drain.Npoints; i++) {
    let u = i / (drain.Npoints - 1);
    let xz = drain.fu(u);
    drain.xz.push(xz.x);
    drain.xz.push(xz.z);
  }
  drain.L = [];
  drain.L.push(0);
  drain.maxL = 0;
  for (let i = 1; i < drain.Npoints; i++) {
    let newd = Math.pow(drain.xz[2 * i] - drain.xz[2 * i - 2], 2);
    newd += Math.pow(drain.xz[2 * i + 1] - drain.xz[2 * i - 1], 2);
    newd = Math.sqrt(newd);
    drain.maxL += newd;
    drain.L.push(drain.maxL);
  }
}

setdrain();

drain.findbyx = function (x) {
  let index = 0;
  if (x < drain.xz[0]) {
    return {
      imin: 0,
      iplus: 0,
      x: drain.xz[0],
      z: drain.xz[1],
      L: drain.L[0],
    };
  }

  for (let i = 1; i < drain.Npoints; i++) {
    if (drain.xz[2 * i] > x) {
      index = i;
      break;
    }
  }
  if (index == 0) {
    return {
      imin: drain.Npoints - 1,
      iplus: drain.Npoints - 1,
      x: drain.xz[2 * drain.Npoints - 2],
      z: drain.xz[2 * drain.Npoints - 1],
      L: drain.L[drain.Npoints - 1],
    };
  }
  let f =
    (drain.xz[2 * index] - x) / (drain.xz[2 * index] - drain.xz[2 * index - 2]);

  return {
    imin: index - 1,
    iplus: index,
    x: x,
    z: f * drain.xz[2 * index - 1] + (1 - f) * drain.xz[2 * index + 1],
    L: f * drain.L[index - 1] + (1 - f) * drain.L[index],
  };
};

drain.findbyz = function (z) {
  let index = 0;
  if (z < drain.xz[1]) {
    return {
      imin: 0,
      iplus: 0,
      x: drain.xz[0],
      z: drain.xz[1],
      L: drain.L[0],
    };
  }

  for (let i = 1; i < drain.Npoints; i++) {
    if (drain.xz[2 * i + 1] > z) {
      index = i;
      break;
    }
  }
  if (index == 0) {
    return {
      imin: drain.Npoints - 1,
      iplus: drain.Npoints - 1,
      x: drain.xz[2 * drain.Npoints - 2],
      z: drain.xz[2 * drain.Npoints - 1],
      L: drain.L[drain.Npoints - 1],
    };
  }
  let f =
    (drain.xz[2 * index + 1] - z) /
    (drain.xz[2 * index + 1] - drain.xz[2 * index - 1]);

  return {
    imin: index - 1,
    iplus: index,
    x: f * drain.xz[2 * index - 2] + (1 - f) * drain.xz[2 * index],
    z: z,
    L: f * drain.L[index - 1] + (1 - f) * drain.L[index],
  };
};
drain.findbyL = function (l) {
  let index = 0;
  if (l <= drain.L[0]) {
    return {
      imin: 0,
      iplus: 0,
      x: drain.xz[0],
      z: drain.xz[1],
      L: drain.L[0],
    };
  }

  for (let i = 1; i < drain.Npoints; i++) {
    if (drain.L[i] > l) {
      index = i;
      break;
    }
  }
  if (index == 0) {
    return {
      imin: drain.Npoints - 1,
      iplus: drain.Npoints - 1,
      x: drain.xz[2 * drain.Npoints - 2],
      z: drain.xz[2 * drain.Npoints - 1],
      L: drain.L[drain.Npoints - 1],
    };
  }
  let f = (drain.L[index] - l) / (drain.L[index] - drain.L[index - 1]);

  return {
    imin: index - 1,
    iplus: index,
    x: f * drain.xz[2 * index - 2] + (1 - f) * drain.xz[2 * index],
    z: f * drain.xz[2 * index - 1] + (1 - f) * drain.xz[2 * index + 1],
    L: l,
  };
};

drain.finddist = function (tox, toy) {
  let mindist = Infinity;
  let lmindist = 0;
  let imin = 0;
  for (let i = 0; i < drain.Npoints; i++) {
    let dist = Math.hypot(tox - drain.xz[2 * i], toy - drain.xz[2 * i + 1]);
    if (dist < mindist) {
      mindist = dist;
      lmindist = drain.L[i];
      imin = i;
    }
  }
  return {
    imin: imin,
    L: lmindist,
    lfrac: lmindist / drain.maxL,
    d: mindist,
    x: drain.xz[2 * imin],
    z: drain.xz[2 * imin + 1],
  };
};
