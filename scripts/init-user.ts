import fs from "fs";
import path from "path";
import readline from "readline";
import { writeFile } from "../src/util";
import { ICredentials, IProxy } from "../src/types";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Accounts directory path: ", async (accountsDirPath) => {
  rl.question("New account username ([a-zA-Z0-9_]): ", async (username) => {
    if (!fs.existsSync(accountsDirPath))
      throw new Error("Users directory path does not exist.");

    const dirName = username;
    const dirPath = path.join(accountsDirPath, dirName);
    const credentials = {
      username,
      password: "",
    } as ICredentials;
    const proxy = {
      server: "us.smartproxy.com:22225",
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
