let drawtrianglefunction =
  "function FEtriangle(Ax, Ay, Bx, By, Cx, Cy, Qfromx, Qfromy, Qtox, Qtoy, id) {\
  let r = Math.ceil(200 * Math.random());\
  let g = Math.ceil(200 * Math.random());\
  let b = Math.ceil(200 * Math.random());\
  ctx.beginPath();\
  ctx.moveTo(Ax, Ay);\
  ctx.lineTo(Bx, By);\
  ctx.lineTo(Cx, Cy);\
  ctx.lineTo(Ax, Ay);\
  ctx.closePath();\
  ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',0.15)';\
  ctx.fill();\
  ctx.lineWidth=1;\
  ctx.stroke();\
  ctx.fillStyle = 'red';\
  ctx.beginPath();\
  ctx.arc(Ax, Ay, 4, 0, 2 * Math.PI);\
  ctx.fill();\
  ctx.stroke();\
  const dx = Qtox - Qfromx;\
  const dy = Qtoy - Qfromy;\
  const headlen = 10;\
  const angle = Math.atan2(dy, dx);\
  ctx.lineWidth=2;\
  ctx.strokeStyle = 'rgb(30, 30, 30,0.75)';\
  ctx.beginPath();\
  ctx.moveTo(Qfromx, Qfromy);\
  ctx.lineTo(Qtox, Qtoy);\
  ctx.strokeStyle = 'red';\
  ctx.stroke();\
  ctx.beginPath();\
  ctx.moveTo(Qtox - headlen * Math.cos(angle - Math.PI / 8), Qtoy - headlen * Math.sin(angle - Math.PI / 6));\
  ctx.lineTo(Qtox, Qtoy);\
  ctx.lineTo(Qtox - headlen * Math.cos(angle + Math.PI / 8), Qtoy - headlen * Math.sin(angle + Math.PI / 6));\
  ctx.stroke();\
  ctx.strokeStyle = 'black';\
  ctx.fillStyle = 'black';\
  ctx.font = '20px Georgia';\
  ctx.textAlign = 'center';\
  ctx.fillText(id, 0.1*Ax+0.45*Bx+0.45*Cx,0.1*Ay+0.45*By+0.45*Cy);}";

function updatenodereport(inode) {
  let BI = makeinspectionbaseinfo(inode)
  let minx = BI.Ax;
  let maxx = BI.Ax;
  let miny = BI.Ay;
  let maxy = BI.Ay;
  let fQ = 1000;
  for (const t of BI.tr) {
    t.minx = Math.min(BI.Ax, t.Bx, t.Cx);
    t.maxx = Math.max(BI.Ax, t.Bx, t.Cx);
    t.miny = Math.min(BI.Ay, t.By, t.Cy);
    t.maxy = Math.max(BI.Ay, t.By, t.Cy);
    minx = Math.min(t.minx, minx);
    maxx = Math.max(t.maxx, maxx);
    miny = Math.min(t.miny, miny);
    maxy = Math.max(t.maxy, maxy);
    t.midx = (BI.Ax + t.Bx + t.Cx) / 3;
    t.midy = (BI.Ay + t.By + t.Cy) / 3;
    fQ = Math.min((t.maxx - t.midx)/ Math.abs(t.Qx), fQ);
    fQ = Math.min((t.midx - t.minx)/ Math.abs(t.Qx), fQ);
    fQ = Math.min((t.maxy - t.midy)/ Math.abs(t.Qy), fQ);
    fQ = Math.min((t.midy - t.miny)/ Math.abs(t.Qy), fQ);
  }
  let factorx = 200 / (maxx - minx);
  let factory = 120 / (maxy - miny);

  let html = "";
  html += "<head>"
  html += "<style>table,th,td {border: 1px solid black}";
  html += " td {text-align: center;}</style>"
  html += "</head>";
  html += "<body>";
  html += "info for node["+inode+"] at x=" +BI.Ax.toFixed(3) + " y=" + BI.Ay.toFixed(3) + "<br><br>";
  html += "head H=" + BI.HA.toFixed(4) + "<br>";
  if(BI.Qextm>-0.5)
  {
    html += "external flux Qext=" + BI.Qextp.toFixed(6) +" "+BI.Qextm.toFixed(6) +"<br>";
    html += Array(30).fill("&nbsp;").join('') +"="+ BI.Qext.toFixed(6) +"<br><br>"
  } else {
  html += "external flux Qext=" + BI.Qext.toFixed(6) + "<br><br>";
  }
  html += "configuration of elements around node: <br>";
  html += "<canvas id='plaatje'width='300' height='150' >";
  html += "</canvas>";
  html += "<script>";
  html += "let canvas = document.getElementById('plaatje');"
  html += "var ctx = canvas.getContext('2d');";
  html += drawtrianglefunction;
  let id =0;
  for (const t of BI.tr) {
    id++;
    html += "FEtriangle(" +
      Math.round(10 + (BI.Ax - minx) * factorx) + ',' +
      Math.round(140 - (BI.Ay - miny) * factory) + ',' +
      Math.round(10 + (t.Bx - minx) * factorx) + ',' +
      Math.round(140 - (t.By - miny) * factory) + ',' +
      Math.round(10 + (t.Cx - minx) * factorx) + ',' +
      Math.round(140 - (t.Cy - miny) * factory) + ',' +
      Math.round(10 + (t.midx - t.Qx / 2 * fQ - minx) * factorx) + ',' +
      Math.round(140 - (t.midy - t.Qy / 2 * fQ - miny) * factory) + ',' +
      Math.round(10 + (t.midx + t.Qx / 2 * fQ - minx) * factorx) + ',' +
      Math.round(140 - (t.midy + t.Qy / 2 * fQ - miny) * factory) + ',' + id + ');';
  }
  html += "   </sc" + "ript>";
  html += "<p>internal fluxes to inspected node:</p>"
  html += "<p>"
  html += "<table style='width:100%'>"
  html += "<tr>";
  html += "<th> triangle number </th>";
  html += "<th> Q to node</th>";
  html += "</tr>";
  id = 0;
  for (const t of BI.tr) {
    id++;
    html += "<tr><td>" + id + "</td><td>" + t.QA.toFixed(4) + "</td></tr>";
  }
  html += "</table>";
  html += "</p>"
  html += "   </sc" + "ript>";
  html += " </body>";
  let blob = new Blob([html], {
    type: 'text/html'
  });
  nodeiframe.src = URL.createObjectURL(blob);
}

function updatecellreport(content)
{
  let html = "";
  html += "<body>";
  html += content;
  html += "</body>"
  let blob = new Blob([html], {
    type: 'text/html'
  });
  celliframe.src = URL.createObjectURL(blob);
}

function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
//
// function shownodereport() {
//   var x = document.getElementById("nodereport");
//   x.style.display = "block";
// }
//
// function hidenodereport() {
//   var x = document.getElementById("nodereport");
//   x.style.display = "none";
// }
//
// function reportsetcontent(idname, content) {
//   var x = document.getElementById(idname);
//   x.innerHTML = content;
// }
//
// showreport("nodereport")
