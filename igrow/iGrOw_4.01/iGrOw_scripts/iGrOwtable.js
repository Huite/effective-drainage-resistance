var table;
let tablestart = {
  "cross section form": modelchoices.crosssection,
  "model bottom": modelchoices.modelbottom,
  "riparian connection": modelchoices.riparianconnection,
  "c(drainage-seepage) values": modelchoices.cvaluesinterpolated,
  "catchment form": modelchoices.catchment,
  "iGrOw width (L/2)": geo.domainwidth,
  "domain height": geo.domainheight,
  "drain width (B/2)": geo.drainwidth,
  "drain bottom": geo.drainbottom,
  "top talud angle": geo.taludangle,
  "trap talud 1 over": NaN,
  "catchment curvature": geo.curvature,
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
  "# verleft": numerics.verleft,
  "# verright": numerics.verright,
  "# dens factor": numerics.densfactor,
  "CELL width": geo.CELLwidth,
  comment: "",
  "iGrOw land width": geo.domainwidth - geo.drainwidth,
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
  "Q seepage face": NaN,
  "CELL H_mean": NaN,
  "CELL Q recharge": NaN,
  "CELL Q lateral": NaN,
  "CELL c_fleak": NaN,
  "CELL Q base": NaN,
};
if (modelchoices.modelbottom == "open") {
  tablestart["c base"] = physics.cbase;
  tablestart["H base"] = physics.Hbase;
} else {
  tablestart["c base"] = NaN;
  tablestart["H base"] = NaN;
}
if (modelchoices.crosssection == "smooth") {
  tablestart["top talud angle"] = geo.taludangle;
  tablestart["trap talud 1 over"] = NaN;
} else {
  tablestart["top talud angle"] = NaN;
  tablestart["trap talud 1 over"] = geo.traptalud;
}
let commentname = Object.getOwnPropertyNames(tablestart).slice(27, 28);
// console.log("commentname",commentname)
let inputnames = Object.getOwnPropertyNames(tablestart).slice(0, 27);
// console.log("inputnames",inputnames)
let outputnames = Object.getOwnPropertyNames(tablestart).slice(28, 46);
// console.log("outputnames",outputnames)
let choiceinputnames = Object.getOwnPropertyNames(tablestart).slice(0, 5);
// console.log("choiceinpuntnames",choiceinputnames)
let geoinputnames = Object.getOwnPropertyNames(tablestart).slice(5, 12);
// console.log("geoinputnames",geoinputnames)
let physicsinputnames = Object.getOwnPropertyNames(tablestart).slice(12, 21);
// console.log("physicsinpuntames",physicsinputnames)
let numericinputnames = Object.getOwnPropertyNames(tablestart).slice(21, 26);
// console.log("numericinputnames",numericinputnames)
let solutioninputnames = Object.getOwnPropertyNames(tablestart).slice(26, 27);
// console.log("solutioninputnames",solutioninputnames)

var tabledata;

