import { IContext, IProcessedPost } from "../types";
import Generator from "./generator";

export async function generateVideo(
  processedPost: IProcessedPost,
  context: IContext
) {
  const generator = new Generator(context);
  const video = await generator.generate(processedPost);
  return video;
}
