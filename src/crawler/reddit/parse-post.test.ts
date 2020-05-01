import { parsePost } from "./parse-post";

describe("Parse Post", () => {
  it("Correctly parses post JSON", () => {
    const samplePostJson = require("../../tests/sample-post-json.json");
    const parsedPost = parsePost(samplePostJson);
    expect(parsedPost).toMatchSnapshot();
  });

  it("Correctly parses post comment JSON", () => {
    const samplePostJson = require("../../tests/sample-post-comment-json.json");
    const parsedPost = parsePost(samplePostJson);
    expect(parsedPost).toMatchSnapshot();
  });
});
