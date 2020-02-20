const { render } = require("@nexrender/core");
import { IProcessedPost, IRenderOutput } from "../../../types/post";
import { getJob } from "./job";

export async function generateVideo(
  post: IProcessedPost,
  {
    outputDir,
    resourceDir,
    debug = false
  }: { outputDir: string; resourceDir: string; debug?: boolean }
) {
  const job = getJob(post, {
    outputDir,
    resourceDir,
    compName: "reddit-template-01"
  });
  const settings = {
    workpath: outputDir,
    maxMemoryPercent: 75, // suspect does not do anything, output shows -mem_usage 50 75
    skipCleanup: debug,
    debug
  };
  await render(job, settings);

  return { job, settings } as IRenderOutput;
}
