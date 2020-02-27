import Command from "@oclif/command";
import { contextFlags } from "../flags/context-flags";
import { createContext, notify } from "../util";
import { processPost } from "../processor";
import { generateVideo } from "../generator";
import { generateThumbnail } from "../generator/video/thumbnail";
import { crawlPost } from "../crawler/crawl-post";

export class DemoCommand extends Command {
  static description = `
    description of my command
    can be multiline
  `;

  static flags = contextFlags;

  async run() {
    notify(`Started demo at ${new Date().toLocaleTimeString()}`);

    const { flags } = this.parse(DemoCommand);
    const { outputDir, resourceDir, saveOutputToFile, debug } = flags;

    const context = createContext({
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug
    });

    const post = await crawlPost(context);
    const processedPost = await processPost(post, context);
    await generateVideo(processedPost, context);
    await generateThumbnail(post.details.title, context);

    notify(`Finished! Demo completed at ${new Date().toLocaleTimeString()}`);
  }
}
