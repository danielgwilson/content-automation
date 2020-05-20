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
    tags: flags.string({
      char: "t",
      description: "tags which target users must be following",
      hidden: false,
      required: true,
      multiple: true,
    }),
  };

  async run() {
    const { args, flags } = this.parse(FollowCommand);
    const { path } = args;
    const {
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug,

      resetSession,
      tags,
    } = flags;

    const context = createContext({
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug,
    });

    notify(`Started uploading post(s) at ${new Date().toLocaleTimeString()}`);

    const executablePath = config.get("PUPPETEER_EXECUTABLE_PATH") as string;
    const manager = await Manager.init(context, { executablePath });

    const credentials = config.get("ACCOUNT_TIKTOK") as {
      email: string;
      password: string;
    };
    const page = await manager.login(credentials, {
      useCookies: !resetSession,
    });
    await manager.followUsers(page, tags);

    // for (let video of videos) {
    //   // handle video upload
    // }

    notify(
      `Finished! Upload(s) completed at ${new Date().toLocaleTimeString()}`
    );
  }
}
