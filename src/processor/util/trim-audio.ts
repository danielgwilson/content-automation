import { IPostSection } from "../../types";

export function trimAudio(
  sections: IPostSection[],
  options: { maxAudioLength?: number } = {}
) {
  const { maxAudioLength } = options;
  if (!maxAudioLength) return sections;

  const trimmedSections: IPostSection[] = [];
  let totalAudioLength = 0;
  for (let section of sections) {
    if (totalAudioLength >= maxAudioLength) {
      break;
    }
    trimmedSections.push(section);
    totalAudioLength += section.length;
  }

  return trimmedSections;
}
