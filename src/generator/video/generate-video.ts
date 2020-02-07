import path from "path";
const { render } = require("@nexrender/core");
import {
  getAssetsForSection,
  getAssetForMatchCompDurationToContents,
  getAssetForSetAttribute,
  getAssetForSetAttributeToParentAttribute,
  getAssetForDuplicateLayer
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
  const SRC_PREFIX = "file://";
  const AUDIO_LEVEL_BG = -10.0;
  const job: any = {
    template: {
      src: `${SRC_PREFIX}${path.join(
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

  // Disable placeholder layers that were duplicated but are otherwise unused
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
  job.assets.push(
    getAssetForSetAttribute(
      {
        layer: {
          name: "transition-ref",
          attribute: "enabled",
          value: false
        }
      },
      `${compName}.comment-comp`
    )
  );

  // Background music
  job.assets.push(
    getAssetForDuplicateLayer("audio-ref", compName, {
      newName: "audio-ref.bg-music"
    })
  );
  job.assets.push({
    type: "audio",
    layerName: "audio-ref.bg-music",
    src: `${SRC_PREFIX}${path.join(
      __dirname,
      "/../../",
      "/public/bg-music/",
      "Sunshine_Samba.mp3"
    )}`
  });
  job.assets.push({
    type: "data",
    layerName: "audio-ref.bg-music",
    property: "timeRemapEnabled",
    value: true
  });
  job.assets.push({
    type: "data",
    layerName: "audio-ref.bg-music",
    property: "Time Remap",
    expression: "loopOut()"
  });
  job.assets.push(
    getAssetForSetAttributeToParentAttribute(
      {
        layer: { name: "audio-ref.bg-music", attribute: "outPoint" },
        parent: {
          index: 1,
          attribute: "outPoint"
        }
      },
      compName
    )
  );
  job.assets.push({
    type: "data",
    layerName: `audio-ref.bg-music`,
    property: "Audio Levels",
    value: [AUDIO_LEVEL_BG, AUDIO_LEVEL_BG]
  });

  // Background video
  job.assets.push({
    type: "video",
    layerName: "bg-ref",
    composition: `${compName}.bg-comp`,
    src: `${SRC_PREFIX}${path.join(
      __dirname,
      "/../../",
      "/public/bg-videos/bg-02-forest-atmosphere.mp4"
    )}`
  });
  job.assets.push({
    type: "data",
    layerName: "bg-ref",
    composition: `${compName}.bg-comp`,
    property: "timeRemapEnabled",
    value: true
  });
  job.assets.push({
    type: "data",
    layerName: "bg-ref",
    composition: `${compName}.bg-comp`,
    property: "Time Remap",
    expression: "loopOut()"
  });
  job.assets.push(
    getAssetForSetAttributeToParentAttribute(
      {
        layer: { name: "bg-ref", attribute: "outPoint" },
        parent: {
          index: 1,
          attribute: "outPoint"
        }
      },
      `${compName}.bg-comp`,
      compName
    )
  );
  job.assets.push(
    getAssetForMatchCompDurationToContents(`${compName}.bg-comp`)
  );
  job.assets.push(
    getAssetForSetAttributeToParentAttribute(
      {
        layer: { name: `${compName}.bg-comp`, attribute: "outPoint" },
        parent: {
          index: 1,
          attribute: "outPoint"
        }
      },
      compName
    )
  );

  // Update comment comp duration and outPoint
  job.assets.push(
    getAssetForMatchCompDurationToContents(`${compName}.comment-comp`)
  );
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
  job.assets.push({
    type: "data",
    layerName: `${compName}.comment-comp`,
    property: "outPoint",
    expression: "layer.outPoint + 1"
  });

  // Update main comp duration
  job.assets.push(getAssetForMatchCompDurationToContents(compName));

  return job;
}
