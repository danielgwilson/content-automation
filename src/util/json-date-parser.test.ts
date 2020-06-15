import { jsonDateParser } from "./json-date-parser";

describe("JSON Date Parser", () => {
  it("Parses JSON strings with dates", () => {
    const jsonStirng = `{
      "myDate": "2020-05-27T02:58:06.177Z"
    }`;
    const result = JSON.parse(jsonStirng, jsonDateParser);
    expect(typeof result.myDate).toBe("object");
    expect(result.myDate.toISOString).toBeDefined();
  });
});
