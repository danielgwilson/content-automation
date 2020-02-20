import fs from "fs";
import path from "path";
import { createCanvas, registerFont } from "canvas";
import { IContext } from "../../../types";
import { fillBoxedText, TextBox } from "./text/boxed-text";

export async function generateThumbnail(
  title: string,
  { outputDir, resourceDir }: IContext
) {
  registerFonts(resourceDir);

  const canvas = createCanvas(1280, 720);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const textBox: TextBox = {
    x: 0,
    y: 200,
    width: canvas.width * (2 / 3) - 0,
    height: canvas.height - 200,
    padding: 25
  };
  const fontWeight = "400";
  const fontStyle = "normal";
  const fontFamily = "IBM Plex Sans";

  ctx.fillStyle = "#FFFFFF";
  fillBoxedText(title, textBox, ctx, {
    fontWeight,
    fontStyle,
    fontFamily
  });

  const fileName = "thumbnail.png";
  const output = fs.createWriteStream(path.join(outputDir, fileName));
  const stream = canvas.createPNGStream();
  stream.pipe(output);

  return fileName;
}

export function registerFonts(resourceDir: string) {
  registerFont(
    path.join(
      resourceDir,
      "/fonts/",
      "/IBM_Plex_Sans/",
      "IBMPlexSans-Regular.ttf"
    ),
    { family: "IBM Plex Sans" }
  );
}
