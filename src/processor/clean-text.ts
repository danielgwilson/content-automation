export function getCleanText(text: string) {
  return text.replace(/[\u200B-\u200D\uFEFF]/g, "");
}
