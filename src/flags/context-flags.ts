import { flags } from "@oclif/command";

export const contextFlags = {
  outputDir: flags.string({
    char: "O",
    description: "output directory for results of run", // help description for flag
    hidden: false, // hide from help
    multiple: false, // allow setting this flag multiple times
    default: "./temp", // default value if flag not passed (can be a function that returns a string or undefined)
    required: false // make flag required (this is not common and you should probably use an argument instead)
  }),
  resourceDir: flags.string({
    char: "R",
    description: "resource directory for static dependencies", // help description for flag
    hidden: false, // hide from help
    multiple: false, // allow setting this flag multiple times
    default: "./lib/resources", // default value if flag not passed (can be a function that returns a string or undefined)
    required: false // make flag required (this is not common and you should probably use an argument instead)
  }),
  saveOutputToFile: flags.boolean({
    char: "S",
    default: true
  }),
  debug: flags.boolean({
    char: "D",
    default: false
  })
};
