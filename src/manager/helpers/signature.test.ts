/**
 * From https://github.com/drawrowfly/tiktok-scraper/blob/103ad94cabb93f787da04c98c26fc2af40e55528/src/helpers/Signature.test.ts
 */

/* eslint-disable no-undef */
import { generateSignature } from "./signature";

import SignatureData from "./__mock-data__/data";

describe("Signature", () => {
  it("should return a valid signature", async () => {
    expect(
      generateSignature(
        SignatureData.url,
        SignatureData.userAgent,
        SignatureData.tac
      )
    ).toEqual("TYYDvAAgEBqyefxD31TDM02GAqAABQA");
    // ).toEqual("TYYDvAAgEBpthLe7v6.DM02GAqAABQA");
  });
});
