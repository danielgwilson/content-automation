import { generateThumbnail } from "./generate-thumbnail";
import { IContext } from "../../../types";

const context: IContext = {
  outputDir: "./",
  resourceDir: "./resources/",
  debug: true
};

it("Generate a thumbnail", async () => {
  const thumbnail = await generateThumbnail(
    "My cool thumbnail YAY it's so awesome it's so dope ayyyyy",
    context
  );
  expect(thumbnail).toBeDefined();
});
