const { render } = require("@nexrender/core");
import { IProcessedPost, IRenderOutput, IVideoSettings } from "../../../types";
import { getJob } from "./job";

export async function renderVideo(
  post: IProcessedPost,
  {
    outputDir,
    resourceDir,
    debug = false,
    settings,
  }: {
    outputDir: string;
    resourceDir: string;
    debug?: boolean;
    settings: IVideoSettings;
  }
) {
  const job = getJob(post, {
    outputDir,
    resourceDir,
    compName: "reddit-template-01",
    settings,
  });
  const renderSettings = {
    workpath: outputDir,
    maxMemoryPercent: 75, // suspect does not do anything, output shows -mem_usage 50 75
    skipCleanup: debug,
    debug,
  };
  await render(job, renderSettings);

  return { job, renderSettings } as IRenderOutput;
}
