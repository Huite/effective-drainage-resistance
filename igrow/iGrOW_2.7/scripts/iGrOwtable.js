var inputfieldisalreadytested = false;

var table;

const geoinputnames = [
  "iGrOw width (L/2)",
  "domain height",
  "drain width (B/2)",
  "drain bottom",
  "talud angle"
];

const physicsinputnames = [
  "drain level",
  "recharge *1000",
  "kxx",
  "kzz",
  "kxz",
  "c drain",
  "c seepage",
  "c base",
  "H base"
];

const numericinputnames = [
  "# hor under drain",
  "# hor right of drain",
  "# ver",
  "densification hor",
  "densification ver"
];

const solveinputnames = ["Cell width"];
const inputnames = [
  ...geoinputnames,
  ...physicsinputnames,
  ...numericinputnames,
  ...solveinputnames
];

const outputnames = [
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
  "Cell Q base",
  "iGrOw land  width"
];

var cur;
var curtable;

function startuptable() {
  cur = {
    "iGrOw width (L/2)": geo.domainwidth,
    "domain height": geo.domainheight,
    "drain width (B/2)": geo.drainwidth,
    "drain bottom": geo.drainbottom,
    "talud angle": geo.taludangle,
    "drain level": physics.drainlevel,
    "recharge *1000": physics.recharge * 1000,
    kxx: physics.kxx,
    kxz: physics.kxz,
    kzz: physics.kzz,
    "c drain": physics.cdrain,
    "c seepage": physics.cseepage,
    "c base": NaN,
    "H base": NaN,
    "# hor under drain": numerics.horleft,
    "# hor right of drain": numerics.horright,
    "# ver": numerics.ver,
    "densification hor": numerics.denshor,
    "densification ver": numerics.densver,
    "iGrOw land  width": geo.domainwidth-geo.drainwidth,
    H_min: NaN,
    H_max: NaN,
    Htop_mean: NaN,
    Hbottom_mean: NaN,
    "Gr Wet Per": NaN,
    "Ow Wet Per": NaN,
    "Ow Per": NaN,
    "Ow Wet Width": NaN,
    "Q tot drain": NaN,
    "Q tot recharge": NaN,
    "Q tot base": NaN,
    "Cell width": NaN,
    "Cell H_mean": NaN,
    "Cell Q recharge": NaN,
    "Cell Q lateral": NaN,
    "Cell c_fleak": NaN,
    "Cell Q base": NaN
  };
  if (geo.hasbaselayer) {
    cur.cbase = physics.cbase;
    cur.Hbase = physics.Hbase;
  }

  curtable = [
    {
      ...cur,
      ...{
        id: "",
        done: "active"
      }
    }
  ];

  const tablewidth = 90;

  table = new Tabulator("#reporttable", {
    height: 300,
    data: curtable,
    // reactiveData: true,
    groupBy: "done",
    headerSort: false,
    columns: [
      {
        title: "id",
        field: "id",
        width: tablewidth,
        sorter: "number"
      },
      {
        title: "H_min",
        field: "H_min",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "H_max",
        field: "H_max",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "Htop_mean",
        field: "Htop_mean",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "Hbottom_mean",
        field: "Hbottom_mean",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "Q tot drain",
        field: "Q tot drain",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "Q tot recharge",
        field: "Q tot recharge",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "Q tot base",
        field: "Q tot base",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "Gr Wet Per",
        field: "Gr Wet Per",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "Ow Wet Per",
        field: "Ow Wet Per",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "Ow Per",
        field: "Ow Per",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "Ow Wet Width",
        field: "Ow Wet Width",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "Cell width",
        field: "Cell width",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "Cell H_mean",
        field: "Cell H_mean",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "Cell Q recharge",
        field: "Cell Q recharge",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "Cell Q lateral",
        field: "Cell Q lateral",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "Cell c_fleak",
        field: "Cell c_fleak",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "Cell Q base",
        field: "Cell Q base",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "iGrOw land  width",
        field: "iGrOw land  width",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "iGrOw width (L/2)",
        field: "iGrOw width (L/2)",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "domain height",
        field: "domain height",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "drain width (B/2)",
        field: "drain width (B/2)",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "drain bottom",
        field: "drain bottom",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "talud angle",
        field: "talud angle",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "drain level",
        field: "drain level",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "recharge *1000",
        field: "recharge *1000",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "kxx",
        field: "kxx",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "kzz",
        field: "kzz",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "kxz",
        field: "kxz",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "c drain",
        field: "c drain",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "c seepage",
        field: "c seepage",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "c base",
        field: "c base",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "H base",
        field: "H base",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "# hor under drain",
        field: "# hor under drain",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "# hor right of drain",
        field: "# hor right of drain",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "# ver",
        field: "# ver",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "densification hor",
        field: "densification hor",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      },
      {
        title: "densification ver",
        field: "densification ver",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: true
      }
    ],
    rowClick: function(e, id, data, row) {
      var rowid = id._row.data.id;
      var rownum = table.rowManager.activeRowsCount - rowid - 1;
      if (rowid == 0) {
        choice = confirm("archive active row?");
        if (choice) {
          doarchiveactiverow();
        }
      } else {
        choice = confirm("make row " + rowid + " active?");
        if (choice) {
          let d = table.rowManager.activeRows[rownum].data;
          for (n of geoinputnames) {
            geomenu.setValue(n, d[n]);
          }
          for (n of physicsinputnames) {
            physicsmenu.setValue(n, d[n]);
          }
          if (!isNaN(physics.Hbase) & !isNaN(physics.cbase)) {
            geomenu.setValue("add base layer", true);
          } else {
            geomenu.setValue("add base layer", false);
          }
          for (n of numericinputnames) {
            numericmenu.setValue(n, d[n]);
          }
          for (n of solveinputnames) {
            solutionmenu.setValue(n, d[n]);
          }
          runmodel();
        }
      }
    }
  });
}

