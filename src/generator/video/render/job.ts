import path from "path";
import { IProcessedPost, IVideoSettings } from "../../../types";

function getSrcForPath(filePath: string) {
  return `file://${filePath}`;
}

export function getJob(
  post: IProcessedPost,
  {
    outputDir,
    resourceDir,
    compName,
    settings,
  }: {
    outputDir: string;
    resourceDir: string;
    compName: string;
    settings: IVideoSettings;
  }
) {
  const { BG_MUSIC, AUDIO_LEVEL_BG, AUDIO_LEVEL_VOICE, TEMPLATE } = settings;
  console.log(settings);
  const resourceDirPath = path.resolve(resourceDir);
  const job: any = {
    template: {
      src: getSrcForPath(
        path.join(resourceDirPath, "/after-effects/", TEMPLATE)
      ),
      composition: compName,
    },
    assets: [],
    actions: {
      postrender: [
        {
          module: "@nexrender/action-encode",
          preset: "mp4",
          output: "encoded.mp4",
        },
        {
          module: "@nexrender/action-copy",
          input: "encoded.mp4",
          output: path.join(outputDir, "output.mp4"),
        },
      ],
    },
  };

  job.assets.push({
    type: "script",
    src: getSrcForPath(
      path.join(resourceDirPath, "/ae-scripts/", "ae-section-title.js")
    ),
    keyword: "SECTION_TITLE_PARAMS",
    parameters: [
      { key: "compName", value: `${compName}.title-comp` },
      { key: "fragments", value: post.sections[0].fragments },
      { key: "author", value: post.sections[0].author },
      { key: "score", value: post.sections[0].score },
      { key: "audioLevelVoice", value: AUDIO_LEVEL_VOICE },
      { key: "postDetails", value: post.details },
    ],
  });

  for (let section of post.sections.slice(1)) {
    job.assets.push({
      type: "script",
      src: getSrcForPath(
        path.join(resourceDirPath, "/ae-scripts/", "ae-section-comment.js")
      ),
      keyword: "SECTION_COMMENT_PARAMS",
      parameters: [
        { key: "compName", value: `${compName}.comment-comp` },
        { key: "section", value: section },
        { key: "audioLevelVoice", value: AUDIO_LEVEL_VOICE },
      ],
    });
  }

  job.assets.push({
    type: "script",
    src: getSrcForPath(
      path.join(resourceDirPath, "/ae-scripts/", "ae-assemble-main.js")
    ),
    keyword: "ASSEMBLE_MAIN_PARAMS",
    parameters: [
      { key: "compName", value: compName },
      {
        key: "subCompNames",
        value: post.sections.map((section, i) => {
          const prefix =
            i === 0 ? `${compName}.title-comp` : `${compName}.comment-comp`;
          const suffix = section.fragments[0].audio.fileName;
          return `${prefix}.${suffix}`;
        }),
      },
    ],
  });

  // Background
  job.assets.push({
    type: "script",
    src: getSrcForPath(path.join(resourceDirPath, "/ae-scripts/", "ae-bg.js")),
    keyword: "BG_PARAMS",
    parameters: [
      { key: "compName", value: compName },
      {
        key: "filePath",
        value: path.join(resourceDirPath, "/bg-music/", BG_MUSIC),
      },
      { key: "audioLevel", value: AUDIO_LEVEL_BG },
    ],
  });

  return job;
}
