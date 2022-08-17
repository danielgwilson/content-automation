import config from "config";
import Command, { flags } from "@oclif/command";
import { contextFlags } from "../flags/context-flags";
import { createContext, notify, getCredentials } from "../util";
import Manager from "../manager";
import { IProxy } from "../types";

export class UnfollowCommand extends Command {
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
    numUnfollows: flags.integer({
      char: "n",
      description: "number of users to follow this session",
      hidden: false,
      required: false,
      multiple: false,
    }),
    randomOrder: flags.boolean({
      char: "o",
      description:
        "randomly select the subset of users to unfollow (default is prioritize oldest follows)",
      hidden: false,
      required: false,
      default: false,
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
    const { args, flags } = this.parse(UnfollowCommand);
    // const { path } = args;
    const {
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug,

      resetSession,
      numUnfollows,
      randomOrder,
      browserType,
    } = flags;

    const context = createContext({
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug,
    });

    notify(`Started unfollowing user(s) at ${new Date().toLocaleTimeString()}`);

    const manager = await Manager.init(context, {
      browserType: browserType as "chromium" | "firefox" | "webkit" | undefined,
    });

    const credentials = getCredentials(outputDir);

    await manager.login(credentials, {
      useCookies: !resetSession,
    });
    await manager.unfollowUsers({ numUnfollows, randomOrder });

    if (!context.debug) await manager.close(); // clean up only if not in debug mode

    notify(
      `Finished! Unfollow(s) completed at ${new Date().toLocaleTimeString()}`
    );
  }
}
