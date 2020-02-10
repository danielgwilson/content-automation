import fs from "fs";
import path from "path";

export function saveObjectToJson(
  object: Object,
  {
    fileName = `${new Date().toISOString()}.output.json`,
    outputDir = ""
  }: { fileName?: string; outputDir?: string }
) {
  fs.writeFileSync(path.join(outputDir, fileName), JSON.stringify(object));
}
