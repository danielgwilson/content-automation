import Canvas from "canvas";

export const renderText = (
  ctx: Canvas.CanvasRenderingContext2D,
  { text, maxWidth }: { text: string; maxWidth?: number },
  {
    fontStyle = "normal",
    fontVariant = "normal",
    fontWeight = "normal",
    fontSize = "14px",
    lineHeight = "21px",
    fontFamily = "NotoSans",
    color = "rgb(26,26,27)"
  }: {
    fontStyle?: string;
    fontVariant?: string;
    fontWeight?: string;
    fontSize?: string;
    lineHeight?: string;
    fontFamily?: string;
    color?: string;
  } = {},
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
  }
) => {
  ctx.font = [fontStyle, fontVariant, fontWeight, fontSize, fontFamily].join(
    " "
  );
  ctx.fillStyle = color;

  const textObject = {
    text,
    x: parent.x + paddingLeft,
    y: (parent.y + paddingTop ?? 0) + parseInt(lineHeight.split("px")[0]),
    width: undefined,
    height: undefined,
    maxWidth
  };

  ctx.fillText(
    textObject.text,
    textObject.x,
    textObject.y,
    textObject.maxWidth
  );

  return textObject;
};

export const measureText = (
  ctx: Canvas.CanvasRenderingContext2D,
  {
    text,
    x,
    y,
    maxWidth
  }: { text: string; x: number; y: number; maxWidth?: number },
  {
    fontStyle = "normal",
    fontVariant = "normal",
    fontWeight = "normal",
    fontSize = "14px",
    lineHeight = "21px",
    fontFamily = "NotoSans"
  }: {
    fontStyle?: string;
    fontVariant?: string;
    fontWeight?: string;
    fontSize?: string;
    lineHeight?: string;
    fontFamily?: string;
  } = {}
) => {
  ctx.font = [fontStyle, fontVariant, fontWeight, fontSize, fontFamily].join(
    " "
  );
  return ctx.measureText(text);
};
