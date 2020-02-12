import { IProcessedPost, IGeneratorOutput } from "../types/post";
import { generateVideo } from "./video/render/generate-video";
import { saveObjectToJson } from "../util";
import { performance } from "perf_hooks";

export default class {
  outputDir: string;
  resourceDir: string;
  constructor({
    outputDir,
    resourceDir
  }: {
    outputDir: string;
    resourceDir: string;
  }) {
    this.outputDir = outputDir;
    this.resourceDir = resourceDir;
  }

  async generate(
    post: IProcessedPost,
    {
      saveOutputToFile = false,
      debug = false
    }: { saveOutputToFile?: boolean; debug?: boolean } = {}
  ) {
    const t0 = performance.now();
    const renderOutput = await generateVideo(post, {
      outputDir: this.outputDir,
      resourceDir: this.resourceDir,
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
