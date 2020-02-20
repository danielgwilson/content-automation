import { getFontString } from "./text-util";

export function fillWrappedText(
  text: string,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  maxWidth: number,
  {
    fontWeight,
    fontStyle,
    fontSize,
    fontFamily,
    lineSpacing
  }: {
    fontWeight?: string;
    fontStyle?: string;
    fontSize?: number;
    fontFamily?: string;
    lineSpacing?: number;
  } = {}
) {
  ctx.font = getFontString({ fontWeight, fontStyle, fontSize, fontFamily });

  const lines = getMultiLineText(text, ctx, maxWidth);
  const lineTextSpacing =
    lineSpacing ?? (fontSize ? Math.round(fontSize * 1.5) : 0);

  for (let [i, line] of lines.entries()) {
    ctx.fillText(line, x, y + i * lineTextSpacing);
  }
}

export function getMultiLineText(
  text: string,
  ctx: CanvasRenderingContext2D,
  maxWidth: number
) {
  const words = text.split(" ");
  let startOfLine = 0;
  const lines: string[] = [];

  for (let i = 1; i <= words.length; i++) {
    const line = words.slice(startOfLine, i).join(" ");
    if (ctx.measureText(line).width > maxWidth) {
      if (words.slice(startOfLine, i - 1).length === 0)
        throw new Error("Word too wide for bounds");
      lines.push(words.slice(startOfLine, i - 1).join(" "));
      startOfLine = i - 1;
    } else if (i === words.length) {
      lines.push(words.slice(startOfLine, i).join(" "));
    }
  }

  return lines;
}
