import { prune } from "underscore.string";

export function getCaptionAndTags(
  postTitle: string,
  tags: string[],
  maxLength: number,
  {
    autofit = true,
    autofitLength,
  }: { autofit?: boolean; autofitLength?: number } = {}
): { caption: string; tags: string[] } {
  let caption = postTitle;
  if (autofit) caption = prune(caption, autofitLength ?? maxLength - 3);
  let captionLength = caption.length;

  const finalTags: string[] = [];
  for (let tag of tags) {
    if (captionLength + tag.length + 1 <= maxLength) {
      finalTags.push(tag);
      captionLength += tag.length + 1; // + 1 for space between tags
    }
  }

  if (captionLength > maxLength)
    throw new Error(
      `Failed to generate caption; length exceeds maximum length of ${maxLength}.\nCaption: ${caption}`
    );
  return { caption, tags: finalTags };
}
