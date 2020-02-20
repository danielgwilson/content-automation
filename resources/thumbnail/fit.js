function FitText(el) {
  this.element = el;
  this.parent = el.parentElement;
  this.clientHeight = -1;
  this.clientWidth = -1;

  this.fit = function(shouldRecalc) {
    this.parent.style.fontSize = "100px";
    if (shouldRecalc || this.clientWidth < 0) {
      this.recalc();
    }

    this.parent.style.fontSize =
      Math.max(
        10,
        Math.min(
          this.clientHeight,
          Math.floor((this.clientWidth / this.element.clientWidth) * 100)
        )
      ) + "px";
  };

  //cache parent width, height
  this.recalc = function() {
    this.clientWidth = this.parent.clientWidth;
    this.clientHeight = this.parent.clientHeight;
  };
}
