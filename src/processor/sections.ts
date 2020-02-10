import { IPost, IPostSection } from "../types/post";
import VoiceOverClient from "./voice-over";
import { getFragments, getAudioLengthForFragments } from "./fragments";
import { getCleanText } from "./clean-text";

export async function getSections(
  post: IPost,
  voiceOverClient: VoiceOverClient
) {
  const texts = [post.title, ...post.comments.map(comment => comment.body)];
  const cleanTexts = texts.map(text => getCleanText(text));

  const promises: Promise<IPostSection>[] = [];
  for (let [i, text] of cleanTexts.entries()) {
    promises.push(
      new Promise(async resolve => {
        const fragments = await getFragments({
          text,
          voiceOverClient,
          fileNamePrefix: `${post.id}-${i}`,
          splitBySentence: i > 0
        });
        return resolve({
          type: i === 0 ? "title" : "comment",
          fragments,
          length: getAudioLengthForFragments(fragments),

          score: i === 0 ? post.score : post.comments[i - 1].score,
          author: i === 0 ? post.author : post.comments[i - 1].author
        } as IPostSection);
      })
    );
  }
  const sections = await Promise.all(promises);

  const totalCharacters = getCharacters(sections);
  const totalAudioLength = getAudioLengthForSections(sections);
  console.log(`\nTotal characters converted to audio: ${totalCharacters}`);
  console.log(
    `Aggregate length of audio files: ${new Date(totalAudioLength * 1000)
      .toISOString()
      .substr(11, 8)}\n`
  );

  return sections;
}

export function getCharacters(sections: IPostSection[]) {
  return sections
    .map(section =>
      section.fragments
        .map(fragment => fragment.text.length)
        .reduce((a, b) => a + b, 0)
    )
    .reduce((a, b) => a + b, 0);
}

export function getAudioLengthForSections(sections: IPostSection[]) {
  return sections.map(section => section.length).reduce((a, b) => a + b, 0);
}