function startuptable() {
  tabledata = [
    {
      ...tablestart,
      ...{
        id: "",
        done: "active",
      },
    },
  ];

  let rowMenu = [
    {
      label: "Edit comment",
      action: function (e, row) {
        let newcomment = prompt(
          "Please give new name for row " + row.getData()["id"],
          row.getData()["comment"]
        );
        row.update({ comment: newcomment });
      },
    },
    {
      label: "Active <-> archive",
      action: function (e, row) {
        let rowid = row.getData()["id"];
        if (rowid == "") {
          let choice = confirm("archive row " + rowid + "?");
          if (choice) {
            let o = { id: tabledata.length, done: "archived" };
            for (let n of inputnames) {
              o[n] = tabledata[0][n];
            }
            for (let n of outputnames) {
              o[n] = tabledata[0][n];
            }
            o["comment"] = tabledata[0]["comment"];
            tabledata.splice(1, 0, o);
            table.setSort("id", "asc");
          }
        } else {
          let choice = confirm("make row " + rowid + " active?");
          if (choice) {
            let tid = tabledata.length - rowid;
            for (let n of inputnames) {
              tabledata[0][n] = tabledata[tid][n];
            }
            tabledata[0]["comment"] = tabledata[tid]["comment"];
            menuset.control = false;
            menuset.action = false;
            for (let n of choiceinputnames) {
              modelmenusetChoice(n, tabledata[0][n]);
            }
            for (n of geoinputnames) {
              geomenu.setValue(n, tabledata[0][n]);
            }
            for (let n of physicsinputnames) {
              // console.log("physics setting",n,tabledata[0][n])
              physicsmenu.setValue(n, tabledata[0][n]);
            }
            for (let n of numericinputnames) {
              // console.log("numeric setting", n, tabledata[0][n]);
              numericmenu.setValue(n, tabledata[0][n]);
            }

            for (let n of solutioninputnames) {
              solutionmenu.setValue(n, tabledata[0][n]);
            }
            menuset.control = true;
            menuset.action = true;
            runmodel();
          }
        }
      },
    },
    {
      label: "Exit menu",
      action: function (e, row) {},
    },
  ];

  const tablewidth = 90;

  table = new Tabulator("#reporttable", {
    height: 250,
    data: tabledata,
    reactiveData: true,
    rowContextMenu: rowMenu,
    groupBy: "done",
    movableColumns: true,
    columns: [
      {
        title: "id",
        field: "id",
        width: tablewidth,
        sorter: "number",
      },
      {
        title: "H min",
        field: "H_min",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "H max",
        field: "H_max",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "H top  mean",
        titleFormatter: "textarea",
        field: "Htop_mean",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "H_bottom mean",
        titleFormatter: "textarea",
        field: "Hbottom_mean",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "Q tot drain",
        titleFormatter: "textarea",
        field: "Q tot drain",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "Q tot recharge",
        titleFormatter: "textarea",
        field: "Q tot recharge",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "Q tot base",
        titleFormatter: "textarea",
        field: "Q tot base",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "Q seepage face",
        titleFormatter: "textarea",
        field: "Q seepage face",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "Gr Wet Per",
        titleFormatter: "textarea",
        field: "Gr Wet Per",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "Ow Wet Per",
        titleFormatter: "textarea",
        field: "Ow Wet Per",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "Ow Per",
        titleFormatter: "textarea",
        field: "Ow Per",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "Ow Wet Width",
        titleFormatter: "textarea",
        field: "Ow Wet Width",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "CELL width",
        titleFormatter: "textarea",
        field: "CELL width",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "CELL H_mean",
        titleFormatter: "textarea",
        field: "CELL H_mean",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "CELL Q recharge",
        titleFormatter: "textarea",
        field: "CELL Q recharge",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "CELL Q lateral",
        titleFormatter: "textarea",
        field: "CELL Q lateral",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "CELL c_fleak",
        titleFormatter: "textarea",
        field: "CELL c_fleak",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "CELL Q base",
        titleFormatter: "textarea",
        field: "CELL Q base",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "cross section form",
        titleFormatter: "textarea",
        field: "cross section form",
        width: tablewidth,
        sorter: "string",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "model bottom",
        titleFormatter: "textarea",
        field: "model bottom",
        width: tablewidth,
        sorter: "string",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "riparian connection",
        titleFormatter: "textarea",
        field: "riparian connection",
        width: tablewidth + 20,
        sorter: "string",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "c(drainage-seepage) values",
        titleFormatter: "textarea",
        field: "c(drainage-seepage) values",
        width: tablewidth + 20,
        sorter: "string",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "catchment form",
        titleFormatter: "textarea",
        field: "catchment form",
        width: tablewidth,
        sorter: "string",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "iGrOw width (L/2)",
        titleFormatter: "textarea",
        field: "iGrOw width (L/2)",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "iGrOw land width",
        titleFormatter: "textarea",
        field: "iGrOw land width",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "domain height",
        titleFormatter: "textarea",
        field: "domain height",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "drain width (B/2)",
        titleFormatter: "textarea",
        field: "drain width (B/2)",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "drain bottom",
        titleFormatter: "textarea",
        field: "drain bottom",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "top talud angle",
        titleFormatter: "textarea",
        field: "top talud angle",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "trap talud 1 over",
        titleFormatter: "textarea",
        field: "trap talud 1 over",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "catchment curvature",
        titleFormatter: "textarea",
        field: "catchment curvature",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "drain level",
        titleFormatter: "textarea",
        field: "drain level",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "recharge *1000",
        titleFormatter: "textarea",
        field: "recharge *1000",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "kxx",
        field: "kxx",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "kzz",
        field: "kzz",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "kxz",
        field: "kxz",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "c drain",
        titleFormatter: "textarea",
        field: "c drain",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "c seepage",
        titleFormatter: "textarea",
        field: "c seepage",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "c base",
        titleFormatter: "textarea",
        field: "c base",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "H base",
        titleFormatter: "textarea",
        field: "H base",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "# hor under  drain",
        titleFormatter: "textarea",
        field: "# hor under drain",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "# hor right of drain",
        titleFormatter: "textarea",
        field: "# hor right of drain",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "# verleft",
        titleFormatter: "textarea",
        field: "# verleft",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "# verright",
        titleFormatter: "textarea",
        field: "# verright",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "# dens factor",
        titleFormatter: "textarea",
        field: "# dens factor",
        width: tablewidth,
        sorter: "number",
        hozAlign: "right",
        headerVertical: false,
      },
      {
        title: "comment",
        titleFormatter: "textarea",
        field: "comment",
        hozAlign: "left",
        width: 150,
        headerVertical: false,
      },
    ],
  });
}
function doarchiveactiverow() {
  let o = { id: tabledata.length, done: "archived" };
  for (n of inputnames) {
    o[n] = tabledata[0][n];
  }
  for (n of outputnames) {
    o[n] = tabledata[0][n];
  }
  o["comment"] = tabledata[0]["comment"];
  tabledata.splice(1, 0, o);
  table.setSort("id", "asc");
}

