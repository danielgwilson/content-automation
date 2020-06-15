import fs from "fs";
import { join } from "path";
import { jsonDateParser } from "./json-date-parser";

export enum BlobType {
  ICrawlerOutput = "crawler",
  processor = "processor",
  generator = "generator",
  upload = "upload",
  follow = "follow",
  unfollow = "unfollow",
}

/**
 * Get the blob(s) contained at the path passed to the cli command as an argument.
 *
 * Gets one or multiple blobs depending on whether the FILE argument references...
 * (1) the /temp/ directory containing post subdirectories
 * (2) a blob subdirectory
 * (3) a single blob file (e.g. *.crawler.json)
 * (4) no blobs of requested type found in path
 *
 * @param path the path argument passed to the cli command
 * @param type the type of job to return
 */
export function getBlobs(
  path: string,
  { type }: { type?: BlobType } = {}
): any[] {
  let blobs: any[] = [];
  if (isDirectory(path)) {
    const fileNames = fs.readdirSync(path);
    const blobFileNames = fileNames.filter((fileName) =>
      isBlob(fileName, { type })
    );
    if (blobFileNames.length > 0) {
      // (2) a blob subdirectory
      for (let blobFileName of blobFileNames) {
        blobs.push(parseBlob(join(path, blobFileName)));
      }
    } else {
      const subDirs = fileNames
        .map((fileName) => join(path, fileName))
        .filter(isDirectory);
      if (subDirs.length > 0) {
        // (1) the /temp/ directory containing blob subdirectories
        return ([] as any[]).concat(
          ...subDirs.map((dirPath) => getBlobs(dirPath, { type }))
        );
      } else {
        return []; // no blobs of requested type found in path
      }
    }
  } else {
    // (3) a single blob file (*.crawler.json)
    blobs.push(parseBlob(path));
  }

  return blobs;
}

function isDirectory(filePath: string) {
  return fs.lstatSync(filePath).isDirectory();
}

function isBlob(filePath: string, { type }: { type?: BlobType }) {
  const fileParts = filePath.split(".");
  if (fileParts.length <= 2) return false; // folder, extension-less file, or file missing "sub-extension" - (e.g. not *.crawler.json but misc.json)
  const extension = fileParts.pop();
  const jobType = fileParts.pop();
  return extension === "json" && (!type || jobType === type);
}

function parseBlob(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"), jsonDateParser);
}
