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

function removeReddit(text: string) {
  let cleanText = text;
  cleanText = cleanText.replace(/^(\w+)( of Reddit,)/, "$1,");
  cleanText = cleanText.replace(/^(Redditors)/, "People");
  return cleanText;
}

function removeSeriousTag(text: string) {
  return text.replace(/^(\[Serious\] )/, "");
}

// TODO: should actually render quotes
function removeQuotes(text: string) {
  return text.replace(new RegExp("&gt;", "gi"), "");
}
