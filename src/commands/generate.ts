import Command, { flags } from "@oclif/command";
import { contextFlags } from "../flags/context-flags";
import { createContext, notify, getPosts } from "../util";
import Generator from "../generator";

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
    ...contextFlags,
    video: flags.boolean({
      char: "v",
      description: "output video(s) for the target processed post(s)", // help description for flag
      hidden: false, // hide from help
      default: true,
      allowNo: true,
      required: false // make flag required (this is not common and you should probably use an argument instead)
    }),
    thumbnail: flags.boolean({
      char: "t",
      description: "output thumbnail(s) for the target processed post(s)", // help description for flag
      hidden: false, // hide from help
      default: false,
      required: false // make flag required (this is not common and you should probably use an argument instead)
    })
  };

  async run() {
    const { args, flags } = this.parse(GenerateCommand);
    const { path } = args;
    const {
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug,
      video,
      thumbnail
    } = flags;

    const context = createContext({
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug
    });

    notify(`Started generating media at ${new Date().toLocaleTimeString()}`);

    const posts = getPosts(path, { type: "processor" });

    // Create new Generator and output results
    const generator = new Generator(context);
    if (video) {
      for (let post of posts) {
        await generator.generateVideo(post);
      }
    }
    if (thumbnail) {
      for (let post of posts) {
        await generator.generateThumbnail(post);
      }
    }
    // const promises: Promise<any>[] = [];
    // if (video) {
    //   promises.push(
    //     ...posts.map(async post => await generator.generateVideo(post))
    //   );
    // }
    // if (thumbnail) {
    //   promises.push(
    //     ...posts.map(async post => await generator.generateThumbnail(post))
    //   );
    // }
    // await Promise.all(promises);

    notify(`Finished! Job completed at ${new Date().toLocaleTimeString()}`);
  }
}