function doarchiveactiverow() {
  let D = table.getData();
  let r = D[D.length - 1];
  let o = { id: table.rowManager.activeRowsCount, done: "archived" };
  for (n of inputnames) {
    o[n] = r[n];
  }
  for (n of outputnames) {
    o[n] = r[n];
  }
  table.addData([o], true);
}

function readcsvFile(input) {
  window.scrollBy(0, 2 * StageHeight);
  document.body.style.cursor = "wait";
  let file = input.files[0];
  let reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function() {
    dataread = reader.result;
    datalines = dataread.split(/\r?\n/);
    let g_ind = {};
    let p_ind = {};
    let n_ind = {};
    let s_ind = {};
    let hasindices = false;
    let needstorun = false;
    for (l of datalines) {
      if (l.length > 0) {
        if (l.charAt(0) != "#") {
          fields = l.split(",");
          if (!hasindices) {
            for (n of geoinputnames) {
              g_ind[n] = fields.indexOf(n);
              if (g_ind[n] < 0) {
                alert("column " + n + " not found!");
              }
            }
            for (n of physicsinputnames) {
              p_ind[n] = fields.indexOf(n);
              if (p_ind[n] < 0) {
                alert("column " + n + " not found!");
              }
            }
            for (n of numericinputnames) {
              n_ind[n] = fields.indexOf(n);
              if (n_ind[n] < 0) {
                alert("column " + n + " not found!");
              }
            }
            for (n of solveinputnames) {
              s_ind[n] = fields.indexOf(n);
              if (s_ind[n] < 0) {
                alert("column " + n + " not found!");
              }
            }
            hasindices = true;
          } else {
            let values = {};
            for (n of geoinputnames) {
              values[n] = parseFloat(fields[g_ind[n]]);
            }
            for (n of physicsinputnames) {
              values[n] = parseFloat(fields[p_ind[n]]);
            }
            for (n of numericinputnames) {
              values[n] = parseFloat(fields[n_ind[n]]);
            }
            for (n of solveinputnames) {
              values[n] = parseFloat(fields[s_ind[n]]);
            }
            let isok =
              values["iGrOw width (L/2)"] > values["drain width (B/2)"]&&
              values["domain height"] > values["drain level"] &&
              values["domain height"] > values["drain bottom"] &&
              values["drain level"] > values["drain bottom"] &&
              values["c seepage"] <= values["c drain"];
            if (!isok) {
              alert("input line: " + l + " is inconsistent");
            } else {
              inputfieldisalreadytested = true;
              for (n of geoinputnames) {
                geomenu.setValue(n, values[n]);
              }
              for (n of physicsinputnames) {
                physicsmenu.setValue(n, values[n]);
              }
              if (!isNaN(physics.Hbase) & !isNaN(physics.cbase)) {
                geomenu.setValue("add base layer", true);
              } else {
                geomenu.setValue("add base layer", false);
              }
              for (n of numericinputnames) {
                numericmenu.setValue(n, values[n]);
              }
              for (n of solveinputnames) {
                solutionmenu.setValue(n, values[n]);
              }
              inputfieldisalreadytested = false;
              needstorun = true;
            }
          }
          if(needstorun)
          {
            runmodel();
            doarchiveactiverow();
          }
        }
      }
    }
  };
  reader.onloadend = function() {
    document.body.style.cursor = "default";
  };
  reader.onerror = function() {
    console.log(reader.error);
  };
}