function readcsvFile(input) {
  interactiveuse = false;
  // window.scrollBy(0, 2 * StageHeight);
  document.body.style.cursor = "wait";
  let file = input.files[0];
  // console.log("in readcsv")
  // console.log(file);
  let reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function () {
    // console.log("in onload")
    let dataread = reader.result;
    let datalines = dataread.split(/\r?\n/);
    // console.log("data lines:");
    // console.log(datalines);
    let m_ind = {};
    let g_ind = {};
    let p_ind = {};
    let n_ind = {};
    let c_ind = {};
    let hasnameindices = false;
    let needstorun = false;
    let linecount = 0;
    for (l of datalines) {
      // console.log("----------------------");
      console.log("doing csv line:", ++linecount);
      // console.log(l);

      if (l.length > 0 && l.charAt(0) != "#" && l.charAt(0) != ",") {
        // console.log("line ok")
        // console.log("----------")
        fields = l.split(",");
        // console.log("fields");
        // console.log(fields);
        if (!hasnameindices) {
          for (n of choiceinputnames) {
            m_ind[n] = fields.indexOf(n);
          }
          for (n of geoinputnames) {
            g_ind[n] = fields.indexOf(n);
          }
          for (n of physicsinputnames) {
            p_ind[n] = fields.indexOf(n);
          }
          for (n of numericinputnames) {
            n_ind[n] = fields.indexOf(n);
          }
          for (n of solutioninputnames) {
            n_ind[n] = fields.indexOf(n);
          }
          c_ind = fields.indexOf(commentname[0]);
          // console.log("m")
          // console.log(m_ind)
          // console.log("g")
          // console.log(g_ind)
          // console.log("p")
          // console.log(p_ind)
          // console.log("n")
          // console.log(n_ind)
          // console.log("c")
          // console.log(c_ind)
          hasnameindices = true;
        } else {
          // console.log("fields read:");
          // console.log(JSON.stringify(fields));
          // console.log("--------------------");
          // column names have been read
          values = {};
          // first choiceinputs
          n = "cross section form";
          if (m_ind[n] >= 0) {
            let f = fields[m_ind[n]].charAt(0);
            // console.log(n, f);
            if (f == "s") {
              values[n] = "smooth";
            } else if (f == "t") {
              values[n] = "trapezoidal";
            }
          }
          n = "model bottom";
          if (m_ind[n] >= 0) {
            let f = fields[m_ind[n]].charAt(0);
            // console.log(n, f);
            if (f == "c") {
              values[n] = "closed";
            } else if (f == "o") {
              values[n] = "open";
            }
          }
          n = "riparian connection";
          if (m_ind[n] >= 0) {
            let f = fields[m_ind[n]].charAt(0);
            // console.log("rip con", n, f);
            if (f == "i") {
              values[n] = "impermeable";
            } else if (f == "s") {
              values[n] = "seepage face";
            } else if (f == "d") {
              values[n] = "dirichlet";
            }
          }
          n = "c(drainage-seepage) values";
          if (m_ind[n] >= 0) {
            let f = fields[m_ind[n]].charAt(0);
            // console.log(n, f);
            if (f == "n") {
              values[n] = "non-interpolated";
            } else if (f == "h") {
              values[n] = "height interpolated";
            }
          }
          n = "catchment form";
          if (m_ind[n] >= 0) {
            let f = fields[m_ind[n]].charAt(0);
            // console.log(n, f);
            if (f == "n") {
              values[p] = "parallel";
            } else if (f == "d") {
              values[n] = "divergent";
            } else if (f == "c") {
              values[n] = "convergent";
            }
          }
          for (n of geoinputnames) {
            if (g_ind[n] >= 0) {
              values[n] = parseFloat(fields[g_ind[n]]);
            }
          }
          for (n of physicsinputnames) {
            if (p_ind[n] >= 0) {
              values[n] = parseFloat(fields[p_ind[n]]);
            }
          }
          for (n of numericinputnames) {
            if (n_ind[n] >= 0) {
              // console.log("num set", n, fields[n_ind[n]]);
              values[n] = parseFloat(fields[n_ind[n]]);
            }
          }
          for (n of solutioninputnames) {
            if (n_ind[n] >= 0) {
              values[n] = parseFloat(fields[n_ind[n]]);
            }
          }
          values[commentname] = fields[c_ind];

          // set the values read

          for (n of choiceinputnames) {
            // console.log("model set ",n,values[n])
            modelmenusetChoice(n, values[n]);
          }

          for (n of geoinputnames) {
            // console.log("geo",n,values[n]);
            geomenu.setValue(n, values[n]);
          }

          for (n of physicsinputnames) {
            physicsmenu.setValue(n, values[n]);
          }

          for (n of numericinputnames) {
            // console.log("num", n, values[n]);
            numericmenu.setValue(n, values[n]);
          }

          for (n of solutioninputnames) {
            if (isNaN(values[n])) {
              solutionmenu.setValue("add CELL analysis", false);
            } else {
              solutionmenu.setValue(n, values[n]);
            }
          }

          // do controls
          if (!control_discr_params()) {
            tabledata[0]["comment"] = "not run because of bad parameters";
            return;
          }
          if (!control_run_params()) {
            tabledata[0]["comment"] = "not run because of bad parameters";
            return;
          }
          if(!isNaN(values["CELL width"]))
          {
            if (!control_CELL_params()) {
              tabledata[0]["comment"] = "not run because of bad parameters";
              return;
            }
          }
          runmodel();
          doarchiveactiverow();
        }
      }
    }
    interactiveuse = true;
  };

  reader.onloadend = function () {
    document.body.style.cursor = "default";
    console.log("all done");
  };
  reader.onerror = function () {
    console.log(reader.error);
  };
}
