import { IPostSection } from '../../types';
import { getAudioLengthForSections } from '../sections';

export function trimAudio(
  sections: IPostSection[],
  options: { maxAudioLength?: number; speakingRate?: number } = {}
) {
  const { maxAudioLength, speakingRate } = options;
  if (!maxAudioLength) return sections;

  const trimmedSections: IPostSection[] = [];
  let totalAudioLength = 0;

  const chunks = sections.map((section) => {
    return {
      section,
      audioLength: getAudioLengthForSections([section]),
    };
  });

  const titleChunk = chunks[0];

  // Filters for only those chunks that, with the title included, would be shorter than the maxAudioLength
  // also sorts by audioLength ascending so that videos can be "zippered" into the right lengths
  const commentChunks = chunks
    .slice(1)
    .filter((chunk) => {
      return titleChunk.audioLength + chunk.audioLength < maxAudioLength;
    })
    .sort((a, b) => {
      return b.audioLength - a.audioLength;
    });
  console.log(`Comment chunk count: ${commentChunks.length}`);
  console.dir(
    commentChunks.map((chunk) => chunk.audioLength),
    { depth: null }
  );

  const collections: IPostSection[][] = [];
  while (commentChunks.length > 0) {
    const chunk = commentChunks.shift();
    if (!chunk) {
      throw new Error(
        'How is `chunk` `undefined`?? `commentChunks.shift()` should only have been called if `commentChunks.length > 0`.'
      );
    }

    // Add it to a collection (if possible)
    let isAdded = false;
    for (let collection of collections) {
      if (
        getAudioLengthForSections(collection) + chunk.audioLength <
        maxAudioLength
      ) {
        collection.push(chunk.section);
        isAdded = true;
        break;
      }
    }

    // If added successfully, continue
    if (isAdded) continue;

    // If not added to a collection, create a new one starting with the title and the chunk that did not fit.
    console.log(
      `Starting a collection ${collections.length} of comment chunks.`
    );
    const collection: IPostSection[] = [titleChunk.section, chunk.section];
    collections.push(collection);
  }
  console.dir(collections, { depth: null });

  for (let section of sections) {
    const sectionAudioLength = getAudioLengthForSections([section]);
    if (totalAudioLength + sectionAudioLength >= maxAudioLength) {
      continue;
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
