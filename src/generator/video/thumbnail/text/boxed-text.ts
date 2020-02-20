import { getFontString } from "./text-util";

export interface TextBox {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  padding?: number;
}

export function fillBoxedText(
  text: string,
  { x = 0, y = 0, width = 500, height = 250, padding = 0 }: TextBox,
  ctx: CanvasRenderingContext2D,
  {
    fontWeight,
    fontStyle,
    fontFamily
  }: {
    fontWeight?: string;
    fontStyle?: string;
    fontFamily?: string;
  } = {}
) {
  const { lines, fontSize, lineHeight } = getBoxedText(
    text,
    { width: width - padding * 2, height: height - padding * 2 },
    ctx,
    {
      fontWeight,
      fontStyle,
      fontFamily
    }
  );
  ctx.font = getFontString({ fontWeight, fontStyle, fontSize, fontFamily });
  const { actualBoundingBoxAscent } = ctx.measureText(lines[0]);
  for (let [i, line] of lines.entries()) {
    ctx.fillText(
      line,
      x + padding,
      y + padding + actualBoundingBoxAscent + i * lineHeight
    );
  }
}

interface BoxedText {
  lines: string[];
  fontSize: number;
  lineHeight: number;
}
export function getBoxedText(
  text: string,
  box: { width: number; height: number },
  ctx: CanvasRenderingContext2D,
  {
    fontWeight,
    fontStyle,
    fontFamily
  }: {
    fontWeight?: string;
    fontStyle?: string;
    fontFamily?: string;
  } = {}
) {
  const { width, height } = box;
  const words = text.split(" ");

  // Get lines and font size pairing (assume line height is a function of font size (~20%))
  let lines: string[] = [];
  // let fontSize = 8;
  let minFontSize = 8;
  let maxFontSize = 400;
  while (minFontSize < Math.floor(maxFontSize) - 1) {
    lines = [];
    const fontSize = Math.floor((minFontSize + maxFontSize) / 2);
    const lineHeight = fontSize * 1.2;
    ctx.font = getFontString({ fontWeight, fontStyle, fontSize, fontFamily });

    let startOfLine = 0;
    for (let i = 1; i <= words.length; i++) {
      const line = words.slice(startOfLine, i).join(" ");
      if (ctx.measureText(line).width > width) {
        if (words.slice(startOfLine, i - 1).length === 0)
          throw new Error("Word too wide for bounds");
        lines.push(words.slice(startOfLine, i - 1).join(" "));
        startOfLine = i - 1;
      } else if (i === words.length) {
        lines.push(words.slice(startOfLine, i).join(" "));
      }
    }

    const textMetrics = ctx.measureText(lines[0]);
    const realLineHeight =
      textMetrics.actualBoundingBoxAscent +
      textMetrics.actualBoundingBoxDescent;
    const textHeight = 1.24 * realLineHeight * lines.length;
    if (textHeight <= height) {
      minFontSize = fontSize;
      if (textHeight === height) break;
    } else {
      maxFontSize = fontSize;
    }
  }
  console.log(minFontSize, maxFontSize);

  minFontSize = maxFontSize;
  const lineHeight = minFontSize * 1.2;

  return { lines, fontSize: minFontSize, lineHeight } as BoxedText;
}
