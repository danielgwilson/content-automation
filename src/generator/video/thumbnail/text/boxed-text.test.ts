import { createCanvas } from "canvas";
import { getBoxedText } from "./boxed-text";
import { getFontString } from "./text-util";

it("Gets lines and max font size for a rectangle", () => {
  const canvas = createCanvas(1280, 720);
  const ctx = canvas.getContext("2d");

  const text = "My cool thumbnail YAY it's so awesome it's so dope ayyyyy";
  const fontWeight = "400";
  const fontStyle = "normal";
  const fontFamily = "IBM Plex Sans";

  const boxedText = getBoxedText(text, { width: 1280, height: 720 }, ctx, {
    fontWeight,
    fontStyle,
    fontFamily
  });
  console.log(boxedText);
  expect(boxedText).toBeDefined();
});
