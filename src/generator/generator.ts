import { IContext, IProcessedPost, IGeneratorOutput } from "../types";
import { generateVideo } from "./video/render/generate-video";
import { saveObjectToJson } from "../util";
import { performance } from "perf_hooks";

export default class Generator {
  context: IContext;
  constructor(context: IContext) {
    this.context = context;
  }

  async generate(post: IProcessedPost) {
    const { outputDir, resourceDir, saveOutputToFile, debug } = this.context;
    const t0 = performance.now();
    const renderOutput = await generateVideo(post, {
      outputDir,
      resourceDir,
      debug
    });
    const generatorOutput = {
      id: post.id,
      dateGenerated: new Date(),
      elapsedTime: performance.now() - t0,
      media: { metadata: {}, thumbnail: {}, render: renderOutput }
    } as IGeneratorOutput;

    console.log(`---`);
    console.log(`Generation complete!`);
    console.log(`Elapsed Time: ${generatorOutput.elapsedTime}`);

    if (saveOutputToFile) {
      const fileName = `${generatorOutput.id}.generator.json`;
      await saveObjectToJson(generatorOutput, {
        fileName,
        outputDir
      });
      console.log(`Saved output to file named ${fileName}`);
    }

    return generatorOutput;
  }
}
