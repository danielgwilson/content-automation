import { createContext } from "./createContext";
import { crawlPost } from "./crawlPost";
import { processPost } from "./processPost";
import { generateVideo } from "./generateVideo";
import { generateThumbnail } from "../generator/video/thumbnail";
import { IContext } from "../types";

export async function demo(context: IContext) {
  const post = await crawlPost(context);
  const processedPost = await processPost(post, context);
  await generateVideo(processedPost, context);
  await generateThumbnail(post.title, context);
}
