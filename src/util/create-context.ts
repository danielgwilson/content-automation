import fs from "fs";
import path from "path";
import { IContext } from "../types";

export function createContext({
  outputDir = "./temp/",
  resourceDir = "./lib/resources/",
  saveOutputToFile = true,
  debug = false,
  useAbsolutePaths = true
}: {
  outputDir?: string;
  resourceDir?: string;
  saveOutputToFile?: boolean;
  debug?: boolean;
  useAbsolutePaths?: boolean;
} = {}) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  if (!fs.existsSync(resourceDir)) {
    fs.mkdirSync(resourceDir);
  }
  return {
    outputDir: useAbsolutePaths ? path.resolve(outputDir) : outputDir,
    resourceDir: useAbsolutePaths ? path.resolve(resourceDir) : resourceDir,
    saveOutputToFile,
    debug
  } as IContext;
}
