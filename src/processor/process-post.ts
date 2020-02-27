import config from "config";
import { IContext, IPost } from "../types";
import Processor from "./processor";

export async function processPost(post: IPost, context: IContext) {
  const processor = new Processor(context, {
    GOOGLE_APPLICATION_CREDENTIALS: config.get("GOOGLE_APPLICATION_CREDENTIALS")
  });
  const processedPost = await processor.process(post);
  return processedPost;
}
