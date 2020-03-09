import { getCleanText } from "./clean-text";

describe("Clean Text", () => {
  it("Produce clean text", () => {
    const text =
      "Fuck, does *markdown* work? [I hope not.](https://example.com)";
    const cleanText = getCleanText(text);
    expect(cleanText).toMatchSnapshot();
  });

  it("Removes quotes", () => {
    const text = `
      &gt; My cool quote here.
      This should all be fine! :D
    `;
    const cleanText = getCleanText(text);

    expect(cleanText).toMatchSnapshot();
  });
});
