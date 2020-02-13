import path from "path";
import { IProcessedPost } from "../../../types/post";
import {
  getAssetForMatchCompDurationToContents,
  getAssetForSetAttribute,
  getAssetForSetAttributeToParentAttribute
} from "./assets/assets";
import { getSrcForPath } from "./assets/util";

export function getJob(
  post: IProcessedPost,
  {
    outputDir,
    resourceDir,
    compName
  }: { outputDir: string; resourceDir: string; compName: string }
) {
  const AUDIO_LEVEL_BG = -10.0;
  const AUDIO_LEVEL_VOICE = 4.0;
  const job: any = {
    template: {
      src: getSrcForPath(
        path.join(resourceDir, "/after-effects/", "reddit-template.aep")
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

  job.assets.push({
    type: "script",
    src: getSrcForPath(
      path.join(resourceDir, "/ae-scripts/", "ae-section-title.js")
    ),
    keyword: "SECTION_TITLE_PARAMS",
    parameters: [
      { key: "compName", value: compName },
      { key: "fragments", value: post.sections[0].fragments },
      { key: "author", value: post.sections[0].author },
      { key: "score", value: post.sections[0].score },
      { key: "audioLevelVoice", value: AUDIO_LEVEL_VOICE },
      { key: "postDetails", value: post.details }
    ]
  });

  job.assets.push({
    type: "script",
    src: getSrcForPath(
      path.join(resourceDir, "/ae-scripts/", "ae-section-comment.js")
    ),
    keyword: "SECTION_COMMENT_PARAMS",
    parameters: [
      { key: "compName", value: compName },
      { key: "fragments", value: post.sections[1].fragments },
      { key: "author", value: post.sections[1].author },
      { key: "score", value: post.sections[1].score },
      { key: "audioLevelVoice", value: AUDIO_LEVEL_VOICE },
      { key: "children", value: post.sections[1].children },
      { key: "delay", value: 1 }
    ]
  });

  // for (let section of post.sections.slice(1)) {
  //   job.assets.push(
  //     ...getAssetsForSection(section, post.details, {
  //       compName,
  //       audioLevelVoice: AUDIO_LEVEL_VOICE,
  //       delay: 1.0
  //     })
  //   );
  // }

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

  // Background music
  job.assets.push({
    type: "script",
    src: getSrcForPath(
      path.join(resourceDir, "/ae-scripts/", "ae-bg-music.js")
    ),
    keyword: "BG_MUSIC_PARAMS",
    parameters: [
      { key: "compName", value: compName },
      {
        key: "filePath",
        value: path.join(resourceDir, "/bg-music/", "Sunshine_Samba.mp3")
      },
      { key: "audioLevel", value: AUDIO_LEVEL_BG }
    ]
  });

  // Background video
  // job.assets.push({
  //   type: "video",
  //   layerName: "bg-ref",
  //   composition: `${compName}.bg-comp`,
  //   src: getSrcForPath(
  //     path.join(resourceDir, "/bg-videos/", "bg-03-rocks-waves-1080p.mp4")
  //   )
  // });
  // job.assets.push({
  //   type: "data",
  //   layerName: "bg-ref",
  //   composition: `${compName}.bg-comp`,
  //   property: "timeRemapEnabled",
  //   value: true
  // });
  // job.assets.push({
  //   type: "data",
  //   layerName: "bg-ref",
  //   composition: `${compName}.bg-comp`,
  //   property: "Time Remap",
  //   expression: "loopOut()"
  // });
  // job.assets.push(
  //   getAssetForSetAttributeToParentAttribute(
  //     {
  //       layer: { name: "bg-ref", attribute: "outPoint" },
  //       parent: {
  //         index: 1,
  //         attribute: "outPoint"
  //       }
  //     },
  //     `${compName}.bg-comp`,
  //     compName
  //   )
  // );
  // job.assets.push(
  //   getAssetForMatchCompDurationToContents(`${compName}.bg-comp`)
  // );
  // job.assets.push(
  //   getAssetForSetAttributeToParentAttribute(
  //     {
  //       layer: { name: `${compName}.bg-comp`, attribute: "outPoint" },
  //       parent: {
  //         index: 1,
  //         attribute: "outPoint"
  //       }
  //     },
  //     compName
  //   )
  // );

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
