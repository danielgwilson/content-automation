import fs from "fs";
import path from "path";
import Command, { flags } from "@oclif/command";
import { contextFlags } from "../flags/context-flags";
import { createContext, notify } from "../util";
import { generateVideo } from "../generator";

export class GenerateCommand extends Command {
  static description = `
    generates media (of a given type) for a processed reddit post
  `;

  static args = [
    {
      name: "file", // name of arg to show in help and reference with args[name]
      required: true, // make the arg required with `required: true`
      description: "name of (path to) processed post .json file to process", // help description
      hidden: false // hide this arg from help
    }
  ];

  static flags = {
    ...contextFlags
  };

  async run() {
    const { args, flags } = this.parse(GenerateCommand);

    // validate file name
    const { file } = args;
    const fileName = path.basename(file);
    const fileNameParts = fileName.split(".");
    const fileExtension = fileNameParts.pop();
    const fileType = fileNameParts.pop();
    if (fileExtension !== "json" || fileType !== "processor") {
    }

    const { outputDir, resourceDir, saveOutputToFile, debug } = flags;
    const context = createContext({
      outputDir,
      resourceDir,
      saveOutputToFile,
      debug
    });

    const processedPost = JSON.parse(fs.readFileSync(file, "utf8"));

    notify(`Started generating media at ${new Date().toLocaleTimeString()}`);

    await generateVideo(processedPost, context);

    notify(`Finished! Job completed at ${new Date().toLocaleTimeString()}`);
  }
}
