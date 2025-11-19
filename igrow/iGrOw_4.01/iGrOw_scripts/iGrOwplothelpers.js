var fillcolors = [
  'rgb(255,255,255)',
  'rgb(252,254,255)',
  'rgb(250,253,255)',
  'rgb(247,252,254)',
  'rgb(244,251,254)',
  'rgb(242,250,254)',
  'rgb(239,249,254)',
  'rgb(236,248,253)',
  'rgb(234,247,253)',
  'rgb(231,246,253)',
  'rgb(229,245,253)',
  'rgb(226,244,253)',
  'rgb(223,243,252)',
  'rgb(221,242,252)',
  'rgb(218,241,252)',
  'rgb(215,240,252)',
  'rgb(213,239,252)',
  'rgb(210,238,251)',
  'rgb(207,237,251)',
  'rgb(205,236,251)',
  'rgb(202,235,251)',
  'rgb(199,234,250)',
  'rgb(197,233,250)',
  'rgb(194,232,250)',
  'rgb(191,231,250)',
  'rgb(189,230,250)',
  'rgb(186,229,249)',
  'rgb(183,228,249)',
  'rgb(181,227,249)',
  'rgb(178,226,249)',
  'rgb(176,225,249)',
  'rgb(173,224,248)',
  'rgb(170,223,248)',
  'rgb(168,222,248)',
  'rgb(165,221,248)',
  'rgb(162,220,247)',
  'rgb(157,218,247)',
  'rgb(155,216,246)',
  'rgb(152,214,245)',
  'rgb(150,212,243)',
  'rgb(148,210,242)',
  'rgb(146,208,241)',
  'rgb(143,206,240)',
  'rgb(141,204,238)',
  'rgb(139,202,237)',
  'rgb(136,200,236)',
  'rgb(134,197,235)',
  'rgb(132,195,234)',
  'rgb(129,193,232)',
  'rgb(127,191,231)',
  'rgb(125,189,230)',
  'rgb(123,187,229)',
  'rgb(120,185,228)',
  'rgb(118,183,226)',
  'rgb(116,181,225)',
  'rgb(113,179,224)',
  'rgb(111,177,223)',
  'rgb(109,175,221)',
  'rgb(106,173,220)',
  'rgb(104,171,219)',
  'rgb(102,169,218)',
  'rgb(100,167,217)',
  'rgb(97,165,215)',
  'rgb(95,163,214)',
  'rgb(93,160,213)',
  'rgb(90,158,212)',
  'rgb(88,156,211)',
  'rgb(86,154,209)',
  'rgb(83,152,208)',
  'rgb(81,150,207)',
  'rgb(79,148,206)',
  'rgb(77,146,204)',
  'rgb(72,142,202)',
  'rgb(72,143,198)',
  'rgb(72,144,195)',
  'rgb(72,145,191)',
  'rgb(72,146,188)',
  'rgb(72,147,184)',
  'rgb(72,148,181)',
  'rgb(72,149,177)',
  'rgb(72,150,173)',
  'rgb(72,151,170)',
  'rgb(72,153,166)',
  'rgb(72,154,163)',
  'rgb(72,155,159)',
  'rgb(72,156,156)',
  'rgb(72,157,152)',
  'rgb(72,158,148)',
  'rgb(72,159,145)',
  'rgb(72,160,141)',
  'rgb(72,161,138)',
  'rgb(73,162,134)',
  'rgb(73,163,131)',
  'rgb(73,164,127)',
  'rgb(73,165,124)',
  'rgb(73,166,120)',
  'rgb(73,167,116)',
  'rgb(73,168,113)',
  'rgb(73,169,109)',
  'rgb(73,170,106)',
  'rgb(73,172,102)',
  'rgb(73,173,99)',
  'rgb(73,174,95)',
  'rgb(73,175,91)',
  'rgb(73,176,88)',
  'rgb(73,177,84)',
  'rgb(73,178,81)',
  'rgb(73,179,77)',
  'rgb(73,181,70)',
  'rgb(78,182,71)',
  'rgb(83,184,71)',
  'rgb(87,185,72)',
  'rgb(92,187,72)',
  'rgb(97,188,73)',
  'rgb(102,189,74)',
  'rgb(106,191,74)',
  'rgb(111,192,75)',
  'rgb(116,193,75)',
  'rgb(121,195,76)',
  'rgb(126,196,77)',
  'rgb(130,198,77)',
  'rgb(135,199,78)',
  'rgb(140,200,78)',
  'rgb(145,202,79)',
  'rgb(150,203,80)',
  'rgb(154,204,80)',
  'rgb(159,206,81)',
  'rgb(164,207,81)',
  'rgb(169,209,82)',
  'rgb(173,210,82)',
  'rgb(178,211,83)',
  'rgb(183,213,84)',
  'rgb(188,214,84)',
  'rgb(193,215,85)',
  'rgb(197,217,85)',
  'rgb(202,218,86)',
  'rgb(207,220,87)',
  'rgb(212,221,87)',
  'rgb(217,222,88)',
  'rgb(221,224,88)',
  'rgb(226,225,89)',
  'rgb(231,226,90)',
  'rgb(236,228,90)',
  'rgb(240,229,91)',
  'rgb(245,231,91)',
  'rgb(250,232,92)',
  'rgb(250,229,91)',
  'rgb(250,225,89)',
  'rgb(250,222,88)',
  'rgb(249,218,86)',
  'rgb(249,215,85)',
  'rgb(249,212,84)',
  'rgb(249,208,82)',
  'rgb(249,205,81)',
  'rgb(249,201,80)',
  'rgb(249,198,78)',
  'rgb(249,195,77)',
  'rgb(248,191,75)',
  'rgb(248,188,74)',
  'rgb(248,184,73)',
  'rgb(248,181,71)',
  'rgb(248,178,70)',
  'rgb(248,174,69)',
  'rgb(248,171,67)',
  'rgb(247,167,66)',
  'rgb(247,164,64)',
  'rgb(247,160,63)',
  'rgb(247,157,62)',
  'rgb(247,154,60)',
  'rgb(247,150,59)',
  'rgb(247,147,58)',
  'rgb(246,143,56)',
  'rgb(246,140,55)',
  'rgb(246,137,53)',
  'rgb(246,133,52)',
  'rgb(246,130,51)',
  'rgb(246,126,49)',
  'rgb(246,123,48)',
  'rgb(246,120,47)',
  'rgb(245,116,45)',
  'rgb(245,113,44)',
  'rgb(245,106,41)',
  'rgb(244,104,41)',
  'rgb(243,102,41)',
  'rgb(242,100,41)',
  'rgb(241,98,41)',
  'rgb(240,96,41)',
  'rgb(239,94,41)',
  'rgb(239,92,41)',
  'rgb(238,90,41)',
  'rgb(237,88,41)',
  'rgb(236,86,41)',
  'rgb(235,84,41)',
  'rgb(234,82,41)',
  'rgb(233,80,41)',
  'rgb(232,78,41)',
  'rgb(231,76,41)',
  'rgb(230,74,41)',
  'rgb(229,72,41)',
  'rgb(228,70,41)',
  'rgb(228,67,40)',
  'rgb(227,65,40)',
  'rgb(226,63,40)',
  'rgb(225,61,40)',
  'rgb(224,59,40)',
  'rgb(223,57,40)',
  'rgb(222,55,40)',
  'rgb(221,53,40)',
  'rgb(220,51,40)',
  'rgb(219,49,40)',
  'rgb(218,47,40)',
  'rgb(217,45,40)',
  'rgb(217,43,40)',
  'rgb(216,41,40)',
  'rgb(215,39,40)',
  'rgb(214,37,40)',
  'rgb(213,35,40)',
  'rgb(211,31,40)',
  'rgb(209,31,40)',
  'rgb(207,30,39)',
  'rgb(206,30,39)',
  'rgb(204,30,38)',
  'rgb(202,30,38)',
  'rgb(200,29,38)',
  'rgb(199,29,37)',
  'rgb(197,29,37)',
  'rgb(195,29,36)',
  'rgb(193,28,36)',
  'rgb(192,28,36)',
  'rgb(190,28,35)',
  'rgb(188,27,35)',
  'rgb(186,27,34)',
  'rgb(185,27,34)',
  'rgb(183,27,34)',
  'rgb(181,26,33)',
  'rgb(179,26,33)',
  'rgb(178,26,32)',
  'rgb(176,26,32)',
  'rgb(174,25,31)',
  'rgb(172,25,31)',
  'rgb(171,25,31)',
  'rgb(169,25,30)',
  'rgb(167,24,30)',
  'rgb(165,24,29)',
  'rgb(164,24,29)',
  'rgb(162,23,29)',
  'rgb(160,23,28)',
  'rgb(158,23,28)',
  'rgb(157,23,27)',
  'rgb(155,22,27)',
  'rgb(153,22,27)',
  'rgb(151,22,26)',
  'rgb(150,22,26)',
  'rgb(146,21,25)'
]


