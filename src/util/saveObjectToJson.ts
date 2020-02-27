import path from "path";
import { writeFile } from "./writeFile";

export async function saveObjectToJson(
  object: Object,
  {
    fileName = `${new Date().toISOString()}.output.json`,
    outputDir = ""
  }: { fileName?: string; outputDir?: string }
) {
  await writeFile(path.join(outputDir, fileName), JSON.stringify(object));
}
