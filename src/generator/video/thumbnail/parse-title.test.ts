import { getUncommonWords, parseTitle } from "./parse-title";
import { IContext } from "../../../types";

const context: IContext = {
  outputDir: "./",
  resourceDir: "./resources/",
  saveOutputToFile: true,
  debug: false
};

it("Gets uncommon words in title", () => {
  // const title =
  //   "Would you take a 50/50 chance at $5,000,000 or death? Why or why not?";
  const title =
    "People who haven't pooped in 2019 yet, why are you still holding on to last years shit?";
  const uncommonWords = getUncommonWords(title, context.resourceDir);
  console.log(uncommonWords);
  expect(uncommonWords).toMatchSnapshot();
});

// it("Gets keywords in title", () => {
//   // const title =
//   //   "Would you take a 50/50 chance at $5,000,000 or death? Why or why not?";
//   const title =
//     "People who haven't pooped in 2019 yet, why are you still holding on to last years shit?";
//   const keywords = parseTitle(title, context.resourceDir);
//   console.log(keywords);
//   expect(keywords).toMatchSnapshot();
// });
