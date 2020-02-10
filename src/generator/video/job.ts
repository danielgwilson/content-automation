import path from "path";
import { IProcessedPost } from "../../types/post";
import {
  getAssetForMatchCompDurationToContents,
  getAssetForSetAttribute,
  getAssetForSetAttributeToParentAttribute,
  getAssetForDuplicateLayer
} from "./render/assets/assets";
import { getAssetsForSection } from "./render/assets/section";
import { getSrcForPath } from "./render/assets/util";

export function getJob(
  post: IProcessedPost,
  { outputDir, compName }: { outputDir: string; compName: string }
) {
  const AUDIO_LEVEL_BG = -10.0;
  const AUDIO_LEVEL_VOICE = 3.0;
  const job: any = {
    template: {
      src: getSrcForPath(
        path.join(
          __dirname,
          "/../../",
          "/public/after-effects/reddit-template.aep"
        )
      ),
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
          output: path.join(outputDir, "output.mp4")
        }
      ]
    }
  };

  for (let section of post.sections) {
    job.assets.push(
      ...getAssetsForSection(section, post.details, {
        compName,
        audioLevelVoice: AUDIO_LEVEL_VOICE,
        delay: 1.0
      })
    );
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
          name: "collapse-comment-bar",
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
    src: getSrcForPath(
      path.join(__dirname, "/../../", "/public/bg-music/", "Sunshine_Samba.mp3")
    )
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
    src: getSrcForPath(
      path.join(
        __dirname,
        "/../../",
        "/public/bg-videos/bg-03-rocks-waves-1080p.mp4"
      )
    )
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
