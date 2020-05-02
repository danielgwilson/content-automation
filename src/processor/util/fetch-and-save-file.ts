import fs from "fs";
import path from "path";
import request from "request";

export async function fetchAndSaveFile(
  uri: string,
  { fileName, outputDir }: { fileName: string; outputDir: string }
): Promise<{ fileName: string; filePath: string }> {
  return new Promise(resolve => {
    const filePath = path.join(outputDir, fileName);
    request.head(uri, function(err, res, body) {
      request(uri)
        .pipe(fs.createWriteStream(filePath))
        .on("close", () => {
          return resolve({ fileName, filePath });
        });
    });
  });
}
