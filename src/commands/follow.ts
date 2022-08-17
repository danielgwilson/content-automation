import config from "config";
import Command, { flags } from "@oclif/command";
import { contextFlags } from "../flags/context-flags";
import { createContext, notify, getCredentials } from "../util";
import Manager from "../manager";
import { IProxy } from "../types";

export class FollowCommand extends Command {
  static description = `
    uploads a generated video to a target platform
  `;

  static args = [];

  static flags = {
    ...contextFlags,
    resetSession: flags.boolean({
      char: "r",
      description: "start session without loading userDataDir or cookies", // help description for flag
      hidden: false, // hide from help
      default: false, // default value if flag not passed (can be a function that returns a string or undefined)
      required: false, // make flag required (this is not common and you should probably use an argument instead)
    }),
    tags: flags.string({
      char: "t",
      description: "tag in which target users comment on posts",
      hidden: false,
      required: false,
      multiple: true,
    }),
    users: flags.string({
      char: "u",
      description: "users whose posts target users comment on",
      hidden: false,
      required: false,
      multiple: true,
    }),
    numFollows: flags.integer({
      char: "n",
      description: "number of users to follow this session",
      hidden: false,
      required: false,
      multiple: false,
    }),
    browserType: flags.string({
      char: "b",
      description:
        "type of browser executable to use (either 'chromium', 'firefox', or 'webkit')",
      hidden: false,
      required: false,
      options: ["chromium", "firefox", "webkit"],
      default: "firefox",
    }),
  };

  async run() {
    const { args, flags } = this.parse(FollowCommand);
    // const { path } = args;
    const {
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug,

      resetSession,
      tags,
      users,
      numFollows,
      browserType,
    } = flags;

    const context = createContext({
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug,
    });

    if (!tags && !users)
      throw new Error("Must call with either target tag(s) or target user(s)");

    notify(`Started following user(s) at ${new Date().toLocaleTimeString()}`);

    const proxy = config.get("PROXY") as IProxy;
    const manager = await Manager.init(context, {
      browserType: browserType as "chromium" | "firefox" | "webkit" | undefined,
      proxy,
    });

    const credentials = getCredentials(outputDir);

    const page = await manager.login(credentials, {
      useCookies: !resetSession,
    });
    await manager.followUsers(page, { tags, users, numFollows });

    if (!context.debug) await manager.close(); // clean up only if not in debug mode

    notify(
      `Finished! Follow(s) completed at ${new Date().toLocaleTimeString()}`
    );
  }
}
