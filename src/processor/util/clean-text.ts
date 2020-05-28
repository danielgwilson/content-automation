import removeMarkdown from "./remove-markdown";

export function getCleanText(text: string) {
  let cleanText = text;

  cleanText = removeBadCharacters(cleanText);
  cleanText = fixHtmlCharacterRefs(cleanText);
  // cleanText = removeProfanity(cleanText);
  cleanText = removeMarkdown(cleanText, {
    stripListLeaders: false,
    gfm: false,
  });
  cleanText = removeQuotes(cleanText);
  cleanText = removeReddit(cleanText);
  cleanText = removeSeriousTag(cleanText);
  cleanText = removeEdit(cleanText);

  return cleanText;
}

function removeBadCharacters(text: string) {
  return text.replace(/[\u200B-\u200D\uFEFF]/g, "");
}

function fixHtmlCharacterRefs(text: string) {
  return text.replace(/(&amp;)/g, "&").replace(/(&#x200B;)/g, "");
}

function removeProfanity(text: string) {
  const profanity = [
    { word: "fuck", alt: "f-ck" },
    { word: "fucker", alt: "f-cker" },
    { word: "motherfucker", alt: "motherf-cker" },
    { word: "shit", alt: "sh-t" },
    { word: "bullshit", alt: "bullsh-t" },
    { word: "bitch", alt: "b-tch" },
    { word: "cunt", alt: "c-nt" },
    { word: "asshole", alt: "assh-le" },
    { word: "whore", alt: "wh-re" },
    { word: "slut", alt: "sl-t" },
    { word: "cock", alt: "c-ck" },
    { word: "tits", alt: "tits" }, // ok
  ];
  let cleanText = text;
  for (let item of profanity) {
    cleanText = cleanText.replace(new RegExp(item.word, "gi"), item.alt);
  }
  return cleanText;
}

function removeEdit(text: string) {
  let cleanText = text;
  cleanText = cleanText.split(/(edit:)/i)[0].trim();
  return cleanText;
}

function removeReddit(text: string) {
  let cleanText = text;
  cleanText = cleanText.replace(/^(\w+)( of Reddit,)/i, "$1,"); // Removes e.g. "People of Reddit, ..."
  cleanText = cleanText.replace(/^(Redditors)/, "People"); // Removes e.g "Redditors who are..."
  cleanText = cleanText // Removes e.g. "Reddit, how would you..."
    .replace(/^(Reddit, )/, "")
    .replace(/^[a-z]/, (v) => v.toUpperCase());
  return cleanText;
}

function removeSeriousTag(text: string) {
  return text.replace(/( ?\[Serious\] ?)/i, "");
}

// TODO: should actually render quotes
function removeQuotes(text: string) {
  return text.replace(new RegExp("&gt;", "gi"), "");
}
