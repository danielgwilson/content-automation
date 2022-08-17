import { IPostSection } from "../../types";
import { getAudioLengthForSections } from "../sections";

export function trimAudio(
  sections: IPostSection[],
  options: { maxAudioLength?: number; speakingRate?: number } = {}
) {
  const { maxAudioLength, speakingRate } = options;
  if (!maxAudioLength) return sections;

  const trimmedSections: IPostSection[] = [];
  let totalAudioLength = 0;
  for (let section of sections) {
    const sectionAudioLength = getAudioLengthForSections([section]);
    if (totalAudioLength + sectionAudioLength >= maxAudioLength) {
      break;
    }
    trimmedSections.push(section);
    totalAudioLength += sectionAudioLength;
  }

  if (trimmedSections.length <= 1) {
    const minimumTotalAudioLength = getAudioLengthForSections(
      sections.slice(0, 2)
    );
    let errorText = `Failed to trim audio output for processed sections within maxAudioLength of ${maxAudioLength}s; minimum audio length: ${minimumTotalAudioLength}`;
    if (speakingRate) {
      const requiredSpeakingRate = Math.round(
        ((minimumTotalAudioLength - 2) / (maxAudioLength - 2)) *
          (speakingRate * 100)
      );
      errorText = errorText.concat(
        `\nRequired speakingRate: ${requiredSpeakingRate}`
      );
    }
    throw new Error(errorText);
  }

  return trimmedSections;
}
