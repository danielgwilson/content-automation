import { getCleanText } from "./clean-text";

describe("Clean Text", () => {
  it("Produce clean text", () => {
    const text =
      "Shoot, does *markdown* work? [I hope not.](https://example.com)";
    const cleanText = getCleanText(text);
    expect(cleanText).toMatchSnapshot();
  });

  it("Removes quotes", () => {
    const text = `&gt; My cool quote here.
      This should all be fine! :D`;
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

  it("Removes closing [Serious] tag", () => {
    const text =
      "What’s the creepiest or most unexplainable thing you’ve ever seen that you haven’t shared anywhere? [Serious]";
    const expectedText =
      "What’s the creepiest or most unexplainable thing you’ve ever seen that you haven’t shared anywhere?";
    const cleanText = getCleanText(text);
    expect(cleanText).toEqual(expectedText);
  });

  it("Doesn't lose sequences of middle newlines", () => {
    const text = "Line 1. \n\n\n\n Line 2.";
    const cleanText = getCleanText(text);
    expect(cleanText).toEqual(text);
  });

  it("Removes introductory 'Reddit, ...' phrase", () => {
    const text =
      "Reddit, how would you feel about a law that bans radio stations from playing commercials with honking/beeping/siren noises in them?";
    const expectedText =
      "How would you feel about a law that bans radio stations from playing commercials with honking/beeping/siren noises in them?";
    const cleanText = getCleanText(text);
    expect(cleanText).toEqual(expectedText);
  });

  it("Removes 'Edit:' blocks", () => {
    const text = `Back in 2016 My mother was staying at my place because My father was in the hospital at the time and my apartment was right next to the hospital . One night I had this dream that the landline rings and my mother answers the phone and hears the news that my dad has passed away. She hangs up the phone and tells me that my uncle (a doctor at the hospital my father was in) just gave her the news of my fathers passing. I wake up startled. I have a drink of water ,and just as I start feeling relieved that this was all just a bad dream. The phone rings and my mom picks it up.. I was just watching her from a distance noticing the expression on her face noticing the tears that started dripping down her cheek, and she hangs up the phone and tells me that my uncle just told her that my father has passed away. This is the only unexplained thing that ever happened to me and this is the first time I share this with anybody

    Edit: Thank you everyone appreciate your kind words and condolences.`;
    const expectedText = `Back in 2016 My mother was staying at my place because My father was in the hospital at the time and my apartment was right next to the hospital . One night I had this dream that the landline rings and my mother answers the phone and hears the news that my dad has passed away. She hangs up the phone and tells me that my uncle (a doctor at the hospital my father was in) just gave her the news of my fathers passing. I wake up startled. I have a drink of water ,and just as I start feeling relieved that this was all just a bad dream. The phone rings and my mom picks it up.. I was just watching her from a distance noticing the expression on her face noticing the tears that started dripping down her cheek, and she hangs up the phone and tells me that my uncle just told her that my father has passed away. This is the only unexplained thing that ever happened to me and this is the first time I share this with anybody`;
    const cleanText = getCleanText(text);
    expect(cleanText).toEqual(expectedText);
  });
});
