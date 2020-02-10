import { IProcessedPost, IGeneratorOutput } from "../types/post";
import { generateVideo as renderVideo } from "./video/render/generate-video";
import { saveObjectToJson } from "../util";

export default class {
  outputDir: string;
  constructor({ outputDir }: { outputDir: string }) {
    this.outputDir = outputDir;
  }

  async generate(
    post: IProcessedPost,
    {
      saveOutputToFile = false,
      debug = false
    }: { saveOutputToFile?: boolean; debug?: boolean } = {}
  ) {
    const t0 = performance.now();
    const videoGeneratorOutput = await renderVideo(post, {
      outputDir: this.outputDir,
      debug
    });
    const generatorOutput = {
      id: post.id,
      dateGenerated: new Date(),
      elapsedTime: performance.now() - t0,
      media: { metadata: {}, thumbnail: {}, render: videoGeneratorOutput }
    } as IGeneratorOutput;

    console.log(`---`);
    console.log(`Generation complete!`);
    console.log(`Elapsed Time: ${generatorOutput.elapsedTime}`);

    if (saveOutputToFile)
      saveObjectToJson(generatorOutput, {
        fileName: `${
          generatorOutput.id
        }.${generatorOutput.dateGenerated.toISOString()}.generator.json`,
        outputDir: this.outputDir
      });

    return generatorOutput;
  }
}
