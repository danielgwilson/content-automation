import fs from "fs";
import path from "path";
import { extract } from "keyword-extractor";

export function parseTitle(title: string, resourceDir: string) {
  const keywords = extract(title);
}

export function getUncommonWords(text: string, resourceDir: string) {
  const words = text.split(" ");
  const commonWords = fs
    .readFileSync(path.join(resourceDir, "/thumbnail/", "common-words.txt"))
    .toString("utf8")
    .split("\n");

  const uncommonWords: string[] = [];
  for (let word of words) {
    if (commonWords.indexOf(word) < 0) uncommonWords.push(word);
  }

  return uncommonWords;
}
