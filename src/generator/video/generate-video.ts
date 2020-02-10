import path from "path";
const { render } = require("@nexrender/core");
import { IProcessedPost } from "../../types/post";
import { getJob } from "./job";

export async function generateVideo(
  post: IProcessedPost,
  { outputDir, debug = false }: { outputDir: string; debug?: boolean }
) {
  const job = getJob(post, { outputDir, compName: "reddit-template-01" });
  const settings = {
    workpath: path.join(outputDir, "/nexrender/"),
    maxMemoryPercent: 75,
    skipCleanup: debug,
    debug
  };
  await render(job, settings);

  return { job, settings };
}
