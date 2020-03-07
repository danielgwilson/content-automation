import { parsePost } from "./parse-post";

describe("Parse Post", () => {
  it("Correctly parses post JSON", () => {
    const samplePost = require("../../tests/sample-post.json");
    const parsedPost = parsePost(samplePost);
    expect(parsedPost).toMatchSnapshot();
  });
});
