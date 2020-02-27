import fs from "fs";
import path from "path";

export async function writeFile(
  filePath: string,
  data: any,
  options?:
    | string
    | {
        encoding?: string | null;
        mode?: string | number;
        flag?: string;
      }
    | null
) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  await fs.writeFileSync(filePath, data, options);
}
