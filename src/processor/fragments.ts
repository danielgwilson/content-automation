import { IPostSectionFragment } from "../types";
import VoiceOverClient from "./voice-over";

export async function getFragments({
  text,
  voiceOverClient,
  fileNamePrefix,
  splitBySentence = true
}: {
  text: string;
  voiceOverClient: VoiceOverClient;
  fileNamePrefix: string;
  splitBySentence?: boolean;
}) {
  const sentences = splitBySentence ? getSentences(text) : [text]; // Splits text by ending punctuation except for title
  const promises: Promise<IPostSectionFragment>[] = [];
  for (let [i, sentence] of sentences.entries()) {
    const textWithPriors = sentences.slice(0, i + 1).join(" ");
    promises.push(
      new Promise(async resolve => {
        const audio = await voiceOverClient.fetchVoiceOver({
          text: sentence,
          fileName: `${fileNamePrefix}.${i}.mp3`
        });
        return resolve({
          text: sentence,
          textWithPriors,
          audio
        });
      })
    );
  }
  return await Promise.all(promises);
}

export function getAudioLengthForFragments(fragments: IPostSectionFragment[]) {
  return fragments
    .map(fragment => fragment.audio.length)
    .reduce((a, b) => a + b, 0);
}

function getSentences(text: string) {
  return text
    .replace(/(\.+|\:|\!|\?)(\"*|\'*|\)*|}*|]*)(\s|\n|\r|\r\n)/gm, "$1$2|")
    .split("|");
}
