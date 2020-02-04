import path from "path";
const { render } = require("@nexrender/core");
import { getAssetsForSection, getAssetForUpdateCompLength } from "./assets";
import { ProcessedPost } from "../../types/post";

export async function generateVideo(
  post: ProcessedPost,
  {
    compName = "reddit-template"
  }: {
    compName?: string;
  } = {}
) {
  const job = getJob(post, "reddit-template");

  const result = await render(job);
  console.log(result);
}

function getJob(post: ProcessedPost, compName: string) {
  const srcPrefix = "file://";
  const job: any = {
    template: {
      src: `${srcPrefix}${path.join(
        __dirname,
        "/../../",
        "/public/after-effects/reddit-template.aep"
      )}`,
      composition: compName
    },
    assets: [],
    actions: {
      postrender: [
        {
          module: "@nexrender/action-encode",
          preset: "mp4",
          output: "encoded.mp4"
        },
        {
          module: "@nexrender/action-copy",
          input: "encoded.mp4",
          output: path.join(__dirname, "/../../", "/temp/", "out.mp4")
        }
      ]
    }
  };

  for (let section of post.sections) {
    job.assets.push(...getAssetsForSection(section, compName));
  }

  // job.assets.push({
  //   type: "data",
  //   layerName: "comment-text",
  //   property: "enabled",
  //   value: false
  // });
  job.assets.push(getAssetForUpdateCompLength(compName));

  return job;
}
