import { getCleanText } from "./clean-text";

describe("Clean Text", () => {
  it("Produce clean text", () => {
    const text =
      "Shoot, does *markdown* work? [I hope not.](https://example.com)";
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

  it("Keeps line breaks", () => {
    const text = "Line1\n\nLine2";
    const cleanText = getCleanText(text);
    expect(cleanText).toMatchSnapshot();
  });

  it("Fixes HTML character reference for '&'", () => {
    const text = "Penn &amp; Teller are great.";
    const cleanText = getCleanText(text);
    expect(cleanText).toMatchSnapshot();
  });

  it("Fixes HTML character reference for zero-width spaces", () => {
    const text =
      "Priority one is to deal with the chickens that my Step-daughter has to deal with. She's 4. I think she could go 1 vs 1, but 2 vs 1 she'd need a little help.\n\n&amp;#x200B;\n\nThen once I get one down, I pick it up and use it like a club.\n\n&amp;#x200B;\n\nIt's time to reassert the pecking order.";
    const expectedText =
      "Priority one is to deal with the chickens that my Step-daughter has to deal with. She's 4. I think she could go 1 vs 1, but 2 vs 1 she'd need a little help.\n\n\n\nThen once I get one down, I pick it up and use it like a club.\n\n\n\nIt's time to reassert the pecking order.";
    const cleanText = getCleanText(text);
    expect(cleanText).toEqual(expectedText);
  });

  it("Removes introductory 'of Reddit' phrase", () => {
    const text =
      "Firefighters of Reddit, what's the dumbest way you've seen someone accidently start a house fire?";
    const expectedText =
      "Firefighters, what's the dumbest way you've seen someone accidently start a house fire?";
    const cleanText = getCleanText(text);
    expect(cleanText).toEqual(expectedText);
  });

  it("Replaces introductory 'Redditors' phrase", () => {
    const text = "Redditors who are married to Karens, how is it like?";
    const expectedText = "People who are married to Karens, how is it like?";
    const cleanText = getCleanText(text);
    expect(cleanText).toEqual(expectedText);
  });

  it("Removes introductory [Serious] tag", () => {
    const text =
      "[Serious] What is the scariest thing to happen to you when you’ve been home alone?";
    const expectedText =
      "What is the scariest thing to happen to you when you’ve been home alone?";
    const cleanText = getCleanText(text);
    expect(cleanText).toEqual(expectedText);
  });

  // it("Doesn't lose sequences of newlines", () => {
  //   const text = "\n\n\n\n";
  //   const cleanText = getCleanText(text);
  //   expect(cleanText).toEqual(text);
  // });
});
