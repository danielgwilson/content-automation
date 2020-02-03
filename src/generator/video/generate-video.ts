import path from "path";
const { render } = require("@nexrender/core");
import { Post } from "../../types/post";

export async function generateVideo(post: Post) {
  const job = getJob(post);

  const result = await render(job);
  console.log(result);
}

function getJob(post: Post) {
  const srcPrefix = "file://";
  const job: any = {
    template: {
      src: `${srcPrefix}${path.join(
        __dirname,
        "/../../",
        "/public/after-effects/reddit-template.aep"
      )}`,
      composition: "reddit-template"
    },
    assets: [
      {
        layerName: "title-text",
        type: "data",
        property: "Source Text",
        value: post.title
      },
      {
        src: `${srcPrefix}${path.join(
          __dirname,
          "/../../",
          `/temp/${post.id}-0.mp3`
        )}`,
        layerName: "audio",
        type: "audio"
      }
    ],
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
  for (let i = 1; i < 2; i++) {
    job.assets.push({
      src: `${srcPrefix}${path.join(
        __dirname,
        "/../../",
        "/public/after-effects/extend-scripts/dupe-audio.jsx"
      )}`,
      type: "script"
    });
    job.assets.push({
      src: `${srcPrefix}${path.join(
        __dirname,
        "/../../",
        `/temp/${post.id}-${i}.mp3`
      )}`,
      layerIndex: 1,
      type: "audio"
    });
  }
  job.assets.push({
    src: `${srcPrefix}${path.join(
      __dirname,
      "/../../",
      "/public/after-effects/extend-scripts/update-comp-length.jsx"
    )}`,
    type: "script"
  });

  return job;
}
