import config from "config";
import Command from "@oclif/command";
import { contextFlags } from "../flags/context-flags";
import { createContext, notify } from "../util";
import Processor from "../processor";
import Generator from "../generator";
import Crawler from "../crawler";
import { logPost } from "../util";

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

    // Crawl first AskReddit post sorted by "hot"
    const crawler = new Crawler(context);
    const post = await crawler.getPost();
    logPost(post);

    // Process post
    const processor = new Processor(context, {
      GOOGLE_APPLICATION_CREDENTIALS: config.get(
        "GOOGLE_APPLICATION_CREDENTIALS"
      )
    });
    const processedPost = await processor.process(post);

    // Generate video and thumbnail
    const generator = new Generator(context);
    await generator.generateVideo(processedPost);
    await generator.generateThumbnail(processedPost);

    notify(`Finished! Demo completed at ${new Date().toLocaleTimeString()}`);
  }
}
