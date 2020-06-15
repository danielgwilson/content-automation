import config from "config";
import Command, { flags } from "@oclif/command";
import { contextFlags } from "../flags/context-flags";
import { createContext, notify } from "../util";
import Manager from "../manager";

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
      numUnfollows,
      randomOrder,
    } = flags;

    const context = createContext({
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug,
    });

    notify(`Started unfollowing user(s) at ${new Date().toLocaleTimeString()}`);

    const executablePath = config.get("PUPPETEER_EXECUTABLE_PATH") as string;
    const manager = await Manager.init(context, { executablePath });

    const credentials = config.get("ACCOUNT_TIKTOK") as {
      email: string;
      password: string;
    };
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
