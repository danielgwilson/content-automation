import fs from "fs";
import { join } from "path";

/**
 * Get the post object(s) contained at the path passed to the cli command as an argument.
 *
 * Gets one or multiple post objects depending on whether the FILE argument references...
 * (1) the /temp/ directory containing post subdirectories
 * (2) a post subdirectory
 * (3) a single post file (*.crawler.json)
 *
 * @param path the path argument passed to the cli command
 * @param type the type of job to return
 */
export function getPosts(path: string, { type }: { type?: string } = {}) {
  const posts: any[] = [];
  if (isDirectory(path)) {
    const fileNames = fs.readdirSync(path);
    const postFileNames = fileNames.filter(fileName =>
      isPost(fileName, { type })
    );
    if (postFileNames.length > 0) {
      // (2) a post subdirectory
      posts.push(parsePost(join(path, postFileNames[0])));
    } else {
      // (1) the /temp/ directory containing post subdirectories
      posts.push(
        ...fileNames
          .map(fileName => join(path, fileName))
          .filter(isDirectory)
          .map(dirPath => {
            const [post] = fs
              .readdirSync(dirPath)
              .filter(fileName => isPost(fileName, { type }))
              .map(fileName => parsePost(join(dirPath, fileName)));
            return post;
          })
      );
    }
  } else {
    // (3) a single post file (*.crawler.json)
    posts.push(parsePost(path));
  }

  return posts;
}

function isDirectory(filePath: string) {
  return fs.lstatSync(filePath).isDirectory();
}

function isPost(filePath: string, { type }: { type?: string }) {
  const fileParts = filePath.split(".");
  const extension = fileParts.pop();
  const jobType = fileParts.pop();
  return extension === "json" && (!type || jobType === type);
}

function parsePost(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
