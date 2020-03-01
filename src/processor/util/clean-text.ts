import removeMd from "remove-markdown";

export function getCleanText(text: string) {
  let cleanText = text;

  cleanText = removeBadCharacters(cleanText);
  // cleanText = removeProfanity(cleanText);
  cleanText = removeMd(cleanText);

  return cleanText;
}

function removeBadCharacters(text: string) {
  return text.replace(/[\u200B-\u200D\uFEFF]/g, "");
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
    { word: "tits", alt: "tits" } // ok
  ];
  let cleanText = text;
  for (let item of profanity) {
    cleanText = cleanText.replace(new RegExp(item.word, "gi"), item.alt);
  }
  return cleanText;
}