fillcolorfun = function(value) {
  value = Math.min(Math.max(value, 0), 1);
  index = Math.round(253 * value);
  return fillcolors[index];
}




function filltriangle(p0, p1, p2, H0, H1, H2, contourvalues, ctx) {
  // look at H0<->H1
  if (H1 < H0) {
    temp = p0;
    p0 = p1;
    p1 = temp;
    temp = H0;
    H0 = H1;
    H1 = temp;
  }
  // now H0<H1, look at H2<->H1
  if (H2 < H1) {
    temp = p1;
    p1 = p2;
    p2 = temp;
    temp = H1;
    H1 = H2;
    H2 = temp;
  }
  // now  H0<H2 and H1<H2, look at H0<->H1
  if (H1 < H0) {
    temp = p0;
    p0 = p1;
    p1 = temp;
    temp = H0;
    H0 = H1;
    H1 = temp;
  }

  var dx1 = p1[0] - p0[0];
  var dx2 = p2[0] - p0[0];
  var dy1 = p1[1] - p0[1];
  var dy2 = p2[1] - p0[1];
  var dH1 = H1 - H0;
  var dH2 = H2 - H0;

  var D = dx1 * dy2 - dx2 * dy1;
  if(Math.abs(D)<1e-5)
  {
    return null;
  }
  var gx = (dy2 * dH1 - dy1 * dH2) / D;
  var gy = (-dx2 * dH1 + dx1 * dH2) / D;

  var l2 = dH2 / (gx * gx + gy * gy);
  var l1 = dH1 / (gx * gx + gy * gy);

  var pg;
  if(Math.abs(l2)>1e-6)
  {
    pg = [p0[0] + l2 * gx, p0[1] + l2 * gy];
  } else {
    pg = [1e-4,1e-4]
  }
  var my_gradient = ctx.createLinearGradient(p0[0], p0[1], pg[0], pg[1]);
  ctx.fillStyle = my_gradient;

  var s = [0,l1/l2,1];

  my_gradient.addColorStop(0,fillcolorfun(H0));
  if(H1-H0>1e-5)
  {
    var Ni = Math.abs(253 / 4 * (H1 - H0));
    for (var j = 1; j < Ni; j++) {
      var f = j / Ni;
      var sf = f * l1/l2;
      var pH = (1 - f) * H0 + f * H1;
      my_gradient.addColorStop(sf,fillcolorfun(pH))
    }
  }

  if(H2-H1>1e-5)
  {
    var Ni = Math.abs(253 / 4 * (H2 - H1));
    for (var j = 1; j < Ni; j++) {
      var f = j / Ni;
      var sf = (1-f)*l1/l2+f;
      var pH = (1 - f) * H1 + f * H2;
      // console.log("#",H1,H2,Ni,j,f)
      // console.log("##",l1,l2,sf,pH)
      my_gradient.addColorStop(sf,fillcolorfun(pH))
    }
   }



  ctx.lineWidth = 0;
  ctx.beginPath();
  ctx.moveTo(p0[0], p0[1]);
  ctx.lineTo(p1[0], p1[1]);
  ctx.lineTo(p2[0], p2[1]);
  ctx.closePath();
  ctx.fill();
  for (var i = 0; i < contourvalues.length; i++) {
    cv = contourvalues[i];
    var xstart, ystart;
    var xend, yend;
    if ((H0 < cv) & (cv < H2)) {
      f02 = (cv - H0) / (H2 - H0);
      xstart = (1 - f02) * p0[0] + f02 * p2[0];
      ystart = (1 - f02) * p0[1] + f02 * p2[1];
      if (cv < H1) {
        f01 = (cv - H0) / (H1 - H0);
        xend = (1 - f01) * p0[0] + f01 * p1[0];
        yend = (1 - f01) * p0[1] + f01 * p1[1];
      } else {
        f12 = (cv - H1) / (H2 - H1);
        xend = (1 - f12) * p1[0] + f12 * p2[0];
        yend = (1 - f12) * p1[1] + f12 * p2[1];
      }
    }
    ctx.beginPath();
    ctx.moveTo(xstart, ystart);
    ctx.lineTo(xend, yend)
    ctx.closePath();
    ctx.stroke();

  }
}



