import path from "path";
import Command, { flags } from "@oclif/command";
import { contextFlags } from "../flags/context-flags";
import { createContext, notify, getCredentials } from "../util";
import Manager from "../manager";

export class InfoCommand extends Command {
  static description = `
    uploads a generated video to a target platform
  `;

  static args = [];

  static flags = {
    ...contextFlags,
  };

  async run() {
    const { args, flags } = this.parse(InfoCommand);
    const { outputDir, resourceDir, saveOutputToFile, debug } = flags;

    const context = createContext({
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug,
    });

    notify(`
    ----------
    INFO - ${outputDir}
    ----------
    `);

    const manager = await Manager.init(context);
    const contentDir = path.join(outputDir, "content");

    function logRemainingContentItems(targetDir: string) {
      console.log(`\nRemaining non-uploaded content items in path:`);
      const contentItems = manager.getRemainingContentItems({ targetDir });
      console.log(`Count: ${contentItems.length}`);
      console.log(contentItems.map((blob) => blob.id));
    }

    logRemainingContentItems(contentDir);

    await manager.close(); // clean up only if not in debug mode
  }
}
