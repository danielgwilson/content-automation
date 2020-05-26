export function getCaptionAndTags(
  postTitle: string,
  tags: string[],
  maxLength: number
): { caption: string; tags: string[] } {
  let captionLength = postTitle.length;
  const finalTags: string[] = [];
  for (let tag of tags) {
    if (captionLength + tag.length + 1 <= maxLength) {
      finalTags.push(tag);
      captionLength += tag.length + 1; // + 1 for space between tags
    }
  }
  if (captionLength > maxLength)
    throw new Error(
      `Failed to generate caption; length exceeds maximum length of ${maxLength}.`
    );
  return { caption: postTitle, tags: finalTags };
}
