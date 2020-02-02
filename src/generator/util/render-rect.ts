import Canvas from "canvas";
import CanvasElement from "./canvas-element";

export const renderRect = (
  ctx: Canvas.CanvasRenderingContext2D,
  { width, height, color }: { width: number; height: number; color: string },
  {
    paddingTop = 0,
    paddingLeft = 0,
    paddingRight = 0,
    paddingBottom = 0
  }: {
    paddingTop?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingBottom?: number;
  } = {},
  parent: {
    x: number;
    y: number;
    width: number;
    height: number;
  },
  {
    justifyContent,
    verticalAlign
  }: { justifyContent?: "center"; verticalAlign?: "middle" } = {}
) => {
  ctx.fillStyle = color;

  const rect = {
    x:
      parent.x +
      (justifyContent === "center" ? (parent.width - width) / 2 : paddingLeft),
    y:
      parent.y +
      (verticalAlign === "middle" ? (parent.height - height) / 2 : paddingTop),
    width:
      width + paddingLeft + paddingRight < parent.width
        ? width
        : parent.width - (paddingLeft + paddingRight),
    height:
      height + paddingTop + paddingBottom < parent.height
        ? height
        : parent.height - (paddingTop + paddingBottom)
  };

  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

  return rect;
};

export class RectElement extends CanvasElement {
  constructor(
    props: {
      width?: number;
      height?: number;

      paddingTop?: number;
      paddingLeft?: number;
      paddingRight?: number;
      paddingBottom?: number;

      justifyContent?: null | "center";
      verticalAlign?: null | "middle";
    } = {}
  ) {
    super(props);
  }

  render(ctx: Canvas.CanvasRenderingContext2D) {
    ctx.fillRect(this.x, this.y, this.getRealWidth(), this.getRealHeight());
    super.render(ctx);
  }
}
