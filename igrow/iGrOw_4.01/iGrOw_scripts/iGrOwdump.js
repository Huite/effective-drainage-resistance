function jsondump() {
  let content = "{";
  content += '"parameters":{';
  content += '"modelchoices":' + JSON.stringify(modelchoices);
  content += ',"geo":' + JSON.stringify(geo);
  content += ',"physics":' + JSON.stringify(physics);
  content += ',"numerics":' + JSON.stringify(numerics);
  content += ',"convergence":' + JSON.stringify(numerics);
  content += "}";
  content += ',"XYdomain":' + JSON.stringify(XYdomain);
  content += ',"XYwater":' + JSON.stringify(XYwater);
  content += ',"discretization":' + JSON.stringify(discretization);
  content += ',"solution":{';
  content += '"H":' + JSON.stringify(state.H);
  if (discretization.done) {
    let Qintern = [];
    for (const t of discretization.elements) {
      let Ax = discretization.nodes[2 * t[0]];
      let Ay = discretization.nodes[2 * t[0] + 1];
      let HA = state.H[t[0]];
      let Bx = discretization.nodes[2 * t[1]];
      let By = discretization.nodes[2 * t[1] + 1];
      let HB = state.H[t[1]];
      let Cx = discretization.nodes[2 * t[2]];
      let Cy = discretization.nodes[2 * t[2] + 1];
      let HC = state.H[t[2]];
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
      Qintern.push(Qs);
    }
    content += ',"Qintern":' + JSON.stringify(Qintern);
    let Qextern = [];
    for (let i = 0; i < discretization.Numnodes; i++) {
      Qextern.push(eqs.QX[i] + eqs.QXc[i] * state.H[i]);
    }
    content += ',"Qextern":' + JSON.stringify(Qextern);
    let statoutput = {};
    for (n of outputnames) {
      statoutput[n] = tabledata[0][n];
    }
    content += ',"statistics":' + JSON.stringify(statoutput);
  }

  content += "}";
  content += "}"; //end content
  let blob = new Blob([content], { type: "text/plain" });
  saveAs(blob, "iGrOwdump.json");
}
