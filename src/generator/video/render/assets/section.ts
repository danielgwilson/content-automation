import { getAssetsForSectionComment } from "./section-comment";
import { IPostSection, IProcessedPostDetails } from "../../../../types/post";

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
    ? new Error("Don't use this one")
    : getAssetsForSectionComment(section, postDetails, {
        compName,
        audioLevelVoice,
        delay
      });
}
