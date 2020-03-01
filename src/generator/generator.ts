import path from "path";
import { IContext, IProcessedPost, IGeneratorOutput } from "../types";
import { renderVideo } from "./video/render";
import { renderThumbnail } from "./video/thumbnail";
import { saveObjectToJson } from "../util";
import { performance } from "perf_hooks";

export default class Generator {
  context: IContext;
  constructor(context: IContext) {
    this.context = context;
  }

  async generateVideo(post: IProcessedPost) {
    const { resourceDir, saveOutputToFile, debug } = this.context;
    const subDir = `/${post.id}/`;
    const outputDir = path.join(this.context.outputDir, subDir);
    const t0 = performance.now();

    const renderOutput = await renderVideo(post, {
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
    console.log(
      `Elapsed Time: ${new Date(generatorOutput.elapsedTime)
        .toISOString()
        .slice(11, -1)}`
    );

    if (saveOutputToFile) {
      const fileName = `${generatorOutput.id}.video.generator.json`;
      await saveObjectToJson(generatorOutput, {
        fileName,
        outputDir
      });
      console.log(`Saved output to file named ${fileName}`);
    }

    return generatorOutput;
  }

  async generateThumbnail(post: IProcessedPost) {
    const { resourceDir, saveOutputToFile, debug } = this.context;
    const subDir = `/${post.id}/`;
    const outputDir = path.join(this.context.outputDir, subDir);

    const thumbnail = await renderThumbnail(post.details.title, {
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug
    } as IContext);
  }
}