function fillquad(p0, p1, p2, p3, H0, H1, H2, H3, contourvalues, ctx) {
  var pm = [
    (p0[0] + p1[0] + p2[0] + p3[0]) / 4,
    (p0[1] + p1[1] + p2[1] + p3[1]) / 4
  ];
  var Hm = (H0 + H1 + H2 + H3) / 4;
  filltriangle(p0, p1, pm, H0, H1, Hm, contourvalues, ctx);
  filltriangle(p1, p2, pm, H1, H2, Hm, contourvalues, ctx);
  filltriangle(p2, p3, pm, H2, H3, Hm, contourvalues, ctx);
  filltriangle(p3, p0, pm, H3, H0, Hm, contourvalues, ctx);
}

canvasarrow = function(ctx, startX, startY, endX, endY, controlPoints, cutsmall) {
  var dx = endX - startX;
  var dy = endY - startY;
  var len = Math.sqrt(dx * dx + dy * dy);
  var longenough = true;
  if (cutsmall) {
    longenough = (len > Math.abs(controlPoints[2]));
  }
  if (longenough) {
    var sin = dy / len;
    var cos = dx / len;
    var a = [];
    a.push(0, 0);
    for (var i = 0; i < controlPoints.length; i += 2) {
      var x = controlPoints[i];
      var y = controlPoints[i + 1];
      a.push(x < 0 ? len + x : x, y);
    }
    a.push(len, 0);
    for (var i = controlPoints.length; i > 0; i -= 2) {
      var x = controlPoints[i - 2];
      var y = controlPoints[i - 1];
      a.push(x < 0 ? len + x : x, -y);
    }
    a.push(0, 0);
    for (var i = 0; i < a.length; i += 2) {
      var x = a[i] * cos - a[i + 1] * sin + startX;
      var y = a[i] * sin + a[i + 1] * cos + startY;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  }
};
