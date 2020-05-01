import removeMarkdown from "./remove-markdown";

describe("Remove Markdown", () => {
  it("Removes markdown without removing sequences of newlines", () => {
    const text = "\n\n\n\n";
    const cleanText = removeMarkdown(text);
    expect(cleanText).toEqual(text);
  });
});
