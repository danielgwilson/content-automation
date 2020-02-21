import fs from "fs";
import path from "path";
import { generateThumbnail } from "./generate-thumbnail";
import { IContext } from "../../../types";

const context: IContext = {
  outputDir: "./",
  resourceDir: "./resources/",
  debug: false
};

it("Generate a thumbnail", async () => {
  // const title = "Would you take a 50/50 chance at $5,000,000 or death? Why or why not?";
  // const title = "Hello world!";
  // const title =
  // "Bank tellers of reddit: What is your plan if someone sends bees through the tube?";
  const title = "Bank tellers, what if someone sends bees through the tube?";
  const thumbnail = await generateThumbnail(title, context);
  const output = fs.existsSync(thumbnail.filePath);
  expect(output).toBeTruthy();
});
