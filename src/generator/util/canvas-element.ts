import Canvas from "canvas";

export default class CanvasElement {
  parent: CanvasElement | null;
  children: CanvasElement[];

  x: number;
  y: number;
  width: number;
  height: number;

  paddingTop: number;
  paddingLeft: number;
  paddingRight: number;
  paddingBottom: number;

  justifyContent: null | "center";
  verticalAlign: null | "middle";

  constructor({
    x = 0,
    y = 0,
    width = 0,
    height = 0,

    paddingTop = 0,
    paddingLeft = 0,
    paddingRight = 0,
    paddingBottom = 0,

    justifyContent = null,
    verticalAlign = null
  }: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;

    paddingTop?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingBottom?: number;

    justifyContent?: null | "center";
    verticalAlign?: null | "middle";
  } = {}) {
    this.parent = null;
    this.children = [];

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.paddingTop = paddingTop;
    this.paddingLeft = paddingLeft;
    this.paddingRight = paddingRight;
    this.paddingBottom = paddingBottom;

    this.justifyContent = justifyContent;
    this.verticalAlign = verticalAlign;
  }

  addChild(child: CanvasElement) {
    child.parent = this;
    this.children.push(child);

    child.x =
      this.x +
      (this.justifyContent === "center"
        ? Math.max((this.width - child.width) / 2, child.paddingLeft)
        : child.paddingLeft); // only works for n=1 children
    child.y =
      this.y +
      (this.verticalAlign === "middle"
        ? Math.max((this.height - child.height) / 2, child.paddingTop)
        : child.paddingTop);
  }

  render(ctx: Canvas.CanvasRenderingContext2D) {
    for (let child of this.children) {
      child.render(ctx);
    }
  }

  getRealWidth() {
    return this.parent
      ? Math.min(
          this.width,
          this.parent.width -
            (this.parent.paddingLeft + this.parent.paddingRight)
        )
      : this.width;
  }

  getRealHeight() {
    return this.parent
      ? Math.min(
          this.height,
          this.parent.height -
            (this.parent.paddingTop + this.parent.paddingBottom)
        )
      : this.height;
  }
}
