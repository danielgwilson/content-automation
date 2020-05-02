import { getSentences } from "./get-sentences";

describe("Sentences", () => {
  it("Gets sentences without removing line break", () => {
    const text = "Sentence 1.\n\nSentence 2.";
    const sentences = getSentences(text);
    expect(sentences).toMatchSnapshot();
  });

  it("Doesn't add extra spaces", () => {
    const text = "Sentence 1. Sentence 2.";
    const sentences = getSentences(text);
    expect(sentences).toMatchSnapshot();
  });

  it("Splits on newlines and doesn't lose any or add extra spaces", () => {
    const text =
      "Priority one is to deal with the chickens that my Step-daughter has to deal with. She's 4. I think she could go 1 vs 1, but 2 vs 1 she'd need a little help.\n\n\n\nThen once I get one down, I pick it up and use it like a club.\n\n\n\nIt's time to reassert the pecking order.";
    const sentences = getSentences(text);
    expect(sentences).toMatchSnapshot();
  });
});
