import path from "path";
const { render } = require("@nexrender/core");
import {
  getAssetsForSection,
  getAssetForMatchCompLengthToContents,
  getAssetForSetAttribute,
  getAssetForSetAttributeToParentAttribute
} from "./assets/assets";
import { IProcessedPost } from "../../types/post";

export async function generateVideo(post: IProcessedPost) {
  const job = getJob(post, "reddit-template-01");

  const result = await render(job, {
    workpath: path.join(__dirname, "/../../", "/temp/nexrender/"),
    skipCleanup: true,
    debug: true
  });
  console.log(result);
}

function getJob(post: IProcessedPost, compName: string) {
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

  // Disable placeholder comment text and background
  job.assets.push(
    getAssetForSetAttribute(
      {
        layer: {
          name: "comment-text",
          attribute: "enabled",
          value: false
        }
      },
      `${compName}.comment-comp`
    )
  );
  job.assets.push(
    getAssetForSetAttribute(
      {
        layer: {
          name: "user-text",
          attribute: "enabled",
          value: false
        }
      },
      `${compName}.comment-comp`
    )
  );
  job.assets.push(
    getAssetForSetAttribute(
      {
        layer: {
          name: "score-text",
          attribute: "enabled",
          value: false
        }
      },
      `${compName}.comment-comp`
    )
  );
  job.assets.push(
    getAssetForSetAttribute(
      {
        layer: {
          name: "upvote-arrow",
          attribute: "enabled",
          value: false
        }
      },
      `${compName}.comment-comp`
    )
  );
  job.assets.push(
    getAssetForSetAttribute(
      {
        layer: {
          name: "downvote-arrow",
          attribute: "enabled",
          value: false
        }
      },
      `${compName}.comment-comp`
    )
  );
  job.assets.push(
    getAssetForSetAttribute(
      {
        layer: {
          name: "comment-bg",
          attribute: "enabled",
          value: false
        }
      },
      `${compName}.comment-comp`
    )
  );

  // // Update comp lengths for main comp and comment comp
  job.assets.push(
    getAssetForMatchCompLengthToContents(`${compName}.comment-comp`)
  );
  // Update title comp outPoint
  job.assets.push(
    getAssetForSetAttributeToParentAttribute(
      {
        layer: { name: `${compName}.comment-comp`, attribute: "outPoint" },
        parent: {
          index: 1,
          attribute: "outPoint"
        }
      },
      compName
    )
  );
  job.assets.push(getAssetForMatchCompLengthToContents(compName));

  return job;
}
