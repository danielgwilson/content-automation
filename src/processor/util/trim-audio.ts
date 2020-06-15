import { IPostSection } from "../../types";
import { getAudioLengthForSections } from "../sections";

export function trimAudio(
  sections: IPostSection[],
  options: { maxAudioLength?: number } = {}
) {
  const { maxAudioLength } = options;
  if (!maxAudioLength) return sections;

  const trimmedSections: IPostSection[] = [];
  let totalAudioLength = 0;
  for (let section of sections) {
    const sectionAudioLength =
      section.length + getAudioLengthForSections(section.children);
    if (totalAudioLength + sectionAudioLength >= maxAudioLength) {
      break;
    }
    trimmedSections.push(section);
    totalAudioLength += sectionAudioLength;
  }

  if (trimmedSections.length <= 1)
    throw new Error(
      `Failed to trim audio output for processed sections within maxAudioLength of ${maxAudioLength}s; minimum audio length: ${sections[0]
        .length + sections[1].length}`
    );

  return trimmedSections;
}
