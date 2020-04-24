import { getSentences } from "./get-sentences";

describe("Sentences", () => {
  it("Gets sentences without removing line break", () => {
    const text = "Sentence 1.\n\nSentence 2.";
    const sentences = getSentences(text);
    expect(sentences).toMatchSnapshot();
  });
});
