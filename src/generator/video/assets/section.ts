import { getAssetsForSectionTitle } from "./section-title";
import { getAssetsForSectionComment } from "./section-comment";
import { IPostSection, IProcessedPostDetails } from "../../../types/post";

export function getAssetsForSection(
  section: IPostSection,
  postDetails: IProcessedPostDetails,
  {
    compName,
    audioLevelVoice,
    delay
  }: { compName: string; audioLevelVoice: number; delay: number }
) {
  return section.type === "title"
    ? getAssetsForSectionTitle(section, postDetails, {
        compName,
        audioLevelVoice
      })
    : getAssetsForSectionComment(section, postDetails, {
        compName,
        audioLevelVoice,
        delay
      });
}
