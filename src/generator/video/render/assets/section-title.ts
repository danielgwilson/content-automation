import { IPostSection, IProcessedPostDetails } from "../../../../types/post";
import {
  getAssetForSetAttributeToParentAttribute,
  getAssetForDuplicateLayer
} from "./assets";
import { getSrcForPath } from "./util";

export function getAssetsForSectionTitle(
  section: IPostSection,
  postDetails: IProcessedPostDetails,
  { compName, audioLevelVoice }: { compName: string; audioLevelVoice: number }
) {
  const assets = [];

  // Add title audio
  assets.push({
    src: getSrcForPath(section.fragments[0].audio.filePath),
    layerName: "audio-ref",
    type: "audio"
  });
  assets.push({
    type: "data",
    layerName: "audio-ref",
    property: "outPoint",
    expression: "layer.startTime + layer.source.duration"
  });
  assets.push({
    type: "data",
    layerName: "audio-ref",
    property: "Audio Levels",
    value: [audioLevelVoice, audioLevelVoice]
  });

  // Update title comp outPoint
  assets.push(
    getAssetForSetAttributeToParentAttribute(
      {
        layer: { name: `${compName}.title-comp`, attribute: "outPoint" },
        parent: { name: "audio-ref", attribute: "outPoint" }
      },
      compName
    )
  );

  // Update subreddit icon
  assets.push({
    src: getSrcForPath(postDetails.subredditIcon.filePath),
    layerName: "subreddit-icon-ref",
    type: "image"
  });

  // Update title text
  assets.push({
    type: "data",
    composition: `${compName}.title-comp`,
    layerName: "title-text",
    property: "Source Text",
    value: section.fragments[0].text
  });

  // Update subreddit name
  assets.push({
    type: "data",
    composition: `${compName}.title-comp`,
    layerName: "subreddit-text",
    property: "Source Text",
    value: "r/" + postDetails.subredditName
  });

  // Update author name
  if (!section.author) throw new Error("author undefined");
  assets.push({
    type: "data",
    composition: `${compName}.title-comp`,
    layerName: "user-text",
    property: "Source Text",
    value: "u/" + section.author
  });

  // Update number of comments
  assets.push({
    type: "data",
    composition: `${compName}.title-comp`,
    layerName: "num-comments-text",
    property: "Source Text",
    value:
      postDetails.numComments > 999
        ? `${Math.round(postDetails.numComments / 100) / 10}k Comments`
        : `${postDetails.numComments} Comments`
  });

  // Update score
  if (!section.score) throw new Error("score undefined");
  assets.push({
    type: "data",
    composition: `${compName}.title-comp`,
    layerName: "score-text",
    property: "Source Text",
    value:
      section.score > 999
        ? `${Math.round(section.score / 100) / 10}k`
        : `${section.score}`
  });

  // Update upvote ratio
  // if (!postDetails.upvoteRatio) throw new Error("upvoteRatio undefined");
  // assets.push(
  //   getAssetForSetProperty(
  //     {
  //       layer: {
  //         name: "pct-upvoted-text",
  //         property: "text.sourceText",
  //         value: `${Math.round(postDetails.upvoteRatio * 100)}% Upvoted`
  //       }
  //     },
  //     `${compName}.title-comp`
  //   )
  // );

  // Set the inPoint of the comment comp to right after the title comp finishes
  assets.push(
    getAssetForSetAttributeToParentAttribute(
      {
        layer: { name: `${compName}.comment-comp`, attribute: "inPoint" },
        parent: { name: `${compName}.title-comp`, attribute: "outPoint" }
      },
      compName
    )
  );

  // Add transition clip at outPoint of title comp
  assets.push(
    getAssetForDuplicateLayer("transition-ref", `${compName}.comment-comp`, {
      newName: "transition-ref.title"
    })
  );
  assets.push(
    getAssetForSetAttributeToParentAttribute(
      {
        layer: {
          name: "transition-ref.title",
          attribute: "startTime"
        },
        parent: {
          name: "audio-ref",
          attribute: "outPoint"
        }
      },
      `${compName}.comment-comp`,
      compName
    )
  );

  return assets;
}
