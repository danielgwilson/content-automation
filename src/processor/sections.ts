import { IPost, IPostSection, IPostComment } from "../types/post";
import VoiceOverClient from "./voice-over";
import { getFragments, getAudioLengthForFragments } from "./fragments";
import { getCleanText } from "./clean-text";

export async function getSections(
  post: IPost,
  voiceOverClient: VoiceOverClient
) {
  const sections = await Promise.all([
    getSectionForTitle(
      {
        text: post.title,
        author: post.author,
        score: post.score
      },
      { voiceOverClient, fileNamePrefix: `${post.id}-${0}` }
    ),
    ...post.comments.map((comment, i) => {
      return getSectionForComment(comment, {
        voiceOverClient,
        fileNamePrefix: `${post.id}-${i + 1}`
      });
    })
  ]);

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

async function getSectionForTitle(
  { text, score, author }: { text: string; score: number; author: string },
  {
    voiceOverClient,
    fileNamePrefix
  }: { voiceOverClient: VoiceOverClient; fileNamePrefix: string }
): Promise<IPostSection> {
  const fragments = await getFragments({
    text: getCleanText(text),
    voiceOverClient,
    fileNamePrefix,
    splitBySentence: false
  });
  return {
    type: "title",
    fragments,
    length: getAudioLengthForFragments(fragments),

    score,
    author,

    children: []
  } as IPostSection;
}

async function getSectionForComment(
  { body, score, author, replies }: IPostComment,
  {
    voiceOverClient,
    fileNamePrefix
  }: { voiceOverClient: VoiceOverClient; fileNamePrefix: string }
): Promise<IPostSection> {
  const fragments = await getFragments({
    text: getCleanText(body),
    voiceOverClient,
    fileNamePrefix,
    splitBySentence: true
  });
  return {
    type: "comment",
    fragments,
    length: getAudioLengthForFragments(fragments),

    score,
    author,

    children: await Promise.all(
      replies.map((reply, i) =>
        getSectionForComment(reply, {
          voiceOverClient,
          fileNamePrefix: `${fileNamePrefix}-${i}`
        })
      )
    )
  } as IPostSection;
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
