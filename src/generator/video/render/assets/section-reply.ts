import { IPostSection, IProcessedPostDetails } from "../../../../types/post";
import {
  getAssetsForAddNextAudio,
  getAssetForDuplicateLayer,
  getAssetsForAddNextText,
  getAssetsForSetInOutToParent,
  getAssetForSetAttributeToParentAttribute
} from "./assets";

export function getAssetsForSectionReply(
  section: IPostSection,
  postDetails: IProcessedPostDetails,
  { compName, audioLevelVoice }: { compName: string; audioLevelVoice: number }
) {
  const assets: any[] = [];

  for (let [i, fragment] of section.fragments.entries()) {
    // Add new audio layer containing fragment
    assets.push(
      ...getAssetsForAddNextAudio(
        fragment.audio.filePath,
        compName,
        0,
        audioLevelVoice
      )
    );

    // Update user text
    assets.push(
      ...getAssetsForAddNextText(
        { name: "user-text", suffix: fragment.audio.filePath },
        section.author,
        `${compName}.comment-comp`,
        compName
      )
    );

    // Update score text
    assets.push(
      ...getAssetsForAddNextText(
        { name: "score-text", suffix: fragment.audio.filePath },
        section.score > 999
          ? section.score > 99999
            ? `${Math.round(section.score / 1000)}k points`
            : `${Math.round(section.score / 100) / 10}k points`
          : `${section.score} points`,
        `${compName}.comment-comp`,
        compName
      )
    );

    // Update comment text to show current fragment
    assets.push(
      ...getAssetsForAddNextText(
        { name: "comment-text", suffix: fragment.audio.filePath },
        fragment.textWithPriors,
        `${compName}.comment-comp`,
        compName
      )
    );

    // Set arrows inPoint and outPoint
    assets.push(
      getAssetForDuplicateLayer("upvote-arrow", `${compName}.comment-comp`, {
        newName: `upvote-arrow.${fragment.audio.filePath}`
      })
    );
    assets.push(
      ...getAssetsForSetInOutToParent(
        {
          layer: {
            name: `upvote-arrow.${fragment.audio.filePath}`
          },
          parent: {
            name: `audio.${fragment.audio.filePath}`
          }
        },
        `${compName}.comment-comp`,
        compName
      )
    );
    assets.push(
      getAssetForDuplicateLayer("downvote-arrow", `${compName}.comment-comp`, {
        newName: `downvote-arrow.${fragment.audio.filePath}`
      })
    );
    assets.push(
      ...getAssetsForSetInOutToParent(
        {
          layer: {
            name: `downvote-arrow.${fragment.audio.filePath}`
          },
          parent: {
            name: `audio.${fragment.audio.filePath}`
          }
        },
        `${compName}.comment-comp`,
        compName
      )
    );

    // Set collapse comment bar inPoint and outPoint
    assets.push(
      getAssetForDuplicateLayer(
        "collapse-comment-bar",
        `${compName}.comment-comp`,
        {
          newName: `collapse-comment-bar.${fragment.audio.filePath}`
        }
      )
    );
    assets.push(
      ...getAssetsForSetInOutToParent(
        {
          layer: {
            name: `collapse-comment-bar.${fragment.audio.filePath}`
          },
          parent: {
            name: `audio.${fragment.audio.filePath}`
          }
        },
        `${compName}.comment-comp`,
        compName
      )
    );

    // Set background inPoint and outPoint
    assets.push(
      getAssetForDuplicateLayer("comment-bg", `${compName}.comment-comp`, {
        newName: `comment-bg.${fragment.audio.filePath}`
      })
    );
    assets.push(
      ...getAssetsForSetInOutToParent(
        {
          layer: {
            name: `comment-bg.${fragment.audio.filePath}`
          },
          parent: {
            name: `audio.${fragment.audio.filePath}`
          }
        },
        `${compName}.comment-comp`,
        compName
      )
    );

    // Add transition clip at outPoint of last fragment
    if (i === section.fragments.length - 1) {
      assets.push(
        getAssetForDuplicateLayer(
          "transition-ref",
          `${compName}.comment-comp`,
          {
            newName: `transition-ref.${fragment.audio.filePath}`
          }
        )
      );
      assets.push(
        getAssetForSetAttributeToParentAttribute(
          {
            layer: {
              name: `transition-ref.${fragment.audio.filePath}`,
              attribute: "startTime"
            },
            parent: {
              name: `audio.${fragment.audio.filePath}`,
              attribute: "outPoint"
            }
          },
          `${compName}.comment-comp`,
          compName
        )
      );
    }
  }

  return assets;
}
