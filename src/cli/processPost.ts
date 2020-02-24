import config from "config";
import Processor from "../processor/processor";
import { IPost, IContext } from "../types";

export async function processPost(post: IPost, context: IContext) {
  const { outputDir, saveOutputToFile } = context;
  const processor = new Processor({
    outputDir,
    GOOGLE_APPLICATION_CREDENTIALS: config.get("GOOGLE_APPLICATION_CREDENTIALS")
  });
  const processedPost = await processor.process(post, {
    saveOutputToFile
  });
  return processedPost;
}
