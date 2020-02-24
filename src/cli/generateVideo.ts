import Generator from "../generator/generator";
import { IProcessedPost, IContext } from "../types";

export async function generateVideo(
  processedPost: IProcessedPost,
  context: IContext
) {
  const { outputDir, resourceDir, saveOutputToFile } = context;
  const generator = new Generator({ outputDir, resourceDir });
  const video = await generator.generate(processedPost, {
    saveOutputToFile,
    debug: true
  });
  return video;
}
