export function getSentences(text: string) {
  return text
    .replace(/(\.+|\:|\!|\?)(\"*|\'*|\)*|}*|]*)(\s|\n|\r|\r\n)/gm, "$1$2|")
    .split("|");
}
