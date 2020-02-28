import Command, { flags } from "@oclif/command";
import { contextFlags } from "../flags/context-flags";
import { createContext, notify, getPosts } from "../util";
import { generateVideo } from "../generator";

export class GenerateCommand extends Command {
  static description = `
    generates media (of a given type) for a processed reddit post
  `;

  static args = [
    {
      name: "path", // name of arg to show in help and reference with args[name]
      required: true, // make the arg required with `required: true`
      description:
        "path to either (1) single processed post .json file, (2) directory containing multiple processed post .json files, or (3) directory of subdirectories containing processed post .json files.", // help description
      hidden: false // hide this arg from help
    }
  ];

  static flags = {
    ...contextFlags
  };

  async run() {
    const { args, flags } = this.parse(GenerateCommand);
    const { path } = args;
    const { outputDir, resourceDir, saveOutputToFile, debug } = flags;

    const context = createContext({
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug
    });

    notify(`Started generating media at ${new Date().toLocaleTimeString()}`);

    const posts = getPosts(path, { type: "processor" });
    await Promise.all(
      posts.map(async post => await generateVideo(post, context))
    );

    notify(`Finished! Job completed at ${new Date().toLocaleTimeString()}`);
  }
}
