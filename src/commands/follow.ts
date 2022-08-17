import config from "config";
import Command, { flags } from "@oclif/command";
import { contextFlags } from "../flags/context-flags";
import { createContext, notify } from "../util";
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
    browser: flags.string({
      char: "b",
      description:
        "name of browser executable to use (either 'chrome' or 'firefox')",
      hidden: false,
      required: false,
      options: ["chrome", "firefox"],
      default: "chrome",
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
      browser,
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

    const { product, executablePath } = (config.get("PUPPETEER_BROWSER") as {
      [key: string]: { product: "chrome" | "firefox"; executablePath?: string };
    })[browser];
    const proxy = config.get("PROXY") as IProxy;
    const manager = await Manager.init(context, {
      executablePath,
      product,
      proxy,
    });

    const credentials = config.get("ACCOUNT_TIKTOK") as {
      email: string;
      password: string;
    };
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
