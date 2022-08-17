import { getNumberFromShortString } from "./number-string";

describe("Number String Converter", () => {
  it("Converts #.##K strings to numbers", () => {
    const str = "20.7K";
    const result = getNumberFromShortString(str);
    expect(result).toEqual(20700);
  });

  it("Converts #.##M strings to numbers", () => {
    const str = "1.2M";
    const result = getNumberFromShortString(str);
    expect(result).toEqual(1200000);
  });

  it("Converts ### strings to numbers", () => {
    const str = "249";
    const result = getNumberFromShortString(str);
    expect(result).toEqual(249);
  });

  it("Fails to convert non ###, ##.#K, ##.#M strings to numbers", () => {
    const str = "123hello";
    const result = getNumberFromShortString(str);
    expect(result).toEqual(NaN);
  });
});
