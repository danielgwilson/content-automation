import config from "config";
import Command, { flags } from "@oclif/command";
import { contextFlags } from "../flags/context-flags";
import { createContext, notify } from "../util";
import Manager from "../manager";
import { IProxy } from "../types";

export class UploadCommand extends Command {
  static description = `
    uploads a generated video to a target platform
  `;

  static args = [
    {
      name: "path", // name of arg to show in help and reference with args[name]
      required: true, // make the arg required with `required: true`
      description:
        "path to single post video file or directory containing multiple post video files to upload", // help description
      hidden: false, // hide this arg from help
    },
  ];

  static flags = {
    ...contextFlags,
    resetSession: flags.boolean({
      char: "r",
      description: "start session without loading userDataDir or cookies", // help description for flag
      hidden: false, // hide from help
      default: false, // default value if flag not passed (can be a function that returns a string or undefined)
      required: false, // make flag required (this is not common and you should probably use an argument instead)
    }),
    title: flags.string({
      char: "t",
      description: "video title to enter into the 'Caption' field",
      hidden: false,
      required: false,
    }),
    testDetection: flags.boolean({
      char: "T",
      description:
        "don't actually upload; instead, open bot detection testing page and save screenshot of results.",
      hidden: false,
      required: false,
      default: false,
    }),
    nContentRemaining: flags.boolean({
      char: "n",
      description:
        "don't actually upload; instead, count number of remaining un-uploaded content items.",
      hidden: false,
      required: false,
      default: false,
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
    const { args, flags } = this.parse(UploadCommand);
    const { path } = args;
    const {
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug,

      resetSession,
      title,
      testDetection,
      browser,
      nContentRemaining,
    } = flags;

    const context = createContext({
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug,
    });

    notify(`Started uploading post(s) at ${new Date().toLocaleTimeString()}`);

    const executablePath = config.get("PUPPETEER_EXECUTABLE_PATH") as {
      [key: string]: string;
    };
    const proxy = config.get("PROXY") as IProxy;
    const manager = await Manager.init(context, {
      executablePath: executablePath[browser],
      proxy,
    });

    function logRemainingContentItems(targetDir: string) {
      console.log(
        `Remaining non-uploaded content items in path: ${manager.getCountOfRemainingContentItems(
          { targetDir }
        )}`
      );
    }

    if (testDetection) {
      await manager.test();
    } else if (nContentRemaining) {
      logRemainingContentItems(path);
    } else {
      const credentials = config.get("ACCOUNT_TIKTOK") as {
        email: string;
        password: string;
      };
      const page = await manager.login(credentials, {
        useCookies: !resetSession,
      });
      await manager.uploadPost({
        targetDir: path,
        title,
        page,
      });
      logRemainingContentItems(path);
    }

    if (!context.debug) await manager.close(); // clean up only if not in debug mode

    // for (let video of videos) {
    //   // handle video upload
    // }

    notify(
      `Finished! Upload(s) completed at ${new Date().toLocaleTimeString()}`
    );
  }
}
