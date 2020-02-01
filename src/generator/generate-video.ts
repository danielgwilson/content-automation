import fs from "fs";
import path from "path";
import Canvas from "canvas";
import { renderText, measureText } from "./util/render-text";
import { renderRect } from "./util/render-rect";
import { Post } from "../types/post";
import REDDIT_STYLES from "./reddit-styles";

export async function generateVideo(post: Post) {
  const style = REDDIT_STYLES.light;

  const canvas = getNewCanvas();
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = style.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const titleSize = measureText(
    ctx,
    {
      text: post.title,
      x: style.post.paddingLeft ?? 0,
      y: style.post.paddingTop ?? 0
    },
    {
      ...style.post.title
    }
  );

  const rect = renderRect(
    ctx,
    {
      width: style.post.width ?? canvas.width,
      height: titleSize.emHeightAscent + 50,
      color: style.post.backgroundColor
    },
    {
      ...style.post
    },
    {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height
    },
    { justifyContent: "center", verticalAlign: "middle" }
  );

  renderText(
    ctx,
    {
      text: post.title
    },
    {
      ...style.post.title
    },
    {
      ...style.post
    },
    rect
  );

  canvas
    .createPNGStream()
    .pipe(fs.createWriteStream(path.join(__dirname, "/../", "output.png")));
}

const getNewCanvas = () => {
  Canvas.registerFont(fontFile("IBM_Plex_Sans/IBMPlexSans-Regular.ttf"), {
    family: "IBMPlexSans",
    weight: "500"
  });
  Canvas.registerFont(fontFile("Noto_Sans/NotoSans-Regular.ttf"), {
    family: "NotoSans",
    weight: "400"
  });

  return Canvas.createCanvas(1920, 1080);
};

const fontFile = (name: string) => {
  return path.join(__dirname, "/../public/fonts", name);
};
