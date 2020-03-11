import config from "config";
import Command, { flags } from "@oclif/command";
import { contextFlags } from "../flags/context-flags";
import { createContext, notify, getPosts } from "../util";
import Processor from "../processor";

export class ProcessCommand extends Command {
  static description = `
    crawls a reddit post with a given index and subreddit name
  `;

  static args = [
    {
      name: "path", // name of arg to show in help and reference with args[name]
      required: true, // make the arg required with `required: true`
      description:
        "path to single post .json file or directory containing multiple post .json files to process", // help description
      hidden: false // hide this arg from help
    }
  ];

  static flags = {
    ...contextFlags,
    maxRepliesPerComment: flags.integer({
      char: "r",
      description: "maximum number of replies to each comment (breadth)", // help description for flag
      hidden: false, // hide from help
      multiple: false, // allow setting this flag multiple times
      default: 2, // default value if flag not passed (can be a function that returns a string or undefined)
      required: false // make flag required (this is not common and you should probably use an argument instead)
    }),
    maxReplyDepth: flags.integer({
      char: "d",
      description: "maximum number of replies deep per chain (depth)", // help description for flag
      hidden: false, // hide from help
      multiple: false, // allow setting this flag multiple times
      default: 2, // default value if flag not passed (can be a function that returns a string or undefined)
      required: false // make flag required (this is not common and you should probably use an argument instead)
    }),
    maxAudioLength: flags.integer({
      char: "l",
      description: "maximum number of replies to each comment (breadth)", // help description for flag
      hidden: false, // hide from help
      multiple: false, // allow setting this flag multiple times
      default: 15 * 1000 * 60, // default value if flag not passed (can be a function that returns a string or undefined)
      required: false // make flag required (this is not common and you should probably use an argument instead)
    })
  };

  async run() {
    const { args, flags } = this.parse(ProcessCommand);
    const { path } = args;
    const {
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug,
      maxRepliesPerComment,
      maxReplyDepth,
      maxAudioLength
    } = flags;

    const context = createContext({
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug
    });

    notify(`Started processing post at ${new Date().toLocaleTimeString()}`);

    const posts = getPosts(path, { type: "crawler" });

    const processor = new Processor(context, {
      GOOGLE_APPLICATION_CREDENTIALS: config.get(
        "GOOGLE_APPLICATION_CREDENTIALS"
      )
    });
    await Promise.all(
      posts.map(
        async post =>
          await processor.process(post, {
            maxRepliesPerComment,
            maxReplyDepth,
            maxAudioLength
          })
      )
    );

    notify(
      `Finished! Processing completed at ${new Date().toLocaleTimeString()}`
    );
  }
}
