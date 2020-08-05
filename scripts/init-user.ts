import fs from "fs";
import path from "path";
import readline from "readline";
import { writeFile } from "../src/util";
import { ICredentials, IProxy } from "../src/types";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("User directory path: ", async (userDirPath) => {
  rl.question("New user ID (####): ", async (userId) => {
    if (!fs.existsSync(userDirPath))
      throw new Error("User directory path does not exist.");

    if (userId.length !== 4)
      throw new Error("User ID must be a numeric string of the form (####)");

    const dirName = `user-${userId}`;
    const dirPath = path.join(userDirPath, dirName);
    const credentials = {
      username: "",
      password: "",
    } as ICredentials;
    const proxy = {
      server: "zproxy.lum-superproxy.io:22225",
      username: "",
      password: "",
    } as IProxy;

    console.log(`Creating new directory for ${dirName} at ${dirPath}...`);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath); // Top-level dir
      fs.mkdirSync(path.join(dirPath, "content")); // Content dir
      fs.mkdirSync(path.join(dirPath, "follows")); // Follows dir

      await writeFile(
        path.join(dirPath, "credentials.json"),
        JSON.stringify(credentials)
      );
      await writeFile(path.join(dirPath, "proxy.json"), JSON.stringify(proxy));

      console.log("Success!");
      rl.close();
    } else {
      throw new Error(`Directory already exists for path ${dirPath}`);
    }
  });
});

rl.on("close", () => {
  process.exit();
});
