class waitforenterkey {
  constructor() {
    this.waitarray = [];
    this.numwaits = 0;
    this.doifany = null;
    document.addEventListener("keydown", this.keydownHandler.bind(this), false);
  }
  keydownHandler(e) {
    if (e.keyCode == 13) {
      let count = 0;
      for (let i = 0; i < this.numwaits; i++) {
        let w = this.waitarray[i];
        if (w.wait) {
          w.doifenter();
          w.wait = false;
          count++;
        }
      }
      if (this.doifany != null) {
        if (count > 0) {
          this.doifany();
        }
      }
    }
  }
  do_if_this(doifenter) {
    this.waitarray.push({
      wait: false,
      doifenter: doifenter,
    });
    this.numwaits++;
    return this.numwaits - 1;
  }
  do_if_any(doifany) {
    this.doifany = doifany;
  }
  set(wfeid) {
    this.waitarray[wfeid].wait = true;
  }
}
