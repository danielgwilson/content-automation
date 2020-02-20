import { createCanvas } from "canvas";
import { getMultiLineText } from "./wrapped-text";
import { getFontString } from "./text-util";

it("Splits text into lines", async () => {
  const canvas = createCanvas(1280, 720);
  const ctx = canvas.getContext("2d");

  const text = "My cool thumbnail YAY it's so awesome it's so dope ayyyyy";
  const fontWeight = "400";
  const fontStyle = "normal";
  const fontSize = 72;
  const fontFamily = "IBM Plex Sans";

  ctx.font = getFontString({ fontWeight, fontStyle, fontSize, fontFamily });
  const lines = getMultiLineText(text, ctx, 500);
  console.log(lines);
  expect(lines.length).toMatchSnapshot();
});
