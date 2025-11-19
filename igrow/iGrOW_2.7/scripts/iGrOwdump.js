function jsondump() {
  let blobparts = ["{\n"];
  blobparts.push('  \"parameters\":{\n');
  blobparts.push('    \"geo\":{\n');
  blobparts.push('        \"domainwidth\":' + geo.domainwidth + ',\n');
  blobparts.push('        \"domainheight\":' + geo.domainheight + ',\n');
  blobparts.push('        \"drainwidth\":' + geo.drainwidth + ',\n');
  blobparts.push('        \"drainbottom\":' + geo.drainbottom + ',\n');
  blobparts.push('        \"taludangle\":' + geo.taludangle + ',\n');
  if (isNaN(geo.CELLwidth)) {
    blobparts.push('        \"CELLwidth\":"NaN",\n');
  } else {
    blobparts.push('        \"CELLwidth\":' + geo.CELLwidth + ',\n');
  }
  if (geo.hasbaselayer) {
    blobparts.push('        \"hasebaselayer":\"true\"\n');
  } else {
    blobparts.push('        \"hasebaselayer":\"false\"\n');
  }
  blobparts.push('     },\n');
  blobparts.push('    \"hydro\":{\n');
  blobparts.push('        \"drainlevel\":' + physics.drainlevel + ',\n');
  blobparts.push('        \"recharge\":' + physics.recharge + ',\n');
  blobparts.push('        \"kxx\":' + physics.kxx + ',\n');
  blobparts.push('        \"kxz\":' + physics.kxz + ',\n');
  blobparts.push('        \"kzz\":' + physics.kzz + ',\n');
  blobparts.push('        \"cdrain\":' + physics.cdrain + ',\n');
  blobparts.push('        \"cseepage\":' + physics.cseepage + ',\n');
  blobparts.push('        \"cbase\":' + physics.cbase + ',\n');
  blobparts.push('        \"Hbase\":' + physics.Hbase + '\n');
  blobparts.push('     },\n');
  blobparts.push('    \"numerics\":{\n');
  blobparts.push('        \"horleft\":' + numerics.horleft + ',\n');
  blobparts.push('        \"horright\":' + numerics.horright + ',\n');
  blobparts.push('        \"ver\":' + numerics.ver + ',\n');
  blobparts.push('        \"denshor\":' + numerics.denshor + ',\n');
  blobparts.push('        \"densver\":' + numerics.densver + '\n');
  blobparts.push('     },\n');
  blobparts.push('    \"convergence\":{\n');
  blobparts.push('        \"omega\":' + convergence.omega + ',\n');
  blobparts.push('        \"theta\":' + convergence.theta + ',\n');
  blobparts.push('        \"maxiter1\":' + convergence.maxiter1 + ',\n');
  blobparts.push('        \"maxiter2\":' + convergence.maxiter2 + ',\n');
  blobparts.push('        \"maxHchange\":' + convergence.maxHchange + ',\n');
  blobparts.push('        \"maxQchange\":' + convergence.maxQchange + ',\n');

  if (convergence.logmaxchange) {
    blobparts.push('        \"logmaxchange\":\"true\"\n');
  } else {
    blobparts.push('        \"logmaxchange\":\"false\"\n');
  }
  blobparts.push('     }\n');
  blobparts.push('  },\n');
  blobparts.push('  \"discretisation\":{\n');
  if (discretisation.numnodes === null) {
    blobparts.push('    \"numnodes\":\"null\",\n');
  } else {
    blobparts.push('    \"numnodes\":' + discretisation.numnodes + ',\n');
  }
  if (discretisation.numhornodes === null) {
    blobparts.push('    \"numhornodes\":\"null\",\n');
  } else {
    blobparts.push('    \"numhornodes\":' + discretisation.numhornodes + ',\n');
  }
  if (discretisation.numvernodes === null) {
    blobparts.push('    \"numvernodes\":\"null\",\n');
  } else {
    blobparts.push('    \"numvernodes\":' + discretisation.numvernodes + ',\n');
  }
  blobparts.push('    \"XYnodes\": [');
  let Nm = discretisation.XYnodes.length;
  if (Nm > 0) {
    blobparts.push('\n');
    for (let i = 0; i < Nm - 2; i += 2) {
      blobparts.push('        ' + discretisation.XYnodes[i] + "," + discretisation.XYnodes[i + 1] + ",\n");
    }
    blobparts.push('        ' + discretisation.XYnodes[Nm - 2] + "," + discretisation.XYnodes[Nm - 1] + "],\n");
  } else {
    blobparts.push("],\n");
  }
  blobparts.push('    \"DULRcells\": [');
  Nm = discretisation.DULRcells.length;
  if (Nm > 0) {
    blobparts.push('\n');
    for (let i = 0; i < Nm - 1; i++) {
      blobparts.push('        [' + discretisation.DULRcells[i][0] + ",");
      blobparts.push(discretisation.DULRcells[i][1] + ",");
      blobparts.push(discretisation.DULRcells[i][2] + ",");
      blobparts.push(discretisation.DULRcells[i][3] + "],\n");
    }
    blobparts.push('        [' + discretisation.DULRcells[Nm - 1][0] + ",");
    blobparts.push(discretisation.DULRcells[Nm - 1][1] + ",");
    blobparts.push(discretisation.DULRcells[Nm - 1][2] + ",");
    blobparts.push(discretisation.DULRcells[Nm - 1][3] + "]\n");
    blobparts.push("      ],\n");
  } else {
    blobparts.push("],\n");
  }
  blobparts.push('    \"topnodes\": [\n        ');
  Nm = discretisation.topnodes.length;
  if (Nm > 0) {
    for (let i = 0; i < Nm - 1; i++) {
      blobparts.push(discretisation.topnodes[i] + ",");
      if ((i > 0) & (i % 10 == 0)) {
        blobparts.push("\n        ");
      }
    }
    blobparts.push(discretisation.topnodes[Nm - 1] + "],\n");
  } else {
    blobparts.push("],\n");
  }
  blobparts.push('    \"bottomnodes\": [\n        ');
  Nm = discretisation.bottomnodes.length;
  if (Nm > 0) {
    for (let i = 0; i < Nm - 1; i++) {
      blobparts.push(discretisation.bottomnodes[i] + ",");
      if ((i > 0) & (i % 10 == 0)) {
        blobparts.push("\n        ");
      }
    }
    blobparts.push(discretisation.bottomnodes[Nm - 1] + "],\n");
  } else {
    blobparts.push("],\n");
  }
  blobparts.push('    \"itopnodes\": [\n        ');
  Nm = discretisation.itopnode.length;
  if (Nm > 0) {
    for (let i = 0; i < Nm - 1; i++) {
      blobparts.push(discretisation.itopnode[i] + ",");
      if ((i > 0) & (i % 10 == 0)) {
        blobparts.push("\n        ");
      }
    }
    blobparts.push(discretisation.itopnode[Nm - 1] + "],\n");
  } else {
    blobparts.push("],\n");
  }
  blobparts.push('    \"iN\": [\n        ');
  Nm = discretisation.iN.length;
  if (Nm > 0) {
    for (let i = 0; i < Nm - 1; i++) {
      blobparts.push(discretisation.iN[i] + ",");
      if ((i > 0) & (i % 10 == 0)) {
        blobparts.push("\n        ");
      }
    }
    blobparts.push(discretisation.iN[Nm - 1] + "],\n");
  } else {
    blobparts.push("],\n");
  }
  blobparts.push('    \"iNE\": [\n        ');
  Nm = discretisation.iNE.length;
  if (Nm > 0) {
    for (let i = 0; i < Nm - 1; i++) {
      blobparts.push(discretisation.iNE[i] + ",");
      if ((i > 0) & (i % 10 == 0)) {
        blobparts.push("\n        ");
      }
    }
    blobparts.push(discretisation.iNE[Nm - 1] + "],\n");
  } else {
    blobparts.push("],\n");
  }
  blobparts.push('    \"iE\": [\n        ');
  Nm = discretisation.iE.length;
  if (Nm > 0) {
    for (let i = 0; i < Nm - 1; i++) {
      blobparts.push(discretisation.iE[i] + ",");
      if ((i > 0) & (i % 10 == 0)) {
        blobparts.push("\n        ");
      }
    }
    blobparts.push(discretisation.iE[Nm - 1] + "],\n");
  } else {
    blobparts.push("],\n");
  }
  blobparts.push('    \"iSE\": [\n        ');
  Nm = discretisation.iSE.length;
  if (Nm > 0) {
    for (let i = 0; i < Nm - 1; i++) {
      blobparts.push(discretisation.iSE[i] + ",");
      if ((i > 0) & (i % 10 == 0)) {
        blobparts.push("\n        ");
      }
    }
    blobparts.push(discretisation.iSE[Nm - 1] + "],\n");
  } else {
    blobparts.push("],\n");
  }
  blobparts.push('    \"iS\": [\n        ');
  Nm = discretisation.iS.length;
  if (Nm > 0) {
    for (let i = 0; i < Nm - 1; i++) {
      blobparts.push(discretisation.iS[i] + ",");
      if ((i > 0) & (i % 10 == 0)) {
        blobparts.push("\n        ");
      }
    }
    blobparts.push(discretisation.iS[Nm - 1] + "],\n");
  } else {
    blobparts.push("],\n");
  }
  blobparts.push('    \"iSW\": [\n        ');
  Nm = discretisation.iSW.length;
  if (Nm > 0) {
    for (let i = 0; i < Nm - 1; i++) {
      blobparts.push(discretisation.iSW[i] + ",");
      if ((i > 0) & (i % 10 == 0)) {
        blobparts.push("\n        ");
      }
    }
    blobparts.push(discretisation.iSW[Nm - 1] + "],\n");
  } else {
    blobparts.push("],\n");
  }
  blobparts.push('    \"iW\": [\n        ');
  Nm = discretisation.iW.length;
  if (Nm > 0) {
    for (let i = 0; i < Nm - 1; i++) {
      blobparts.push(discretisation.iW[i] + ",");
      if ((i > 0) & (i % 10 == 0)) {
        blobparts.push("\n        ");
      }
    }
    blobparts.push(discretisation.iW[Nm - 1] + "],\n");
  } else {
    blobparts.push("],\n");
  }
  blobparts.push('    \"iNW\": [\n        ');
  Nm = discretisation.iNW.length;
  if (Nm > 0) {
    for (let i = 0; i < Nm - 1; i++) {
      blobparts.push(discretisation.iNW[i] + ",");
      if ((i > 0) & (i % 10 == 0)) {
        blobparts.push("\n        ");
      }
    }
    blobparts.push(discretisation.iNW[Nm - 1] + "]\n");
  } else {
    blobparts.push("]\n");
  }
  blobparts.push('  },\n');
  blobparts.push('  \"statebalance\":[\n');
  Nm = discretisation.numnodes;
  if ((Nm > 0) & (state.H[0] !== undefined)) {
    let Q = 0;
    let H = 0;
    for (let i = 0; i < Nm - 1; i++) {
      H = state.H[i];
      blobparts.push('    {\"H\":' + H);
      Q = eqs.QN[i] * (state.H[discretisation.iN[i]] - H);
      blobparts.push(',\"QN":', Q);
      Q = eqs.QNE[i] * (state.H[discretisation.iNE[i]] - H);
      blobparts.push(',\"QNE":', Q);
      Q = eqs.QE[i] * (state.H[discretisation.iE[i]] - H);
      blobparts.push(',\"QE":', Q);
      Q = eqs.QSE[i] * (state.H[discretisation.iSE[i]] - H);
      blobparts.push(',\"QSE":', Q);
      Q = eqs.QS[i] * (state.H[discretisation.iS[i]] - H);
      blobparts.push(',\"QS":', Q);
      Q = eqs.QSW[i] * (state.H[discretisation.iSW[i]] - H);
      blobparts.push(',\"QSW":', Q);
      Q = eqs.QW[i] * (state.H[discretisation.iW[i]] - H);
      blobparts.push(',\"QW":', Q);
      Q = eqs.QNW[i] * (state.H[discretisation.iNW[i]] - H);
      blobparts.push(',\"QNW":', Q);
      Q = eqs.QX[i] + eqs.QXc[i]*H;
      blobparts.push(',\"Qexternal":', Q);
      blobparts.push('},\n');
    }
    H = state.H[Nm - 1];
    blobparts.push('    {\"H\":' + H);
    Q = eqs.QN[Nm - 1] * (state.H[discretisation.iN[Nm - 1]] - H);
    blobparts.push(',\"QN":', Q);
    Q = eqs.QNE[Nm - 1] * (state.H[discretisation.iNE[Nm - 1]] - H);
    blobparts.push(',\"QNE":', Q);
    Q = eqs.QE[Nm - 1] * (state.H[discretisation.iE[Nm - 1]] - H);
    blobparts.push(',\"QE":', Q);
    Q = eqs.QSE[Nm - 1] * (state.H[discretisation.iSE[Nm - 1]] - H);
    blobparts.push(',\"QSE":', Q);
    Q = eqs.QS[Nm - 1] * (state.H[discretisation.iS[Nm - 1]] - H);
    blobparts.push(',\"QS":', Q);
    Q = eqs.QSW[Nm - 1] * (state.H[discretisation.iSW[Nm - 1]] - H);
    blobparts.push(',\"QSW":', Q);
    Q = eqs.QW[Nm - 1] * (state.H[discretisation.iW[Nm - 1]] - H);
    blobparts.push(',\"QW":', Q);
    Q = eqs.QNW[Nm - 1] * (state.H[discretisation.iNW[Nm - 1]] - H);
    blobparts.push(',\"QNW":', Q);
    Q = eqs.QX[Nm-1] + eqs.QXc[Nm-1]*H;
    blobparts.push(',\"Qexternal":', Q);
    blobparts.push('}\n');
    blobparts.push('  ],\n');
  }
  blobparts.push('  \"statistics\":\{\n');
  statnames = [
    "H_min",
    "H_max",
    "Htop_mean",
    "Hbottom_mean",
    "Q tot drain",
    "Q tot recharge",
    "Q tot base",
    "Gr Wet Per",
    "Ow Wet Per",
    "Ow Per",
    "Ow Wet Width",
    "Cell H_mean",
    "Cell Q recharge",
    "Cell Q lateral",
    "Cell c_fleak",
    "Cell Q base"
  ];
  let v = 0;
  let n = "";
  for (n of statnames) {
    v = curtable[0][n];
    blobparts.push('      \"' + n + '\":');
    if (isNaN(v)) {
      blobparts.push('\"NaN\",\n');
    } else {
      blobparts.push(v + ',\n');
    }
  }
  n = "iGrOw land  width";
  v = curtable[0][n];
  blobparts.push('        \"' + n + '\":');
  if (isNaN(v)) {
    blobparts.push('\"NaN\",\n');
  } else {
    blobparts.push(v + '\n');
  }
  blobparts.push('  }\n');
  blobparts.push('}\n');
  var blob = new Blob(blobparts, {
    type: "text/plain;charset=utf-8"
  });
  saveAs(blob, "iGrOwdump.json");
}
